import type { DualLensDatabase } from "@/lib/storage/database";
import { database } from "@/lib/storage/database";
import type { Company } from "@/types/domain";

export class CompanyRepository {
  public constructor(private readonly db: DualLensDatabase = database) {}

  public list(): Promise<Company[]> {
    return this.db.companies.orderBy("ticker").toArray();
  }

  public get(id: string): Promise<Company | undefined> {
    return this.db.companies.get(id);
  }

  public save(company: Company): Promise<string> {
    return this.db.companies.put(company);
  }

  public async delete(id: string): Promise<void> {
    await this.db.transaction(
      "rw",
      [
        this.db.companies,
        this.db.documents,
        this.db.chunks,
        this.db.researchRuns,
        this.db.evaluations,
      ],
      async () => {
        const runIds = await this.db.researchRuns.where("companyId").equals(id).primaryKeys();
        const documentIds = await this.db.documents.where("companyId").equals(id).primaryKeys();
        if (runIds.length) await this.db.evaluations.where("researchRunId").anyOf(runIds).delete();
        if (documentIds.length)
          await this.db.chunks.where("documentId").anyOf(documentIds).delete();
        await this.db.researchRuns.where("companyId").equals(id).delete();
        await this.db.documents.where("companyId").equals(id).delete();
        await this.db.companies.delete(id);
      },
    );
  }
}
