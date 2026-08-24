import { z } from "zod";

export const APP_MODES = ["demo", "local-ai"] as const;
export const appModeSchema = z.enum(APP_MODES);
export type AppMode = z.infer<typeof appModeSchema>;

export const DEFAULT_APP_MODE: AppMode = "demo";
