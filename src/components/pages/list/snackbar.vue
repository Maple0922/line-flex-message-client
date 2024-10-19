<template>
  <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    transition="slide-y-reverse-transition"
  >
    {{ snackbar.text }}
    <template #actions>
      <v-btn variant="text" @click="onClickClose">
        <v-icon icon="mdi-close" />
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { strictInject } from "@/utils/strictInject";
import { key } from "@/components/pages/list/provider";

const { snackbar } = strictInject(key);

const onClickClose = () => {
  Object.assign(snackbar, { visible: false });
};
</script>
