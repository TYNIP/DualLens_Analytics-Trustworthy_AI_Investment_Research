import { Cpu, Download, MemoryStick, Power, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { useAppMode } from "@/app/providers/app-mode-provider";
import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { Button } from "@/components/ui/button";
import { LOCAL_GENERATION_MODEL } from "@/lib/ai/local-model-config";

export function LocalModelManager() {
  const { setMode } = useAppMode();
  const { capabilities, loadModel, modelState, unloadModel } = useLocalRuntime();
  const [consenting, setConsenting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = ["initializing", "downloading-model", "loading-model"].includes(modelState.status);

  async function confirmLoad() {
    setError(null);
    try {
      await loadModel();
      setConsenting(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The local model could not be loaded.");
    }
  }

  return (
    <section className="model-console" aria-labelledby="local-model-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="thread-label">Local generation</p>
          <h2 id="local-model-title" className="mt-2 text-sm font-semibold">
            {LOCAL_GENERATION_MODEL.label}
          </h2>
        </div>
        <span className="text-muted-foreground font-mono text-xs">{modelState.status}</span>
      </div>
      <div className="text-muted-foreground mt-4 grid gap-2 text-xs">
        <span className="flex items-center gap-2">
          <Download aria-hidden="true" className="size-3.5" />
          {LOCAL_GENERATION_MODEL.approximateDownload} initial download
        </span>
        <span className="flex items-center gap-2">
          <MemoryStick aria-hidden="true" className="size-3.5" />
          Approximately {LOCAL_GENERATION_MODEL.approximateVram} VRAM
        </span>
      </div>

      {!capabilities?.webGPU ? (
        <div className="border-warning/35 bg-warning/7 text-muted-foreground mt-4 border-l-2 p-3 text-xs leading-5">
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline size-4" />
          WebGPU is unavailable. PDF indexing and evidence retrieval can still work through WASM;
          generation cannot run.
        </div>
      ) : null}

      {consenting ? (
        <div className="border-border bg-background/55 mt-4 border p-3">
          <p className="text-sm font-medium">Load this model on this device?</p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            Model assets are downloaded from their hosting origin and cached by the browser. Your
            documents and queries are not sent to an inference API. Loading may use significant
            memory.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void confirmLoad()} disabled={busy}>
              <Cpu aria-hidden="true" className="size-4" />
              Confirm and load
            </Button>
            <Button type="button" variant="ghost" onClick={() => setConsenting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {busy ? (
        <div className="mt-4" role="status" aria-live="polite">
          <div className="bg-meter-track h-1.5 overflow-hidden">
            <span
              className="bg-accent-violet block h-full transition-transform"
              style={{
                transform: `scaleX(${modelState.progress ?? 0.03})`,
                transformOrigin: "left",
              }}
            />
          </div>
          <p className="text-muted-foreground mt-2 text-xs">{modelState.message}</p>
        </div>
      ) : null}

      {error || modelState.error ? (
        <p role="alert" className="text-warning mt-3 text-xs leading-5">
          {error ?? modelState.error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {modelState.status === "ready" ? (
          <Button type="button" variant="secondary" onClick={() => void unloadModel()}>
            <Power aria-hidden="true" className="size-4" />
            Unload model
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={!capabilities?.webGPU || busy}
            onClick={() => setConsenting(true)}
          >
            Load local model
          </Button>
        )}
        {!capabilities?.webGPU || modelState.status === "error" ? (
          <Button type="button" variant="ghost" onClick={() => setMode("demo")}>
            Use Demo Mode
          </Button>
        ) : null}
      </div>
    </section>
  );
}
