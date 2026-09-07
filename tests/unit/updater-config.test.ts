import { describe, expect, it } from 'vitest';
import { migrateConfig } from '../../scripts/updater/config-migration';

const wrap = (body: string) => `const config = {\n${body}};\nexport default config;\n`;

describe('structural config migration', () => {
  it('inserts new defaults with comments/order and preserves existing values', () => {
    const base = wrap(`  theme: 'dark',\n  nested: {\n    old: true,\n  },\n`);
    const local = wrap(`  custom: 42,\n  theme: 'light',\n  nested: {\n    old: false,\n  },\n`);
    const incoming = wrap(
      `  theme: 'auto',\n  // Explains the new option.\n  motion: 'normal',\n  nested: {\n    old: true,\n    child: 'new',\n  },\n`
    );
    const result = migrateConfig(base, local, incoming);
    expect(result.contents).toContain("theme: 'light'");
    expect(result.contents).toContain('custom: 42');
    expect(result.contents).toContain('// Explains the new option.');
    expect(result.contents).toContain("motion: 'normal'");
    expect(result.contents).toContain("child: 'new'");
    expect(result.contents).toContain('old: false');
    expect(result.added).toEqual(['nested.child', 'motion']);
  });

  it('removes formerly managed options but keeps local-only entries', () => {
    const result = migrateConfig(
      wrap(`  removed: true,\n  kept: 1,\n`),
      wrap(`  removed: false,\n  kept: 9,\n  custom: 'yes',\n`),
      wrap(`  kept: 2,\n`)
    );
    expect(result.contents).not.toContain('removed:');
    expect(result.contents).toContain('kept: 9');
    expect(result.contents).toContain("custom: 'yes'");
    expect(result.removed).toEqual(['removed']);
  });

  it('keeps the declared order when several new options share an insertion point', () => {
    const result = migrateConfig(
      wrap(`  existing: true,\n`),
      wrap(`  existing: false,\n`),
      wrap(`  existing: true,\n  first: 1,\n  second: 2,\n`)
    );
    expect(result.contents.indexOf('first: 1')).toBeLessThan(result.contents.indexOf('second: 2'));
  });

  it('preserves a user value even when it still equals the old default', () => {
    const result = migrateConfig(
      wrap(`  theme: 'dark',\n`),
      wrap(`  theme: 'dark',\n`),
      wrap(`  theme: 'auto',\n`)
    );
    expect(result.contents).toContain("theme: 'dark'");
    expect(result.contents).not.toContain("theme: 'auto'");
  });

  it('preserves arrays and performs only explicitly authorized asset rewrites', () => {
    const source = wrap(`  image: 'assets/images/profile.svg',\n  items: ['custom'],\n`);
    const result = migrateConfig(
      source,
      source,
      wrap(`  image: 'assets/images/default/profile.svg',\n  items: ['new-default'],\n`),
      new Map([['assets/images/profile.svg', 'assets/images/default/profile.svg']])
    );
    expect(result.contents).toContain("image: 'assets/images/default/profile.svg'");
    expect(result.contents).toContain("items: ['custom']");
  });

  it('fails closed when dynamic syntax makes a structural edit ambiguous', () => {
    expect(() =>
      migrateConfig(
        wrap('  old: true,\n'),
        wrap('  ...extras,\n  old: true,\n'),
        wrap('  added: true,\n')
      )
    ).toThrow('dynamic syntax');
  });
});
