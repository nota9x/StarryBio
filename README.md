# StarryBio v3

StarryBio is a static Astro link-in-bio site with an animated starfield, grouped links,
featured cards, availability schedules, generated downloads, and optional analytics. It builds
directly to `dist/` and deploys as Cloudflare Workers static assets.

Demo: [a9x.pro](https://a9x.pro)

## Requirements

- Node.js 24.0.0+
- pnpm 11.23.0+
- A Cloudflare account only when deploying

Install and start the local Astro server:

```bash
pnpm install
pnpm dev
```

Edit [`config/starrybio.config.ts`](config/starrybio.config.ts). It is a complete starter config
and the only file most installations need to change. While `pnpm dev` is running, saving this
file automatically reloads the open site with the updated configuration.

## Commands

| Command              | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `pnpm dev`           | Validate config, generate assets and icons, then start Astro  |
| `pnpm build`         | Produce the static site in `dist/`                            |
| `pnpm preview`       | Build and serve `dist/` through Wrangler                      |
| `pnpm validate`      | Validate configuration and local asset paths                  |
| `pnpm icons`         | Regenerate configured Simple Icons from the installed package |
| `pnpm test:unit`     | Run Vitest coverage for config and build/runtime helpers      |
| `pnpm test:e2e`      | Build and run local Playwright browser tests                  |
| `pnpm release:check` | Run the complete local v3 release gate                        |
| `pnpm deploy`        | Build and deploy static assets with Wrangler                  |

`release:check` runs formatting, linting, type checks, unit tests, a production build, browser
tests, and `pnpm audit --prod`. It does not publish, tag, merge, or deploy.

## v2 To v3

v3 rejects legacy and unknown configuration properties.

| v2                                            | v3                                                     |
| --------------------------------------------- | ------------------------------------------------------ |
| Top-level `links`                             | Required `sections: [{ title, links }]`                |
| Link `text`                                   | Required link `label`                                  |
| Theme `bright`                                | Theme `classic-blue`                                   |
| `status.showLocalTime`                        | `status.showVisitorTime`                               |
| `status.showOwnerLocalTime`                   | `status.showOwnerTime`                                 |
| Status schedule interpreted as UTC/owner time | Schedule interpreted in each visitor's local time      |
| CDN icon download during every build          | Deterministic generation from installed `simple-icons` |

When `showOwnerTime` is `true`, `ownerTimeZone` is required and must be a valid IANA timezone.
It controls only the optional owner clock, never schedule matching.

## Configuration

The TypeScript config ends with `satisfies StarryBioConfig`, while the same strict Zod schema
validates it at build time. Errors include the exact failing path. Unknown fields, unsafe paths,
unsupported URL protocols, invalid analytics identifiers, and incorrect generated-file
extensions stop the build.

### Sections And Links

```ts
sections: [
  {
    title: 'Socials',
    description: 'Find me around the web.',
    links: [
      {
        label: 'GitHub',
        subtitle: '@your-name',
        url: 'https://github.com/your-name',
        icon: { simpleIcon: 'GitHub' },
      },
      {
        label: 'Email address',
        specialType: 'copy',
        copyValue: 'hello@example.com',
      },
    ],
  },
];
```

Sections, links, and featured cards accept `enabled`, `visibleFrom`, and `visibleUntil`.
Visibility timestamps use ISO date-time strings and are evaluated during the build. End times
are exclusive.

Only external HTTP(S) destinations open a new tab. Root-relative, relative, hash, `mailto:`,
and `tel:` links stay in the current context.

### Themes And Layouts

Theme presets are `nebula`, `midnight`, `classic-blue`, `aurora`, `eclipse`, `cosmic-gold`,
`minimal`, and `terminal`. `classic-blue` restores v2's blue-gradient Bright theme under its
new name. Layout modes are `centered`, `split-screen`, `profile-card`, `compact`,
`creator-grid`, `portfolio`, and `terminal`.

```ts
theme: {
  preset: 'midnight',
  mode: 'dark',
  buttonStyle: 'glass',
  background: 'starfield',
  animationIntensity: 'normal',
},
layout: {
  mode: 'centered',
  linkStyle: 'cards',
  profilePosition: 'top',
  featuredPosition: 'above-links',
},
```

Reduced-motion preferences disable nonessential movement.

### Status Schedule

```ts
status: {
  enabled: true,
  ownerTimeZone: 'America/New_York',
  showOwnerTime: true,
  showVisitorTime: true,
  showNextAvailable: true,
  responseText: 'Usually replies within a few hours',
  default: { text: 'Offline', color: '#6B7280' },
  types: {
    available: { text: 'Available', color: '#10B981' },
    busy: { text: 'Busy', color: '#EF4444' },
  },
  schedule: [
    { status: 'busy', days: 'weekdays', start: '09:00', end: '17:00' },
    { status: 'available', days: 'weekdays', start: '21:00', end: '05:00' },
  ],
},
```

Times use 24-hour `HH:MM`. `daily`, `weekdays`, and `weekends` refer to the visitor's local
calendar day. An overnight range belongs to its start day, so a Friday weekday range from
`21:00` to `05:00` remains active early Saturday.

### Images And Icons

Local images live under `public/`. Both `assets/images/profile.svg` and
`/assets/images/profile.svg` resolve to `public/assets/images/profile.svg`. Remote images must
use HTTP(S). Stable image dimensions are emitted to prevent layout shift.

Simple Icons can be used in links, featured cards, and statuses:

```ts
icon: { simpleIcon: 'Node.js', slug: 'nodedotjs', color: '#5FA04E' }
```

The build reads SVG data from the pinned `simple-icons` dependency and writes only the icons in
use. `slug`, `color`, `darkColor`, `viewbox`, and `size` remain available for customization.

### Generated Assets

```ts
ogImage: { enabled: true, output: 'public/og.png' },
qr: { enabled: true, url: 'https://example.com', output: 'public/qr.png' },
contactCard: {
  enabled: true,
  output: 'public/contact.vcf',
  name: 'Your Name',
  email: 'hello@example.com',
},
```

Outputs must stay inside `public/` and use the correct extension. Disabling a generator removes
its configured output so stale downloads cannot be deployed. vCard values are escaped and
folded according to the format's UTF-8 line limit.

### Analytics And CSP

Analytics defaults to `{ provider: 'none' }`. Supported providers are `google`, `cloudflare`,
`plausible`, `umami`, and `custom`. Configuration is passed to the bundled runtime through data
attributes; StarryBio emits no inline analytics initialization.

```ts
// Google Analytics 4
analytics: { provider: 'google', measurementId: 'G-XXXXXXXXXX' },

// Cloudflare Web Analytics
analytics: { provider: 'cloudflare', token: 'your-site-token' },

// Plausible's current per-site snippet (copy the complete URL from Site Installation)
analytics: { provider: 'plausible', scriptSrc: 'https://plausible.io/js/pa-XXXXXXXX.js' },

// Umami Cloud or a self-hosted Umami instance
analytics: {
  provider: 'umami',
  websiteId: 'your-website-id',
  scriptSrc: 'https://cloud.umami.is/script.js',
},
```

Existing Plausible installations can continue to use the legacy
`{ provider: 'plausible', domain: 'example.com' }` form. New installations should use the exact
per-site `scriptSrc` supplied by Plausible.

The default CSP in `public/_headers` allows the documented provider hosts without
`script-src 'unsafe-inline'`. Any overridden or self-hosted `scriptSrc` remains HTTPS-only. If it
uses a host not already listed in `_headers`, add that host to `script-src` and add the provider's
collection endpoint to `connect-src` before deployment.

## Static Cloudflare Deployment

`astro build` writes static HTML and hashed CSS/JavaScript directly to `dist/`. There is no
Astro Cloudflare adapter, Worker entry point, session binding, or Workers runtime type package.
Wrangler deploys `dist/` using the `assets.directory` setting in `wrangler.jsonc`, including the
custom `404.html` and `public/_headers` rules.

```bash
pnpm deploy
```

Use `pnpm preview` before deployment to verify Cloudflare's static asset routing, headers, cache
rules, generated downloads, and unknown-route 404 responses.
