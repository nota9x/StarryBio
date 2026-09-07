import { describe, expect, it } from 'vitest';
import { parseArguments } from '../../scripts/update-repository';
import { releaseVersion, stablePublishedReleases } from '../../scripts/updater/github';
import type { GitHubRelease } from '../../scripts/updater/types';

function release(tag: string, overrides: Partial<GitHubRelease> = {}): GitHubRelease {
  return {
    assets: [],
    draft: false,
    id: tag.length,
    immutable: true,
    prerelease: false,
    published_at: '2026-01-01T00:00:00Z',
    tag_name: tag,
    ...overrides,
  };
}

describe('release-only updater selection', () => {
  it('uses semantic-version precedence, including major releases', () => {
    const selected = stablePublishedReleases([
      release('v10.0.0'),
      release('v3.10.0'),
      release('v3.9.9'),
      release('v4.0.0'),
    ]);
    expect(selected.map(releaseVersion)).toEqual(['3.9.9', '3.10.0', '4.0.0', '10.0.0']);
  });

  it('ignores drafts, prereleases, and invalid tags', () => {
    const selected = stablePublishedReleases([
      release('not-a-version'),
      release('v3.6.0', { draft: true }),
      release('v3.7.0-beta.1'),
      release('v3.8.0', { prerelease: true }),
      release('v3.5.1'),
    ]);
    expect(selected.map(releaseVersion)).toEqual(['3.5.1']);
  });

  it('cannot react to commits or bare tags because selection accepts releases only', () => {
    expect(stablePublishedReleases([release('v3.5.0')]).map(releaseVersion)).toEqual(['3.5.0']);
  });
});

describe('updater CLI', () => {
  it('supports the documented modes', () => {
    expect(parseArguments(['--check'])).toMatchObject({ check: true });
    expect(parseArguments(['--dry-run', '--yes'])).toMatchObject({ dryRun: true, yes: true });
    expect(parseArguments(['--help'])).toMatchObject({ help: true });
  });

  it('rejects obsolete Git options and incompatible modes', () => {
    expect(() => parseArguments(['--remote', 'origin'])).toThrow('Unknown option');
    expect(() => parseArguments(['--check', '--dry-run'])).toThrow('cannot be combined');
  });
});
