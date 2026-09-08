import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@apps': path.resolve(__dirname, './apps'),
      '/shared': path.resolve(__dirname, './shared')
    }
  },
  server: {
    port: 3000
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
