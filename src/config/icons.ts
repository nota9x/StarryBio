import type { IconConfig, SimpleIconConfig } from './schema';

export interface SimpleIconSpec {
  brand: string;
  slug: string;
  color: string;
  darkColor: string;
  viewbox: string;
  size: string;
}

export const DEFAULT_SIMPLE_ICON_COLOR = 'fff';
export const SIMPLE_ICON_OUTPUT_PREFIX = 'assets/icons/simple-icons';

export function collectSimpleIconSpecs(
  value: unknown,
  collected = new Map<string, SimpleIconSpec>()
) {
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
    const spec = normalizeSimpleIconSpec((value as { icon?: IconConfig }).icon);
    if (spec) {
      collected.set(getSimpleIconFilename(spec), spec);
    }
  }

  for (const item of Object.values(value)) {
    collectSimpleIconSpecs(item, collected);
  }

  return Array.from(collected.values());
}

export function resolveIconSource(iconConfig: IconConfig | undefined): string {
  if (!iconConfig) return '';

  if (typeof iconConfig === 'string') {
    return iconConfig;
  }

  const simpleIconPath = getSimpleIconAssetPath(iconConfig);
  return simpleIconPath || '';
}

export function getSimpleIconAssetPath(iconConfig: SimpleIconConfig): string {
  const spec = normalizeSimpleIconSpec(iconConfig);
  if (!spec) return '';

  return `${SIMPLE_ICON_OUTPUT_PREFIX}/${getSimpleIconFilename(spec)}`;
}

export function normalizeSimpleIconSpec(iconConfig: IconConfig | undefined): SimpleIconSpec | null {
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

export function getSimpleIconFilename(spec: SimpleIconSpec): string {
  const parts = [spec.slug];

  if (spec.color) parts.push(spec.color);
  if (spec.darkColor) parts.push(spec.darkColor);
  if (spec.viewbox) parts.push(`viewbox-${spec.viewbox}`);
  if (spec.size) parts.push(`size-${spec.size}`);

  return `${parts.map(sanitizeFilenamePart).join('--')}.svg`;
}

export function getSvgPathData(icon: string): string {
  const trimmedIcon = icon.trim();

  if (trimmedIcon.toUpperCase().startsWith('M')) {
    return trimmedIcon;
  }

  if (trimmedIcon.startsWith('<path')) {
    const match = trimmedIcon.match(/\sd=(["'])(.*?)\1/i);
    return match ? match[2] : '';
  }

  return '';
}

export function brandNameToSimpleIconSlug(brandName: string): string {
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

function normalizeColor(color: unknown): string {
  const value = getString(color);
  if (!value) return '';

  return value.startsWith('#') ? value.slice(1) : value;
}

function getString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

function sanitizeFilenamePart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}
