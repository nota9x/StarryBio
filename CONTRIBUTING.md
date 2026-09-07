# Contributing to StarryBio

Thanks for contributing to StarryBio. The project is a configurable Astro link-in-bio site that builds to portable static assets and supports GitHub Pages, Cloudflare Workers, Vercel, and Netlify. Contributions that improve the starter configuration, site experience, accessibility, reliability, themes, layouts, or integrations are welcome.

## Reporting issues

Please search [existing issues](https://github.com/nota9x/StarryBio/issues) before opening a new one. Use the form that best matches the report:

- [Report a bug](https://github.com/nota9x/StarryBio/issues/new?template=bug-report.yml) for broken builds, configuration, generated assets, or UI behavior.
- [Propose a theme or layout](https://github.com/nota9x/StarryBio/issues/new?template=theme-layout-proposal.yml) for a visual preset, layout mode, or responsive design improvement.
- [Propose an analytics provider](https://github.com/nota9x/StarryBio/issues/new?template=analytics-provider-proposal.yml) for a provider integration or an improvement to one already supported.

Include a minimal reproduction whenever possible. Do not post credentials, analytics tokens, site IDs tied to a real account, or other sensitive information.

For a security vulnerability, use [private vulnerability reporting](https://github.com/nota9x/StarryBio/security/advisories/new) instead of a public issue. See [SECURITY.md](SECURITY.md) for the reporting policy.

## Getting started

### Requirements

- Node.js 24.x or 26.0.0+ (`.node-version` selects 24.x for provider builds)
- pnpm 12.3.4
- A hosting-provider account only when you need to deploy

Fork the repository, clone your fork, and create a focused branch. Use a descriptive branch name such as `fix/status-timezone` or `feat/solarized-theme`.

```bash
pnpm install
pnpm dev
```

`pnpm dev` validates the configuration, generates configured assets and icons, then starts Astro. Most site customization belongs in [`config/starrybio.config.ts`](config/starrybio.config.ts); saving that file while the dev server is running reloads the site.

## Project structure

| Path                                                                                     | Purpose                                                                                                                |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [`config/starrybio.config.ts`](config/starrybio.config.ts)                               | Complete starter configuration for profile data, links, themes, layouts, status, generated assets, and analytics.      |
| [`src/config/schema.ts`](src/config/schema.ts)                                           | Zod schema and TypeScript types for the public configuration contract. Update this when adding a configuration option. |
| [`src/config/themes.ts`](src/config/themes.ts)                                           | Built-in theme tokens and logic that turns a selected preset into CSS custom properties.                               |
| [`src/styles/`](src/styles)                                                              | Theme, layout, component, motion, and input styles.                                                                    |
| [`src/components/`](src/components)                                                      | Reusable Astro UI components, including profile, links, featured cards, SEO, status, and analytics.                    |
| [`src/pages/`](src/pages)                                                                | The homepage and static 404 page.                                                                                      |
| [`src/scripts/`](src/scripts)                                                            | Browser-side behavior for links, status, and the starfield.                                                            |
| [`src/config/analytics.ts`](src/config/analytics.ts)                                     | Analytics script descriptors and safe data-attribute generation.                                                       |
| [`scripts/`](scripts)                                                                    | Build-time validation, asset generation, live config updates, and Simple Icons generation.                             |
| [`public/`](public)                                                                      | Static assets and Cloudflare/Netlify headers. Place user-facing local images here.                                     |
| [`public/_headers`](public/_headers)                                                     | Canonical Content Security Policy and static header intent for Cloudflare and Netlify.                                 |
| [`vercel.json`](vercel.json)                                                             | Vercel build/output settings and its translation of the shared header intent.                                          |
| [`netlify.toml`](netlify.toml)                                                           | Netlify build and publish settings.                                                                                    |
| [`wrangler.jsonc`](wrangler.jsonc)                                                       | Cloudflare static-assets deployment and custom 404 handling.                                                           |
| [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) | GitHub Pages build, artifact upload, and deployment workflow.                                                          |
| [`tests/unit/`](tests/unit) and [`tests/e2e/`](tests/e2e)                                | Vitest unit tests and Playwright release checks.                                                                       |

Prefer compact SVG source artwork for simple interface graphics and status icons. Keep raster formats for photographic or texture-rich imagery that would lose quality or become excessively complex as vectors; never embed raster data inside an SVG.

## Themes, layouts, and visuals

Theme presets are defined in [`src/config/themes.ts`](src/config/themes.ts). A new preset normally needs:

1. Its name added to the `ThemePreset` schema in [`src/config/schema.ts`](src/config/schema.ts).
2. A complete token set in `THEME_PRESETS`.
3. Any required theme-specific behavior in [`src/styles/theme.css`](src/styles/theme.css) or the relevant component stylesheet.
4. Responsive and reduced-motion checks in a browser.

Keep the visual system configurable: use the CSS custom properties emitted by `getThemeStyle` instead of hard-coding one preset’s colors in a component. Layout mode rules live primarily in [`src/styles/layout.css`](src/styles/layout.css), and shared controls/cards live in [`src/styles/components.css`](src/styles/components.css).

## Analytics integrations

Supported providers are Google Analytics, Cloudflare Web Analytics, Plausible, Umami, and a custom external script. Their configuration shape is validated in [`src/config/schema.ts`](src/config/schema.ts), and their script descriptors are created in [`src/config/analytics.ts`](src/config/analytics.ts).

When adding or changing a provider:

- Use external HTTPS scripts and data attributes; do not add inline initialization code.
- Add validation and tests for all new configuration fields.
- Update the provider-specific origins in [`src/config/security-headers.ts`](src/config/security-headers.ts), then run `pnpm headers`. The generated Cloudflare/Netlify and Vercel policies stay narrow and the validation step rejects stale copies.
- Document the provider and a placeholder-only configuration example in [README.md](README.md).
- Never commit real site IDs, tokens, credentials, or analytics data.

## Building and testing

Run the checks appropriate to your change before opening a pull request:

```bash
pnpm check
pnpm build
```

For changes affecting the rendered site, also run:

```bash
pnpm test:e2e
```

`pnpm check` is the fast local quality gate: formatting, typed linting, type checks, and unit tests. `pnpm release:check` adds a production build, browser tests, and a production dependency audit. Use `pnpm preview` for a provider-neutral static preview, or `pnpm preview:cloudflare` to exercise the output through Wrangler.

If you change the config schema, generated assets, status scheduling, or runtime behavior, add or update focused tests. For visual work, check narrow and wide viewports, keyboard navigation, and reduced-motion behavior.

## Submitting pull requests

1. Open an issue first for substantial features, new themes, layouts, or analytics providers so the approach can be discussed.
2. Keep each pull request focused. Avoid unrelated refactors or formatting changes.
3. Make the implementation, documentation, configuration examples, and tests agree.
4. Run the relevant checks above and record the results in the pull request template.
5. Add screenshots or a recording for visual changes, including new themes and layouts.
6. Link the issue with `Closes #<number>` when applicable, then submit the pull request against the default branch.

### Pull request titles

Pull request titles must use [Conventional Commits](https://www.conventionalcommits.org/) syntax. A type is required, a scope is optional, and the description follows a colon:

```text
feat(deploy): add Vercel support
fix(ui): correct mobile card spacing
docs(readme): improve installation instructions
```

StarryBio uses squash merging, so the pull request title becomes the meaningful commit on `main` and drives release notes and version selection. CI accepts `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`. Renovate's `chore(deps): ...` titles follow the same convention.

### Commit messages

Every commit introduced by a pull request is checked with commitlint and should follow the same convention:

```text
feat: add dark mode
fix(ui): correct mobile spacing
perf(assets): optimize generated icons
docs: improve installation instructions
```

Mark a breaking change with `!`:

```text
feat(config)!: redesign configuration format
```

Alternatively, describe it in a `BREAKING CHANGE:` footer in the commit body. Validate the latest local commit before pushing with:

```bash
pnpm commitlint
```

CI validates all commits in each pull request. Amend or reword invalid commits before merging. The final squash commit is derived from the separately validated pull request title.

## Releases

Release Please manages versions, `CHANGELOG.md`, Git tags, and GitHub Releases from the Conventional Commits on `main`:

```text
PR merged into main
        ↓
Release Please analyzes commits
        ↓
Release PR is created/updated
        ↓
Maintainer reviews release
        ↓
Release PR merged
        ↓
vX.Y.Z tag + GitHub Release
```

Ordinary pull request merges do not immediately publish releases. They update the pending release pull request; merging that release pull request is the manual release gate.

Version changes follow Semantic Versioning:

- Patch releases contain fixes and small compatible improvements (`fix:` and `perf:`).
- Minor releases contain backward-compatible features (`feat:`).
- Major releases contain breaking changes (`!` or a `BREAKING CHANGE:` footer).

Other types normally do not independently trigger a release. Use GitHub milestones such as `v3.4`, `v3.5`, or `v4.0` to plan feature releases. Routine patch releases do not need a milestone.

### Maintainer repository setup

The following settings are manual GitHub repository configuration, not repository files:

- Under **Settings → General → Pull Requests**, enable squash merging and select the pull request title as the default squash commit title.
- Disable merge commits. Disable rebase merging as well if the project wants a strictly linear conventional history.
- Enable automatic deletion of head branches after merge.
- Protect `main`: require pull requests and require the `Release validation` and `Validate PR title` checks before merging.
- Create a fine-grained token for `nota9x/StarryBio` with repository **Contents**, **Pull requests**, and **Issues** read/write access, save it as the Actions secret `RELEASE_PLEASE_TOKEN`, and ensure the token's owner can open pull requests. Release Please needs this separate token so its release pull requests trigger the normal CI workflow; GitHub suppresses workflow events created by the built-in `GITHUB_TOKEN`.

To publish, review the version and changelog in the Release Please pull request, wait for its required checks, and squash-merge it. Release Please then creates the matching `vX.Y.Z` tag and GitHub Release. There is no npm publication step.

## Code of Conduct

All participation in this repository is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions are licensed under the project’s [GNU General Public License v3.0](LICENSE).
