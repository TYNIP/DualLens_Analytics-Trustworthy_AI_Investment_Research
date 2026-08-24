import type { DualLensDatabase } from "@/lib/storage/database";
import { database } from "@/lib/storage/database";
import type { WorkspaceSetting } from "@/types/domain";

export class SettingRepository {
  public constructor(private readonly db: DualLensDatabase = database) {}

  public list(): Promise<WorkspaceSetting[]> {
    return this.db.settings.toArray();
  }

  public get(key: string): Promise<WorkspaceSetting | undefined> {
    return this.db.settings.get(key);
  }

  public save(setting: WorkspaceSetting): Promise<string> {
    return this.db.settings.put(setting);
  }
}
