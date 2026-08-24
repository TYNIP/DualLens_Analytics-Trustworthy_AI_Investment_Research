import type {
  Company,
  DocumentChunk,
  EvaluationResult,
  ISODateTime,
  ResearchDocument,
  ResearchRun,
  WorkspaceSetting,
} from "./domain";

export const WORKSPACE_EXPORT_VERSION = 2 as const;

export interface WorkspaceExport {
  version: typeof WORKSPACE_EXPORT_VERSION;
  exportedAt: ISODateTime;
  companies: Company[];
  documents: ResearchDocument[];
  chunks: DocumentChunk[];
  researchRuns: ResearchRun[];
  evaluations: EvaluationResult[];
  settings: WorkspaceSetting[];
}
