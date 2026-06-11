import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import config from '../config/starrybio.config';
import { resolveOutputPath } from './config-utils';
import { normalizeStarryBioConfig, validateStarryBioConfig } from '../src/config/schema';
import { getThemePresetTokens } from '../src/config/themes';

async function main() {
  const siteConfig = normalizeStarryBioConfig(validateStarryBioConfig(config));

  await generateOgImage(siteConfig);
  await generateQrCode(siteConfig);
  await generateContactCard(siteConfig);
  await syncImageOptimizationAssets();
}

async function syncImageOptimizationAssets() {
  const publicImages = path.resolve('public/assets/images');
  const optimizedImages = path.resolve('src/assets/images');

  await rm(optimizedImages, { recursive: true, force: true });
  await mkdir(path.dirname(optimizedImages), { recursive: true });
  await cp(publicImages, optimizedImages, {
    recursive: true,
    filter: (source) => !path.basename(source).startsWith('.'),
  });

  console.log('✓ Synced image assets for Astro optimization');
}

async function generateOgImage(siteConfig: ReturnType<typeof normalizeStarryBioConfig>) {
  if (!siteConfig.ogImage?.enabled) {
    console.log('✓ Generated SEO metadata');
    return;
  }

  const output = resolveOutputPath(siteConfig.ogImage.output, 'public/og.png');
  await mkdir(path.dirname(output), { recursive: true });

  const svg = createOgSvg(siteConfig);

  if (output.endsWith('.svg')) {
    await writeFile(output, svg);
  } else {
    const { Resvg } = await import('@resvg/resvg-js');
    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: { loadSystemFonts: true },
    })
      .render()
      .asPng();
    await writeFile(output, png);
  }

  console.log(`✓ Generated SEO metadata (${path.relative(process.cwd(), output)})`);
}

async function generateQrCode(siteConfig: ReturnType<typeof normalizeStarryBioConfig>) {
  if (!siteConfig.qr?.enabled) return;

  const url = siteConfig.qr.url || siteConfig.seo.canonicalUrl;
  if (!url) {
    throw new Error('qr.url is required when seo.canonicalUrl is not configured.');
  }

  const output = resolveOutputPath(siteConfig.qr.output, 'public/qr.png');
  await mkdir(path.dirname(output), { recursive: true });

  const qrcode = await import('qrcode');
  await qrcode.toFile(output, url, {
    width: 960,
    margin: 2,
    color: {
      dark: '#0b1020',
      light: '#ffffff',
    },
  });

  console.log(`✓ Generated QR code (${path.relative(process.cwd(), output)})`);
}

async function generateContactCard(siteConfig: ReturnType<typeof normalizeStarryBioConfig>) {
  if (!siteConfig.contactCard?.enabled) return;

  const output = resolveOutputPath(siteConfig.contactCard.output, 'public/contact.vcf');
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, createVCard(siteConfig));

  console.log(`✓ Generated contact card (${path.relative(process.cwd(), output)})`);
}

function createOgSvg(siteConfig: ReturnType<typeof normalizeStarryBioConfig>): string {
  const tokens = getThemePresetTokens(siteConfig.theme);
  const title = escapeXml(siteConfig.ogImage?.title || siteConfig.seo.title);
  const subtitle = escapeXml(siteConfig.ogImage?.subtitle || siteConfig.seo.description);
  const name = escapeXml(siteConfig.profile.name);

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="70%" r="85%">
      <stop offset="0%" stop-color="${tokens.accent}" stop-opacity="0.32"/>
      <stop offset="46%" stop-color="${tokens.bgColor}"/>
      <stop offset="100%" stop-color="#02030a"/>
    </radialGradient>
    <linearGradient id="line" x1="0" x2="1">
      <stop offset="0%" stop-color="${tokens.accent}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1020" cy="120" r="180" fill="${tokens.accent}" opacity="0.12"/>
  <circle cx="160" cy="520" r="220" fill="#ffffff" opacity="0.06"/>
  ${createStarSvg()}
  <rect x="90" y="88" width="1020" height="454" rx="36" fill="${tokens.cardBg}" stroke="${tokens.accent}" stroke-opacity="0.32"/>
  <rect x="130" y="138" width="92" height="92" rx="28" fill="${tokens.accent}" opacity="0.22"/>
  <text x="176" y="196" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" fill="#ffffff">*</text>
  <text x="130" y="302" font-family="Inter, Arial, sans-serif" font-size="78" font-weight="800" fill="#ffffff">${title}</text>
  <text x="132" y="372" font-family="Inter, Arial, sans-serif" font-size="34" fill="${tokens.muted}">${subtitle}</text>
  <rect x="132" y="430" width="260" height="4" rx="2" fill="url(#line)"/>
  <text x="132" y="492" font-family="Inter, Arial, sans-serif" font-size="28" fill="${tokens.text}">${name}</text>
</svg>`;
}

function createStarSvg(): string {
  const stars = [
    [104, 96, 2],
    [286, 104, 1.5],
    [502, 78, 2],
    [782, 122, 1.5],
    [1016, 282, 2],
    [954, 502, 1.5],
    [694, 548, 2],
    [414, 512, 1.5],
    [186, 418, 2],
  ];

  return stars
    .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="0.72"/>`)
    .join('');
}

function createVCard(siteConfig: ReturnType<typeof normalizeStarryBioConfig>): string {
  const card = siteConfig.contactCard;
  if (!card?.enabled) return '';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(card.name || siteConfig.profile.name)}`,
  ];

  if (card.organization) lines.push(`ORG:${escapeVCard(card.organization)}`);
  if (card.title) lines.push(`TITLE:${escapeVCard(card.title)}`);
  if (card.email) lines.push(`EMAIL:${escapeVCard(cleanEmail(card.email))}`);
  if (card.phone) lines.push(`TEL:${escapeVCard(card.phone)}`);
  if (card.website) lines.push(`URL:${escapeVCard(card.website)}`);
  lines.push('END:VCARD', '');

  return lines.join('\r\n');
}

function cleanEmail(email: string): string {
  return email.startsWith('mailto:') ? email.slice('mailto:'.length) : email;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
