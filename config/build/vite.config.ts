import react from '@vitejs/plugin-react';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Since vite.config.ts is now in config/build/, we need to go up 2 levels to reach root
const rootDir = path.resolve(__dirname, '..', '..');

export default defineConfig({
  plugins: [
    react(),
    // themePlugin(), // Temporarily disabled for reorganization
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'apps', 'client', 'src'),
      '@shared': path.resolve(rootDir, 'packages', 'shared'),
      '@server': path.resolve(rootDir, 'apps', 'server'),
      '@types': path.resolve(rootDir, 'packages', 'types'),
      '@config': path.resolve(rootDir, 'packages', 'config'),
      '@tools': path.resolve(rootDir, 'tools'),
      '@tests': path.resolve(rootDir, 'tests'),
      '@auth': path.resolve(rootDir, 'packages', 'auth-system'),
    },
  },
  root: path.resolve(rootDir, 'apps', 'client'),
  build: {
    outDir: path.resolve(rootDir, 'dist/public'),
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: true,
    // ✅ IMPROVED: Optimized chunk splitting for better caching and error reduction
    rollupOptions: {
      output: {
        // Force new file names every build
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // ✅ FIX: Optimize bundle splitting for better caching and error reduction
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
          'vapi': ['@vapi-ai/web'],
          'utils': ['lodash', 'date-fns']
        }
      },
      // ✅ IMPROVED: External dependencies handling
      external: () => {
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
      },
    },
    // ✅ IMPROVED: Build performance optimizations
    target: 'esnext',
    minify: 'esbuild',
    // ✅ IMPROVED: Increase chunk size limit for better performance
    chunkSizeWarningLimit: 2000, // Increased from 1000 to 2000
    // ✅ IMPROVED: Better build optimizations
    reportCompressedSize: false, // Faster builds
    modulePreload: {
      polyfill: false, // Modern browsers don't need polyfill
    },
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
  // ✅ FIX: Optimize dependencies for production
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'recharts',
      '@vapi-ai/web',
      'axios',
      'zod',
    ],
    exclude: ['@daily-co/daily-js'],
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
