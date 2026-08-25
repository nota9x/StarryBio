import { z } from 'zod';

const THEME_PRESETS = [
  'nebula',
  'midnight',
  'classic-blue',
  'aurora',
  'eclipse',
  'cosmic-gold',
  'minimal',
  'terminal',
] as const;
const THEME_MODES = ['dark', 'light'] as const;
const BUTTON_STYLES = ['glass', 'solid', 'outline', 'minimal', 'terminal'] as const;
const THEME_BACKGROUNDS = ['starfield', 'gradient', 'minimal'] as const;
const ANIMATION_INTENSITIES = ['none', 'subtle', 'normal', 'high'] as const;
const LAYOUT_MODES = [
  'centered',
  'split-screen',
  'profile-card',
  'compact',
  'creator-grid',
  'portfolio',
  'terminal',
] as const;
const LINK_STYLES = ['cards', 'buttons', 'minimal', 'terminal'] as const;
const PROFILE_POSITIONS = ['top', 'left'] as const;
const FEATURED_POSITIONS = ['above-links', 'below-links'] as const;
const PROFILE_LAYOUTS = ['vertical', 'horizontal'] as const;
const SCHEDULE_DAYS = ['daily', 'weekdays', 'weekends'] as const;
const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const GA_MEASUREMENT_ID_RE = /^G-[A-Z0-9]+$/;
const ANALYTICS_ID_RE = /^[A-Za-z0-9_-]+$/;
const DATA_ATTRIBUTE_RE = /^[a-z][a-z0-9-]*$/;
const RESERVED_CUSTOM_DATA_ATTRIBUTES = new Set([
  'starrybio-provider',
  'measurement-id',
  'send-page-view',
  'config',
]);

const nonEmptyString = z.string().trim().min(1, 'must be a non-empty string');
const hexColor = z.string().regex(HEX_COLOR_RE, 'must be a hex color such as "#10B981"');
const time = z.string().regex(TIME_RE, 'must use 24-hour HH:MM format');
const isoDate = z.string().refine(isIsoDate, 'must be a valid ISO date with a time component');
const assetUrl = nonEmptyString.refine(
  isSupportedAssetUrl,
  'must be an HTTP(S) URL or a safe path within public/'
);
const publicOutput = (extensions: readonly string[]) =>
  nonEmptyString.refine(
    (value) => isSafePublicOutput(value, extensions),
    `must stay inside public/ and end with ${extensions.join(' or ')}`
  );

const simpleIconSchema = z
  .object({
    simpleIcon: nonEmptyString.optional(),
    brand: nonEmptyString.optional(),
    slug: nonEmptyString.regex(/^[a-z0-9]+$/, 'must be a lowercase Simple Icons slug').optional(),
    color: z.union([z.string(), z.number()]).optional(),
    darkColor: z.union([z.string(), z.number()]).optional(),
    viewbox: z.union([z.string(), z.number()]).optional(),
    size: z.union([z.string(), z.number()]).optional(),
  })
  .strict()
  .refine((value) => value.simpleIcon || value.brand || value.slug, {
    message: 'must include simpleIcon, brand, or slug',
  });

const iconSchema = z.union([nonEmptyString, simpleIconSchema]);

const visibilityFields = {
  enabled: z.boolean().optional(),
  visibleFrom: isoDate.optional(),
  visibleUntil: isoDate.optional(),
};

const linkSchema = z
  .object({
    ...visibilityFields,
    label: nonEmptyString,
    subtitle: z.string().optional(),
    description: z.string().optional(),
    url: supportedUrl({ allowHash: true }).optional(),
    icon: iconSchema.optional(),
    specialType: z.literal('copy').optional(),
    copyValue: nonEmptyString.optional(),
  })
  .strict()
  .superRefine((link, context) => {
    if (link.specialType === 'copy' && !link.copyValue) {
      context.addIssue({
        code: 'custom',
        path: ['copyValue'],
        message: 'is required for copy links',
      });
    }
    if (link.specialType !== 'copy' && !link.url) {
      context.addIssue({ code: 'custom', path: ['url'], message: 'is required for links' });
    }
    validateVisibilityWindow(link, context);
  });

const sectionSchema = z
  .object({
    ...visibilityFields,
    title: nonEmptyString,
    description: z.string().optional(),
    links: z.array(linkSchema),
  })
  .strict()
  .superRefine(validateVisibilityWindow);

const featuredCardSchema = z
  .object({
    ...visibilityFields,
    title: nonEmptyString,
    description: nonEmptyString,
    url: supportedUrl({ allowHash: false }),
    image: assetUrl.optional(),
    badge: z.string().optional(),
    icon: iconSchema.optional(),
  })
  .strict()
  .superRefine(validateVisibilityWindow);

const statusDefinitionSchema = z
  .object({
    text: nonEmptyString,
    color: hexColor,
    icon: iconSchema.optional(),
    message: z.string().optional(),
  })
  .strict();

const scheduleItemSchema = z
  .object({
    status: nonEmptyString,
    days: z.enum(SCHEDULE_DAYS),
    start: time,
    end: time,
  })
  .strict()
  .refine((item) => item.start !== item.end, {
    path: ['end'],
    message: 'must be different from start',
  });

const themeConfigSchema = z
  .object({
    preset: z.enum(THEME_PRESETS).optional(),
    accent: hexColor.optional(),
    mode: z.enum(THEME_MODES).optional(),
    buttonStyle: z.enum(BUTTON_STYLES).optional(),
    background: z.enum(THEME_BACKGROUNDS).optional(),
    animationIntensity: z.enum(ANIMATION_INTENSITIES).optional(),
  })
  .strict();

const layoutConfigSchema = z
  .object({
    mode: z.enum(LAYOUT_MODES).optional(),
    linkStyle: z.enum(LINK_STYLES).optional(),
    profilePosition: z.enum(PROFILE_POSITIONS).optional(),
    featuredPosition: z.enum(FEATURED_POSITIONS).optional(),
  })
  .strict();

const statusSchema = z
  .object({
    enabled: z.boolean(),
    ownerTimeZone: nonEmptyString.optional(),
    showOwnerTime: z.boolean().optional(),
    showVisitorTime: z.boolean().optional(),
    showNextAvailable: z.boolean().optional(),
    responseText: z.string().optional(),
    default: statusDefinitionSchema,
    types: z.record(nonEmptyString, statusDefinitionSchema),
    schedule: z.array(scheduleItemSchema),
  })
  .strict()
  .superRefine((status, context) => {
    if (status.showOwnerTime === true && !status.ownerTimeZone) {
      context.addIssue({
        code: 'custom',
        path: ['ownerTimeZone'],
        message: 'is required when showOwnerTime is true',
      });
    }
    if (status.ownerTimeZone && !isValidTimeZone(status.ownerTimeZone)) {
      context.addIssue({
        code: 'custom',
        path: ['ownerTimeZone'],
        message: 'must be a valid IANA timezone such as "America/New_York"',
      });
    }
    status.schedule.forEach((item, index) => {
      if (!status.types[item.status]) {
        context.addIssue({
          code: 'custom',
          path: ['schedule', index, 'status'],
          message: `must match a key in status.types`,
        });
      }
    });
  });

const analyticsValueSchema = z.union([z.string(), z.number(), z.boolean()]);
const analyticsId = nonEmptyString.regex(
  ANALYTICS_ID_RE,
  'must contain only letters, numbers, underscores, or hyphens'
);
const analyticsSchema = z.discriminatedUnion('provider', [
  z.object({ provider: z.literal('none') }).strict(),
  z.object({ provider: z.literal('cloudflare'), token: analyticsId }).strict(),
  z
    .object({
      provider: z.literal('google'),
      measurementId: z
        .string()
        .regex(GA_MEASUREMENT_ID_RE, 'must be a GA4 measurement ID such as "G-XXXXXXXXXX"'),
      scriptSrc: supportedUrl({ allowHash: false, protocols: ['https:'] }).optional(),
      sendPageView: z.boolean().optional(),
      config: z.record(z.string(), analyticsValueSchema).optional(),
    })
    .strict(),
  z
    .object({
      provider: z.literal('plausible'),
      domain: nonEmptyString.optional(),
      scriptSrc: supportedUrl({ allowHash: false, protocols: ['https:'] }).optional(),
    })
    .strict()
    .refine((value) => value.domain || value.scriptSrc, {
      path: ['scriptSrc'],
      message: 'must provide a current per-site script URL or a domain for the legacy script',
    }),
  z
    .object({
      provider: z.literal('umami'),
      websiteId: analyticsId,
      scriptSrc: supportedUrl({ allowHash: false, protocols: ['https:'] }),
    })
    .strict(),
  z
    .object({
      provider: z.literal('custom'),
      scriptSrc: supportedUrl({ allowHash: false, protocols: ['https:'] }),
      dataAttributes: z
        .record(
          z.string().regex(DATA_ATTRIBUTE_RE, 'must be a safe data attribute name'),
          z.string()
        )
        .optional(),
    })
    .strict()
    .superRefine((analytics, context) => {
      for (const key of Object.keys(analytics.dataAttributes || {})) {
        if (!RESERVED_CUSTOM_DATA_ATTRIBUTES.has(key)) continue;
        context.addIssue({
          code: 'custom',
          path: ['dataAttributes', key],
          message: 'must not override a reserved StarryBio analytics attribute',
        });
      }
    }),
]);

export const starryBioConfigSchema = z
  .object({
    pageTitle: nonEmptyString,
    favicon: assetUrl.optional(),
    theme: z.union([z.enum(THEME_PRESETS), themeConfigSchema]).optional(),
    layout: layoutConfigSchema.optional(),
    animation: z
      .object({
        starMultiplier: z.number().nonnegative().optional(),
        shootingStarMultiplier: z.number().nonnegative().optional(),
      })
      .strict()
      .optional(),
    profile: z
      .object({
        name: nonEmptyString,
        description: nonEmptyString,
        image: assetUrl,
        layout: z.enum(PROFILE_LAYOUTS).optional(),
      })
      .strict(),
    sections: z.array(sectionSchema),
    featured: z.array(featuredCardSchema).optional(),
    status: statusSchema.optional(),
    announcement: z
      .object({
        enabled: z.boolean(),
        text: nonEmptyString,
        url: supportedUrl({ allowHash: true }).optional(),
      })
      .strict()
      .optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        image: assetUrl.optional(),
        canonicalUrl: supportedUrl({ allowHash: false, protocols: ['http:', 'https:'] }).optional(),
        themeColor: hexColor.optional(),
      })
      .strict()
      .optional(),
    ogImage: z
      .object({
        enabled: z.boolean(),
        output: publicOutput(['.png', '.svg']).optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
      })
      .strict()
      .optional(),
    qr: z
      .object({
        enabled: z.boolean(),
        showButton: z.boolean().optional(),
        url: supportedUrl({ allowHash: false, protocols: ['http:', 'https:'] }).optional(),
        output: publicOutput(['.png', '.svg']).optional(),
      })
      .strict()
      .optional(),
    analytics: analyticsSchema.optional(),
    contactCard: z
      .object({
        enabled: z.boolean(),
        output: publicOutput(['.vcf']).optional(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        website: supportedUrl({ allowHash: false }).optional(),
        organization: z.string().optional(),
        title: z.string().optional(),
      })
      .strict()
      .superRefine((card, context) => {
        if (!card.enabled) return;
        if (!card.name?.trim()) {
          context.addIssue({ code: 'custom', path: ['name'], message: 'is required when enabled' });
        }
        if (![card.email, card.phone, card.website].some((value) => value?.trim())) {
          context.addIssue({
            code: 'custom',
            message: 'must include email, phone, or website when enabled',
          });
        }
      })
      .optional(),
    footer: z.object({ copyright: z.string().optional() }).strict().optional(),
  })
  .strict();

export type ThemePreset = (typeof THEME_PRESETS)[number];
export type ThemeMode = (typeof THEME_MODES)[number];
export type ButtonStyle = (typeof BUTTON_STYLES)[number];
export type ThemeBackground = (typeof THEME_BACKGROUNDS)[number];
export type AnimationIntensity = (typeof ANIMATION_INTENSITIES)[number];
export type LayoutMode = (typeof LAYOUT_MODES)[number];
export type LinkStyle = (typeof LINK_STYLES)[number];
export type ProfilePosition = (typeof PROFILE_POSITIONS)[number];
export type FeaturedPosition = (typeof FEATURED_POSITIONS)[number];
export type ProfileLayout = (typeof PROFILE_LAYOUTS)[number];
export type ScheduleDays = (typeof SCHEDULE_DAYS)[number];
export type LinkSpecialType = 'copy';
export type AnalyticsProvider = AnalyticsConfig['provider'];
export type SimpleIconConfig = z.infer<typeof simpleIconSchema>;
export type IconConfig = z.infer<typeof iconSchema>;
export type StarryBioLink = z.infer<typeof linkSchema>;
export type LinkSection = z.infer<typeof sectionSchema>;
export type FeaturedCard = z.infer<typeof featuredCardSchema>;
export type StatusDefinition = z.infer<typeof statusDefinitionSchema>;
export type ScheduleItem = z.infer<typeof scheduleItemSchema>;
export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type LayoutConfig = z.infer<typeof layoutConfigSchema>;
export type AnalyticsConfig = z.infer<typeof analyticsSchema>;
export type StarryBioConfig = z.infer<typeof starryBioConfigSchema>;
export type VisibilityConfig = Pick<StarryBioLink, 'enabled' | 'visibleFrom' | 'visibleUntil'>;

export interface NormalizedThemeConfig {
  preset: ThemePreset;
  accent: string;
  mode: ThemeMode;
  buttonStyle: ButtonStyle;
  background: ThemeBackground;
  animationIntensity: AnimationIntensity;
}

export interface NormalizedLayoutConfig {
  mode: LayoutMode;
  linkStyle: LinkStyle;
  profilePosition: ProfilePosition;
  featuredPosition: FeaturedPosition;
}

export interface NormalizedLink extends StarryBioLink {
  label: string;
}

export interface NormalizedSection {
  title: string;
  description?: string;
  links: NormalizedLink[];
}

export interface NormalizedSeoConfig {
  title: string;
  description: string;
  image?: string;
  canonicalUrl?: string;
  themeColor: string;
}

export type NormalizedStatusConfig = NonNullable<StarryBioConfig['status']> & {
  showOwnerTime: boolean;
  showVisitorTime: boolean;
  showNextAvailable: boolean;
};

export type NormalizedQrConfig = NonNullable<StarryBioConfig['qr']> & {
  showButton: boolean;
};

export interface NormalizedStarryBioConfig extends Omit<
  StarryBioConfig,
  'theme' | 'layout' | 'sections' | 'featured' | 'seo' | 'status' | 'qr'
> {
  theme: NormalizedThemeConfig;
  layout: NormalizedLayoutConfig;
  sections: NormalizedSection[];
  featured: FeaturedCard[];
  seo: NormalizedSeoConfig;
  status?: NormalizedStatusConfig;
  qr?: NormalizedQrConfig;
  analytics: AnalyticsConfig;
}

const DEFAULT_DARK_THEME_ACCENTS: Record<ThemePreset, string> = {
  nebula: '#d8b4fe',
  midnight: '#b0c4de',
  'classic-blue': '#b0c4de',
  aurora: '#7ddf9b',
  eclipse: '#f6c177',
  'cosmic-gold': '#f7d06b',
  minimal: '#b8c4d4',
  terminal: '#9cffac',
};

const DEFAULT_LIGHT_THEME_ACCENTS: Record<ThemePreset, string> = {
  nebula: '#6d28d9',
  midnight: '#3e6085',
  'classic-blue': '#285b9e',
  aurora: '#167346',
  eclipse: '#9a4d0a',
  'cosmic-gold': '#80600c',
  minimal: '#334155',
  terminal: '#147532',
};

export function getDefaultThemeAccent(preset: ThemePreset, mode: ThemeMode): string {
  return mode === 'light'
    ? DEFAULT_LIGHT_THEME_ACCENTS[preset]
    : DEFAULT_DARK_THEME_ACCENTS[preset];
}

export class StarryBioConfigError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid StarryBio config:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`);
    this.name = 'StarryBioConfigError';
  }
}

export function validateStarryBioConfig(value: unknown): StarryBioConfig {
  const result = starryBioConfigSchema.safeParse(value);
  if (!result.success) {
    throw new StarryBioConfigError(
      result.error.issues.map((issue) => {
        const path = issue.path.length ? issue.path.join('.') : 'config';
        return `${path} ${issue.message}.`;
      })
    );
  }
  return result.data;
}

export function normalizeStarryBioConfig(config: StarryBioConfig): NormalizedStarryBioConfig {
  const theme = normalizeTheme(config.theme);
  const layout = normalizeLayout(config.layout, theme.preset);
  const sections = config.sections
    .filter(isVisible)
    .map((section) => ({
      title: section.title,
      description: section.description,
      links: section.links.filter(isVisible),
    }))
    .filter((section) => section.links.length > 0 || section.description);

  return {
    ...config,
    theme,
    layout,
    sections,
    featured: (config.featured || []).filter(isVisible),
    seo: {
      title: config.seo?.title || config.pageTitle,
      description: config.seo?.description || config.profile.description,
      image: config.seo?.image,
      canonicalUrl: config.seo?.canonicalUrl,
      themeColor: config.seo?.themeColor || theme.accent,
    },
    status: config.status
      ? {
          ...config.status,
          showOwnerTime: config.status.showOwnerTime ?? Boolean(config.status.ownerTimeZone),
          showVisitorTime: config.status.showVisitorTime ?? false,
          showNextAvailable: config.status.showNextAvailable ?? false,
        }
      : undefined,
    qr: config.qr
      ? {
          ...config.qr,
          showButton: config.qr.showButton ?? true,
        }
      : undefined,
    analytics: config.analytics || { provider: 'none' },
  };
}

export function isVisible(item: VisibilityConfig, now = Date.now()): boolean {
  if (item.enabled === false) return false;
  if (item.visibleFrom && Date.parse(item.visibleFrom) > now) return false;
  if (item.visibleUntil && Date.parse(item.visibleUntil) <= now) return false;
  return true;
}

function normalizeTheme(theme: StarryBioConfig['theme']): NormalizedThemeConfig {
  const value = typeof theme === 'string' ? { preset: theme } : theme || {};
  const preset = value.preset || 'midnight';
  const mode = value.mode || (preset === 'minimal' ? 'light' : 'dark');
  return {
    preset,
    accent: value.accent || getDefaultThemeAccent(preset, mode),
    mode,
    buttonStyle: value.buttonStyle || (preset === 'terminal' ? 'terminal' : 'glass'),
    background: value.background || (preset === 'minimal' ? 'minimal' : 'starfield'),
    animationIntensity: value.animationIntensity || 'normal',
  };
}

function normalizeLayout(
  layout: LayoutConfig | undefined,
  preset: ThemePreset
): NormalizedLayoutConfig {
  const mode = layout?.mode || (preset === 'terminal' ? 'terminal' : 'centered');
  return {
    mode,
    linkStyle: layout?.linkStyle || (mode === 'terminal' ? 'terminal' : 'cards'),
    profilePosition: layout?.profilePosition || (mode === 'split-screen' ? 'left' : 'top'),
    featuredPosition: layout?.featuredPosition || 'above-links',
  };
}

function supportedUrl(options: { allowHash: boolean; protocols?: string[] }) {
  return nonEmptyString.refine(
    (value) => isSupportedUrl(value, options),
    'must be a supported URL or root-relative path'
  );
}

function isSupportedUrl(
  value: string,
  options: { allowHash: boolean; protocols?: string[] }
): boolean {
  if (options.allowHash && value.startsWith('#')) return true;
  if (value.startsWith('/') && !value.startsWith('//')) return !hasTraversal(value);
  if (!value.includes(':') && !value.startsWith('//')) return !hasTraversal(value);
  try {
    const url = new URL(value);
    return (options.protocols || ['http:', 'https:', 'mailto:', 'tel:']).includes(url.protocol);
  } catch {
    return false;
  }
}

function isSupportedAssetUrl(value: string): boolean {
  if (value.startsWith('//') || hasTraversal(value)) return false;
  if (value.startsWith('/') || !value.includes(':')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateVisibilityWindow(
  value: { visibleFrom?: string; visibleUntil?: string },
  context: z.RefinementCtx
): void {
  if (
    value.visibleFrom &&
    value.visibleUntil &&
    Date.parse(value.visibleFrom) >= Date.parse(value.visibleUntil)
  ) {
    context.addIssue({
      code: 'custom',
      path: ['visibleUntil'],
      message: 'must be later than visibleFrom',
    });
  }
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value));
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function isSafePublicOutput(value: string, extensions: readonly string[]): boolean {
  const normalized = value.replace(/\\/g, '/');
  return (
    normalized.startsWith('public/') &&
    !hasTraversal(normalized) &&
    extensions.some((extension) => normalized.toLowerCase().endsWith(extension))
  );
}

function hasTraversal(value: string): boolean {
  try {
    return decodeURIComponent(value).replace(/\\/g, '/').split('/').includes('..');
  } catch {
    return true;
  }
}
