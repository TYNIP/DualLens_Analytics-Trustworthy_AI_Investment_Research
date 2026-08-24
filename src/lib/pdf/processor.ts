export interface ExtractedPdfPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedPdfDocument {
  filename: string;
  pageCount: number;
  pages: ExtractedPdfPage[];
}

export interface PdfProcessor {
  extract(
    source: ArrayBuffer,
    filename: string,
    options?: {
      signal?: AbortSignal;
      onProgress?: (page: number, total: number) => void;
    },
  ): Promise<ExtractedPdfDocument>;
}

export const MAX_PDF_BYTES = 25 * 1024 * 1024;

export function validatePdfFile(file: Pick<File, "name" | "size" | "type">): string | null {
  if (!file.name.toLowerCase().endsWith(".pdf")) return "Choose a file with a .pdf extension.";
  if (file.size === 0) return "The selected PDF is empty.";
  if (file.size > MAX_PDF_BYTES)
    return "This PDF is too large to process safely in this browser session (25 MB maximum).";
  if (file.type && !["application/pdf", "application/octet-stream"].includes(file.type))
    return "The selected file is not recognized as a PDF.";
  return null;
}

export function normalizeExtractedText(value: string): string {
  return value
    .split("\u0000")
    .join("")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
