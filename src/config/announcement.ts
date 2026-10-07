import { createHash } from 'node:crypto';
import type { StarryBioConfig } from './schema';

export function getAnnouncementKey(
  announcement: StarryBioConfig['announcement'] | undefined
): string | undefined {
  if (!announcement?.enabled || !announcement.text) return undefined;
  return createHash('sha256')
    .update(`${announcement.text}|${announcement.url || ''}`)
    .digest('hex')
    .slice(0, 12);
}
