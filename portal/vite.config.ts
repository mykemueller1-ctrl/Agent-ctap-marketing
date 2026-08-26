import { defineConfig } from "vite";

export default defineConfig({
  root: "portal",
  publicDir: "public",
  // Relative so GitHub Pages project URL and gh-pages CDNs both load assets.
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
