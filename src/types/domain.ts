export type ISODateTime = string;
export type EntityId = string;
export type EmbeddingVector = number[];

export interface Company {
  id: EntityId;
  ticker: string;
  name: string;
  description?: string;
  notes?: string;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
}

export type IndexingStatus =
  "pending" | "extracting" | "chunking" | "embedding" | "saving" | "ready" | "error" | "cancelled";

export interface ResearchDocument {
  id: EntityId;
  companyId: EntityId;
  filename: string;
  fileSize: number;
  pageCount: number;
  chunkCount: number;
  uploadedAt: ISODateTime;
  indexedAt?: ISODateTime;
  indexingStatus: IndexingStatus;
  embeddingModel?: string;
  embeddingDimension?: number;
  chunkingVersion?: string;
  errorMessage?: string;
}

export interface DocumentChunk {
  id: EntityId;
  documentId: EntityId;
  companyId: EntityId;
  page: number;
  chunkIndex: number;
  text: string;
  embedding: EmbeddingVector;
  embeddingModel: string;
  embeddingDimension: number;
  chunkingVersion: string;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
  rank: number;
}

export interface Citation {
  documentId: EntityId;
  filename: string;
  page: number;
  chunkId: EntityId;
  text: string;
  similarity: number;
}

export interface ModelMetadata {
  provider: "demo" | "local-webllm";
  modelId: string;
  executionDevice?: string;
}

export interface LocalRunDiagnostics {
  retrievalSufficient: boolean;
  retrievalThreshold: number;
  evidenceCount: number;
  referencedEvidenceCount: number;
  citationCoverage: number;
  companyPurity: number;
  guardrailTriggered: boolean;
  retrievalLatencyMs: number;
  generationLatencyMs?: number;
}

export interface ResearchRun {
  id: EntityId;
  question: string;
  companyId?: EntityId;
  answer: string;
  citations: Citation[];
  retrievalResults: RetrievalResult[];
  evaluationId?: EntityId;
  createdAt: ISODateTime;
  model: ModelMetadata;
  mode?: "demo" | "local-ai";
  promptVersion?: string;
  diagnostics?: LocalRunDiagnostics;
}

export type EvaluationMethod = "deterministic" | "local-model" | "human";

export interface EvaluationResult {
  id: EntityId;
  researchRunId: EntityId;
  groundedness: number | null;
  contextRelevance: number | null;
  answerRelevance: number | null;
  retrievalHit: boolean | null;
  notes?: string;
  method: EvaluationMethod;
  createdAt: ISODateTime;
}

export interface OptimizationVariant {
  label: "v1" | "v2";
  instructions: string;
  heldOutAccuracy: number;
}

export interface OptimizationExperiment {
  id: EntityId;
  v1: OptimizationVariant;
  v2: OptimizationVariant;
  improvement: number;
  createdAt: ISODateTime;
}

export interface RankedCompany {
  companyId: EntityId;
  rank: number;
  rationale: string;
  citations: Citation[];
}

export interface RankingResult {
  id: EntityId;
  rankings: RankedCompany[];
  caveat?: string;
  createdAt: ISODateTime;
}

export type ConfidenceVerdict = "client-ready" | "flagged" | "human-review";

export interface ConfidenceSignals {
  objectiveGold: number;
  evaluation: number;
  rankingGroundedness: number;
}

export interface ConfidenceResult {
  score: number;
  signals: ConfidenceSignals;
  verdict: ConfidenceVerdict;
}

export interface WorkspaceSetting {
  key: string;
  value: string | number | boolean;
  updatedAt: ISODateTime;
}
