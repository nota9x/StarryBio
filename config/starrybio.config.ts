import type { StarryBioConfig } from '../src/config/schema';

const config = {
  pageTitle: 'StarryBio v3.0',
  favicon: 'assets/images/favicon.svg',

  theme: {
    preset: 'aurora',
    accent: '#a78bfa',
    mode: 'dark',
    buttonStyle: 'glass',
    background: 'starfield',
    animationIntensity: 'normal',
  },

  layout: {
    mode: 'centered',
    linkStyle: 'cards',
    profilePosition: 'top',
    featuredPosition: 'above-links',
  },

  animation: {
    starMultiplier: 1,
    shootingStarMultiplier: 1,
  },

  profile: {
    name: 'Astronaut',
    description: 'Exploring the Digital Universe',
    image: 'assets/images/profile.svg',
    layout: 'vertical',
  },

  featured: [
    {
      title: 'StarryBio',
      description: 'A self-hosted animated link-in-bio template for static-first sites.',
      url: 'https://github.com/nota9x/StarryBio',
      image: 'assets/images/profile.svg',
      badge: 'Open Source',
      icon: { simpleIcon: 'GitHub' },
    },
  ],

  sections: [
    {
      title: 'Socials',
      description: 'Find me around the web.',
      enabled: true,
      links: [
        {
          label: 'GitHub',
          subtitle: '@nota9x',
          url: 'https://github.com/nota9x',
          icon: { simpleIcon: 'GitHub' },
        },
        {
          label: 'Discord',
          subtitle: 'Join the server',
          url: 'https://discord.gg/example',
          icon: { simpleIcon: 'Discord' },
        },
        {
          label: 'Discord Name',
          subtitle: 'Copy: nota9x#0000',
          specialType: 'copy',
          copyValue: 'nota9x#0000',
          icon: { simpleIcon: 'Discord' },
        },
      ],
    },
  ],

  status: {
    enabled: true,
    ownerTimeZone: 'America/New_York',
    showLocalTime: true,
    showVisitorTime: true,
    showNextAvailable: true,
    responseText: 'Usually replies within a few hours',
    default: {
      text: 'Offline',
      color: '#6B7280',
      icon: 'M20 12h-2v2h2v-2zm-4 0h-2v2h2v-2zm-4 0H8v2h4v-2zm-4 0H4v2h4v-2z',
    },
    types: {
      available: {
        text: 'Available',
        color: '#10B981',
        icon: 'assets/images/online.webp',
        message: 'Online and ready to chat!',
      },
      busy: {
        text: 'Busy / School',
        color: '#EF4444',
        icon: 'assets/images/dnd.webp',
        message: 'Focused on work. Replies slow.',
      },
      sleeping: {
        text: 'Sleeping',
        color: '#6d7684',
        icon: 'assets/images/idle.webp',
        message: 'Dreaming of electric sheep.',
      },
    },
    schedule: [
      { status: 'sleeping', days: 'daily', start: '05:00', end: '13:00' },
      { status: 'busy', days: 'weekdays', start: '13:00', end: '21:00' },
      { status: 'available', days: 'weekdays', start: '21:00', end: '05:00' },
      { status: 'available', days: 'weekends', start: '13:00', end: '05:00' },
    ],
  },

  announcement: {
    enabled: true,
    text: 'Welcome to v3.0!',
    url: '#',
  },

  seo: {
    title: 'StarryBio v3.0',
    description: 'A premium animated link-in-bio template for builders and creators.',
    image: '/assets/images/profile.svg',
    canonicalUrl: 'https://a9x.pro',
    themeColor: '#a78bfa',
  },

  ogImage: {
    enabled: false,
    output: 'public/og.png',
    title: 'StarryBio v3.0',
    subtitle: 'A premium animated link-in-bio template.',
  },

  qr: {
    enabled: true,
    output: 'public/qr.png',
  },

  analytics: {
    provider: 'none',
  },

  contactCard: {
    enabled: false,
    output: 'public/contact.vcf',
    name: 'Astronaut',
    website: 'https://a9x.pro',
  },

  footer: {
    copyright: '© {year} a9x Development',
  },
} satisfies StarryBioConfig;

export default config;
