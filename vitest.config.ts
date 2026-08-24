import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "sync/Never-86d/server/integrations/evidence/**/*.test.ts",
      "sync/Never-86d/server/calendar/**/*.test.ts",
    ],
    environment: "node",
  },
});
