import type { DualLensDatabase } from "@/lib/storage/database";
import { database } from "@/lib/storage/database";
import { workspaceExportSchema } from "@/lib/storage/workspace-schema";
import { WORKSPACE_EXPORT_VERSION } from "@/types/workspace";
import type { WorkspaceExport } from "@/types/workspace";

export interface WorkspaceCounts {
  companies: number;
  documents: number;
  chunks: number;
  researchRuns: number;
  evaluations: number;
}

export class WorkspaceService {
  public constructor(private readonly db: DualLensDatabase = database) {}

  public async counts(): Promise<WorkspaceCounts> {
    const [companies, documents, chunks, researchRuns, evaluations] = await Promise.all([
      this.db.companies.count(),
      this.db.documents.count(),
      this.db.chunks.count(),
      this.db.researchRuns.count(),
      this.db.evaluations.count(),
    ]);
    return { companies, documents, chunks, researchRuns, evaluations };
  }

  public async export(): Promise<WorkspaceExport> {
    const [companies, documents, chunks, researchRuns, evaluations, settings] = await Promise.all([
      this.db.companies.toArray(),
      this.db.documents.toArray(),
      this.db.chunks.toArray(),
      this.db.researchRuns.toArray(),
      this.db.evaluations.toArray(),
      this.db.settings.toArray(),
    ]);
    return {
      version: WORKSPACE_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      companies,
      documents,
      chunks,
      researchRuns,
      evaluations,
      settings,
    };
  }

  public parse(source: string): WorkspaceExport {
    const raw: unknown = JSON.parse(source);
    return workspaceExportSchema.parse(raw);
  }

  public async replace(workspace: WorkspaceExport): Promise<void> {
    const validated = workspaceExportSchema.parse(workspace);
    await this.db.transaction(
      "rw",
      [
        this.db.companies,
        this.db.documents,
        this.db.chunks,
        this.db.researchRuns,
        this.db.evaluations,
        this.db.settings,
      ],
      async () => {
        await Promise.all([
          this.db.companies.clear(),
          this.db.documents.clear(),
          this.db.chunks.clear(),
          this.db.researchRuns.clear(),
          this.db.evaluations.clear(),
          this.db.settings.clear(),
        ]);
        if (validated.companies.length) await this.db.companies.bulkAdd(validated.companies);
        if (validated.documents.length) await this.db.documents.bulkAdd(validated.documents);
        if (validated.chunks.length) await this.db.chunks.bulkAdd(validated.chunks);
        if (validated.researchRuns.length)
          await this.db.researchRuns.bulkAdd(validated.researchRuns);
        if (validated.evaluations.length) await this.db.evaluations.bulkAdd(validated.evaluations);
        if (validated.settings.length) await this.db.settings.bulkAdd(validated.settings);
      },
    );
  }

  public async clear(): Promise<void> {
    await this.db.transaction(
      "rw",
      [
        this.db.companies,
        this.db.documents,
        this.db.chunks,
        this.db.researchRuns,
        this.db.evaluations,
        this.db.settings,
      ],
      async () => {
        await Promise.all([
          this.db.companies.clear(),
          this.db.documents.clear(),
          this.db.chunks.clear(),
          this.db.researchRuns.clear(),
          this.db.evaluations.clear(),
          this.db.settings.clear(),
        ]);
      },
    );
  }
}

export function downloadWorkspace(workspace: WorkspaceExport): void {
  const blob = new Blob([JSON.stringify(workspace)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `duallens-workspace-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
