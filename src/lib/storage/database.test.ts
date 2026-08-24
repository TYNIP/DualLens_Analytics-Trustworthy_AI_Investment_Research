import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import { DualLensDatabase } from "./database";

describe("DualLensDatabase migration", () => {
  let name = "";

  afterEach(async () => {
    if (name) await Dexie.delete(name);
  });

  it("upgrades a version-1 workspace without losing records", async () => {
    name = `Migration-${crypto.randomUUID()}`;
    const legacy = new Dexie(name);
    legacy.version(1).stores({
      companies: "id, &ticker, createdAt",
      documents: "id, companyId, indexingStatus, uploadedAt, [companyId+indexingStatus]",
      chunks: "id, documentId, companyId, [documentId+chunkIndex], [companyId+documentId]",
      researchRuns: "id, companyId, createdAt",
      evaluations: "id, &researchRunId, createdAt",
    });
    await legacy.open();
    await legacy.table("companies").add({
      id: "legacy",
      ticker: "OLD",
      name: "Legacy company",
      createdAt: "2026-01-01T00:00:00Z",
    });
    legacy.close();

    const current = new DualLensDatabase(name);
    await current.open();
    await expect(current.companies.get("legacy")).resolves.toMatchObject({ ticker: "OLD" });
    await expect(current.settings.count()).resolves.toBe(0);
    expect(current.verno).toBe(2);
    current.close();
  });
});
