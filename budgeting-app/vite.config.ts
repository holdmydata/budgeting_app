import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Custom plugin to handle lz4 module resolution
const lz4ResolverPlugin = () => {
  return {
    name: 'vite:lz4-resolver',
    resolveId(id) {
      // Handle the specific import of lz4 from @databricks/sql
      if (id === 'lz4' || id.includes('@databricks/sql/dist/utils/lz4')) {
        return { id: path.resolve(__dirname, 'src/utils/lz4-wrapper.ts'), moduleSideEffects: false };
      }
      return null;
    }
  };
};

// Handle node polyfills
const nodePolyfillsPlugin = () => {
  const globals = {
    Buffer: 'Buffer',
    global: 'globalThis',
    process: 'process',
  };

  return {
    name: 'vite:node-polyfills',
    config: () => ({
      define: Object.entries(globals).reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {}
      ),
    }),
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    lz4ResolverPlugin(),
    nodePolyfillsPlugin(),
  ],
  base: './',
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        {
          name: 'external-node-modules',
          setup(build) {
            // Mark lz4 as external to prevent esbuild from trying to bundle it
            build.onResolve({ filter: /^lz4$/ }, () => {
              return { path: path.resolve(__dirname, 'src/utils/lz4-wrapper.ts'), external: false };
            });
          },
        },
      ],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].css'
          }
          return 'assets/[name]-[hash][extname]'
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
    sourcemap: false,
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'lz4': path.resolve(__dirname, 'src/utils/lz4-wrapper.ts'),
      'buffer': 'buffer',
      'node:buffer': 'buffer',
      'stream': 'stream-browserify',
      'util': 'util',
    },
  },
  define: {
    'process.env': {},
    'process.browser': true,
    'global': 'globalThis',
    '__filename': JSON.stringify(''),
    '__dirname': JSON.stringify('')
  },
  server: {
    port: 5173,
    headers: {
      'Content-Security-Policy': "default-src 'self' blob: data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: http://localhost:5000 http://localhost:4000 https://res.cdn.office.net; worker-src 'self' blob:;"
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/graphql': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
})
