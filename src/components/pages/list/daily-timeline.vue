<template>
  <v-container class="timeline">
    <div class="timeline__header">
      <div class="timeline__header__left">
        <v-btn
          variant="text"
          density="comfortable"
          color="indigo-darken-4"
          @click="shift(-7)"
          icon="mdi-chevron-double-left"
        />
        <v-btn
          variant="text"
          density="comfortable"
          color="indigo-darken-4"
          @click="shift(-1)"
          icon="mdi-chevron-left"
        />
      </div>
      <p class="header__title">
        {{ formatDate(props.day.date, "YYYY年M月D日 (ddd)") }}
      </p>
      <div class="timeline__header__right">
        <v-btn
          variant="text"
          density="comfortable"
          color="indigo-darken-4"
          @click="shift(1)"
          icon="mdi-chevron-right"
        />
        <v-btn
          variant="text"
          density="comfortable"
          color="indigo-darken-4"
          @click="shift(7)"
          icon="mdi-chevron-double-right"
        />
      </div>
    </div>
    <div class="timeline__main">
      <div class="main__left">
        <p class="main__left__time" v-for="time in times" :key="time">
          {{ time }}:00
        </p>
      </div>
      <div class="main__center" @click="onClickTimeline">
        <div class="main__center__line" v-for="time in times" :key="time"></div>
      </div>
      <div class="main__reservations">
        <span
          class="main__reservations__item"
          v-for="reservation in props.day.reservations"
          :key="reservation.id"
          :style="generateReservationStyle(reservation)"
          @click="onClickReservation(reservation)"
        >
          <span class="main__reservations__item__inner">
            <p class="main__reservations__item__name">{{ reservation.name }}</p>
            <p class="main__reservations__item__time">
              {{ reservation.time.start }} - {{ reservation.time.end }}
            </p>
          </span>
        </span>
      </div>
    </div>
  </v-container>
  <create-dialog />
  <edit-dialog />
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import { Day } from "@/types";
import { formatDate } from "@/utils/dateFormatter";
import { Reservation } from "@/types";

import CreateDialog from "./dialogs/create.vue";
import EditDialog from "./dialogs/edit.vue";

import { strictInject } from "@/utils/strictInject";
import { key } from "@/components/pages/list/provider";

const {
  clickedRow,
  dialogVisible,
  createForm,
  editForm,
  createRange,
  editRange,
} = strictInject(key);

const props = defineProps<{ day: Day }>();
const emits = defineEmits<{ (e: "shift", diff: number): void }>();

const shift = (diff: number): void => {
  emits("shift", diff);
};

const times = Array.from({ length: 15 }, (_, i) => i + 8);

const onClickTimeline = (e: any) => {
  const date = props.day.date;
  const time = Math.floor(e.layerY / 48) + 8;
  if (!date || time < 8 || time >= 22) return;
  Object.assign(clickedRow, { date, time });

  createRange.value = time === 21 ? 1 : 2;

  Object.assign(createForm, {
    name: "",
    date,
    time: {
      start: { hour: time, minute: 0 },
      end: { hour: time + createRange.value, minute: 0 },
    },
    code: "",
  });

  Object.assign(dialogVisible, { create: true });
};

const onClickReservation = (reservation: Reservation) => {
  const [startHour, startMinute] = reservation.time.start.split(":");
  const [endHour, endMinute] = reservation.time.end.split(":");
  Object.assign(editForm, {
    id: reservation.id,
    name: reservation.name,
    date: props.day.date,
    time: {
      start: { hour: Number(startHour), minute: Number(startMinute) },
      end: { hour: Number(endHour), minute: Number(endMinute) },
    },
    code: "",
  });

  const startNum = Number(`${startHour}${startMinute === "30" ? "50" : "00"}`);
  const endNum = Number(`${endHour}${endMinute === "30" ? "50" : "00"}`);

  editRange.value = (endNum - startNum) / 100;

  Object.assign(dialogVisible, { edit: true });
};

const generateReservationStyle = (reservation: Reservation) => {
  const start = reservation.time.start;
  const end = reservation.time.end;
  const startHour =
    Number(start.split(":")[0]) + Number(start.split(":")[1]) / 60;
  const endHour = Number(end.split(":")[0]) + Number(end.split(":")[1]) / 60;
  const top = (startHour - 8) * 48 + 1;
  const height = (endHour - startHour) * 48 - 1;
  return {
    top: `${top}px`,
    height: `${height}px`,
  };
};
</script>

<style lang="scss" scoped>
.timeline {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__main {
    display: flex;
    gap: 8px;
    position: relative;
  }
}
.header {
  &__title {
    font-size: 1rem;
    font-weight: bold;
  }
}

.main {
  &__left {
    width: 36px;
    &__time {
      height: 48px;
      text-align: right;
      position: relative;
      font-size: 12px;
      top: -8px;
      color: #666;
      font-weight: bold;
    }
  }
  &__center {
    width: calc(100% - 72px);
    &__line {
      height: 48px;
      border-top: 1px solid #ccc;
    }
  }
  &__reservations {
    position: absolute;
    top: 0;
    left: 44px;
    width: calc(100% - 72px);
    &__item {
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 1px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &__inner {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        width: 100%;
        height: 100%;
        background-color: #1a237e;
        border-radius: 4px;
        padding: 2px 8px;
      }
      &__name {
        font-size: 12px;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: white;
      }
      &__time {
        font-size: 12px;
        font-weight: bold;
        color: white;
      }
    }
  }
}
</style>
