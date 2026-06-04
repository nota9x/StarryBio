import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const SITE_DIR = path.resolve('src/site');
const CONFIG_PATH = path.join(SITE_DIR, 'config.js');
const OUTPUT_DIR = path.join(SITE_DIR, 'assets/icons/simple-icons');
const OUTPUT_URL_PREFIX = 'assets/icons/simple-icons';
const CDN_BASE_URL = 'https://cdn.simpleicons.org';
const DEFAULT_SIMPLE_ICON_COLOR = 'fff';

async function main() {
  const config = await loadConfig();
  const iconSpecs = collectSimpleIconSpecs(config);

  if (iconSpecs.length === 0) {
    console.log('[simple-icons] No Simple Icons found in config.');
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  let downloadedCount = 0;
  for (const spec of iconSpecs) {
    const filename = getSimpleIconFilename(spec);
    const outputPath = path.join(OUTPUT_DIR, filename);
    const cdnUrl = getSimpleIconCdnUrl(spec);

    const response = await fetch(cdnUrl);
    if (!response.ok) {
      throw new Error(
        `[simple-icons] Failed to fetch "${spec.brand}" from ${cdnUrl}: ${response.status} ${response.statusText}`
      );
    }

    const svg = await response.text();
    if (!svg.trimStart().startsWith('<svg')) {
      throw new Error(`[simple-icons] CDN response for "${spec.brand}" did not look like SVG.`);
    }

    await writeFile(outputPath, svg);
    downloadedCount += 1;
    console.log(`[simple-icons] ${spec.brand} -> ${OUTPUT_URL_PREFIX}/${filename}`);
  }

  console.log(`[simple-icons] Downloaded ${downloadedCount} icon(s).`);
}

async function loadConfig() {
  const source = await readFile(CONFIG_PATH, 'utf8');
  const context = vm.createContext({});
  const script = new vm.Script(`${source}\n;globalThis.__STARRYBIO_CONFIG__ = CONFIG;`, {
    filename: CONFIG_PATH,
  });

  script.runInContext(context);
  return context.__STARRYBIO_CONFIG__;
}

function collectSimpleIconSpecs(value, collected = new Map()) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectSimpleIconSpecs(item, collected);
    }
    return Array.from(collected.values());
  }

  if (!value || typeof value !== 'object') {
    return Array.from(collected.values());
  }

  if (Object.prototype.hasOwnProperty.call(value, 'icon')) {
    const spec = normalizeSimpleIconSpec(value.icon);
    if (spec) {
      collected.set(getSimpleIconFilename(spec), spec);
    }
  }

  for (const item of Object.values(value)) {
    collectSimpleIconSpecs(item, collected);
  }

  return Array.from(collected.values());
}

function normalizeSimpleIconSpec(iconConfig) {
  if (!iconConfig || typeof iconConfig !== 'object' || Array.isArray(iconConfig)) {
    return null;
  }

  const brand = getString(iconConfig.simpleIcon) || getString(iconConfig.brand);
  const slug = getString(iconConfig.slug) || (brand ? brandNameToSimpleIconSlug(brand) : '');

  if (!brand && !slug) {
    return null;
  }

  return {
    brand: brand || slug,
    slug,
    color: normalizeColor(iconConfig.color) || DEFAULT_SIMPLE_ICON_COLOR,
    darkColor: normalizeColor(iconConfig.darkColor),
    viewbox: getString(iconConfig.viewbox),
    size: getString(iconConfig.size),
  };
}

function getSimpleIconCdnUrl(spec) {
  const segments = [CDN_BASE_URL, encodeURIComponent(spec.slug)];

  if (spec.color || spec.darkColor) {
    segments.push(encodeURIComponent(spec.color || '_'));
  }

  if (spec.darkColor) {
    segments.push(encodeURIComponent(spec.darkColor));
  }

  const url = new URL(segments.join('/'));

  if (spec.viewbox) {
    url.searchParams.set('viewbox', spec.viewbox);
  }

  if (spec.size) {
    url.searchParams.set('size', spec.size);
  }

  return url.toString();
}

function getSimpleIconFilename(spec) {
  const parts = [spec.slug];

  if (spec.color) parts.push(spec.color);
  if (spec.darkColor) parts.push(spec.darkColor);
  if (spec.viewbox) parts.push(`viewbox-${spec.viewbox}`);
  if (spec.size) parts.push(`size-${spec.size}`);

  return `${parts.map(sanitizeFilenamePart).join('--')}.svg`;
}

function brandNameToSimpleIconSlug(brandName) {
  return brandName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/đ/g, 'd')
    .replace(/ħ/g, 'h')
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/\./g, 'dot')
    .replace(/&/g, 'and')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]/g, '');
}

function normalizeColor(color) {
  const value = getString(color);
  if (!value) return '';

  return value.startsWith('#') ? value.slice(1) : value;
}

function getString(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

function sanitizeFilenamePart(value) {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
