export const LOCAL_GENERATION_MODEL = {
  id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  label: "Qwen 2.5 1.5B Instruct",
  approximateDownload: "880 MB",
  approximateVram: "1.63 GB",
  requiredCapability: "webgpu",
  contextWindow: 4096,
} as const;

export type LocalModelStatus =
  | "unsupported"
  | "available"
  | "initializing"
  | "downloading-model"
  | "loading-model"
  | "ready"
  | "error"
  | "unloaded";

export interface LocalModelState {
  status: LocalModelStatus;
  progress?: number;
  message: string;
  error?: string;
}
