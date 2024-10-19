<template>
  <v-bottom-navigation
    :elevation="0"
    grow
    color="indigo-darken-4"
    v-model="tabName"
    @update:modelValue="onTabChange"
    mandatory
    height="72"
  >
    <v-btn v-for="tab in tabs" :key="tab.name" :value="tab.name">
      <v-icon>{{ tab.icon }}</v-icon>
      <span class="mb-3">{{ tab.text }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

const tabs = [
  { text: "一覧", name: "list", icon: "mdi-calendar-range" },
  { text: "予約", name: "reserve", icon: "mdi-calendar-edit" },
  { text: "日調", name: "schedule", icon: "mdi-calendar-clock" },
] as const;

type TabName = (typeof tabs)[number]["name"];
const tabName = ref<TabName>("list");

const onTabChange = (tabName: TabName) => router.push({ name: tabName });
</script>
