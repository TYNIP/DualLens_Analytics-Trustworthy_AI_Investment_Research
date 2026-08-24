import type { ExtractedPdfPage } from "@/lib/pdf/processor";

export const CHUNKING_VERSION = "chars-v1-1000-200";
export const DEFAULT_CHUNK_SIZE = 1000;
export const DEFAULT_CHUNK_OVERLAP = 200;

export interface ChunkDraft {
  id: string;
  documentId: string;
  companyId: string;
  page: number;
  chunkIndex: number;
  text: string;
  chunkingVersion: string;
}

export interface ChunkingOptions {
  chunkSize?: number;
  overlap?: number;
}

function chooseBoundary(text: string, start: number, target: number): number {
  if (target >= text.length) return text.length;
  const minimum = start + Math.floor((target - start) * 0.6);
  const candidates = ["\n\n", ". ", "\n", " "];
  for (const separator of candidates) {
    const boundary = text.lastIndexOf(separator, target);
    if (boundary >= minimum) return boundary + separator.length;
  }
  return target;
}

export function chunkPages(
  pages: ExtractedPdfPage[],
  documentId: string,
  companyId: string,
  options: ChunkingOptions = {},
): ChunkDraft[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_CHUNK_OVERLAP;
  if (chunkSize < 100) throw new Error("Chunk size must be at least 100 characters.");
  if (overlap < 0 || overlap >= chunkSize)
    throw new Error("Chunk overlap must be non-negative and smaller than chunk size.");

  const chunks: ChunkDraft[] = [];
  for (const page of pages) {
    const text = page.text.trim();
    if (!text) continue;
    let start = 0;
    let pageChunkIndex = 0;
    while (start < text.length) {
      const end = chooseBoundary(text, start, Math.min(start + chunkSize, text.length));
      const chunkText = text.slice(start, end).trim();
      if (chunkText) {
        chunks.push({
          id: `${documentId}:p${page.pageNumber}:c${pageChunkIndex}`,
          documentId,
          companyId,
          page: page.pageNumber,
          chunkIndex: pageChunkIndex,
          text: chunkText,
          chunkingVersion: CHUNKING_VERSION,
        });
        pageChunkIndex += 1;
      }
      if (end >= text.length) break;
      start = Math.max(start + 1, end - overlap);
    }
  }
  return chunks;
}
