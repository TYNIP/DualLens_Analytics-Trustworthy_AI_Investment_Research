import { describe, expect, it } from "vitest";

import { PdfJsProcessor } from "./pdfjs-processor";
import { normalizeExtractedText, validatePdfFile } from "./processor";

function createTextPdf(text: string): ArrayBuffer {
  const stream = `BT /F1 18 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let source = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(source.length);
    source += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = source.length;
  source += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  source += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  source += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(source).buffer;
}

describe("PDF processing", () => {
  it("extracts readable page text with PDF.js", async () => {
    const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    (globalThis as typeof globalThis & { pdfjsWorker?: typeof worker }).pdfjsWorker = worker;
    const result = await new PdfJsProcessor().extract(
      createTextPdf("DualLens PDF evidence"),
      "fixture.pdf",
    );
    expect(result.pageCount).toBe(1);
    expect(result.pages[0]).toMatchObject({ pageNumber: 1, text: "DualLens PDF evidence" });
    delete (globalThis as typeof globalThis & { pdfjsWorker?: typeof worker }).pdfjsWorker;
  });

  it("validates extension, MIME, empty, and size constraints", () => {
    expect(validatePdfFile({ name: "report.txt", size: 10, type: "text/plain" })).toMatch(/\.pdf/);
    expect(validatePdfFile({ name: "report.pdf", size: 0, type: "application/pdf" })).toMatch(
      /empty/i,
    );
    expect(
      validatePdfFile({ name: "report.pdf", size: 26 * 1024 * 1024, type: "application/pdf" }),
    ).toMatch(/too large/i);
    expect(validatePdfFile({ name: "report.pdf", size: 10, type: "application/pdf" })).toBeNull();
  });

  it("normalizes PDF control characters and whitespace", () => {
    expect(normalizeExtractedText("  Alpha\u0000   beta \n\n\n gamma  ")).toBe("Alpha beta\ngamma");
  });
});
