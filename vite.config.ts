import { defineConfig } from "vite";
import { resolve } from "path";

import vue from "@vitejs/plugin-vue";

import { VitePWA } from "vite-plugin-pwa";

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      manifest: {
        lang: "ja",
        name: "BUYO",
        short_name: "BUYO",
        icons: [
          {
            src: "./favicon.ico",
            sizes: "256x256",
            type: "image/x-icon",
          },
          {
            src: "./favicon.png",
            sizes: "256x256",
            type: "image/png",
          },
        ],
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        orientation: "portrait-primary",
        scope: "/",
      },
    }),
  ],
});
