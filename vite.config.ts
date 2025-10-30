import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'static',
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
