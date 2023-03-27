import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuejsx from "@vitejs/plugin-vue-jsx";
import { libInjectCss } from "./inject-css-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), libInjectCss(), vuejsx()],
  build: {
    lib: {
      entry: {
        OmegaDialog: "./src/components/OmegaDialog.vue",
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        dir: './dist',
        preserveModules: true // 为 false 就只会产生一个 chunk
      }
    },
  },
});
