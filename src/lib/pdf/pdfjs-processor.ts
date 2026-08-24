import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { normalizeExtractedText } from "@/lib/pdf/processor";
import type { ExtractedPdfDocument, PdfProcessor } from "@/lib/pdf/processor";

export class PdfJsProcessor implements PdfProcessor {
  public async extract(
    source: ArrayBuffer,
    filename: string,
    options: {
      signal?: AbortSignal;
      onProgress?: (page: number, total: number) => void;
    } = {},
  ): Promise<ExtractedPdfDocument> {
    const pdfjs =
      typeof globalThis.DOMMatrix === "undefined"
        ? await import("pdfjs-dist/legacy/build/pdf.mjs")
        : await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const task = pdfjs.getDocument({ data: new Uint8Array(source) });

    try {
      const pdf = await task.promise;
      const pageCount = pdf.numPages;
      const pages = [];
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        if (options.signal?.aborted) throw new DOMException("Indexing cancelled.", "AbortError");
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const raw = content.items
          .flatMap((item) => ("str" in item ? [item] : []))
          .map((item) => `${item.str}${item.hasEOL ? "\n" : " "}`)
          .join("");
        pages.push({ pageNumber, text: normalizeExtractedText(raw) });
        options.onProgress?.(pageNumber, pageCount);
        page.cleanup();
      }
      return { filename, pageCount, pages };
    } finally {
      await task.destroy();
    }
  }
}
