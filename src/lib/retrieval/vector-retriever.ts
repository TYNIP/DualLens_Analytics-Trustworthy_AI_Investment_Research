import type { EmbeddingVector, RetrievalResult } from "@/types/domain";

export interface RetrievalOptions {
  companyId?: string;
  documentIds?: string[];
  topK: number;
}

export interface VectorRetriever {
  search(queryEmbedding: EmbeddingVector, options: RetrievalOptions): Promise<RetrievalResult[]>;
}
