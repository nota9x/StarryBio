import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import config from '../config/starrybio.config';
import {
  collectSimpleIconSpecs,
  getSimpleIconFilename,
  SIMPLE_ICON_OUTPUT_PREFIX,
} from '../src/config/icons';
import { normalizeStarryBioConfig, validateStarryBioConfig } from '../src/config/schema';

const OUTPUT_DIR = path.resolve('public/assets/icons/simple-icons');
const CDN_BASE_URL = 'https://cdn.simpleicons.org';

async function main() {
  const validatedConfig = normalizeStarryBioConfig(validateStarryBioConfig(config));
  const iconSpecs = collectSimpleIconSpecs(validatedConfig);

  if (iconSpecs.length === 0) {
    console.log('✓ Fetched Simple Icons (none configured)');
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
    console.log(`[simple-icons] ${spec.brand} -> ${SIMPLE_ICON_OUTPUT_PREFIX}/${filename}`);
  }

  console.log(`✓ Fetched Simple Icons (${downloadedCount} icon(s))`);
}

function getSimpleIconCdnUrl(spec: {
  slug: string;
  color: string;
  darkColor: string;
  viewbox: string;
  size: string;
}): string {
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

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
