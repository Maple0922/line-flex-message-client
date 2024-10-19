import { createApp } from "vue";
import App from "./App.vue";

// setup vuetify
import vuetify from "./plugins/vuetify";

// setup webfontloader
import { loadFonts } from "./plugins/webfontloader";
loadFonts();

// setup axios
import axios from "axios";
import { useEnv } from "./utils/environment";
const { API_URL } = useEnv();
axios.defaults.baseURL = API_URL;
createApp(App).config.globalProperties.$axios = axios;

// setup router
import { routes } from "./routes";
import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// setup pwa
import { registerSW } from "virtual:pwa-register";
registerSW();

createApp(App).use(vuetify).use(router).mount("#app");

import "./styles/main.scss";
