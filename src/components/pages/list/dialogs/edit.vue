<template>
  <v-dialog v-model="visible" transition="dialog-bottom-transition">
    <v-card :loading="editLoading">
      <v-toolbar
        density="comfortable"
        color="indigo-lighten-4"
        variant="outlined"
      >
        <v-toolbar-title>
          <v-icon icon="mdi-calendar-edit" size="small" />
          <span class="font-weight-bold text-body-1"> 変更</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-container>
        <v-row>
          <v-col class="pb-0">
            <p class="font-weight-bold text-h6">
              {{ formatDate(editForm.date, "YYYY年M月D日 (ddd)") }}
            </p>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-col cols="2">
            <v-btn
              variant="text"
              density="comfortable"
              color="indigo-darken-4"
              @click="shiftTime(-30, 'edit')"
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
              @click="shiftTime(30, 'edit')"
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
                  >変更可能です</span
                >
              </template>
            </v-alert>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="editForm.name"
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
              v-model="editForm.code"
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
        <v-btn
          color="red-darken-4"
          :loading="deleteLoading"
          :disabled="deleteDisabled || editLoading"
          variant="flat"
          @click="destroy"
          icon="mdi-trash-can-outline"
        />
        <v-spacer />
        <v-btn
          color="yellow-darken-4"
          :loading="editLoading"
          :disabled="editDisabled || deleteLoading"
          variant="flat"
          @click="edit"
          icon="mdi-pencil"
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
import RangeToggle from "./forms/edit-range-toggle.vue";
import { ReservationEditForm, Reservation } from "@/types";

import { formatDate } from "@/utils/dateFormatter";
const {
  dialogVisible,
  editForm,
  day,
  shiftTime,
  setSnackbar,
  fetchReservations,
} = strictInject(key);
const { edit: visible } = toRefs(dialogVisible);

const displayDatetime = computed(() => {
  const start = editForm.time.start;
  const end = editForm.time.end;
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

const editLoading = ref(false);
const deleteLoading = ref(false);

const editDisabled = computed(
  () =>
    !editForm.name ||
    !editForm.code ||
    editForm.name.length > 114514 ||
    !/^\d{4}$/.test(editForm.code) ||
    duplicateBands.value.length
);

const deleteDisabled = computed(
  () => !editForm.code || !/^\d{4}$/.test(editForm.code)
);

const edit = async () => {
  editLoading.value = true;

  const request = generateEditRequest(editForm);

  try {
    await axios.put(`/reserve/${editForm.id}`, request);
    await fetchReservations();
    setSnackbar("yellow-darken-4", `「${editForm.name}」を変更しました。`);
    visible.value = false;
    Object.assign(editForm, {
      name: "",
      code: "",
    });
  } catch (error: any) {
    if (error.response.status === 403) {
      setSnackbar("yellow-darken-4", `パスコードが違います。`);
    } else {
      setSnackbar(
        "red-darken-4",
        `エラーが発生しました。お手数ですが時間をおいて再度お試しください。`
      );
      visible.value = false;
      Object.assign(editForm, {
        name: "",
        code: "",
      });
    }
  } finally {
    editLoading.value = false;
  }
};

const destroy = async () => {
  deleteLoading.value = true;

  const request = generateDeleteRequest(editForm);

  try {
    await axios.delete(`/reserve/${editForm.id}`, { data: request });
    await fetchReservations();
    setSnackbar("red-darken-4", `「${editForm.name}」を削除しました。`);
    visible.value = false;
    Object.assign(editForm, {
      name: "",
      code: "",
    });
  } catch (error: any) {
    if (error.response.status === 403) {
      setSnackbar("yellow-darken-4", `パスコードが違います。`);
    } else {
      setSnackbar(
        "red-darken-4",
        `エラーが発生しました。お手数ですが時間をおいて再度お試しください。`
      );
      visible.value = false;
      Object.assign(editForm, {
        name: "",
        code: "",
      });
    }
  } finally {
    deleteLoading.value = false;
  }
};

const generateEditRequest = (editForm: ReservationEditForm) => {
  const start = editForm.time.start;
  const end = editForm.time.end;

    const startTime = formatDate(
    `${editForm.date} ${start.hour < 10 ? `0${start.hour}` : start.hour}:${start.minute === 0 ? "00" : "30"}`,
    "YYYY-MM-DD HH:mm:ss"
  );
  const endTime = formatDate(
    `${editForm.date} ${end.hour < 10 ? `0${end.hour}` : end.hour}:${end.minute === 0 ? "00" : "30"}`,
    "YYYY-MM-DD HH:mm:ss"
  );

  return {
    start: startTime,
    end: endTime,
    name: editForm.name,
    passcode: editForm.code,
  };
};

const generateDeleteRequest = (editForm: ReservationEditForm) => ({
  passcode: editForm.code,
});

const duplicateBands = computed<Reservation[]>(() => {
  const start = editForm.time.start;
  const end = editForm.time.end;
  const startNum = Number(`${start.hour}${start.minute === 30 ? "30" : "00"}`);
  const endNum = Number(`${end.hour}${end.minute === 30 ? "30" : "00"}`);
  return day.value.reservations.filter(({ id, time }) => {
    const start = Number(time.start.replace(":", ""));
    const end = Number(time.end.replace(":", ""));
    return startNum < end && endNum > start && id !== editForm.id;
  });
});
</script>
