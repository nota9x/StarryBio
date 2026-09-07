import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import starterConfig from '../../config/starrybio.config';

describe('StarryBio starter artwork', () => {
  it('ships compact and accessible managed status SVGs', async () => {
    const imageDirectory = path.resolve('public/assets/images/default');
    for (const filename of ['online.svg', 'idle.svg', 'dnd.svg', 'offline.svg']) {
      const svg = await readFile(path.join(imageDirectory, filename), 'utf8');
      expect(svg).toContain('viewBox="0 0 32 32"');
      expect(svg).toContain('<title');
      expect(svg).toContain('<desc');
      expect(svg).not.toContain('<image');
      expect(Buffer.byteLength(svg)).toBeLessThan(4_096);
      await expect(
        readFile(path.join(imageDirectory, filename.replace('.svg', '.webp')))
      ).rejects.toThrow();
    }
  });

  it('maps the starter statuses to the managed default artwork family', () => {
    expect([
      starterConfig.status.default.icon,
      starterConfig.status.types.available.icon,
      starterConfig.status.types.busy.icon,
      starterConfig.status.types.sleeping.icon,
    ]).toEqual([
      'assets/images/default/offline.svg',
      'assets/images/default/online.svg',
      'assets/images/default/dnd.svg',
      'assets/images/default/idle.svg',
    ]);
  });
});
