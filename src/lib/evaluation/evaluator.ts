import type { EvaluationResult, ResearchRun } from "@/types/domain";

export interface EvaluationContext {
  expectedToken?: string;
  retrievedText: string;
}

export interface ResearchEvaluator {
  evaluate(run: ResearchRun, context: EvaluationContext): Promise<EvaluationResult>;
}
