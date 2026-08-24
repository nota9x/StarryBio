import { existsSync } from 'node:fs';
import path from 'node:path';
import type { IconConfig, StarryBioConfig } from '../src/config/schema';

export function validateLocalAssetPaths(config: StarryBioConfig): string[] {
  const issues: string[] = [];
  const paths = collectLocalAssetPaths(config);

  for (const item of paths) {
    const publicPath = toPublicPath(item.value);
    if (!publicPath) continue;

    if (!isInsideDirectory(publicPath, path.resolve('public'))) {
      issues.push(`${item.path} must stay inside public/.`);
      continue;
    }

    if (!existsSync(publicPath)) {
      issues.push(
        `${item.path} points to "${item.value}", but ${path.relative(process.cwd(), publicPath)} does not exist.`
      );
    }
  }

  return issues;
}

export function resolveOutputPath(output: string | undefined, fallback: string): string {
  const value = output || fallback;
  const normalized = path.normalize(value);
  const absolute = path.resolve(normalized);
  const publicRoot = path.resolve('public');

  if (!absolute.startsWith(publicRoot + path.sep) && absolute !== publicRoot) {
    throw new Error(`Output path "${value}" must stay inside public/.`);
  }

  return absolute;
}

function collectLocalAssetPaths(config: StarryBioConfig): Array<{ path: string; value: string }> {
  const paths: Array<{ path: string; value: string }> = [];

  addAsset(paths, 'favicon', config.favicon);
  addAsset(paths, 'profile.image', config.profile.image);
  addAsset(paths, 'seo.image', config.seo?.image);

  config.sections?.forEach((section, sectionIndex) => {
    section.links.forEach((link, linkIndex) =>
      collectIcon(paths, `sections[${sectionIndex}].links[${linkIndex}].icon`, link.icon)
    );
  });
  config.featured?.forEach((card, index) => {
    addAsset(paths, `featured[${index}].image`, card.image);
    collectIcon(paths, `featured[${index}].icon`, card.icon);
  });

  if (config.status) {
    collectIcon(paths, 'status.default.icon', config.status.default.icon);
    for (const [name, status] of Object.entries(config.status.types)) {
      collectIcon(paths, `status.types.${name}.icon`, status.icon);
    }
  }

  return paths;
}

function collectIcon(
  paths: Array<{ path: string; value: string }>,
  configPath: string,
  icon: IconConfig | undefined
): void {
  if (typeof icon !== 'string') return;
  addAsset(paths, configPath, icon);
}

function addAsset(
  paths: Array<{ path: string; value: string }>,
  configPath: string,
  value: string | undefined
): void {
  if (!value || !isLocalAssetPath(value)) return;
  paths.push({ path: configPath, value });
}

function isLocalAssetPath(value: string): boolean {
  if (value.startsWith('data:')) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
  if (value.trim().toUpperCase().startsWith('M')) return false;
  if (value.trim().startsWith('<path')) return false;
  return true;
}

function toPublicPath(value: string): string {
  const clean = value.startsWith('/') ? value.slice(1) : value;
  return path.resolve('public', clean);
}

function isInsideDirectory(candidate: string, directory: string): boolean {
  const relative = path.relative(directory, candidate);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
  );
}
