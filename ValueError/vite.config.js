import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Setiap request yang diawali '/api' akan diteruskan ke backend
      "/api": {
        target: "http://10.82.128.221:8000", // IP Backend kamu
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""), // Hapus prefix '/api' sebelum dikirim ke backend
      },
    },
  },
});
