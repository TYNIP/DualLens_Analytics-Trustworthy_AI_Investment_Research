import type { DualLensDatabase } from "@/lib/storage/database";
import { database } from "@/lib/storage/database";
import type { ResearchRun } from "@/types/domain";

export class ResearchRepository {
  public constructor(private readonly db: DualLensDatabase = database) {}

  public listRecent(limit = 25): Promise<ResearchRun[]> {
    return this.db.researchRuns.orderBy("createdAt").reverse().limit(limit).toArray();
  }

  public list(): Promise<ResearchRun[]> {
    return this.db.researchRuns.orderBy("createdAt").reverse().toArray();
  }

  public get(id: string): Promise<ResearchRun | undefined> {
    return this.db.researchRuns.get(id);
  }

  public save(run: ResearchRun): Promise<string> {
    return this.db.researchRuns.put(run);
  }

  public delete(id: string): Promise<void> {
    return this.db.transaction("rw", this.db.researchRuns, this.db.evaluations, async () => {
      await this.db.evaluations.where("researchRunId").equals(id).delete();
      await this.db.researchRuns.delete(id);
    });
  }
}
