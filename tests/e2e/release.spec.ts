import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

function collectBrowserErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('renders without overflow, broken images, or serious accessibility violations', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('StarryBio');
  await expect(page.locator('.starfield-canvas')).toHaveCount(1);

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

test('supports keyboard tooltip and native dialog focus, Escape, and backdrop dismissal', async ({
  page,
}) => {
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

test('keys announcement dismissal to its content', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'starrybioAnnouncement',
      value: 'an-old-announcement',
      url: 'http://127.0.0.1:8791',
    },
  ]);
  await page.goto('/');
  await expect(page.locator('#announcement-banner')).toBeVisible();
  await page.locator('#announcement-close-btn').click();
  await expect(page.locator('#announcement-banner')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#announcement-banner')).toHaveCount(0);
});

test('reports copy success accessibly', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const copyButton = page.locator('.copy-button-active');
  await copyButton.click();
  await expect(copyButton.locator('[data-copy-feedback]')).toHaveText('Copied!');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('@nota9x');
});

test('serves the custom 404 and survives repeated transitions with one canvas', async ({
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
    await expect(page.locator('.starfield-canvas')).toHaveCount(1);
  }
  expect(errors.filter((error) => !error.includes('status of 404'))).toEqual([]);
});

test('honors reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.shooting-star')).toHaveCount(0);
  const duration = await page
    .locator('#announcement-banner')
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001);
});

test('serves release headers, hashed assets, and generated downloads', async ({
  request,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'One network check covers both viewport projects.'
  );
  const home = await request.get('/');
  expect(home.status()).toBe(200);
  expect(home.headers()['content-security-policy']).not.toContain(
    "script-src 'self' 'unsafe-inline'"
  );

  const html = await home.text();
  const assetPath = html.match(/(?:src|href)="(\/_astro\/[^"]+\.(?:css|js))"/)?.[1];
  expect(assetPath).toBeTruthy();
  const asset = await request.get(assetPath!);
  expect(asset.status()).toBe(200);
  expect(asset.headers()['cache-control']).toContain('immutable');

  const qr = await request.get('/qr.png');
  expect(qr.status()).toBe(200);
  expect(qr.headers()['content-type']).toContain('image/png');
});
