import { chunkPages } from "@/lib/chunking/text-chunker";
import type { EmbeddingProvider } from "@/lib/embeddings/provider";
import {
  LOCAL_EMBEDDING_DIMENSION,
  LOCAL_EMBEDDING_MODEL,
} from "@/lib/embeddings/transformers-provider";
import type { PdfProcessor } from "@/lib/pdf/processor";
import { validatePdfFile } from "@/lib/pdf/processor";
import { DocumentRepository } from "@/lib/storage/repositories/documents";
import type { DocumentChunk, IndexingStatus, ResearchDocument } from "@/types/domain";
import { createId } from "@/lib/utils/id";

export interface IndexingProgress {
  stage: IndexingStatus;
  message: string;
  current?: number;
  total?: number;
}

export class DocumentIndexer {
  public constructor(
    private readonly pdf: PdfProcessor,
    private readonly embeddings: EmbeddingProvider,
    private readonly documents = new DocumentRepository(),
    private readonly batchSize = 8,
  ) {}

  public async index(
    file: File,
    companyId: string,
    options: {
      signal?: AbortSignal;
      onProgress?: (progress: IndexingProgress) => void;
      documentId?: string;
    } = {},
  ): Promise<ResearchDocument> {
    const validationError = validatePdfFile(file);
    if (validationError) throw new Error(validationError);
    const id = options.documentId ?? createId("doc");
    const uploadedAt = new Date().toISOString();
    let document: ResearchDocument = {
      id,
      companyId,
      filename: file.name,
      fileSize: file.size,
      pageCount: 0,
      chunkCount: 0,
      uploadedAt,
      indexingStatus: "pending",
    };
    await this.documents.save(document);

    const update = async (status: IndexingStatus, message: string) => {
      document = { ...document, indexingStatus: status, errorMessage: undefined };
      await this.documents.save(document);
      options.onProgress?.({ stage: status, message });
    };

    try {
      await update("extracting", "Reading PDF pages locally");
      const extracted = await this.pdf.extract(await file.arrayBuffer(), file.name, {
        signal: options.signal,
        onProgress: (page, total) =>
          options.onProgress?.({
            stage: "extracting",
            message: `Reading PDF · page ${page} of ${total}`,
            current: page,
            total,
          }),
      });
      if (!extracted.pages.some((page) => page.text.trim()))
        throw new Error("No readable text was extracted. The PDF may be scanned or encrypted.");
      document = { ...document, pageCount: extracted.pageCount };

      await update("chunking", "Creating deterministic page-aware chunks");
      const drafts = chunkPages(extracted.pages, id, companyId);
      if (!drafts.length) throw new Error("The PDF did not produce any indexable text chunks.");
      options.onProgress?.({
        stage: "chunking",
        message: `Chunking complete · ${drafts.length} chunks`,
        current: drafts.length,
        total: drafts.length,
      });

      await update("embedding", "Loading the local embedding model");
      const model = await this.embeddings.load();
      const chunks: DocumentChunk[] = [];
      for (let start = 0; start < drafts.length; start += this.batchSize) {
        if (options.signal?.aborted) throw new DOMException("Indexing cancelled.", "AbortError");
        const batch = drafts.slice(start, start + this.batchSize);
        const vectors = await this.embeddings.embed(batch.map((chunk) => chunk.text));
        batch.forEach((draft, index) => {
          const embedding = vectors[index];
          if (!embedding) throw new Error("An embedding was missing from the model batch.");
          chunks.push({
            ...draft,
            embedding,
            embeddingModel: model.modelId,
            embeddingDimension: model.dimensions,
          });
        });
        options.onProgress?.({
          stage: "embedding",
          message: `Embedding ${chunks.length} of ${drafts.length}`,
          current: chunks.length,
          total: drafts.length,
        });
      }

      document = {
        ...document,
        chunkCount: chunks.length,
        indexingStatus: "saving",
        embeddingModel: model.modelId,
        embeddingDimension: model.dimensions,
        chunkingVersion: chunks[0]?.chunkingVersion,
      };
      options.onProgress?.({ stage: "saving", message: "Saving local index" });
      document = { ...document, indexingStatus: "ready", indexedAt: new Date().toISOString() };
      await this.documents.saveReadyWithChunks(document, chunks);
      options.onProgress?.({
        stage: "ready",
        message: `Ready · ${chunks.length} chunks stored locally`,
        current: chunks.length,
        total: chunks.length,
      });
      return document;
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === "AbortError";
      const quota = error instanceof DOMException && error.name === "QuotaExceededError";
      document = {
        ...document,
        indexingStatus: cancelled ? "cancelled" : "error",
        errorMessage: cancelled
          ? "Indexing was cancelled before completion."
          : quota
            ? "Browser storage is full. Delete local documents or clear the workspace, then retry."
            : error instanceof Error
              ? error.message
              : "Document indexing failed.",
      };
      await this.documents.save(document);
      throw new Error(document.errorMessage, { cause: error });
    }
  }
}

export const DEFAULT_INDEX_MODEL = {
  id: LOCAL_EMBEDDING_MODEL,
  dimension: LOCAL_EMBEDDING_DIMENSION,
  batchSize: 8,
} as const;
