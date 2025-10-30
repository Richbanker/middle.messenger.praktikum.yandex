import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'static',
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: 'index.html',
        auth: 'auth.html',
        register: 'register.html',
        chats: 'chats.html',
        profile: 'profile.html',
        notFound: '404.html',
        error500: '500.html'
      }
    }
  }
});
