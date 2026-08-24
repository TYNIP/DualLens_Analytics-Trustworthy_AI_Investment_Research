export interface BrowserCapabilities {
  webGPU: boolean;
  indexedDB: boolean;
  wasm: boolean;
  persistentStorage: boolean;
  storagePersistenceGranted: boolean | null;
  storageUsage?: number;
  storageQuota?: number;
  deviceMemoryGb?: number;
}

export function supportsWebGPU(target: Navigator | undefined = globalThis.navigator): boolean {
  return Boolean(target && "gpu" in target);
}

export function supportsIndexedDB(target: Window | undefined = globalThis.window): boolean {
  return Boolean(target && "indexedDB" in target);
}

export function supportsWebAssembly(): boolean {
  return typeof globalThis.WebAssembly === "object";
}

function readDeviceMemory(target: Navigator | undefined): number | undefined {
  if (!target || !("deviceMemory" in target)) return undefined;
  const value = (target as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof value === "number" ? value : undefined;
}

export function detectBrowserCapabilities(): BrowserCapabilities {
  const storage = globalThis.navigator?.storage;
  return {
    webGPU: supportsWebGPU(),
    indexedDB: supportsIndexedDB(),
    wasm: supportsWebAssembly(),
    persistentStorage: Boolean(storage?.persist),
    storagePersistenceGranted: null,
    deviceMemoryGb: readDeviceMemory(globalThis.navigator),
  };
}

export async function inspectBrowserCapabilities(): Promise<BrowserCapabilities> {
  const base = detectBrowserCapabilities();
  const storage = globalThis.navigator?.storage;
  if (!storage) return base;

  const [estimate, persisted] = await Promise.all([
    storage.estimate?.().catch(() => undefined),
    storage.persisted?.().catch(() => false),
  ]);

  return {
    ...base,
    storagePersistenceGranted: persisted ?? null,
    storageUsage: estimate?.usage,
    storageQuota: estimate?.quota,
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  return (await globalThis.navigator?.storage?.persist?.()) ?? false;
}
