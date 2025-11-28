import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },

  // 👇 Correct base URL (your actual repo name)
  base: "/TreasureTrack/",

  // 👇 Output ALWAYS in dist folder (required for gh-pages)
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "https://treasure-backen-production.up.railway.app",
        changeOrigin: true,
      },
    },
  },
});
