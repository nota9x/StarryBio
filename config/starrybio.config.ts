import type { StarryBioConfig } from '../src/config/schema';

// This is the only file most StarryBio users need to edit. See README.md for
// every option, provider example, and the v2-to-v3 migration table.
const config = {
  pageTitle: 'StarryBio — your corner of the internet',
  favicon: 'assets/images/favicon.svg',

  theme: {
    preset: 'midnight',
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
    name: 'StarryBio',
    description: 'A beautiful, self-hosted link-in-bio for the things you make.',
    image: 'assets/images/profile.svg',
    layout: 'vertical',
  },

  featured: [
    {
      title: 'Make your link-in-bio unmistakably yours',
      description:
        'Launch a fast, animated home for your links with themes, status, QR sharing, and no platform lock-in.',
      url: 'https://github.com/nota9x/StarryBio',
      image: 'assets/images/profile.svg',
      badge: 'Open source · Astro',
      icon: { simpleIcon: 'GitHub' },
    },
  ],

  sections: [
    {
      title: 'Explore StarryBio',
      description: 'Start with the source or copy our Discord handle to say hello.',
      links: [
        {
          label: 'View the project on GitHub',
          subtitle: 'Source, setup, and customization guides',
          url: 'https://github.com/nota9x/StarryBio',
          icon: { simpleIcon: 'GitHub' },
        },
        {
          label: 'Discord',
          subtitle: 'Copy @nota9x to clipboard',
          specialType: 'copy',
          copyValue: '@nota9x',
          icon: { simpleIcon: 'Discord' },
        },
      ],
    },
  ],

  status: {
    enabled: true,
    ownerTimeZone: 'America/New_York',
    showOwnerTime: true,
    showVisitorTime: false,
    showNextAvailable: true,
    responseText: 'Usually replies within a few hours',
    default: {
      text: 'Offline',
      color: '#6B7280',
      icon: 'assets/images/offline.svg',
    },
    types: {
      available: {
        text: 'Available',
        color: '#10B981',
        icon: 'assets/images/online.svg',
        message: 'Online and ready to chat!',
      },
      busy: {
        text: 'Busy / School',
        color: '#EF4444',
        icon: 'assets/images/dnd.svg',
        message: 'Focused on work. Replies slow.',
      },
      sleeping: {
        text: 'Sleeping',
        color: '#6d7684',
        icon: 'assets/images/idle.svg',
        message: 'Dreaming of electric sheep.',
      },
    },
    // Schedule days and times are evaluated in each visitor's local timezone.
    schedule: [
      { status: 'sleeping', days: 'daily', start: '05:00', end: '13:00' },
      { status: 'busy', days: 'weekdays', start: '13:00', end: '21:00' },
      { status: 'available', days: 'weekdays', start: '21:00', end: '05:00' },
      { status: 'available', days: 'weekends', start: '13:00', end: '05:00' },
    ],
  },

  announcement: {
    enabled: true,
    text: 'StarryBio is open source and ready to become yours.',
    url: 'https://github.com/nota9x/StarryBio',
  },

  seo: {
    title: 'StarryBio — your corner of the internet',
    description: 'An open-source, animated link-in-bio built for creators who want full control.',
    image: '/assets/images/profile.svg',
    canonicalUrl: 'https://a9x.pro',
    themeColor: '#7ddf9b',
  },

  ogImage: {
    enabled: false,
    output: 'public/og.png',
    title: 'StarryBio',
    subtitle: 'Your corner of the internet.',
  },

  qr: {
    enabled: true,
    showButton: true,
    url: 'https://a9x.pro',
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
