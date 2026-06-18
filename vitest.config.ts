import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Stub next-intl/navigation so routing.ts can be imported in jsdom
      "next-intl/navigation": path.resolve(
        __dirname,
        "src/__mocks__/next-intl-navigation.ts"
      ),
    },
  },
});
