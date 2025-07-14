import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    themePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "apps", "client", "src"),
      "@shared": path.resolve(__dirname, "packages", "shared"),
      "@server": path.resolve(__dirname, "apps", "server"),
      "@types": path.resolve(__dirname, "packages", "types"),
      "@config": path.resolve(__dirname, "packages", "config"),
      "@tools": path.resolve(__dirname, "tools"),
      "@tests": path.resolve(__dirname, "tests"),
    },
  },
  root: path.resolve(__dirname, "apps", "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  },
});
