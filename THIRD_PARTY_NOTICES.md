# Third-party notices

DualLens does not redistribute model weights in the repository or production build. Local AI
downloads model assets from their hosting origins only when the user starts the relevant workflow.

## Models

| Asset                                                                                                         | Use                              | License/provenance                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`onnx-community/all-MiniLM-L6-v2-ONNX`](https://huggingface.co/onnx-community/all-MiniLM-L6-v2-ONNX)         | 384-dimension browser embeddings | Model card identifies Apache-2.0                                                                                                                            |
| [`mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC`](https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC) | WebLLM compiled generation model | Compiled artifact of Qwen2.5; the [`Qwen/Qwen2.5-1.5B-Instruct`](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) source model card identifies Apache-2.0 |

Users should review the linked model cards and terms at the time of use. The application references
remote model identifiers; it does not grant additional rights to model files or outputs.

## Application dependencies

The project uses open-source packages including React, Vite, TypeScript, Tailwind CSS, shadcn/ui
conventions, Lucide, React Router, Recharts, Zod, Dexie, PDF.js, Transformers.js, and WebLLM. Exact
versions are locked in `pnpm-lock.yaml`; authoritative license texts and notices are distributed by
each package and linked from their package metadata/source repositories.

Notable license families in the direct dependency set include MIT, Apache-2.0, and ISC. This notice
is a practical attribution index, not a replacement for the upstream license texts.

## Academic and company material

Course PDFs, gold/source datasets, notebook exports, and locally generated academic artifacts are
not part of the public application distribution. Company names and tickers in compact Demo Mode
fixtures are used for educational research context. DualLens is not affiliated with or endorsed by
those companies, the model authors, or the course provider.
