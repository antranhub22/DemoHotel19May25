import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(
        new URL("../../packages/shared", import.meta.url),
      ),
    },
  },
  server: {
    fs: {
      allow: [
        fileURLToPath(new URL("./", import.meta.url)),
        fileURLToPath(new URL("../../packages", import.meta.url)),
        fileURLToPath(new URL("../../", import.meta.url)),
      ],
    },
  },
});
