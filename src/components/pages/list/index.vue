<template>
  <v-row justify="end">
    <v-col cols="12" md="8" lg="6"> あ </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { onMounted, provide } from "vue";
import { useRoute, useRouter } from "vue-router";
import { formatDate } from "@/utils/dateFormatter";
import DailyTimeline from "./daily-timeline.vue";
import Snackbar from "./snackbar.vue";

import { RangeType } from "@/types";
import { key, useProvide } from "./provider";

const provider = useProvide();
provide(key, provider);
const { fetchReservations, days, day, type, page } = provider;

const route = useRoute();
const router = useRouter();

if (["d", "w"].includes(route.query.t as string)) {
  type.value = route.query.t as RangeType;
}

if (route.query.p !== undefined) {
  page.value = parseInt(route.query.p as string);
}

const onChangeType = () => {
  router.push({ query: { ...route.query, t: type.value } });
  fetchReservations();
};

const shiftDate = (diff: number): void => {
  page.value += diff;
  router.push({ query: { ...route.query, p: page.value } });
  fetchReservations();
};

const shiftToday = (): void => {
  if (page.value === 0) return;
  page.value = 0;
  router.push({ query: { ...route.query, p: page.value } });
  fetchReservations();
};

const onClickLineBot = (): void => {
  window.open("https://lin.ee/638d84X");
};

onMounted(async () => {
  fetchReservations();
});
</script>
