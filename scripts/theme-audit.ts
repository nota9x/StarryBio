import { runAtmosphereAudit } from './atmosphere-audit';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium, type Page } from '@playwright/test';
import {
  THEME_PRESET_NAMES,
  getThemePresetDefinition,
  getThemeStyle,
  type ResolvedProfileImageShape,
  type StarfieldEffectKind,
  type ThemePreset,
} from '../src/config/themes';

const HOST = '127.0.0.1';
const PORT = 8792;
const BASE_URL = `http://${HOST}:${PORT}`;
const OUTPUT_DIRECTORY = path.resolve('test-results/theme-audit');
const ASTRO_CLI = path.resolve('node_modules/astro/bin/astro.mjs');

interface AuditTheme {
  appearance: 'dark' | 'light';
  background: 'starfield' | 'gradient' | 'minimal';
  buttonStyle: 'glass' | 'solid' | 'outline' | 'minimal' | 'terminal';
  layout: 'centered' | 'terminal';
  linkStyle: 'cards' | 'terminal';
  imageShape: ResolvedProfileImageShape;
  effect: StarfieldEffectKind;
  name: ThemePreset;
  style: string;
}

function auditTheme(name: ThemePreset): AuditTheme {
  const definition = getThemePresetDefinition(name);
  const background = definition.defaultBackground || 'starfield';
  return {
    name,
    appearance: definition.appearance,
    background,
    buttonStyle: definition.defaultButtonStyle || 'glass',
    layout: definition.defaultLayout || 'centered',
    linkStyle: definition.defaultLinkStyle || 'cards',
    imageShape: definition.defaultImageShape,
    effect: definition.starfieldEffect,
    style: getThemeStyle({
      preset: name,
      accent: definition.accent,
      background,
      cardRadius: 28,
      buttonRadius: 16,
    }),
  };
}

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch {
      // The development server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Theme audit server did not start at ${BASE_URL}.`);
}

async function stopServer(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const process_ = spawn(process.execPath, [ASTRO_CLI, 'dev', 'stop'], {
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: 'ignore',
    });
    process_.once('error', reject);
    process_.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`Unable to stop theme audit server (${code}).`))
    );
  });
}

async function applyTheme(page: Page, theme: AuditTheme): Promise<void> {
  await page.evaluate((value) => {
    const root = document.documentElement;
    root.setAttribute('style', value.style);
    root.dataset.theme = value.name;
    root.dataset.themeAppearance = value.appearance;
    root.dataset.themeBackground = value.background;
    root.dataset.buttonStyle = value.buttonStyle;
    root.dataset.profileImageShape = value.imageShape;

    let stars = document.querySelector<HTMLElement>('.stars-container');
    if (!stars && value.background === 'starfield') {
      stars = document.createElement('div');
      stars.className = 'stars-container';
      stars.ariaHidden = 'true';
      document.body.prepend(stars);
    }
    if (stars) {
      stars.hidden = value.background !== 'starfield';
      stars.dataset.starfieldEffect = value.effect;
      stars.dataset.animationIntensity = 'normal';
    }

    const shell = document.querySelector<HTMLElement>('.layout-shell');
    if (shell) shell.dataset.layout = value.layout;
    const card = document.querySelector<HTMLElement>('.profile-card');
    if (card) {
      for (const className of [...card.classList]) {
        if (
          className.startsWith('layout-') ||
          className.startsWith('links-') ||
          className.startsWith('profile-position-') ||
          className === 'theme-terminal'
        ) {
          card.classList.remove(className);
        }
      }
      card.classList.add(
        `layout-${value.layout}`,
        `links-${value.linkStyle}`,
        'profile-position-top'
      );
      if (value.buttonStyle === 'terminal') card.classList.add('theme-terminal');
    }

    document.dispatchEvent(new Event('astro:page-load'));
  }, theme);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
}

async function inspectPage(page: Page, theme: AuditTheme, viewport: string): Promise<void> {
  const result = await page.evaluate(() => ({
    brokenImages: [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    theme: document.documentElement.dataset.theme,
  }));
  if (result.theme !== theme.name) throw new Error(`${theme.name}/${viewport}: wrong data-theme.`);
  if (result.overflow > 1)
    throw new Error(`${theme.name}/${viewport}: ${result.overflow}px overflow.`);
  if (result.brokenImages.length) {
    throw new Error(`${theme.name}/${viewport}: broken images: ${result.brokenImages.join(', ')}`);
  }

  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const blocking = accessibility.violations.filter(
    (violation) =>
      violation.id === 'color-contrast' ||
      violation.impact === 'serious' ||
      violation.impact === 'critical'
  );
  if (blocking.length) {
    throw new Error(
      `${theme.name}/${viewport}: accessibility violations: ${blocking
        .map((violation) => violation.id)
        .join(', ')}`
    );
  }
}

function contactSheet(): string {
  const rows = THEME_PRESET_NAMES.map(
    (theme) => `<article>
      <h2>${theme}</h2>
      <div class="shots">
        <figure><img src="desktop/${theme}.png" alt="${theme} desktop"><figcaption>Desktop</figcaption></figure>
        <figure><img src="interaction/${theme}.png" alt="${theme} keyboard focus and hover"><figcaption>Interaction</figcaption></figure>
        <figure><img src="mobile/${theme}.png" alt="${theme} mobile"><figcaption>Mobile</figcaption></figure>
        <figure><img src="geometry-mobile/${theme}.png" alt="${theme} mobile square avatar and alternating radii"><figcaption>Mobile geometry</figcaption></figure>
        <figure><img src="geometry/${theme}.png" alt="${theme} square avatar and alternating radii"><figcaption>Alternating geometry</figcaption></figure>
        <figure><img src="geometry-zero/${theme}.png" alt="${theme} circular avatar and zero radii"><figcaption>0px geometry</figcaption></figure>
        <figure><img src="geometry-pill/${theme}.png" alt="${theme} maximum radius geometry"><figcaption>999px geometry</figcaption></figure>
        <figure><img src="qr-success/${theme}.png" alt="${theme} QR download success"><figcaption>QR success</figcaption></figure>
        <figure><img src="copy-error/${theme}.png" alt="${theme} copy error"><figcaption>Copy error</figcaption></figure>
        <figure><img src="tooltip/${theme}.png" alt="${theme} status tooltip"><figcaption>Tooltip</figcaption></figure>
        <figure><img src="modal/${theme}.png" alt="${theme} status modal"><figcaption>Modal</figcaption></figure>
        <figure><img src="modal-geometry/${theme}.png" alt="${theme} status modal using configured radii"><figcaption>Modal geometry</figcaption></figure>
        <figure><img src="motion/${theme}.png" alt="${theme} animated effect"><figcaption>Motion</figcaption></figure>
        <figure><img src="parallax/${theme}.png" alt="${theme} pointer-responsive effect"><figcaption>Pointer depth</figcaption></figure>
        <figure><img src="dismissed/${theme}.png" alt="${theme} dismissed announcement"><figcaption>Dismissed</figcaption></figure>
      </div>
    </article>`
  ).join('\n');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>StarryBio theme audit</title><style>
    body{margin:0;padding:24px;background:#111;color:#eee;font:14px system-ui}h1{margin:0 0 24px}article{margin:0 0 36px}h2{font-size:18px}.shots{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}figure{margin:0;background:#1d1d1d;padding:8px}img{display:block;width:100%;height:auto}figcaption{padding-top:7px;color:#bbb}@media(max-width:1100px){.shots{grid-template-columns:1fr 1fr}}
  </style><body><h1>StarryBio curated theme audit</h1>${rows}</body></html>`;
}

async function run(): Promise<void> {
  await Promise.all(
    [
      'desktop',
      'interaction',
      'mobile',
      'geometry-mobile',
      'geometry',
      'geometry-zero',
      'geometry-zero-mobile',
      'geometry-pill',
      'geometry-pill-mobile',
      'qr-success',
      'copy-error',
      'tooltip',
      'modal',
      'modal-geometry',
      'motion',
      'parallax',
      'motion-mobile',
      'dismissed',
    ].map((name) => mkdir(path.join(OUTPUT_DIRECTORY, name), { recursive: true }))
  );
  const server = spawn(
    process.execPath,
    [ASTRO_CLI, 'dev', '--host', HOST, '--port', String(PORT)],
    {
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  let serverOutput = '';
  server.stdout.on('data', (chunk: Buffer) => (serverOutput += chunk.toString()));
  server.stderr.on('data', (chunk: Buffer) => (serverOutput += chunk.toString()));

  try {
    await waitForServer();
    if (process.argv.includes('--atmosphere')) {
      await runAtmosphereAudit(BASE_URL, path.join(OUTPUT_DIRECTORY, 'atmosphere'));
      return;
    }
    const browser = await chromium.launch();
    try {
      for (const name of THEME_PRESET_NAMES) {
        const theme = auditTheme(name);
        for (const [viewport, size] of [
          ['desktop', { width: 1440, height: 900 }],
          ['mobile', { width: 390, height: 844 }],
        ] as const) {
          const context = await browser.newContext({
            viewport: size,
            reducedMotion: 'reduce',
            permissions: ['clipboard-read', 'clipboard-write'],
          });
          const page = await context.newPage();
          const runtimeErrors: string[] = [];
          page.on('pageerror', (error) => runtimeErrors.push(error.message));
          await page.goto(BASE_URL, { waitUntil: 'networkidle' });
          await page.addStyleTag({
            content:
              'astro-dev-toolbar{display:none!important}*,*::before,*::after{animation-duration:0s!important;transition:none!important}',
          });
          await applyTheme(page, theme);
          await inspectPage(page, theme, viewport);
          await page.screenshot({
            fullPage: true,
            path: path.join(OUTPUT_DIRECTORY, viewport, `${name}.png`),
          });

          await page.evaluate(() => {
            const root = document.documentElement;
            root.dataset.profileImageShape = 'circle';
            root.style.setProperty('--img-radius', '50%');
            root.style.setProperty('--card-radius', '0px');
            root.style.setProperty('--button-radius', '0px');
            for (const corner of ['top-left', 'top-right', 'bottom-right', 'bottom-left']) {
              root.style.setProperty(`--card-radius-${corner}`, '0px');
              root.style.setProperty(`--button-radius-${corner}`, '0px');
            }
          });
          await page.screenshot({
            fullPage: true,
            path: path.join(
              OUTPUT_DIRECTORY,
              viewport === 'desktop' ? 'geometry-zero' : 'geometry-zero-mobile',
              `${name}.png`
            ),
          });

          await page.evaluate((locksGeometry) => {
            const root = document.documentElement;
            root.dataset.profileImageShape = 'square';
            root.style.setProperty('--img-radius', '0px');
            root.style.setProperty('--card-radius', locksGeometry ? '0px' : '28px 8px');
            root.style.setProperty('--button-radius', locksGeometry ? '0px' : '28px 8px');
            const corners = locksGeometry
              ? ['0px', '0px', '0px', '0px']
              : ['28px', '8px', '28px', '8px'];
            ['top-left', 'top-right', 'bottom-right', 'bottom-left'].forEach((corner, index) => {
              root.style.setProperty(`--card-radius-${corner}`, corners[index]);
              root.style.setProperty(`--button-radius-${corner}`, corners[index]);
            });
          }, name === 'terminal');
          await page.screenshot({
            fullPage: true,
            path: path.join(
              OUTPUT_DIRECTORY,
              viewport === 'desktop' ? 'geometry' : 'geometry-mobile',
              `${name}.png`
            ),
          });
          await page.evaluate((locksGeometry) => {
            const root = document.documentElement;
            root.dataset.profileImageShape = 'rounded-square';
            root.style.setProperty('--img-radius', '18px');
            root.style.setProperty('--card-radius', locksGeometry ? '0px' : '999px');
            root.style.setProperty('--button-radius', locksGeometry ? '0px' : '999px');
            const radius = locksGeometry ? '0px' : '999px';
            for (const corner of ['top-left', 'top-right', 'bottom-right', 'bottom-left']) {
              root.style.setProperty(`--card-radius-${corner}`, radius);
              root.style.setProperty(`--button-radius-${corner}`, radius);
            }
          }, name === 'terminal');
          await page.screenshot({
            fullPage: true,
            path: path.join(
              OUTPUT_DIRECTORY,
              viewport === 'desktop' ? 'geometry-pill' : 'geometry-pill-mobile',
              `${name}.png`
            ),
          });
          await applyTheme(page, theme);

          if (viewport === 'desktop') {
            const firstLink = page.locator('.link-button').first();
            await firstLink.hover();
            await firstLink.focus();
            await page
              .locator('.copy-button-active')
              .first()
              .evaluate((button) => {
                const copyButton = button as HTMLButtonElement;
                copyButton.dataset.feedbackState = 'success';
                copyButton.classList.add('show-success-feedback');
                const feedback = copyButton.querySelector<HTMLElement>('[data-feedback-live]');
                if (feedback) feedback.textContent = 'Copied!';
              });
            await page.screenshot({
              fullPage: true,
              path: path.join(OUTPUT_DIRECTORY, 'interaction', `${name}.png`),
            });
            await page
              .locator('.copy-button-active')
              .first()
              .evaluate((button) => {
                const copyButton = button as HTMLButtonElement;
                copyButton.dataset.feedbackState = 'error';
                copyButton.classList.remove('show-success-feedback');
                const feedback = copyButton.querySelector<HTMLElement>('[data-feedback-live]');
                if (feedback) feedback.textContent = 'Copy failed';
              });
            await inspectPage(page, theme, 'copy-error');
            await page.screenshot({
              fullPage: true,
              path: path.join(OUTPUT_DIRECTORY, 'copy-error', `${name}.png`),
            });
            await page
              .locator('.copy-button-active')
              .first()
              .evaluate((button) => {
                const copyButton = button as HTMLButtonElement;
                const feedback = copyButton.querySelector<HTMLElement>('[data-feedback-live]');
                copyButton.classList.remove('show-success-feedback');
                delete copyButton.dataset.feedbackState;
                if (feedback) {
                  feedback.textContent = copyButton.dataset.originalSubtitle || 'Copy to clipboard';
                }
              });

            const qrDownload = page.locator('[data-download-feedback]');
            if (await qrDownload.count()) {
              await Promise.all([page.waitForEvent('download'), qrDownload.click()]);
              await page.waitForFunction(
                () =>
                  document.querySelector<HTMLElement>('[data-download-feedback]')?.dataset
                    .feedbackState === 'success'
              );
              await inspectPage(page, theme, 'qr-success');
              await page.screenshot({
                fullPage: true,
                path: path.join(OUTPUT_DIRECTORY, 'qr-success', `${name}.png`),
              });
            }
            const status = page.locator('#status-indicator-container');
            if (await status.count()) {
              await page
                .locator('.copy-button-active')
                .first()
                .evaluate((button) => {
                  button.classList.remove('show-success-feedback');
                  delete (button as HTMLButtonElement).dataset.feedbackState;
                });
              await status.hover();
              await inspectPage(page, theme, 'tooltip');
              await page.screenshot({
                fullPage: true,
                path: path.join(OUTPUT_DIRECTORY, 'tooltip', `${name}.png`),
              });
              await status.click();
              await page.locator('#status-modal-close').focus();
              await inspectPage(page, theme, 'modal');
            }
            await page.screenshot({
              fullPage: true,
              path: path.join(OUTPUT_DIRECTORY, 'modal', `${name}.png`),
            });

            await page.keyboard.press('Escape');
            await page.evaluate((locksGeometry) => {
              const root = document.documentElement;
              const cardRadius = locksGeometry ? '0px' : '28px 8px';
              const buttonRadius = locksGeometry ? '0px' : '20px 6px';
              root.style.setProperty('--modal-radius', cardRadius);
              root.style.setProperty('--tooltip-radius', buttonRadius);
              const corners = locksGeometry
                ? ['0px', '0px', '0px', '0px']
                : ['20px', '6px', '20px', '6px'];
              ['top-left', 'top-right', 'bottom-right', 'bottom-left'].forEach((corner, index) => {
                root.style.setProperty(`--button-radius-${corner}`, corners[index]);
              });
            }, name === 'terminal');
            if (await status.count()) {
              await status.click();
              await page.locator('#status-modal-close').focus();
              await inspectPage(page, theme, 'modal-geometry');
              await page.screenshot({
                fullPage: true,
                path: path.join(OUTPUT_DIRECTORY, 'modal-geometry', `${name}.png`),
              });
              await page.keyboard.press('Escape');
            }
            await page.emulateMedia({ reducedMotion: 'no-preference' });
            await applyTheme(page, theme);
            await page.waitForTimeout(1_200);
            await page.screenshot({
              fullPage: true,
              path: path.join(OUTPUT_DIRECTORY, 'motion', `${name}.png`),
            });
            await page.mouse.move(size.width * 0.92, size.height * 0.14, { steps: 12 });
            await page.waitForTimeout(450);
            await page.screenshot({
              fullPage: true,
              path: path.join(OUTPUT_DIRECTORY, 'parallax', `${name}.png`),
            });

            await page.evaluate(() => {
              document.documentElement.dataset.announcementState = 'dismissed';
              document.documentElement.style.setProperty('--announcement-clearance', '0px');
            });
            await page.screenshot({
              fullPage: true,
              path: path.join(OUTPUT_DIRECTORY, 'dismissed', `${name}.png`),
            });
          } else {
            await page.emulateMedia({ reducedMotion: 'no-preference' });
            await applyTheme(page, theme);
            await page.waitForTimeout(1_200);
            await page.screenshot({
              fullPage: true,
              path: path.join(OUTPUT_DIRECTORY, 'motion-mobile', `${name}.png`),
            });
          }

          if (runtimeErrors.length) {
            throw new Error(`${name}/${viewport}: ${runtimeErrors.join('; ')}`);
          }
          await context.close();
        }
        console.log(`✓ Audited ${name}`);
      }
    } finally {
      await browser.close();
    }
    await writeFile(path.join(OUTPUT_DIRECTORY, 'index.html'), contactSheet());
    console.log(`✓ Theme contact sheet: ${path.join(OUTPUT_DIRECTORY, 'index.html')}`);
  } catch (error) {
    if (serverOutput.trim()) console.error(serverOutput.trim());
    throw error;
  } finally {
    server.kill();
    await stopServer();
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
