import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 5173,
    proxy: {
      "/trpc": {
        target: process.env.VITE_SERVER_URL ?? "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});
