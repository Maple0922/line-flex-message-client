<template>
  <v-dialog v-model="visible" transition="dialog-bottom-transition">
    <v-card :loading="createLoading">
      <v-toolbar density="comfortable" color="indigo-darken-4">
        <v-toolbar-title>
          <v-icon icon="mdi-calendar-edit" size="small" />
          <span class="font-weight-bold text-body-1"> 予約</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-container>
        <v-row>
          <v-col class="pb-0">
            <p class="font-weight-bold text-h6">
              {{ formatDate(createForm.date, "YYYY年M月D日 (ddd)") }}
            </p>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-col cols="2">
            <v-btn
              variant="text"
              density="comfortable"
              color="indigo-darken-4"
              @click="shiftTime(-30, 'create')"
              icon="mdi-chevron-left"
            />
          </v-col>
          <v-col cols="8" class="px-0">
            <p class="font-weight-bold text-h4 text-center">
              {{ displayDatetime }}
            </p>
          </v-col>
          <v-col cols="2">
            <v-btn
              variant="text"
              density="comfortable"
              color="indigo-darken-4"
              @click="shiftTime(30, 'create')"
              icon="mdi-chevron-right"
            />
          </v-col>
          <v-col align="center">
            <range-toggle />
          </v-col>
          <v-col>
            <v-alert
              v-if="duplicateBands.length"
              density="compact"
              type="error"
              variant="tonal"
            >
              <template v-slot:title>
                <span class="text-caption font-weight-bold d-inline-block py-1"
                  >時間が重複しています</span
                >
              </template>
              <template v-slot:text>
                <v-container class="pa-3">
                  <v-row
                    v-for="band in duplicateBands"
                    :key="band.id"
                    class="text-caption"
                    style="gap: 12px; white-space: nowrap; flex-wrap: nowrap"
                  >
                    <span>{{ band.time.start }} - {{ band.time.end }}</span>
                    <span style="overflow: hidden; text-overflow: ellipsis">{{
                      band.name
                    }}</span>
                  </v-row>
                </v-container>
              </template>
            </v-alert>
            <v-alert v-else density="compact" type="success" variant="tonal">
              <template v-slot:title>
                <span class="text-caption font-weight-bold d-inline-block py-1"
                  >予約可能です</span
                >
              </template>
            </v-alert>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="createForm.name"
              :counter="114514"
              label="バンド名"
              required
              color="indigo-darken-4"
              variant="outlined"
              density="compact"
              :rules="rules.name"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="10">
            <v-text-field
              v-model="createForm.code"
              :counter="4"
              label="パスコード"
              inputmode="numeric"
              :append-inner-icon="showPasscode ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPasscode ? 'text' : 'password'"
              required
              color="indigo-darken-4"
              variant="outlined"
              density="compact"
              @click:append-inner="showPasscode = !showPasscode"
              :rules="rules.code"
            />
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="indigo-darken-4"
          :loading="createLoading"
          :disabled="createDisabled"
          variant="flat"
          @click="create"
          icon="mdi-check-bold"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { strictInject } from "@/utils/strictInject";
import { key } from "@/components/pages/list/provider";
import { toRefs, ref, computed } from "vue";
import axios from "axios";
import RangeToggle from "./forms/create-range-toggle.vue";
import { ReservationCreateForm, Reservation } from "@/types";

import { formatDate } from "@/utils/dateFormatter";
const {
  dialogVisible,
  createForm,
  day,
  shiftTime,
  setSnackbar,
  fetchReservations,
} = strictInject(key);
const { create: visible } = toRefs(dialogVisible);

const displayDatetime = computed(() => {
  const start = createForm.time.start;
  const end = createForm.time.end;
  const startMinute = start.minute === 30 ? "30" : "00";
  const endMinute = end.minute === 30 ? "30" : "00";
  return `${start.hour}:${startMinute} - ${end.hour}:${endMinute}`;
});

const rules = {
  name: [
    (v: string) => !!v || "バンド名は必須です",
    (v: string) =>
      (v && v.length <= 114514) || "114514文字以内で入力してください",
  ],
  code: [
    (v: string) => !!v || "パスコードは必須です",
    (v: string) => /^\d{4}$/.test(v) || "4桁の数字で入力してください",
  ],
};

const showPasscode = ref(false);

const createLoading = ref(false);

const createDisabled = computed(() => {
  return (
    !createForm.name ||
    !createForm.code ||
    createForm.name.length > 114514 ||
    !/^\d{4}$/.test(createForm.code) ||
    duplicateBands.value.length
  );
});

const create = async () => {
  createLoading.value = true;

  const request = generateCreateRequest(createForm);

  try {
    await axios.post("/reserve", request);
    await fetchReservations();
    setSnackbar("indigo-darken-4", `「${request.name}」の予約をしました。`);
  } catch (error: any) {
    setSnackbar(
      "red-darken-4",
      `エラーが発生しました。時間をおいて再度お試しください。(メッセージ: ${error.message})`
    );
  } finally {
    createLoading.value = false;
    visible.value = false;
    Object.assign(createForm, {
      name: "",
      code: "",
    });
  }
};

const generateCreateRequest = (createForm: ReservationCreateForm) => {
  const start = createForm.time.start;
  const end = createForm.time.end;

  const startTime = formatDate(
    `${createForm.date} ${start.hour < 10 ? `0${start.hour}` : start.hour}:${start.minute === 0 ? "00" : "30"}`,
    "YYYY-MM-DD HH:mm:ss"
  );
  const endTime = formatDate(
    `${createForm.date} ${end.hour < 10 ? `0${end.hour}` : end.hour}:${end.minute === 0 ? "00" : "30"}`,
    "YYYY-MM-DD HH:mm:ss"
  );

  return {
    start: startTime,
    end: endTime,
    name: createForm.name,
    passcode: createForm.code,
  };
};

const duplicateBands = computed<Reservation[]>(() => {
  const start = createForm.time.start;
  const end = createForm.time.end;
  const startNum = Number(`${start.hour}${start.minute === 30 ? "30" : "00"}`);
  const endNum = Number(`${end.hour}${end.minute === 30 ? "30" : "00"}`);
  return day.value.reservations.filter(({ time }) => {
    const start = Number(time.start.replace(":", ""));
    const end = Number(time.end.replace(":", ""));
    return startNum < end && endNum > start;
  });
});
</script>
