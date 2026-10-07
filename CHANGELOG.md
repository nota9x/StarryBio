# Changelog

## Unreleased

### Themes

- Curated the built-in library from 28 presets to 13 visually distinct themes and expanded
  the semantic token system for surfaces, typography, geometry, interactions, focus states,
  overlays, icons, and responsive density.
- Preserved `nebula`, `midnight`, `classic-blue`, `aurora`, and `eclipse`; redesigned
  `minimal`, `supernova`, `black-hole`, `pulsar`, `mars`, `starlight`, and `voyager`; and
  polished `terminal`.
- Added compatibility aliases: `cosmic-gold` and `saturn` → `eclipse`; `andromeda` →
  `nebula`; `lunar` and `deep-space` → `midnight`; `solar-flare`, `quasar`, and
  `red-giant` → `supernova`; `event-horizon` → `black-hole`; `apollo` → `voyager`;
  `alien` → `aurora`; `cyber-orbit` → `terminal`; `ice-moon` and `white-dwarf` →
  `pulsar`; and `titan` → `mars`.
- Added repeatable desktop/mobile screenshot auditing and fixed generated Open Graph artwork
  to use solid, theme-appropriate SVG colors.
- Added configurable card/button radii and avatar shapes, with alternating-corner support and
  an intentional square geometry lock for `terminal`.
- Rebuilt Eclipse, Black Hole, Pulsar, and the newer atmospheric effects as integrated,
  reduced-motion-safe canvas treatments; restored theme-appropriate translucency and improved
  light tooltip and copy-success contrast.
- Refined Eclipse, Black Hole, and Pulsar into softer environmental lighting with restrained
  cursor depth, propagated configured radii through schedule surfaces, and gave QR downloads the
  same positive checkmark feedback as copy actions.
- Eliminated dismissed-announcement first-paint flashing and residual layout clearance, and
  balanced fixed-banner spacing across safe-area, desktop, and mobile layouts.

## [3.6.0](https://github.com/nota9x/StarryBio/compare/v3.5.0...v3.6.0) (2026-09-07)


### Features

* **updater:** add verified transactional GitHub release updates ([#63](https://github.com/nota9x/StarryBio/issues/63)) ([dc7c93f](https://github.com/nota9x/StarryBio/commit/dc7c93fd8573d5616ca833f9c200da86f524c1b3))


### Bug Fixes

* **ci:** isolate fixture project dependencies ([0e7a25c](https://github.com/nota9x/StarryBio/commit/0e7a25ca506c28a5fc136e14dd870dcbb8b24a5e))

## [3.5.0](https://github.com/nota9x/StarryBio/compare/v3.4.1...v3.5.0) (2026-09-07)


### Features

* **deploy:** add GitHub Pages support ([0416743](https://github.com/nota9x/StarryBio/commit/041674309356afdad6b97c64e843b271eec24302))


### Bug Fixes

* **deploy:** update GitHub Pages actions to Node 24 ([a6aa992](https://github.com/nota9x/StarryBio/commit/a6aa9925515aa268d52c2fc3aa5e8d23cf5fcc66))
* **security:** allow Umami Cloud gateway collection origin ([1db9a1b](https://github.com/nota9x/StarryBio/commit/1db9a1b195afcc384ebb29ffec83d4efd1acd010))
* **security:** harden dependency checks and deployment policies ([ff8bf3f](https://github.com/nota9x/StarryBio/commit/ff8bf3ff389c5858a0153f5eb07adf2b569d6213))


### Documentation

* **security:** update vulnerability policy and add security.txt ([8256dea](https://github.com/nota9x/StarryBio/commit/8256dea19ed8021dc4edd55750952045ecf8672b))
* update live demo and default site URLs ([70ad6f5](https://github.com/nota9x/StarryBio/commit/70ad6f5904ab9be7d450a4efae02855c47cd2d11))

## [3.4.1](https://github.com/nota9x/StarryBio/compare/v3.4.0...v3.4.1) (2026-09-06)


### Bug Fixes

* **ci:** disable caching for dependency audit ([c80987d](https://github.com/nota9x/StarryBio/commit/c80987de1f459324b6a376054c14a492eda7f022))

## [3.4.0](https://github.com/nota9x/StarryBio/compare/v3.3.0...v3.4.0) (2026-09-06)


### Features

* **release:** automate semantic GitHub releases ([#50](https://github.com/nota9x/StarryBio/issues/50)) ([e36758e](https://github.com/nota9x/StarryBio/commit/e36758e68e24107169cca31b6e2e9ccf2016c9ae))


### Documentation

* **github:** remove duplicate security report link ([f50eb45](https://github.com/nota9x/StarryBio/commit/f50eb4574813c270aacf9e9d6cc335fd5f3d5c40))
