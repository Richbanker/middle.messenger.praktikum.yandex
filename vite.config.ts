import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/middle.messenger.praktikum.yandex/' : '/',
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
