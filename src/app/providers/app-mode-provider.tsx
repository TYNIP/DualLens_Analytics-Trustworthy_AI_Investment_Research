/* eslint-disable react-refresh/only-export-components -- the mode context and hook form one provider boundary */
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { appModeSchema, DEFAULT_APP_MODE } from "@/types/app";
import type { AppMode } from "@/types/app";

const MODE_STORAGE_KEY = "duallens:app-mode";

interface AppModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextValue | null>(null);

function initialMode(): AppMode {
  try {
    const parsed = appModeSchema.safeParse(globalThis.localStorage?.getItem(MODE_STORAGE_KEY));
    return parsed.success ? parsed.data : DEFAULT_APP_MODE;
  } catch {
    return DEFAULT_APP_MODE;
  }
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(initialMode);
  const value = useMemo<AppModeContextValue>(
    () => ({
      mode,
      setMode(nextMode) {
        setModeState(nextMode);
        try {
          globalThis.localStorage?.setItem(MODE_STORAGE_KEY, nextMode);
        } catch {
          // Mode still works for this session when storage is restricted.
        }
      },
    }),
    [mode],
  );

  return <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>;
}

export function useAppMode(): AppModeContextValue {
  const context = useContext(AppModeContext);
  if (!context) throw new Error("useAppMode must be used inside AppModeProvider.");
  return context;
}
