import { describe, expect, it } from "vitest";

import { CHUNKING_VERSION, chunkPages } from "./text-chunker";

describe("chunkPages", () => {
  it("preserves page provenance and ignores blank pages", () => {
    const chunks = chunkPages(
      [
        { pageNumber: 1, text: "A concise first page." },
        { pageNumber: 2, text: "   " },
        { pageNumber: 3, text: "A concise third page." },
      ],
      "doc-1",
      "company-1",
      { chunkSize: 100, overlap: 10 },
    );

    expect(chunks.map((chunk) => chunk.page)).toEqual([1, 3]);
    expect(chunks[0]).toMatchObject({
      id: "doc-1:p1:c0",
      companyId: "company-1",
      chunkingVersion: CHUNKING_VERSION,
    });
  });

  it("creates deterministic overlapping chunks without crossing pages", () => {
    const text = Array.from({ length: 45 }, (_, index) => `word${index}`).join(" ");
    const pages = [{ pageNumber: 7, text }];
    const first = chunkPages(pages, "doc", "company", { chunkSize: 120, overlap: 24 });
    const second = chunkPages(pages, "doc", "company", { chunkSize: 120, overlap: 24 });

    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(2);
    expect(first.every((chunk) => chunk.page === 7 && chunk.text.length <= 120)).toBe(true);
    const previousTail = first[0]!.text.slice(-16);
    expect(first[1]!.text).toContain(previousTail.trim().split(" ").at(-1));
  });

  it("prefers paragraph and sentence boundaries", () => {
    const text = `${"Alpha ".repeat(14)}end.\n\n${"Beta ".repeat(30)}finish.`;
    const chunks = chunkPages([{ pageNumber: 1, text }], "doc", "company", {
      chunkSize: 120,
      overlap: 10,
    });
    expect(chunks[0]!.text).toMatch(/end\.$/);
    expect(chunks.some((chunk) => chunk.text.includes("Beta"))).toBe(true);
  });

  it("rejects invalid chunking options", () => {
    expect(() =>
      chunkPages([{ pageNumber: 1, text: "text" }], "doc", "company", {
        chunkSize: 99,
      }),
    ).toThrow(/at least 100/i);
    expect(() =>
      chunkPages([{ pageNumber: 1, text: "text" }], "doc", "company", {
        chunkSize: 100,
        overlap: 100,
      }),
    ).toThrow(/smaller than chunk size/i);
  });
});
