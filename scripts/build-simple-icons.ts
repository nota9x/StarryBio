import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import config from '../config/starrybio.config';
import {
  collectSimpleIconSpecs,
  getSimpleIconFilename,
  getSvgPathData,
  SIMPLE_ICON_OUTPUT_PREFIX,
  type SimpleIconSpec,
} from '../src/config/icons';
import { normalizeStarryBioConfig, validateStarryBioConfig } from '../src/config/schema';

const OUTPUT_DIR = path.resolve('public/assets/icons/simple-icons');
const require = createRequire(import.meta.url);

export async function buildSimpleIcons(value: unknown): Promise<number> {
  const iconSpecs = collectSimpleIconSpecs(value);
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  if (iconSpecs.length === 0) {
    console.log('✓ Generated Simple Icons (none configured)');
    return 0;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  for (const spec of iconSpecs) {
    const filename = getSimpleIconFilename(spec);
    const outputPath = path.join(OUTPUT_DIR, filename);
    await writeFile(outputPath, await createSimpleIconSvg(spec));
    console.log(`[simple-icons] ${spec.brand} -> ${SIMPLE_ICON_OUTPUT_PREFIX}/${filename}`);
  }

  console.log(`✓ Generated Simple Icons (${iconSpecs.length} icon(s))`);
  return iconSpecs.length;
}

export async function createSimpleIconSvg(spec: SimpleIconSpec): Promise<string> {
  let sourcePath: string;
  try {
    sourcePath = require.resolve(`simple-icons/icons/${spec.slug}.svg`);
  } catch {
    throw new Error(
      `[simple-icons] Unknown icon "${spec.brand}". Set icon.slug to a valid Simple Icons slug.`
    );
  }

  const source = await readFile(sourcePath, 'utf8');
  const pathData = getSvgPathData(source);
  if (!pathData) {
    throw new Error(`[simple-icons] Icon "${spec.brand}" did not contain SVG path data.`);
  }

  const viewBox = normalizeViewBox(spec.viewbox);
  const sizeAttributes = spec.size
    ? ` width="${escapeXml(spec.size)}" height="${escapeXml(spec.size)}"`
    : '';
  const darkStyle = spec.darkColor
    ? `<style>@media (prefers-color-scheme: dark){path{fill:#${escapeXml(spec.darkColor)}}}</style>`
    : '';

  return `<svg role="img" viewBox="${escapeXml(viewBox)}"${sizeAttributes} xmlns="http://www.w3.org/2000/svg"><title>${escapeXml(spec.brand)}</title>${darkStyle}<path fill="#${escapeXml(spec.color)}" d="${escapeXml(pathData)}"/></svg>`;
}

function normalizeViewBox(value: string): string {
  if (!value) return '0 0 24 24';
  return /^\d+(?:\.\d+)?$/.test(value) ? `0 0 ${value} ${value}` : value;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function main(): Promise<void> {
  const siteConfig = normalizeStarryBioConfig(validateStarryBioConfig(config));
  await buildSimpleIcons(siteConfig);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
