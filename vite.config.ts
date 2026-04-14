import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://39.97.234.93:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', '')
      }
    }
  },
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    global: 'window'
  }
});
