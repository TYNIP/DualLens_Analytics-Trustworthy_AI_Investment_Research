# Feature boundaries

Phase 3 preserves the deterministic, read-only Demo Mode and adds a separate browser-native Local
AI workflow for company/document management, PDF indexing, retrieval, generation, diagnostics,
history, and storage portability. Academic-only score, optimization, ranking, and financial
surfaces remain explicitly labeled when Local AI Mode is active.

Heavy browser dependencies such as PDF.js, Transformers.js, and WebLLM are loaded dynamically
inside their owning feature or provider. They must not be imported by the application shell.
