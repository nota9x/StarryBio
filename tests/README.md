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
- `pnpm theme:audit` — every active theme at desktop/mobile sizes, avatar/radius variants,
  tooltip/schedule/copy/QR/banner states, motion and reduced-motion views, Axe checks, and a
  generated contact sheet under `test-results/theme-audit/`

- `pnpm theme:audit --atmosphere` � focused Eclipse, Black Hole, and Pulsar renders,
  continuous-field and lifecycle checks, frame timing, and a full live Pulsar revolution.
  Produces desktop/mobile screenshots, a phase scrubber, and `report.json` under
  `test-results/theme-audit/atmosphere/`. The audit injects its inspection bridge into
  the served development module; no test controls enter the production bundle.

Add feature-specific assertions to a controlled fixture unless the test intentionally verifies project-level behavior. Tests that use the active deployment must calculate expected names, values, paths, and feature presence from the normalized config.
