import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    allowedHosts: ['943c-2409-40c1-3024-3ce0-75e2-d867-6947-887a.ngrok-free.app'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          resume: ['html2canvas', 'jspdf', 'react-beautiful-dnd'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@react-pdf/renderer'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@react-pdf/renderer': '@react-pdf/renderer',
    },
  },
});
