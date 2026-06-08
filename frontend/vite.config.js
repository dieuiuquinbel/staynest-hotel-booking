// Chức năng: Cấu hình Vite, React plugin và proxy/dev server cho frontend.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cấu hình dev server cho frontend.
// Không khóa cứng port để tránh lỗi khi Vite cũ vẫn còn chạy trên máy.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5714,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
