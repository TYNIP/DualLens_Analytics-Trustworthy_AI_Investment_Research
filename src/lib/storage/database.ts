import Dexie from "dexie";
import type { EntityTable } from "dexie";

import { DATABASE_NAME } from "@/constants/brand";
import type {
  Company,
  DocumentChunk,
  EvaluationResult,
  ResearchDocument,
  ResearchRun,
  WorkspaceSetting,
} from "@/types/domain";

export class DualLensDatabase extends Dexie {
  companies!: EntityTable<Company, "id">;
  documents!: EntityTable<ResearchDocument, "id">;
  chunks!: EntityTable<DocumentChunk, "id">;
  researchRuns!: EntityTable<ResearchRun, "id">;
  evaluations!: EntityTable<EvaluationResult, "id">;
  settings!: EntityTable<WorkspaceSetting, "key">;

  public constructor(name = DATABASE_NAME) {
    super(name);

    this.version(1).stores({
      companies: "id, &ticker, createdAt",
      documents: "id, companyId, indexingStatus, uploadedAt, [companyId+indexingStatus]",
      chunks: "id, documentId, companyId, [documentId+chunkIndex], [companyId+documentId]",
      researchRuns: "id, companyId, createdAt",
      evaluations: "id, &researchRunId, createdAt",
    });

    this.version(2).stores({
      companies: "id, &ticker, createdAt, updatedAt",
      documents:
        "id, companyId, indexingStatus, uploadedAt, indexedAt, embeddingModel, [companyId+indexingStatus], [companyId+embeddingModel]",
      chunks:
        "id, documentId, companyId, embeddingModel, [documentId+chunkIndex], [companyId+documentId], [companyId+embeddingModel]",
      researchRuns: "id, companyId, createdAt, mode",
      evaluations: "id, &researchRunId, createdAt",
      settings: "&key, updatedAt",
    });
  }
}

export const database = new DualLensDatabase();
