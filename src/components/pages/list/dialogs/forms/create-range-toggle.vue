<template>
  <v-btn-toggle
    v-model="createRange"
    color="indigo-darken-4"
    density="compact"
    variant="outlined"
    divided
    mandatory
  >
    <v-btn @click="onChangeRange" :value="0.5">0.5h</v-btn>
    <v-btn @click="onChangeRange" :value="1.0">1.0h</v-btn>
    <v-btn @click="onChangeRange" :value="1.5">1.5h</v-btn>
    <v-btn @click="onChangeRange" :value="2.0">2.0h</v-btn>
  </v-btn-toggle>
</template>

<script lang="ts" setup>
import { strictInject } from "@/utils/strictInject";
import { key } from "@/components/pages/list/provider";

const { createForm, createRange, shiftTime } = strictInject(key);

const onChangeRange = () => {
  const start = createForm.time.start;

  const endHour = Math.floor(
    start.hour + start.minute / 60 + createRange.value
  );
  const endMinute =
    (start.minute === 0 && createRange.value % 1 === 0) ||
    (start.minute === 30 && createRange.value % 1 === 0.5)
      ? 0
      : 30;

  const startHour = start.hour;
  const startMinute = start.minute;

  Object.assign(createForm, {
    time: {
      start: { hour: startHour, minute: startMinute },
      end: { hour: endHour, minute: endMinute },
    },
  });

  const endNum = (endHour + endMinute / 60) * 100;

  if (endNum > 2200) {
    const diff = (endNum - 2200) / 50;
    for (let i = 0; i < diff; i++) {
      shiftTime(-30, "create");
    }
  }
};
</script>
