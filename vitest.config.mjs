import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    include: ["./test/**/*.test.ts"],
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
    },
    environment: "node",
  },

  plugins: [
    swc.vite({
      module: { type: "es6" },
      tsconfigFile: 'tsconfig.json'
    }),
  ],
});
