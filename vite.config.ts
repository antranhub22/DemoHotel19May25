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
      "@auth": path.resolve(__dirname, "packages", "auth-system"),
    },
  },
  root: path.resolve(__dirname, "apps", "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: true,
    // Optimized chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'chart-vendor': ['recharts', 'd3-scale', 'd3-shape'],
          'utility-vendor': ['axios', 'jwt-decode', 'zod', 'clsx', 'tailwind-merge'],
          'voice-vendor': ['@vapi-ai/web', '@daily-co/daily-js'],
        },
        // Optimized chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Build performance optimizations
    target: 'esnext',
    minify: 'esbuild',
    // Increase chunk size limit for better performance
    chunkSizeWarningLimit: 1000,
  },
  // Development optimizations
  server: {
    port: 3000,
    open: false,
    hmr: {
      overlay: false,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'recharts',
      'axios',
      'zod',
    ],
    exclude: [
      '@vapi-ai/web',
      '@daily-co/daily-js',
    ],
  },
  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        charset: false,
      },
    },
  },
  // Enable experimental features for better performance
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'esnext',
    platform: 'browser',
  },
});
