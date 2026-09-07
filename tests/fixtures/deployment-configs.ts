import type { StarryBioConfig } from '../../src/config/schema';

export const minimalDeploymentConfig = {
  pageTitle: 'Quiet profile',
  theme: {
    preset: 'minimal',
    background: 'minimal',
    animationIntensity: 'none',
  },
  profile: {
    name: 'River Example',
    description: 'A deliberately small downstream profile.',
    image: 'assets/images/default/profile.svg',
  },
  sections: [
    {
      title: 'Elsewhere',
      links: [{ label: 'Local notes', url: '/notes' }],
    },
  ],
} satisfies StarryBioConfig;

export const customizedDeploymentConfig = {
  pageTitle: 'Ada’s orbital workshop',
  favicon: 'assets/images/default/favicon.svg',
  theme: {
    preset: 'aurora',
    accent: '#22C55E',
    buttonStyle: 'outline',
    background: 'gradient',
    animationIntensity: 'subtle',
  },
  layout: {
    mode: 'portfolio',
    linkStyle: 'buttons',
    profilePosition: 'top',
    featuredPosition: 'below-links',
  },
  profile: {
    name: 'Ada Orbit',
    description: 'Robotics, field notes, and deliberately non-demo content.',
    image: 'assets/images/default/profile.svg',
    layout: 'horizontal',
  },
  featured: [
    {
      title: 'Latest field note',
      description: 'A representative customized featured card.',
      url: 'https://example.test/field-notes',
      badge: 'New',
    },
  ],
  sections: [
    {
      title: 'Custom destinations',
      links: [
        { label: 'Mission log', url: 'https://example.test/log' },
        {
          label: 'Copy radio call sign',
          specialType: 'copy',
          copyValue: 'ORBIT-73',
          subtitle: 'Copy custom value',
        },
      ],
    },
  ],
  status: {
    enabled: true,
    ownerTimeZone: 'Pacific/Auckland',
    showOwnerTime: true,
    showVisitorTime: true,
    showNextAvailable: true,
    responseText: 'Replies after landing',
    default: {
      text: 'Beyond radio range',
      color: '#64748B',
      icon: 'assets/images/default/idle.svg',
    },
    types: {
      transmitting: {
        text: 'Transmitting live',
        color: '#22C55E',
        icon: 'assets/images/default/online.svg',
        message: 'Radio channel is open.',
      },
      surveying: {
        text: 'Surveying',
        color: '#F97316',
        icon: 'assets/images/default/dnd.svg',
      },
    },
    schedule: [
      { status: 'transmitting', days: 'weekdays', start: '07:30', end: '11:45' },
      { status: 'surveying', days: 'daily', start: '11:45', end: '19:15' },
    ],
  },
  announcement: {
    enabled: true,
    text: 'Custom transmission scheduled this week.',
    url: '/transmission',
  },
  seo: {
    title: 'Ada Orbit — workshop',
    description: 'A substantially customized StarryBio deployment fixture.',
    canonicalUrl: 'https://profiles.example.test/people/ada/',
    themeColor: '#22C55E',
  },
  ogImage: {
    enabled: true,
    output: 'public/generated/social/ada-card.svg',
    title: 'Ada Orbit',
    subtitle: 'Field notes from orbit',
  },
  qr: {
    enabled: true,
    showButton: true,
    url: 'https://profiles.example.test/people/ada/',
    output: 'public/generated/share/ada-qr.svg',
  },
  analytics: { provider: 'none' },
  contactCard: {
    enabled: true,
    output: 'public/generated/contact/ada.vcf',
    name: 'Ada Orbit',
    email: 'ada@example.test',
    website: 'https://profiles.example.test/people/ada/',
  },
  footer: { copyright: '© {year} Ada Orbit' },
} satisfies StarryBioConfig;
