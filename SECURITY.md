# Security policy

## Supported version

The current portfolio release line is `1.0.x`.

## Reporting a vulnerability

Do not place credentials, private documents, personal data, or exploit details in a public issue.
After a sanitized public repository exists, use its private GitHub Security Advisory reporting flow.
Until then, keep the finding private and identify the affected component, reproduction conditions,
and potential impact without attaching real research documents.

## Security boundary

DualLens has no backend, login, cloud database, analytics, or paid inference API. That removes many
server-side risks but does not make browser data risk-free:

- local workspace data follows the browser profile's storage and device-access security;
- imported PDFs are untrusted input and may contain prompt-injection text;
- model and package assets are downloaded from third-party origins;
- exported workspace JSON contains extracted research text and embeddings and should be handled as
  private data;
- clearing browser data can destroy local records if they were not exported.

The application validates workspace imports, limits PDF/import sizes and record counts, scopes
retrieval, treats evidence as untrusted prompt data, and does not silently fall back to cloud
inference.

## Known dependency audit findings

As of 2026-08-23, `pnpm audit --prod` reports two high-severity transitive findings under the latest
stable `@huggingface/transformers@4.2.0` dependency graph:

- `onnxruntime-node → adm-zip <0.6.0` (`GHSA-xcpc-8h2w-3j85`);
- `sharp <0.35.0` through inherited libvips issues (`GHSA-f88m-g3jw-g9cj`).

The Vite browser build resolves Transformers.js's web export and does not include those Node modules
in `dist/`; the affected packages remain in the installation/lockfile graph. The upstream stable
package pins or constrains them, and no compatible stable Transformers.js release currently removes
both findings. This is treated as an unresolved release gate, not hidden with audit ignores or
untested transitive overrides.
