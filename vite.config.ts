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
        index: 'pages/index.html',
        auth: 'pages/auth.html',
        register: 'pages/register.html',
        chats: 'pages/chats.html',
        profile: 'pages/profile.html',
        notFound: 'pages/404.html',
        error500: 'pages/500.html'
      }
    }
  }
});
