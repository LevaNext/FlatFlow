import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, "src/extension/background.ts"),
      formats: ["es"],
      fileName: () => "background.js",
    },
    rollupOptions: {
      output: {
        entryFileNames: "background.js",
        format: "es",
        inlineDynamicImports: true,
      },
    },
  },
});
