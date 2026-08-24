import { describe, expect, it } from "vitest";

import {
  inspectBrowserCapabilities,
  supportsIndexedDB,
  supportsWebAssembly,
  supportsWebGPU,
} from "./capabilities";

describe("browser capabilities", () => {
  it("reports WebGPU as unavailable when navigator has no gpu property", () => {
    expect(supportsWebGPU({} as Navigator)).toBe(false);
  });

  it("detects a WebGPU-like navigator without initializing a model", () => {
    expect(supportsWebGPU({ gpu: {} } as unknown as Navigator)).toBe(true);
  });

  it("safely handles an unavailable window", () => {
    expect(supportsIndexedDB({} as Window)).toBe(false);
  });

  it("detects IndexedDB in the test browser", () => {
    expect(supportsIndexedDB(window)).toBe(true);
  });

  it("detects the WebAssembly fallback runtime", () => {
    expect(supportsWebAssembly()).toBe(true);
  });

  it("degrades safely when StorageManager is absent", async () => {
    await expect(inspectBrowserCapabilities()).resolves.toMatchObject({
      indexedDB: true,
      wasm: true,
      storagePersistenceGranted: null,
    });
  });
});
