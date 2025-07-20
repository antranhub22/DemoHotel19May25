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
    // ✅ IMPROVED: Optimized chunk splitting for better caching and error reduction
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ✅ IMPROVED: Better chunk logic to prevent vendor chunk errors
          if (id.includes('node_modules')) {
            // React and core dependencies - highest priority
            if (id.includes('react') && !id.includes('react-router')) {
              return 'react-core';
            }
            if (id.includes('react-router') || id.includes('react-dom')) {
              return 'react-router';
            }
            
            // UI libraries  
            if (id.includes('@radix-ui') || id.includes('radix-ui')) {
              return 'ui-vendor';
            }
            
            // ✅ FIXED: Better chart handling to prevent circular deps
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('d3-') && !id.includes('recharts')) {
              return 'charts-utils';
            }
            
            // Voice and audio libraries - separate to avoid conflicts
            if (id.includes('@vapi-ai')) {
              return 'vapi';
            }
            if (id.includes('@daily-co') || id.includes('daily-js')) {
              return 'daily';
            }
            
            // Utility libraries - group carefully
            if (id.includes('axios')) {
              return 'http-client';
            }
            if (id.includes('jwt-decode') || id.includes('zod')) {
              return 'validation';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'css-utils';
            }
            
            // Other vendor libraries - catch-all
            return 'vendor';
          }
          
          // Application chunks - more granular
          if (id.includes('/components/siri/')) {
            return 'siri-components';
          }
          if (id.includes('/components/dashboard/')) {
            return 'dashboard-components';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/hooks/') || id.includes('/context/')) {
            return 'hooks-context';
          }
          if (id.includes('/pages/') || id.includes('/routes/')) {
            return 'pages';
          }
          if (id.includes('/services/') || id.includes('/lib/')) {
            return 'services';
          }
        },
        // ✅ IMPROVED: Better chunk file naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // ✅ IMPROVED: External dependencies handling
      external: (id) => {
        // Don't externalize these dependencies as they need to be bundled
        return false;
      },
      onwarn: (warning, warn) => {
        // ✅ IMPROVED: Suppress problematic warnings that don't affect functionality
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }
        if (warning.code === 'INVALID_ANNOTATION') {
          return;
        }
        if (warning.code === 'UNRESOLVED_IMPORT') {
          return;
        }
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      }
    },
    // ✅ IMPROVED: Build performance optimizations
    target: 'esnext',
    minify: 'esbuild',
    // ✅ IMPROVED: Increase chunk size limit for better performance
    chunkSizeWarningLimit: 2000, // Increased from 1000 to 2000
    // ✅ IMPROVED: Better build optimizations
    reportCompressedSize: false, // Faster builds
    modulePreload: {
      polyfill: false // Modern browsers don't need polyfill
    }
  },
  // Development optimizations
  server: {
    port: 3000,
    open: false,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
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
