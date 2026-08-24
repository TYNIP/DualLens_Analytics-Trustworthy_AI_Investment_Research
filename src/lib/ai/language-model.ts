import type { Citation, ModelMetadata } from "@/types/domain";

export interface GenerationRequest {
  systemInstruction: string;
  question: string;
  context: string;
}

export interface GenerationResponse {
  answer: string;
  citations: Citation[];
  model: ModelMetadata;
}

export interface LocalLanguageModel {
  load(): Promise<ModelMetadata>;
  generate(request: GenerationRequest): Promise<GenerationResponse>;
  unload(): Promise<void>;
}
