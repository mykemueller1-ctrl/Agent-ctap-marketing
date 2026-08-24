import { defineConfig, type Plugin } from "vitest/config";

/**
 * The `sync/Never-86d/` tree is a cherry-pick patch for the private `Never-86d`
 * monorepo (see docs/ctap-intake/README.md). A few boundary modules the PDQ
 * detector imports (`../gmail`, `../pdf`, `../../../drizzle/schema`) live in that
 * monorepo and are intentionally not synced here. To exercise the synced logic
 * standalone we resolve those specifiers to lightweight test doubles WITHOUT
 * adding files into the `sync/` tree, so the patch stays clean for cherry-picking.
 *
 * The synced tests never invoke these doubles' behavior — they only need the
 * imported symbols to exist so the modules load. The evidence/ module is fully
 * self-contained and unaffected by this plugin.
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
    include: ["sync/Never-86d/server/integrations/**/*.test.ts"],
    environment: "node",
  },
});
