import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
    exclude: []
  },
  server: {
    host: true,                 // ⭐ cho phép truy cập từ ngoài
    port: 5173,                 // ⭐ giữ cố định port
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  }
});