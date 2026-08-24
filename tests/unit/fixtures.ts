import type { StarryBioConfig } from '../../src/config/schema';

export function createConfig(overrides: Record<string, unknown> = {}): StarryBioConfig {
  return {
    pageTitle: 'Test profile',
    profile: {
      name: 'Test User',
      description: 'A test profile',
      image: '/assets/images/profile.svg',
    },
    sections: [
      {
        title: 'Links',
        links: [{ label: 'Home', url: '/' }],
      },
    ],
    ...overrides,
  } as StarryBioConfig;
}

export function createStatus() {
  return {
    enabled: true,
    default: { text: 'Offline', color: '#6B7280' },
    types: {
      available: { text: 'Available', color: '#10B981' },
      busy: { text: 'Busy', color: '#EF4444' },
    },
    schedule: [{ status: 'available', days: 'weekdays', start: '09:00', end: '17:00' }],
  } as const;
}
