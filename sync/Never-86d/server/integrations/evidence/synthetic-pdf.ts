/**
 * Synthetic PDF builder for fixtures and tests.
 * Never encode a real vendor invoice, POS export, or mailbox here.
 */

export function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildMinimalPdf(lines: string[]): Buffer {
  const ops = [
    "BT",
    "/F1 12 Tf",
    "72 720 Td",
    ...lines.flatMap((line, index) =>
      index === 0
        ? [`(${escapePdfText(line)}) Tj`]
        : ["0 -16 Td", `(${escapePdfText(line)}) Tj`]
    ),
    "ET",
  ].join("\n");

  const stream = `<< /Length ${Buffer.byteLength(ops, "latin1")} >>\nstream\n${ops}\nendstream`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    stream,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body, "latin1"));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefPos = Buffer.byteLength(body, "latin1");
  const xref = objects
    .map((_, index) => `${String(offsets[index + 1]).padStart(10, "0")} 00000 n \n`)
    .join("");

  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${xref}`;
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(body, "latin1");
}

export type SyntheticInvoice = {
  vendorName: string;
  invoiceNumber: string;
  date: string;
  lines: Array<{
    product: string;
    quantity: number;
    unit: string;
    unitPrice: string;
    total: string;
  }>;
  total: string;
};

/** Obvious fake vendor — not a CTAP distributor. */
export const SYNTHETIC_INVOICE: SyntheticInvoice = {
  vendorName: "ACME Test Produce LLC",
  invoiceNumber: "INV-1001",
  date: "08/01/2026",
  lines: [
    {
      product: "Demo Romaine Case",
      quantity: 2,
      unit: "CS",
      unitPrice: "12.50",
      total: "25.00",
    },
    {
      product: "Demo Tomato Case",
      quantity: 1,
      unit: "CS",
      unitPrice: "18.00",
      total: "18.00",
    },
  ],
  total: "43.00",
};

export function buildSyntheticInvoicePdf(
  invoice: SyntheticInvoice = SYNTHETIC_INVOICE
): Buffer {
  const lines = [
    invoice.vendorName,
    `Invoice ${invoice.invoiceNumber}`,
    `Date ${invoice.date}`,
    ...invoice.lines.map(
      (line) =>
        `${line.product}  ${line.quantity} ${line.unit}  $${line.unitPrice}  $${line.total}`
    ),
    `Total $${invoice.total}`,
  ];
  return buildMinimalPdf(lines);
}

export function syntheticInvoicePlainText(
  invoice: SyntheticInvoice = SYNTHETIC_INVOICE
): string {
  return [
    invoice.vendorName,
    `Invoice ${invoice.invoiceNumber}`,
    `Date ${invoice.date}`,
    ...invoice.lines.map(
      (line) =>
        `${line.product}  ${line.quantity} ${line.unit}  $${line.unitPrice}  $${line.total}`
    ),
    `Total $${invoice.total}`,
  ].join("\n");
}

/** 1x1 PNG — not a photographed invoice. */
export const SYNTHETIC_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);
