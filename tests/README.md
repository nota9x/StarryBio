# Test suite boundaries

StarryBio separates portable downstream checks from maintainer-only repository policy.

- `unit/` tests schema, normalization, runtime logic, generators, security, and updater behavior with isolated values.
- `integration/` builds minimal and heavily customized fixtures in temporary project copies. These tests never replace the installation's real config or user assets.
- `e2e/` reads the active config through `STARRYBIO_CONFIG_PATH` (or `config/starrybio.config.ts`) and derives expectations from its normalized values. Optional-feature interactions are skipped only when that active config disables the feature.
- `upstream/` checks the stock artwork, starter mappings, README deployment metadata, package-manager policy, and maintainer workflows. It runs in upstream release checks and only in CI for `nota9x/StarryBio`.

Commands:

- `pnpm test:unit` — fast downstream logic tests
- `pnpm test:integration` — isolated representative production builds
- `pnpm test:e2e` — the installation's active config
- `pnpm test:e2e:fixtures` — deterministic minimal and customized browser deployments
- `pnpm test:upstream` — StarryBio maintainer/release integrity

Add feature-specific assertions to a controlled fixture unless the test intentionally verifies project-level behavior. Tests that use the active deployment must calculate expected names, values, paths, and feature presence from the normalized config.
