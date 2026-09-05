<div align="center">

# ✨ StarryBio v3

### A beautiful, customizable link-in-bio site built with Astro.

Build your profile once. Deploy it anywhere.

[![Live Demo](https://img.shields.io/badge/✨_Live_Demo-a9x.pro-7c3aed?style=for-the-badge)](https://a9x.pro)
[![Documentation](https://img.shields.io/badge/📖_Documentation-Wiki-2563eb?style=for-the-badge)](https://github.com/nota9x/StarryBio/wiki)

<br>

[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro\&logoColor=white)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub License](https://img.shields.io/github/license/nota9x/StarryBio)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/nota9x/StarryBio?display_name=tag)](https://github.com/nota9x/StarryBio/releases)
[![GitHub Stars](https://img.shields.io/github/stars/nota9x/StarryBio?style=flat)](https://github.com/nota9x/StarryBio/stargazers)

</div>

---

StarryBio is a static, customizable link-in-bio site built with Astro. It combines grouped links, featured cards, availability schedules, generated downloads, optional analytics, and an animated starfield.

The normal build produces a portable `dist/` directory that can be served by **Cloudflare Workers**, **Vercel**, **Netlify**, or another static host.

<div align="center">

### 🚀 Deploy your own

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/nota9x/StarryBio"><img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" height="32"></a>   <a href="https://app.netlify.com/start/deploy?repository=https://github.com/nota9x/StarryBio"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" height="32"></a>   <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnota9x%2FStarryBio"><img src="https://vercel.com/button" alt="Deploy with Vercel" height="32"></a>

</div>

---

## ✨ Highlights

* 🎨 **Highly customizable** — themes, layouts, motion, profile content, grouped links, featured cards, metadata, and more from one strict TypeScript configuration.
* 🌌 **Animated presentation** — responsive layouts, built-in theme presets, configurable motion, and StarryBio's animated starfield.
* 🔗 **More than simple links** — copy-to-clipboard actions, visitor-local availability schedules, announcements, QR codes, and vCard downloads.
* 🖼️ **Generated assets** — build-time Simple Icons and generated Open Graph images.
* 📊 **Optional analytics** — Google Analytics 4, Cloudflare Web Analytics, Plausible, Umami, or custom HTTPS analytics scripts.
* ⚡ **Static and portable** — produces a standard `dist/` directory with no required backend or database.
* ☁️ **Deploy anywhere** — first-class support for Cloudflare Workers, Vercel, and Netlify.
* 🔐 **Production-minded** — custom 404 behavior, security headers, cache rules, configuration validation, and automated tests.

## 📖 Documentation

The **[StarryBio Wiki](https://github.com/nota9x/StarryBio/wiki)** is the primary documentation for installing, configuring, deploying, operating, and extending StarryBio.

| Guide                                                                                            | Description                                       |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| [🚀 Getting started](https://github.com/nota9x/StarryBio/wiki/Getting-Started)                   | Install StarryBio and create your first profile.  |
| [⚙️ Configuration reference](https://github.com/nota9x/StarryBio/wiki/Configuration-Reference)   | Explore available configuration options.          |
| [☁️ Deploy to Cloudflare](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Cloudflare)      | Deploy with Cloudflare Workers.                   |
| [▲ Deploy to Vercel](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Vercel)               | Deploy as a static Vercel project.                |
| [◆ Deploy to Netlify](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Netlify)             | Deploy through Netlify.                           |
| [🌐 Custom domains and DNS](https://github.com/nota9x/StarryBio/wiki/Domains-and-DNS)            | Connect your own domain.                          |
| [🔐 Security and privacy](https://github.com/nota9x/StarryBio/wiki/Security-and-Privacy)         | Understand security and analytics considerations. |
| [🛠️ Troubleshooting](https://github.com/nota9x/StarryBio/wiki/Troubleshooting)                  | Diagnose common setup and deployment problems.    |
| [🧑‍💻 Development and contribution](https://github.com/nota9x/StarryBio/wiki/Development-Setup) | Set up the repository for development.            |

## ⚡ Quick start

### Requirements

* **Node.js** 24.x or 26.0.0+
* **pnpm** 11.25.0
* A hosting account only when deploying

Clone the repository and start the development server:

```bash
pnpm install
pnpm dev
```

Edit:

```text
config/starrybio.config.ts
```

Save your changes and the development server will reload the open page automatically.

Local assets belong under `public/`.

### Before publishing

```bash
pnpm validate
pnpm build
pnpm preview
```

`pnpm build` produces portable static output in:

```text
dist/
```

No hosting credentials are required to build StarryBio.

### Deploy to Cloudflare

```bash
pnpm deploy
```

For complete setup instructions, see the deployment guides for:

* [Cloudflare](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Cloudflare)
* [Vercel](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Vercel)
* [Netlify](https://github.com/nota9x/StarryBio/wiki/Deploying-to-Netlify)

## 🧰 Common commands

| Command                   | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `pnpm dev`                | Validate, generate assets/icons, and start Astro.  |
| `pnpm validate`           | Validate configuration and local asset paths.      |
| `pnpm build`              | Build portable static output in `dist/`.           |
| `pnpm preview`            | Build and serve `dist/` with Astro.                |
| `pnpm preview:cloudflare` | Build and serve `dist/` through Wrangler.          |
| `pnpm deploy`             | Backwards-compatible Cloudflare deployment.        |
| `pnpm deploy:cloudflare`  | Build and deploy static assets with Wrangler.      |
| `pnpm test:unit`          | Run Vitest unit tests.                             |
| `pnpm test:e2e`           | Build and run Playwright browser tests.            |
| `pnpm starrybio:update`   | Safely integrate updates from the main repository. |
| `pnpm release:check`      | Run the complete local release gate.               |

## 🤝 Contributing

Contributions are welcome.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project contribution process and the [wiki development guide](https://github.com/nota9x/StarryBio/wiki/Testing-and-Contributing) for the code map, testing commands, and change-specific expectations.

## 🔐 Security

Report vulnerabilities privately through [GitHub Security Advisories](https://github.com/nota9x/StarryBio/security/advisories/new).

See [SECURITY.md](SECURITY.md) for the full reporting policy.

Please do **not** post credentials, real API tokens, or private analytics data in public issues.

## 📜 License

StarryBio is licensed under the [GNU General Public License v3.0](LICENSE).

---

<div align="center">

**[✨ Live Demo](https://a9x.pro)** · **[📖 Documentation](https://github.com/nota9x/StarryBio/wiki)** · **[🐛 Report a Bug](https://github.com/nota9x/StarryBio/issues/new?template=bug-report.yml)** · **[⭐ Star StarryBio](https://github.com/nota9x/StarryBio)**

</div>
