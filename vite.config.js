import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/index.html"),
    },
  },
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, "./src/partials"),
      context: {
        username: "Evgen",
      },
    }),
  ],
  server: {
    port: 3000,
    open: "/",
    host: true,
    proxy: {
      "/api": {
        target: "https://ya-praktikum.tech",
        changeOrigin: true,
        secure: true,
        // важно: переписываем домен cookie на localhost, иначе браузер игнорирует Set-Cookie от прокси
        cookieDomainRewrite: "",
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  base: "./",
});
