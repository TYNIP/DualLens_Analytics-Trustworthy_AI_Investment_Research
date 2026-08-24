import { LOCAL_GENERATION_MODEL } from "@/lib/ai/local-model-config";
import type { LocalModelState } from "@/lib/ai/local-model-config";
import type {
  GenerationRequest,
  GenerationResponse,
  LocalLanguageModel,
} from "@/lib/ai/language-model";
import { supportsWebGPU } from "@/lib/browser/capabilities";
import type { ModelMetadata } from "@/types/domain";

type WebLlmEngine = import("@mlc-ai/web-llm").MLCEngine;
type Listener = (state: LocalModelState) => void;

export class WebLlmLanguageModel implements LocalLanguageModel {
  private engine: WebLlmEngine | null = null;
  private listeners = new Set<Listener>();
  private state: LocalModelState = supportsWebGPU()
    ? { status: "available", message: "WebGPU available · model not loaded" }
    : { status: "unsupported", message: "WebGPU is unavailable in this browser" };

  public getState(): LocalModelState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private setState(state: LocalModelState) {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }

  public async load(): Promise<ModelMetadata> {
    if (!supportsWebGPU()) {
      this.setState({ status: "unsupported", message: "WebGPU is unavailable in this browser" });
      throw new Error("Local generation requires a WebGPU-compatible browser and device.");
    }
    if (this.engine) return this.metadata();

    this.setState({ status: "initializing", message: "Preparing the local model runtime" });
    try {
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
      this.engine = await CreateMLCEngine(LOCAL_GENERATION_MODEL.id, {
        initProgressCallback: (report) => {
          const status = report.progress < 0.98 ? "downloading-model" : "loading-model";
          this.setState({
            status,
            progress: report.progress,
            message:
              report.text ||
              (status === "downloading-model" ? "Downloading model files" : "Loading model"),
          });
        },
        logLevel: "WARN",
      });
      this.setState({ status: "ready", progress: 1, message: "Local language model ready" });
      return this.metadata();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Local model initialization failed.";
      this.engine = null;
      this.setState({
        status: "error",
        message: "The local model could not be loaded",
        error: message,
      });
      throw new Error(message, { cause: error });
    }
  }

  public async generate(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.engine || this.state.status !== "ready")
      throw new Error("Load the local language model before generating an answer.");
    const completion = await this.engine.chat.completions.create({
      messages: [
        { role: "system", content: request.systemInstruction },
        { role: "user", content: `${request.context}\n\nQuestion:\n${request.question}` },
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 400,
    });
    return {
      answer: completion.choices[0]?.message.content?.trim() || "I don't know.",
      citations: [],
      model: this.metadata(),
    };
  }

  public async interrupt(): Promise<void> {
    await this.engine?.interruptGenerate();
  }

  public async unload(): Promise<void> {
    await this.engine?.unload();
    this.engine = null;
    this.setState({ status: "unloaded", message: "Model unloaded · browser cache retained" });
  }

  private metadata(): ModelMetadata {
    return {
      provider: "local-webllm",
      modelId: LOCAL_GENERATION_MODEL.id,
      executionDevice: "WebGPU",
    };
  }
}

export const localLanguageModel = new WebLlmLanguageModel();
