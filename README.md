# ✨ StarryBio v3

StarryBio is a static, customizable link-in-bio site built with Astro. It combines grouped links, featured cards, availability schedules, generated downloads, optional analytics, and an animated starfield. The normal build produces a portable `dist/` directory that can be served by Cloudflare Workers, Vercel, Netlify, or another static host.

Demo: [a9x.pro](https://a9x.pro)

<p align="center">
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/nota9x/StarryBio"><img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" height="32"></a>&nbsp;&nbsp;
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/nota9x/StarryBio"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" height="32"></a>&nbsp;&nbsp;
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnota9x%2FStarryBio"><img src="https://vercel.com/button" alt="Deploy with Vercel" height="32"></a>
</p>

## Documentation

The [StarryBio Wiki](https://github.com/nota9x/StarryBio/wiki) is the primary documentation for using, configuring, deploying, operating, and extending StarryBio.

- [Getting started](https://github.com/nota9x/StarryBio/wiki/Getting-Started)
- [Configuration reference](https://github.com/nota9x/StarryBio/wiki/Configuration-Reference)
- [Deploy to Cloudflare](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Cloudflare)
- [Deploy to Vercel](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Vercel)
- [Deploy to Netlify](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Netlify)
- [Custom domains and DNS](https://github.com/nota9x/StarryBio/wiki/Domains-and-DNS)
- [Security and privacy](https://github.com/nota9x/StarryBio/wiki/Security-and-Privacy)
- [Troubleshooting](https://github.com/nota9x/StarryBio/wiki/Troubleshooting)
- [Development and contribution](https://github.com/nota9x/StarryBio/wiki/Development-Setup)

## Highlights

- One strict TypeScript configuration file for profile content, grouped links, featured cards, themes, layouts, availability, generated downloads, metadata, and analytics.
- Built-in theme presets, responsive layouts, configurable motion, local/remote assets, and build-time Simple Icon generation.
- Copy-to-clipboard links, a visitor-local availability schedule, a dismissible announcement, QR-code and vCard downloads, and generated Open Graph images.
- Optional Google Analytics 4, Cloudflare Web Analytics, Plausible, Umami, or custom HTTPS analytics script support.
- Portable static output with custom 404 behavior, security headers, and cache rules translated for each supported host.

StarryBio is one static profile site per installation. It has no built-in accounts, admin dashboard, authentication, database, server-side API, provider data binding, or runtime environment-variable configuration. Review the [FAQ and limitations](https://github.com/nota9x/StarryBio/wiki/FAQ-and-Limitations) before planning features that need those capabilities.

## Quick start

Requirements:

- Node.js 24.x or 26.0.0+
- pnpm 11.25.0
- A hosting account only when deploying

```bash
pnpm install
pnpm dev
```

Edit `config/starrybio.config.ts` and save; the development server reloads the open page after a configuration change. Local assets belong under `public/`.

Before publishing:

```bash
pnpm validate
pnpm build
pnpm preview
```

`pnpm build` produces portable static output in `dist/` without hosting credentials.

Deploy to Cloudflare with:

```bash
pnpm deploy
```

For setup instructions, see the Wiki guides for [Cloudflare](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Cloudflare), [Vercel](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Vercel), and [Netlify](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Netlify).

## Common commands

| Command                   | Purpose                                           |
| ------------------------- | ------------------------------------------------- |
| `pnpm dev`                | Validate, generate assets/icons, and start Astro. |
| `pnpm validate`           | Validate configuration and local asset paths.     |
| `pnpm build`              | Build portable static output in `dist/`.          |
| `pnpm preview`            | Build and serve `dist/` with Astro.               |
| `pnpm preview:cloudflare` | Build and serve `dist/` through Wrangler.         |
| `pnpm deploy`             | Backwards-compatible Cloudflare deployment.       |
| `pnpm deploy:cloudflare`  | Build and deploy static assets with Wrangler.     |
| `pnpm test:unit`          | Run Vitest unit tests.                            |
| `pnpm test:e2e`           | Build and run Playwright browser tests.           |
| `pnpm release:check`      | Run the complete local release gate.              |

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project contribution process and the [wiki development guide](https://github.com/nota9x/StarryBio/wiki/Testing-and-Contributing) for the code map, test commands, and change-specific expectations.

Report vulnerabilities privately through [GitHub Security Advisories](https://github.com/nota9x/StarryBio/security/advisories/new); see [SECURITY.md](SECURITY.md) for the reporting policy. Do not post credentials, real API tokens, or private analytics data in public issues.

## License

StarryBio is licensed under the [GNU General Public License v3.0](LICENSE).
