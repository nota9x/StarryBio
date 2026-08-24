# Contributing to StarryBio

Thanks for contributing to StarryBio. The project is a configurable Astro link-in-bio site that builds to static assets and deploys through Cloudflare Workers. Contributions that improve the starter configuration, site experience, accessibility, reliability, themes, layouts, or integrations are welcome.

## Reporting issues

Please search [existing issues](https://github.com/nota9x/StarryBio/issues) before opening a new one. Use the form that best matches the report:

- [Report a bug](https://github.com/nota9x/StarryBio/issues/new?template=bug-report.yml) for broken builds, configuration, generated assets, or UI behavior.
- [Propose a theme or layout](https://github.com/nota9x/StarryBio/issues/new?template=theme-layout-proposal.yml) for a visual preset, layout mode, or responsive design improvement.
- [Propose an analytics provider](https://github.com/nota9x/StarryBio/issues/new?template=analytics-provider-proposal.yml) for a provider integration or an improvement to one already supported.

Include a minimal reproduction whenever possible. Do not post credentials, analytics tokens, site IDs tied to a real account, or other sensitive information.

For a security vulnerability, use [private vulnerability reporting](https://github.com/nota9x/StarryBio/security/advisories/new) instead of a public issue. See [SECURITY.md](SECURITY.md) for the reporting policy.

## Getting started

### Requirements

- Node.js 24 or later
- pnpm 11.23.0 or later
- A Cloudflare account only when you need to deploy

Fork the repository, clone your fork, and create a focused branch. Use a descriptive branch name such as `fix/status-timezone` or `feat/solarized-theme`.

```bash
pnpm install
pnpm dev
```

`pnpm dev` validates the configuration, generates configured assets and icons, then starts Astro. Most site customization belongs in [`config/starrybio.config.ts`](config/starrybio.config.ts); saving that file while the dev server is running reloads the site.

## Project structure

| Path                                                       | Purpose                                                                                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [`config/starrybio.config.ts`](config/starrybio.config.ts) | Complete starter configuration for profile data, links, themes, layouts, status, generated assets, and analytics.      |
| [`src/config/schema.ts`](src/config/schema.ts)             | Zod schema and TypeScript types for the public configuration contract. Update this when adding a configuration option. |
| [`src/config/themes.ts`](src/config/themes.ts)             | Built-in theme tokens and logic that turns a selected preset into CSS custom properties.                               |
| [`src/styles/`](src/styles)                                | Theme, layout, component, motion, and input styles.                                                                    |
| [`src/components/`](src/components)                        | Reusable Astro UI components, including profile, links, featured cards, SEO, status, and analytics.                    |
| [`src/pages/`](src/pages)                                  | The homepage and static 404 page.                                                                                      |
| [`src/scripts/`](src/scripts)                              | Browser-side behavior for links, status, and the starfield.                                                            |
| [`src/config/analytics.ts`](src/config/analytics.ts)       | Analytics script descriptors and safe data-attribute generation.                                                       |
| [`scripts/`](scripts)                                      | Build-time validation, asset generation, live config updates, and Simple Icons generation.                             |
| [`public/`](public)                                        | Static assets and Cloudflare headers. Place user-facing local images here.                                             |
| [`public/_headers`](public/_headers)                       | Content Security Policy and other static deployment headers.                                                           |
| [`tests/unit/`](tests/unit) and [`tests/e2e/`](tests/e2e)  | Vitest unit tests and Playwright release checks.                                                                       |

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
- Update [`public/_headers`](public/_headers) with the provider’s script and collection hosts, keeping the Content Security Policy as narrow as possible.
- Document the provider and a placeholder-only configuration example in [README.md](README.md).
- Never commit real site IDs, tokens, credentials, or analytics data.

## Building and testing

Run the checks appropriate to your change before opening a pull request:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

For changes affecting the rendered site, also run:

```bash
pnpm test:e2e
```

`pnpm release:check` runs the complete local release gate, including formatting, linting, type checks, unit tests, a production build, browser tests, and a production dependency audit. Use `pnpm preview` to exercise the built static output through Wrangler before deployment.

If you change the config schema, generated assets, status scheduling, or runtime behavior, add or update focused tests. For visual work, check narrow and wide viewports, keyboard navigation, and reduced-motion behavior.

## Submitting pull requests

1. Open an issue first for substantial features, new themes, layouts, or analytics providers so the approach can be discussed.
2. Keep each pull request focused. Avoid unrelated refactors or formatting changes.
3. Make the implementation, documentation, configuration examples, and tests agree.
4. Run the relevant checks above and record the results in the pull request template.
5. Add screenshots or a recording for visual changes, including new themes and layouts.
6. Link the issue with `Closes #<number>` when applicable, then submit the pull request against the default branch.

Write clear commit and pull request titles that describe the outcome, for example `fix: preserve overnight status schedules` or `feat: add aurora theme preset`.

## Code of Conduct

All participation in this repository is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions are licensed under the project’s [GNU General Public License v3.0](LICENSE).
