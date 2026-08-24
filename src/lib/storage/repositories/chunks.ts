import type { DualLensDatabase } from "@/lib/storage/database";
import { database } from "@/lib/storage/database";
import type { DocumentChunk } from "@/types/domain";

export class ChunkRepository {
  public constructor(private readonly db: DualLensDatabase = database) {}

  public listByCompany(companyId: string): Promise<DocumentChunk[]> {
    return this.db.chunks.where("companyId").equals(companyId).toArray();
  }

  public listByCompanyAndModel(companyId: string, embeddingModel: string) {
    return this.db.chunks
      .where("[companyId+embeddingModel]")
      .equals([companyId, embeddingModel])
      .toArray();
  }

  public list(): Promise<DocumentChunk[]> {
    return this.db.chunks.toArray();
  }

  public listByDocument(documentId: string): Promise<DocumentChunk[]> {
    return this.db.chunks.where("documentId").equals(documentId).sortBy("chunkIndex");
  }

  public saveMany(chunks: DocumentChunk[]): Promise<string> {
    return this.db.chunks.bulkPut(chunks).then(() => chunks.at(-1)?.id ?? "");
  }

  public deleteByDocument(documentId: string): Promise<number> {
    return this.db.chunks.where("documentId").equals(documentId).delete();
  }
}
