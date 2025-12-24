import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import checker from 'vite-plugin-checker';
import { vitePluginBuildInfo } from './build/plugins/vite-plugin-build-info.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html'),
    },
  },
  server: {
    port: 3000,
    open: '/',
    host: true,
    proxy: {
      '/api': {
        target: 'https://ya-praktikum.tech',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: '',
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  plugins: [
    vitePluginBuildInfo({
      outputFile: 'build-info.json',
      includeGitInfo: true,
    }),
    handlebars({
      partialDirectory: resolve(__dirname, './src/partials'),
      context: {
        username: 'Evgen',
      },
    }),
    checker({
      typescript: {
        tsconfigPath: 'tsconfig.json',
        buildMode: true,
      },
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,js}"',
        useFlatConfig: true,
        dev: {
          logLevel: ['error', 'warning'],
        },
        build: {
          failOnError: false,
        },
      },
      stylelint: {
        lintCommand: 'stylelint "src/**/*.scss"',
        dev: {
          logLevel: ['error', 'warning'],
        },
        build: {
          failOnError: true,
        },
      },
    }),
  ],
});
