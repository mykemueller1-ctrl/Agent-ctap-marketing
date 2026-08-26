import { defineConfig, type Plugin } from "vitest/config";

/**
 * The `sync/Never-86d/` tree is a cherry-pick patch for the private `Never-86d`
 * monorepo. Boundary modules (`../gmail`, `../pdf`, `../../../drizzle/schema`)
 * live there and are stubbed here so tests run standalone.
 */
const boundaryStubs: Record<string, string> = {
  "../gmail": `
    export function searchAndReadGmail() {
      throw new Error("gmail boundary stub: provided by the Never-86d monorepo, not synced here");
    }
    export function findPdfAttachments() { return []; }
    export async function getAttachmentBuffer() { return new Uint8Array(); }
    export function hashAttachment() { return ""; }
  `,
  "../pdf": `
    export async function extractPdfTextFromBuffer() { return { text: "", warnings: [] }; }
  `,
  "../../../drizzle/schema": `export {};`,
};

const STUB_PREFIX = "\0ctap-boundary-stub:";

function boundaryStubPlugin(): Plugin {
  return {
    name: "ctap-boundary-stubs",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !importer.includes("/sync/Never-86d/")) return null;
      if (Object.prototype.hasOwnProperty.call(boundaryStubs, source)) {
        return STUB_PREFIX + source;
      }
      return null;
    },
    load(id) {
      if (id.startsWith(STUB_PREFIX)) {
        return boundaryStubs[id.slice(STUB_PREFIX.length)];
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [boundaryStubPlugin()],
  test: {
    include: [
      "sync/**/*.test.ts",
    ],
    environment: "node",
  },
});
