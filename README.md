# StarryBio v3

StarryBio is a static-first, animated link-in-bio template built with Astro and deployed as Cloudflare Workers static assets. It keeps the signature starfield background, glassy profile card, Simple Icons support, smart availability status, and a user-editable TypeScript config.

Demo: [a9x.pro](https://a9x.pro)

## v3 Features

- Type-safe config in `config/starrybio.config.ts` using `satisfies StarryBioConfig`.
- Build-time config validation with clear path-based errors.
- Theme presets: `nebula`, `midnight`, `aurora`, `eclipse`, `cosmic-gold`, `minimal`, `terminal`.
- Homepage layout modes: `centered`, `split-screen`, `profile-card`, `compact`, `creator-grid`, `portfolio`, `terminal`.
- Grouped link sections with optional descriptions, disabled states, and scheduling windows.
- Featured cards for projects, releases, services, or posts.
- SEO, Open Graph, Twitter card, canonical URL, favicon, and theme-color tags.
- Optional build-time OG image, QR code, and vCard/contact export generation.
- Optional analytics for Google Analytics 4, Cloudflare, Plausible, Umami, or a custom script.
- Improved smart status with owner time, visitor time, next availability, and response text.
- Custom 404 page with the same persistent starfield and smooth transition back home.

## Setup

Requirements:

- Node.js 20.3 or newer
- pnpm
- Wrangler for Cloudflare deployment, installed through project dependencies

Install dependencies:

```bash
pnpm install
```

Start local development:

```bash
pnpm run dev
```

Build:

```bash
pnpm run build
```

Preview the Cloudflare static asset output:

```bash
pnpm run preview
```

Deploy:

```bash
pnpm run deploy
```

## Commands

- `pnpm run dev`: validate config, generate optional assets, build CSS, start Astro dev server.
- `pnpm run build`: validate config, fetch Simple Icons, generate optional assets, build CSS, build Astro.
- `pnpm run preview`: build and run `wrangler dev`.
- `pnpm run validate`: validate the config only.
- `pnpm run icons`: fetch configured Simple Icons.
- `pnpm run typecheck`: run Astro and TypeScript checks.
- `pnpm run deploy`: build and deploy with Wrangler.

## Configuration

Edit `config/starrybio.config.ts`. The browser never loads this file directly; Astro and build scripts consume it at build/render time and emit static HTML, CSS, JS, and assets.

The config should end with:

```ts
} satisfies StarryBioConfig;
```

Local asset paths are resolved from `public/`. For example, `assets/images/profile.svg` means `public/assets/images/profile.svg`.

Legacy flat `links` still work. New v3 configs can use grouped `sections`.

## Themes

Use a preset and optional accent override:

```ts
theme: {
  preset: 'nebula',
  mode: 'dark',
  buttonStyle: 'glass',
  background: 'starfield',
  animationIntensity: 'normal',
}
```

Themes work through CSS custom properties, so users do not need to edit CSS for normal customization. `accent` is optional; omit it to use the refined preset color. Reduced-motion preferences are respected.

## Layout Modes

Configure layout without creating new pages:

```ts
layout: {
  mode: 'centered',
  linkStyle: 'cards',
  profilePosition: 'top',
  featuredPosition: 'above-links',
}
```

Every mode renders the same homepage data differently and stays responsive.

## Sections And Links

```ts
sections: [
  {
    title: 'Socials',
    description: 'Find me around the web.',
    enabled: true,
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/nota9x',
        icon: { simpleIcon: 'GitHub' },
      },
    ],
  },
];
```

Links and sections support `enabled`, `visibleFrom`, and `visibleUntil`. Disabled, future, and expired items are filtered during render.

## Featured Cards

```ts
featured: [
  {
    title: 'StarryBio',
    description: 'A self-hosted animated link-in-bio template.',
    url: 'https://github.com/nota9x/StarryBio',
    image: 'assets/images/profile.svg',
    badge: 'Open Source',
    icon: { simpleIcon: 'GitHub' },
  },
];
```

Cards can appear above or below links using `layout.featuredPosition`.

## Simple Icons

Use Simple Icons in links, featured cards, and statuses:

```ts
icon: {
  simpleIcon: 'GitHub';
}
```

If a generated slug is wrong, provide one:

```ts
icon: { simpleIcon: 'Node.js', slug: 'nodedotjs' }
```

Run `pnpm run icons` to fetch icons manually. `pnpm run build` also fetches them.

## Status And Schedule

Status keeps the existing schedule model:

```ts
status: {
  enabled: true,
  ownerTimeZone: 'America/New_York',
  showLocalTime: true,
  showNextAvailable: true,
  responseText: 'Usually replies within a few hours',
  schedule: [
    { status: 'available', days: 'weekdays', start: '21:00', end: '05:00' },
  ],
}
```

Times use `HH:MM`. The current implementation treats schedule windows as UTC, then displays visitor-local schedule ranges in the modal and owner-local times in the tooltip when configured.

## SEO And OG Image

```ts
seo: {
  title: 'nota9x',
  description: 'Developer, designer, and builder.',
  image: '/assets/images/profile.svg',
  canonicalUrl: 'https://a9x.pro',
  themeColor: '#a78bfa',
}
```

Optional OG image generation:

```ts
ogImage: {
  enabled: true,
  output: 'public/og.png',
  title: 'nota9x',
  subtitle: 'Developer, designer, and builder.',
}
```

OG generation uses build-time `@resvg/resvg-js`. It is not shipped to the browser. Generated `public/og.png` is ignored by git by default.

## QR Code

```ts
qr: {
  enabled: true,
  url: 'https://a9x.pro',
  output: 'public/qr.png',
}
```

If `qr.url` is omitted, `seo.canonicalUrl` is used. QR generation uses the build-time `qrcode` package and adds a download link when enabled.
Generated `public/qr.png` is ignored by git by default.

## Analytics

Analytics defaults to:

```ts
analytics: {
  provider: 'none',
}
```

Supported providers are `google`, `cloudflare`, `plausible`, `umami`, and `custom`. No analytics script is emitted unless explicitly enabled. Google Analytics, Plausible, Umami, and custom providers send page-view data to third-party infrastructure; choose providers and retention settings according to your privacy needs.

Google Analytics 4 uses a GA4 measurement ID:

```ts
analytics: {
  provider: 'google',
  measurementId: 'G-XXXXXXXXXX',
  sendPageView: false,
}
```

Set `sendPageView: false` if you want to initialize gtag without the automatic page view. Use `config` for additional GA4 `gtag('config', ...)` parameters.

The default CSP allows Google Analytics, Cloudflare Web Analytics, Plausible, and the default Umami host. Custom script hosts may require updating `public/_headers`.

## Contact Card

```ts
contactCard: {
  enabled: true,
  output: 'public/contact.vcf',
  name: 'nota9x',
  email: 'hello@example.com',
  website: 'https://a9x.pro',
}
```

When enabled, the build generates a `.vcf` file and the homepage shows an “Add Contact” download link. StarryBio intentionally does not include a contact form.
Generated `public/contact.vcf` is ignored by git by default.

## 404 Transition

`src/pages/404.astro` uses the same `BaseLayout`, theme variables, and persistent starfield as the homepage. Astro view transitions persist the background and transition the 404 card into the homepage card when clicking “Go Home”. External profile links still behave as normal links.

## Deployment

The project uses `@astrojs/cloudflare` with static output and `wrangler.jsonc` assets pointing at `dist`. Keep generated assets inside `public/` so they are copied to the deployment output.

## Migration Notes

StarryBio v3 is the Astro version. Old references to `src/site/config.js` are obsolete. Move site settings into `config/starrybio.config.ts`; legacy flat `links` can remain, but grouped `sections` are preferred for new configs.

## Troubleshooting

- Config fails: run `pnpm run validate` and fix the exact path shown in the error.
- Local asset fails: make sure the file exists under `public/`.
- Simple Icon fails: add an explicit `slug`.
- Analytics script blocked: update `public/_headers` CSP for custom hosts.
- QR generation fails: set `qr.url` or `seo.canonicalUrl`.
- OG generation disabled: no image is generated unless `ogImage.enabled` is `true`.
- Cloudflare preview issues: run `pnpm run build` first, then `pnpm run preview`.
