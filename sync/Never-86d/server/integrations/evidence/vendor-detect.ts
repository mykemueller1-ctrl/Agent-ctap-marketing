import type { VendorKey } from "./types";

const FINGERPRINTS: Array<{ vendorKey: VendorKey; test: RegExp }> = [
  { vendorKey: "pdq_payout", test: /\bpay\s*out\b/i },
  { vendorKey: "hyvee_wine", test: /hy-?vee\s+wine|wine\s*&\s*spirits/i },
  { vendorKey: "hyvee_grocery", test: /hy-?vee|employee owned/i },
  { vendorKey: "performance_foods", test: /performance\s+food/i },
  { vendorKey: "sysco", test: /\bsysco\b/i },
  {
    vendorKey: "northern_lights",
    test: /northern\s+lights/i,
  },
  { vendorKey: "sawyer_meats", test: /sawyer/i },
  { vendorKey: "humes", test: /humes\s+distribut/i },
  {
    vendorKey: "fort_dodge_distributing",
    test: /ft\.?\s*dodge\s+distribut|fort\s+dodge\s+distribut/i,
  },
  { vendorKey: "confluence", test: /confluence/i },
  { vendorKey: "pdq", test: /z\s*-?\s*report|sales summary/i },
];

export function detectVendorKey(
  text: string,
  hinted?: string
): VendorKey | undefined {
  if (hinted && hinted !== "demo_vendor") return hinted as VendorKey;
  for (const { vendorKey, test } of FINGERPRINTS) {
    if (test.test(text)) return vendorKey;
  }
  return undefined;
}
