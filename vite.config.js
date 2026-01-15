import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/4ad-tabs/" : "/",
  resolve: {
    extensions: [".js", ".jsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
