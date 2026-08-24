/**
 * Kenzy one-tap Hy-Vee send. Myke is not in this loop.
 * Source of truth = qty>0 on the live liquor Google Sheet.
 */

export const HYVEE_ONE_CLICK_SHEET_ID =
  "1_gAesi5ufLOHsQ_uan3PEfzcOaVg4gxP8P7F_YHMHbU";

export const HYVEE_MIXER_STOP =
  /^(tonic|diet\s*7|ginger beer|bloody mary|squirt|simple syrup)/i;

export type LiquorSheetRow = {
  name: string;
  qty: number | string | null | undefined;
};

export function liquorQtyLines(rows: LiquorSheetRow[]): string[] {
  const lines: string[] = [];
  for (const row of rows) {
    const name = String(row.name ?? "").trim();
    if (!name) continue;
    if (/^total$/i.test(name) || /over\s*\/\s*under/i.test(name)) continue;
    if (HYVEE_MIXER_STOP.test(name)) break;
    const qty = Number(row.qty);
    if (!Number.isFinite(qty) || qty <= 0) continue;
    lines.push(`${name} - ${qty}`);
  }
  return lines;
}

/** Kenzy's text format. No Myke on the email. */
export function kenzyHyveeEmail(options: {
  to: string;
  lines: string[];
}): { to: string; subject: string; body: string } {
  return {
    to: options.to,
    subject: "Community Tap & Pizza — weekly liquor order",
    body: [
      "Community liquor order —",
      "",
      ...options.lines.map(line => `*${line}`),
      "",
      "Thanks,",
      "Kenzy Thompson",
      "Community Tap & Pizza",
      "communitypizza2026@gmail.com",
    ].join("\n"),
  };
}
