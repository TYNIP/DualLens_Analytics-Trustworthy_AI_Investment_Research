import type { DualLensDatabase } from "@/lib/storage/database";
import { database } from "@/lib/storage/database";
import type { EvaluationResult } from "@/types/domain";

export class EvaluationRepository {
  public constructor(private readonly db: DualLensDatabase = database) {}

  public getByResearchRun(researchRunId: string): Promise<EvaluationResult | undefined> {
    return this.db.evaluations.where("researchRunId").equals(researchRunId).first();
  }

  public save(evaluation: EvaluationResult): Promise<string> {
    return this.db.evaluations.put(evaluation);
  }

  public list(): Promise<EvaluationResult[]> {
    return this.db.evaluations.orderBy("createdAt").reverse().toArray();
  }

  public delete(id: string): Promise<void> {
    return this.db.evaluations.delete(id);
  }
}
