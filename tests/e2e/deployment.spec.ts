import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { loadConfig } from '../../scripts/load-config';
import { buildContentSecurityPolicy } from '../../src/config/security-headers';
import { normalizeStarryBioConfig, validateStarryBioConfig } from '../../src/config/schema';

const config = normalizeStarryBioConfig(validateStarryBioConfig(await loadConfig()));
const copyLink = config.sections
  .flatMap((section) => section.links)
  .find((link) => link.specialType === 'copy');
const generatedAssets = [
  config.qr?.enabled && {
    output: config.qr.output || 'public/qr.png',
    contentType: /^image\//,
  },
  config.ogImage?.enabled && {
    output: config.ogImage.output || 'public/og.png',
    contentType: config.ogImage.output?.endsWith('.svg') ? /image\/svg\+xml/ : /image\/png/,
  },
  config.contactCard?.enabled && {
    output: config.contactCard.output || 'public/contact.vcf',
    contentType: /text\/(?:x-)?vcard/,
  },
].filter((asset): asset is { output: string; contentType: RegExp } => Boolean(asset));

function collectBrowserErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

function generatedUrl(output: string): string {
  return `/${output
    .replace(/\\/g, '/')
    .replace(/^public\//, '')
    .replace(/^\/+/, '')}`;
}

test('renders the active deployment without overflow, broken images, runtime errors, or serious accessibility violations', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(config.profile.name);
  await expect(page.locator('.starfield-canvas')).toHaveCount(
    config.theme.background === 'starfield' ? 1 : 0
  );

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const brokenImages = await page
    .locator('img')
    .evaluateAll((images) =>
      images
        .filter(
          (image) =>
            !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0
        )
        .map((image) => (image as HTMLImageElement).src)
    );
  expect(brokenImages).toEqual([]);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    )
  ).toEqual([]);
  expect(errors).toEqual([]);
});

test('renders optional controls only when enabled by the active config', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#status-indicator-container')).toHaveCount(
    config.status?.enabled ? 1 : 0
  );
  await expect(page.locator('#status-modal')).toHaveCount(config.status?.enabled ? 1 : 0);
  await expect(page.locator('#announcement-banner')).toHaveCount(
    config.announcement?.enabled ? 1 : 0
  );
  await expect(page.locator('.copy-button-active')).toHaveCount(
    config.sections
      .flatMap((section) => section.links)
      .filter((link) => link.specialType === 'copy').length
  );
  await expect(page.getByRole('link', { name: 'Download QR code' })).toHaveCount(
    config.qr?.enabled && config.qr.showButton ? 1 : 0
  );
  await expect(page.getByRole('link', { name: 'Add Contact' })).toHaveCount(
    config.contactCard?.enabled ? 1 : 0
  );

  const hasProfileActions = Boolean(
    (config.qr?.enabled && config.qr.showButton) || config.contactCard?.enabled
  );
  await expect(page.locator('.profile-actions')).toHaveCount(hasProfileActions ? 1 : 0);
});

test('supports keyboard tooltip and native dialog focus handling when status is enabled', async ({
  page,
}) => {
  test.skip(!config.status?.enabled, 'The active deployment has status disabled.');
  const errors = collectBrowserErrors(page);
  await page.goto('/');
  const trigger = page.locator('#status-indicator-container');
  await trigger.focus();
  await expect(page.locator('#status-tooltip')).toBeVisible();
  await page.keyboard.press('Enter');

  const dialog = page.locator('#status-modal');
  await expect(dialog).toHaveJSProperty('open', true);
  await expect(page.locator('#status-modal-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();

  await trigger.click();
  await dialog.click({ position: { x: 4, y: 4 } });
  await expect(dialog).not.toHaveAttribute('open', '');
  expect(errors).toEqual([]);
});

test('keys announcement dismissal to its configured content when enabled', async ({
  page,
  context,
}) => {
  test.skip(!config.announcement?.enabled, 'The active deployment has announcements disabled.');
  await context.addCookies([
    {
      name: 'starrybioAnnouncement',
      value: 'a-stale-announcement-key',
      url: 'http://127.0.0.1:8791',
    },
  ]);
  await page.goto('/');
  await expect(page.locator('#announcement-banner')).toContainText(config.announcement!.text);
  await page.locator('#announcement-close-btn').click();
  await expect(page.locator('#announcement-banner')).toHaveCount(0);
  await expect(page.locator('#announcement-banner-container')).toHaveCount(0);
  await page.addInitScript(() => {
    const visibleFrames: number[] = [];
    Object.assign(window, { __starryBioVisibleBannerFrames: visibleFrames });
    let frames = 0;
    const inspect = () => {
      const banner = document.querySelector<HTMLElement>('#announcement-banner');
      if (banner) {
        const style = getComputedStyle(banner);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
          visibleFrames.push(frames);
        }
      }
      frames += 1;
      if (frames < 20) requestAnimationFrame(inspect);
    };
    requestAnimationFrame(inspect);
  });
  await page.route(/\/_astro\/BaseLayout\..*\.js(?:\?.*)?$/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.reload();
  await expect(page.locator('#announcement-banner')).toHaveCount(0);
  await expect(page.locator('#announcement-banner-container')).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __starryBioVisibleBannerFrames?: number[] })
          .__starryBioVisibleBannerFrames
    )
  ).toEqual([]);
  await expect(page.locator('html')).toHaveAttribute('data-announcement-state', 'dismissed');
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--announcement-clearance').trim()
    )
  ).toBe('0px');
});

test('copies the user-defined value and reports success accessibly when a copy action exists', async ({
  page,
  context,
}) => {
  test.skip(!copyLink, 'The active deployment has no copy action.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const copyButton = page.locator('.copy-button-active').filter({ hasText: copyLink!.label });
  await copyButton.click();
  await expect(copyButton.locator('[data-feedback-live]')).toHaveText('Copied!');
  await expect(copyButton).toHaveAttribute('data-feedback-state', 'success');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(copyLink!.copyValue);
});

test('uses the shared positive feedback after a QR download is triggered', async ({ page }) => {
  test.skip(
    !(config.qr?.enabled && config.qr.showButton),
    'The active deployment has no QR action.'
  );
  await page.goto('/');
  const qrButton = page.locator('[data-download-feedback]');
  const [download] = await Promise.all([page.waitForEvent('download'), qrButton.click()]);

  expect(download.suggestedFilename()).toBe(
    (config.qr!.output || 'public/qr.png').split('/').at(-1)
  );
  await expect(qrButton).toHaveAttribute('data-feedback-state', 'success');
  await expect(qrButton).toHaveClass(/show-success-feedback/);
  await expect(qrButton.locator('[data-feedback-live]')).toHaveText('QR code downloaded');
  await expect(qrButton.locator('.feedback-action-glyph-default')).toHaveCSS('opacity', '0');
  await expect(qrButton.locator('.feedback-action-glyph-check')).toHaveCSS('opacity', '1');
  await expect(qrButton).not.toHaveAttribute('data-feedback-state', 'success', { timeout: 3_000 });
  await expect(qrButton).toHaveAttribute('aria-label', 'Download QR code');
});

test('does not show QR success when the download cannot be prepared', async ({ page }) => {
  test.skip(
    !(config.qr?.enabled && config.qr.showButton),
    'The active deployment has no QR action.'
  );
  const qrPath = (config.qr!.output || 'public/qr.png').replace(/^public[\\/]/, '');
  await page.route(`**/${qrPath}`, (route) => route.fulfill({ status: 500, body: 'Unavailable' }));
  await page.goto('/');
  const qrButton = page.locator('[data-download-feedback]');
  await qrButton.click();

  await expect(qrButton).toHaveAttribute('data-feedback-state', 'error');
  await expect(qrButton).not.toHaveClass(/show-success-feedback/);
  await expect(qrButton.locator('[data-feedback-live]')).toHaveText('Download failed');
});

test('serves the custom 404 and survives repeated transitions without duplicate backgrounds', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  for (let index = 0; index < 3; index += 1) {
    const response = await page.goto(`/missing-${index}`);
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('404');
    await expect(page.locator('#status-indicator-container')).toHaveCount(0);
    await page.getByRole('link', { name: 'Go Home' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.starfield-canvas')).toHaveCount(
      config.theme.background === 'starfield' ? 1 : 0
    );
  }
  expect(errors.filter((error) => !error.includes('status of 404'))).toEqual([]);
});

test('honors reduced motion regardless of optional content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.shooting-star')).toHaveCount(0);
  if (config.announcement?.enabled) {
    const duration = await page
      .locator('#announcement-banner')
      .evaluate((element) => getComputedStyle(element).animationDuration);
    expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001);
  }
});

test('serves config-aware security headers, hashed assets, and enabled generated downloads', async ({
  request,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'One network check covers both viewport projects.'
  );
  const home = await request.get('/');
  expect(home.status()).toBe(200);
  expect(home.headers()['content-security-policy']).toBe(
    buildContentSecurityPolicy(config.analytics)
  );

  const html = await home.text();
  expect(html).toContain('http-equiv="Content-Security-Policy"');
  const assetPath = html.match(/(?:src|href)="(\/_astro\/[^"]+\.(?:css|js))"/)?.[1];
  expect(assetPath).toBeTruthy();
  const asset = await request.get(assetPath!);
  expect(asset.status()).toBe(200);
  expect(asset.headers()['cache-control']).toContain('immutable');

  for (const generated of generatedAssets) {
    const response = await request.get(generatedUrl(generated.output));
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(generated.contentType);
  }
});
