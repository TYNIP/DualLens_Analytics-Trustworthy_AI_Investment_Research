import type { DualLensDatabase } from "@/lib/storage/database";
import { database } from "@/lib/storage/database";
import type { ResearchDocument } from "@/types/domain";

export class DocumentRepository {
  public constructor(private readonly db: DualLensDatabase = database) {}

  public listByCompany(companyId: string): Promise<ResearchDocument[]> {
    return this.db.documents.where("companyId").equals(companyId).sortBy("uploadedAt");
  }

  public list(): Promise<ResearchDocument[]> {
    return this.db.documents.orderBy("uploadedAt").reverse().toArray();
  }

  public get(id: string): Promise<ResearchDocument | undefined> {
    return this.db.documents.get(id);
  }

  public save(document: ResearchDocument): Promise<string> {
    return this.db.documents.put(document);
  }

  public async saveReadyWithChunks(
    document: ResearchDocument,
    chunks: import("@/types/domain").DocumentChunk[],
  ): Promise<void> {
    await this.db.transaction("rw", this.db.documents, this.db.chunks, async () => {
      await this.db.chunks.where("documentId").equals(document.id).delete();
      if (chunks.length) await this.db.chunks.bulkPut(chunks);
      await this.db.documents.put(document);
    });
  }

  public delete(id: string): Promise<void> {
    return this.db.transaction("rw", this.db.documents, this.db.chunks, async () => {
      await this.db.chunks.where("documentId").equals(id).delete();
      await this.db.documents.delete(id);
    });
  }
}
