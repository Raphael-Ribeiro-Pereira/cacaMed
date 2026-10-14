import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { pacoteRevisado } from "./scripts/pacoteRevisado.mjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [pacoteRevisado(), react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
