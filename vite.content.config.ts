import path from "node:path";
import { defineConfig } from "vite";

/**
 * Content script is built as IIFE so Chrome can run it without type="module".
 * Main app (popup/index) is built by the default vite.config.ts.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, "src/extension/content.ts"),
      formats: ["iife"],
      name: "FlatFlowContent",
    },
    rollupOptions: {
      output: {
        entryFileNames: "content.js",
        format: "iife",
        inlineDynamicImports: true,
      },
    },
  },
});
