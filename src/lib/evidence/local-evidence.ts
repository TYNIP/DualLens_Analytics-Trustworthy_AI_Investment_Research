import type { EvidenceViewRecord } from "@/components/evidence/evidence-inspector";
import type { ResearchDocument, RetrievalResult } from "@/types/domain";

export function toLocalEvidence(
  results: RetrievalResult[],
  companyLabel: string,
  documents: Map<string, ResearchDocument>,
  referencedChunkIds: Set<string> = new Set(),
): EvidenceViewRecord[] {
  return results.map((result) => ({
    id: result.chunk.id,
    rank: result.rank,
    company: companyLabel,
    document: documents.get(result.chunk.documentId)?.filename ?? "Unknown local document",
    pageLabel: `page ${result.chunk.page}`,
    chunkId: result.chunk.id,
    score: result.score,
    text: result.chunk.text,
    contributed: referencedChunkIds.has(result.chunk.id),
    provenance: "local-retrieval",
  }));
}
