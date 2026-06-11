export type ThemePreset =
  | 'nebula'
  | 'midnight'
  | 'aurora'
  | 'eclipse'
  | 'cosmic-gold'
  | 'minimal'
  | 'terminal';
export type LegacyTheme = 'bright';
export type ThemeMode = 'dark' | 'light';
export type ButtonStyle = 'glass' | 'solid' | 'outline' | 'minimal' | 'terminal';
export type ThemeBackground = 'starfield' | 'gradient' | 'minimal';
export type AnimationIntensity = 'none' | 'subtle' | 'normal' | 'high';
export type LayoutMode =
  | 'centered'
  | 'split-screen'
  | 'profile-card'
  | 'compact'
  | 'creator-grid'
  | 'portfolio'
  | 'terminal';
export type LinkStyle = 'cards' | 'buttons' | 'minimal' | 'terminal';
export type ProfilePosition = 'top' | 'left';
export type FeaturedPosition = 'above-links' | 'below-links';
export type ProfileLayout = 'vertical' | 'horizontal';
export type ScheduleDays = 'daily' | 'weekdays' | 'weekends';
export type LinkSpecialType = 'copy';
export type AnalyticsProvider = 'none' | 'cloudflare' | 'plausible' | 'umami' | 'custom';

export interface SimpleIconConfig {
  simpleIcon?: string;
  brand?: string;
  slug?: string;
  color?: string | number;
  darkColor?: string | number;
  viewbox?: string | number;
  size?: string | number;
}

export type IconConfig = string | SimpleIconConfig;

export interface VisibilityConfig {
  enabled?: boolean;
  visibleFrom?: string;
  visibleUntil?: string;
}

export interface StarryBioLink extends VisibilityConfig {
  label?: string;
  text?: string;
  subtitle?: string;
  description?: string;
  url?: string;
  icon?: IconConfig;
  specialType?: LinkSpecialType;
  copyValue?: string;
}

export interface LinkSection extends VisibilityConfig {
  title: string;
  description?: string;
  links: StarryBioLink[];
}

export interface FeaturedCard extends VisibilityConfig {
  title: string;
  description: string;
  url: string;
  image?: string;
  badge?: string;
  icon?: IconConfig;
}

export interface StatusDefinition {
  text: string;
  color: string;
  icon?: IconConfig;
  message?: string;
}

export interface ScheduleItem {
  status: string;
  days: ScheduleDays;
  start: string;
  end: string;
}

export interface ThemeConfig {
  preset?: ThemePreset | LegacyTheme;
  accent?: string;
  mode?: ThemeMode;
  buttonStyle?: ButtonStyle;
  background?: ThemeBackground;
  animationIntensity?: AnimationIntensity;
}

export interface LayoutConfig {
  mode?: LayoutMode;
  linkStyle?: LinkStyle;
  profilePosition?: ProfilePosition;
  featuredPosition?: FeaturedPosition;
}

export interface SeoConfig {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  themeColor?: string;
}

export interface OgImageConfig {
  enabled?: boolean;
  output?: string;
  title?: string;
  subtitle?: string;
}

export interface QrConfig {
  enabled?: boolean;
  url?: string;
  output?: string;
}

export interface ContactCardConfig {
  enabled?: boolean;
  output?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  organization?: string;
  title?: string;
}

export type AnalyticsConfig =
  | { provider?: 'none' }
  | { provider: 'cloudflare'; token: string }
  | { provider: 'plausible'; domain: string; scriptSrc?: string }
  | { provider: 'umami'; websiteId: string; scriptSrc: string }
  | { provider: 'custom'; scriptSrc: string; dataAttributes?: Record<string, string> };

export interface StarryBioConfig {
  pageTitle: string;
  favicon?: string;
  theme?: ThemePreset | LegacyTheme | ThemeConfig;
  layout?: LayoutConfig;
  animation?: {
    starMultiplier?: number;
    shootingStarMultiplier?: number;
  };
  profile: {
    name: string;
    description: string;
    image: string;
    layout?: ProfileLayout;
  };
  links?: StarryBioLink[];
  sections?: LinkSection[];
  featured?: FeaturedCard[];
  status?: {
    enabled: boolean;
    ownerTimeZone?: string;
    showLocalTime?: boolean;
    showOwnerLocalTime?: boolean;
    showVisitorTime?: boolean;
    showNextAvailable?: boolean;
    responseText?: string;
    default: StatusDefinition;
    types: Record<string, StatusDefinition>;
    schedule: ScheduleItem[];
  };
  announcement?: {
    enabled: boolean;
    text: string;
    url?: string;
  };
  seo?: SeoConfig;
  ogImage?: OgImageConfig;
  qr?: QrConfig;
  analytics?: AnalyticsConfig;
  contactCard?: ContactCardConfig;
  footer?: {
    copyright?: string;
  };
}

export interface NormalizedLink extends Required<Pick<StarryBioLink, 'label'>> {
  subtitle?: string;
  description?: string;
  url?: string;
  icon?: IconConfig;
  specialType?: LinkSpecialType;
  copyValue?: string;
}

export interface NormalizedSection {
  title: string;
  description?: string;
  links: NormalizedLink[];
}

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

export interface NormalizedSeoConfig {
  title: string;
  description: string;
  image?: string;
  canonicalUrl?: string;
  themeColor: string;
}

export interface NormalizedStarryBioConfig extends Omit<
  StarryBioConfig,
  'theme' | 'layout' | 'links' | 'sections' | 'seo' | 'featured'
> {
  theme: NormalizedThemeConfig;
  layout: NormalizedLayoutConfig;
  sections: NormalizedSection[];
  featured: FeaturedCard[];
  seo: NormalizedSeoConfig;
}

const THEME_PRESETS = new Set<ThemePreset | LegacyTheme>([
  'nebula',
  'midnight',
  'aurora',
  'eclipse',
  'cosmic-gold',
  'minimal',
  'terminal',
  'bright',
]);
const THEME_MODES = new Set<ThemeMode>(['dark', 'light']);
const BUTTON_STYLES = new Set<ButtonStyle>(['glass', 'solid', 'outline', 'minimal', 'terminal']);
const THEME_BACKGROUNDS = new Set<ThemeBackground>(['starfield', 'gradient', 'minimal']);
const ANIMATION_INTENSITIES = new Set<AnimationIntensity>(['none', 'subtle', 'normal', 'high']);
const LAYOUT_MODES = new Set<LayoutMode>([
  'centered',
  'split-screen',
  'profile-card',
  'compact',
  'creator-grid',
  'portfolio',
  'terminal',
]);
const LINK_STYLES = new Set<LinkStyle>(['cards', 'buttons', 'minimal', 'terminal']);
const PROFILE_POSITIONS = new Set<ProfilePosition>(['top', 'left']);
const FEATURED_POSITIONS = new Set<FeaturedPosition>(['above-links', 'below-links']);
const PROFILE_LAYOUTS = new Set<ProfileLayout>(['vertical', 'horizontal']);
const SCHEDULE_DAYS = new Set<ScheduleDays>(['daily', 'weekdays', 'weekends']);
const ANALYTICS_PROVIDERS = new Set<AnalyticsProvider>([
  'none',
  'cloudflare',
  'plausible',
  'umami',
  'custom',
]);
const DEFAULT_THEME_ACCENTS: Record<ThemePreset, string> = {
  nebula: '#d8b4fe',
  midnight: '#b0c4de',
  aurora: '#7ddf9b',
  eclipse: '#f6c177',
  'cosmic-gold': '#f7d06b',
  minimal: '#334155',
  terminal: '#9cffac',
};
const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class StarryBioConfigError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid StarryBio config:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`);
    this.name = 'StarryBioConfigError';
  }
}

export function validateStarryBioConfig(value: unknown): StarryBioConfig {
  const issues: string[] = [];

  if (!isRecord(value)) {
    throw new StarryBioConfigError(['config must export an object.']);
  }

  requiredString(value, 'pageTitle', issues);
  optionalString(value, 'favicon', issues);
  validateTheme(value.theme, 'theme', issues);
  validateLayout(value.layout, 'layout', issues);
  validateAnimation(value.animation, 'animation', issues);
  validateProfile(value.profile, 'profile', issues);
  validateLinks(value.links, 'links', issues, { optional: true });
  validateSections(value.sections, 'sections', issues);
  validateFeatured(value.featured, 'featured', issues);
  validateStatus(value.status, 'status', issues);
  validateAnnouncement(value.announcement, 'announcement', issues);
  validateSeo(value.seo, 'seo', issues);
  validateOgImage(value.ogImage, 'ogImage', issues);
  validateQr(value.qr, 'qr', issues);
  validateAnalytics(value.analytics, 'analytics', issues);
  validateContactCard(value.contactCard, 'contactCard', issues);
  validateFooter(value.footer, 'footer', issues);

  if (!Array.isArray(value.links) && !Array.isArray(value.sections)) {
    issues.push('links or sections must be provided.');
  }

  if (issues.length > 0) {
    throw new StarryBioConfigError(issues);
  }

  return value as unknown as StarryBioConfig;
}

export function normalizeStarryBioConfig(config: StarryBioConfig): NormalizedStarryBioConfig {
  const theme = normalizeTheme(config.theme);
  const layout = normalizeLayout(config.layout, theme.preset);
  const flatLinks = filterVisibleLinks(config.links || []);
  const sectionSource =
    config.sections && config.sections.length > 0
      ? config.sections
      : [{ title: 'Links', enabled: true, links: flatLinks }];
  const sections = sectionSource
    .filter(isVisible)
    .map((section) => ({
      title: section.title,
      description: section.description,
      links: filterVisibleLinks(section.links).map(normalizeLink),
    }))
    .filter((section) => section.links.length > 0 || section.description);
  const featured = (config.featured || []).filter(isVisible);
  const seo = normalizeSeo(config, theme.accent);

  return {
    ...config,
    theme,
    layout,
    sections,
    featured,
    seo,
    analytics: config.analytics || { provider: 'none' },
  };
}

export function isVisible(item: VisibilityConfig): boolean {
  if (item.enabled === false) return false;

  const now = Date.now();
  if (item.visibleFrom && Date.parse(item.visibleFrom) > now) return false;
  if (item.visibleUntil && Date.parse(item.visibleUntil) <= now) return false;

  return true;
}

function normalizeTheme(theme: StarryBioConfig['theme']): NormalizedThemeConfig {
  const themeObject = typeof theme === 'object' && theme ? theme : { preset: theme };
  const preset = themeObject.preset === 'bright' ? 'midnight' : themeObject.preset || 'midnight';

  return {
    preset,
    accent: themeObject.accent || DEFAULT_THEME_ACCENTS[preset],
    mode: themeObject.mode || (preset === 'minimal' ? 'light' : 'dark'),
    buttonStyle: themeObject.buttonStyle || (preset === 'terminal' ? 'terminal' : 'glass'),
    background: themeObject.background || (preset === 'minimal' ? 'minimal' : 'starfield'),
    animationIntensity: themeObject.animationIntensity || 'normal',
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

function normalizeSeo(config: StarryBioConfig, accent: string): NormalizedSeoConfig {
  return {
    title: config.seo?.title || config.pageTitle || config.profile.name,
    description: config.seo?.description || config.profile.description,
    image: config.seo?.image,
    canonicalUrl: config.seo?.canonicalUrl,
    themeColor: config.seo?.themeColor || accent,
  };
}

function filterVisibleLinks(links: StarryBioLink[]): StarryBioLink[] {
  return links.filter(isVisible);
}

function normalizeLink(link: StarryBioLink): NormalizedLink {
  return {
    label: link.label || link.text || '',
    subtitle: link.subtitle,
    description: link.description,
    url: link.url,
    icon: link.icon,
    specialType: link.specialType,
    copyValue: link.copyValue,
  };
}

function validateTheme(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;

  if (typeof value === 'string') {
    if (!THEME_PRESETS.has(value as ThemePreset | LegacyTheme)) {
      issues.push(`${path} must be one of: ${formatOptions(THEME_PRESETS)}.`);
    }
    return;
  }

  if (!isRecord(value)) {
    issues.push(`${path} must be a preset string or an object.`);
    return;
  }

  optionalEnum(value, `${path}.preset`, THEME_PRESETS, issues);
  optionalHexColor(value, `${path}.accent`, issues);
  optionalEnum(value, `${path}.mode`, THEME_MODES, issues);
  optionalEnum(value, `${path}.buttonStyle`, BUTTON_STYLES, issues);
  optionalEnum(value, `${path}.background`, THEME_BACKGROUNDS, issues);
  optionalEnum(value, `${path}.animationIntensity`, ANIMATION_INTENSITIES, issues);
}

function validateLayout(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  optionalEnum(value, `${path}.mode`, LAYOUT_MODES, issues);
  optionalEnum(value, `${path}.linkStyle`, LINK_STYLES, issues);
  optionalEnum(value, `${path}.profilePosition`, PROFILE_POSITIONS, issues);
  optionalEnum(value, `${path}.featuredPosition`, FEATURED_POSITIONS, issues);
}

function validateAnimation(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  optionalNonNegativeNumber(value, 'starMultiplier', path, issues);
  optionalNonNegativeNumber(value, 'shootingStarMultiplier', path, issues);
}

function validateProfile(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object.`);
    return;
  }

  requiredString(value, `${path}.name`, issues);
  requiredString(value, `${path}.description`, issues);
  requiredString(value, `${path}.image`, issues);
  optionalEnum(value, `${path}.layout`, PROFILE_LAYOUTS, issues);
}

function validateSections(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    issues.push(`${path} must be an array when provided.`);
    return;
  }

  value.forEach((section, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(section)) {
      issues.push(`${itemPath} must be an object.`);
      return;
    }

    requiredString(section, `${itemPath}.title`, issues);
    optionalString(section, `${itemPath}.description`, issues);
    validateVisibility(section, itemPath, issues);
    validateLinks(section.links, `${itemPath}.links`, issues, { optional: false });
  });
}

function validateLinks(
  value: unknown,
  path: string,
  issues: string[],
  options: { optional: boolean }
): void {
  if (value === undefined && options.optional) return;
  if (!Array.isArray(value)) {
    issues.push(`${path} must be an array.`);
    return;
  }

  value.forEach((link, index) => validateLink(link, `${path}[${index}]`, issues));
}

function validateLink(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object.`);
    return;
  }

  if (!hasNonEmptyString(value.label) && !hasNonEmptyString(value.text)) {
    issues.push(`${path}.label must be a non-empty string. Use text for legacy configs.`);
  }

  optionalString(value, `${path}.subtitle`, issues);
  optionalString(value, `${path}.description`, issues);
  optionalString(value, `${path}.url`, issues);
  optionalString(value, `${path}.copyValue`, issues);
  validateVisibility(value, path, issues);
  validateUrl(value.url, `${path}.url`, issues, { optional: true, allowHash: true });
  validateIcon(value.icon, `${path}.icon`, issues);

  if (value.specialType !== undefined && value.specialType !== 'copy') {
    issues.push(`${path}.specialType must be "copy" when provided.`);
  }

  if (value.specialType === 'copy') {
    requiredString(value, `${path}.copyValue`, issues);
  } else {
    requiredString(value, `${path}.url`, issues);
  }
}

function validateFeatured(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    issues.push(`${path} must be an array when provided.`);
    return;
  }

  value.forEach((card, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(card)) {
      issues.push(`${itemPath} must be an object.`);
      return;
    }

    requiredString(card, `${itemPath}.title`, issues);
    requiredString(card, `${itemPath}.description`, issues);
    requiredString(card, `${itemPath}.url`, issues);
    optionalString(card, `${itemPath}.image`, issues);
    optionalString(card, `${itemPath}.badge`, issues);
    validateUrl(card.url, `${itemPath}.url`, issues, { optional: false, allowHash: false });
    validateIcon(card.icon, `${itemPath}.icon`, issues);
    validateVisibility(card, itemPath, issues);
  });
}

function validateStatus(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  requiredBoolean(value, `${path}.enabled`, issues);
  optionalString(value, `${path}.ownerTimeZone`, issues);
  optionalBoolean(value, `${path}.showLocalTime`, issues);
  optionalBoolean(value, `${path}.showOwnerLocalTime`, issues);
  optionalBoolean(value, `${path}.showVisitorTime`, issues);
  optionalBoolean(value, `${path}.showNextAvailable`, issues);
  optionalString(value, `${path}.responseText`, issues);

  if (
    typeof value.ownerTimeZone === 'string' &&
    value.ownerTimeZone &&
    !isValidTimeZone(value.ownerTimeZone)
  ) {
    issues.push(`${path}.ownerTimeZone must be a valid IANA timezone such as "America/New_York".`);
  }

  validateStatusDefinition(value.default, `${path}.default`, issues);

  if (!isRecord(value.types)) {
    issues.push(`${path}.types must be an object keyed by status name.`);
  } else {
    for (const [name, status] of Object.entries(value.types)) {
      if (!name.trim()) {
        issues.push(`${path}.types contains an empty status name.`);
      }
      validateStatusDefinition(status, `${path}.types.${name || '<empty>'}`, issues);
    }
  }

  validateSchedule(value.schedule, value.types, `${path}.schedule`, issues);
}

function validateStatusDefinition(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object.`);
    return;
  }

  requiredString(value, `${path}.text`, issues);
  requiredHexColor(value, `${path}.color`, issues);
  optionalString(value, `${path}.message`, issues);
  validateIcon(value.icon, `${path}.icon`, issues);
}

function validateSchedule(
  value: unknown,
  statusTypes: unknown,
  path: string,
  issues: string[]
): void {
  if (!Array.isArray(value)) {
    issues.push(`${path} must be an array.`);
    return;
  }

  const knownStatuses = isRecord(statusTypes)
    ? new Set(Object.keys(statusTypes))
    : new Set<string>();

  value.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(item)) {
      issues.push(`${itemPath} must be an object.`);
      return;
    }

    requiredString(item, `${itemPath}.status`, issues);
    requiredEnum(item, `${itemPath}.days`, SCHEDULE_DAYS, issues);
    requiredTime(item, `${itemPath}.start`, issues);
    requiredTime(item, `${itemPath}.end`, issues);

    if (typeof item.status === 'string' && !knownStatuses.has(item.status)) {
      issues.push(
        `${itemPath}.status must match one of status.types: ${formatOptions(knownStatuses)}.`
      );
    }

    if (typeof item.start === 'string' && typeof item.end === 'string' && item.start === item.end) {
      issues.push(`${itemPath}.start and ${itemPath}.end must be different times.`);
    }
  });
}

function validateAnnouncement(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  requiredBoolean(value, `${path}.enabled`, issues);
  requiredString(value, `${path}.text`, issues);
  validateUrl(value.url, `${path}.url`, issues, { optional: true, allowHash: true });
}

function validateSeo(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  optionalString(value, `${path}.title`, issues);
  optionalString(value, `${path}.description`, issues);
  optionalString(value, `${path}.image`, issues);
  optionalString(value, `${path}.canonicalUrl`, issues);
  optionalHexColor(value, `${path}.themeColor`, issues);
  validateUrl(value.canonicalUrl, `${path}.canonicalUrl`, issues, {
    optional: true,
    allowHash: false,
  });
}

function validateOgImage(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  requiredBoolean(value, `${path}.enabled`, issues);
  optionalString(value, `${path}.output`, issues);
  optionalString(value, `${path}.title`, issues);
  optionalString(value, `${path}.subtitle`, issues);
}

function validateQr(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  requiredBoolean(value, `${path}.enabled`, issues);
  optionalString(value, `${path}.url`, issues);
  optionalString(value, `${path}.output`, issues);
  validateUrl(value.url, `${path}.url`, issues, { optional: true, allowHash: false });
}

function validateAnalytics(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  const provider = value.provider ?? 'none';
  if (typeof provider !== 'string' || !ANALYTICS_PROVIDERS.has(provider as AnalyticsProvider)) {
    issues.push(`${path}.provider must be one of: ${formatOptions(ANALYTICS_PROVIDERS)}.`);
    return;
  }

  if (provider === 'cloudflare') requiredString(value, `${path}.token`, issues);
  if (provider === 'plausible') {
    requiredString(value, `${path}.domain`, issues);
    validateUrl(value.scriptSrc, `${path}.scriptSrc`, issues, { optional: true, allowHash: false });
  }
  if (provider === 'umami') {
    requiredString(value, `${path}.websiteId`, issues);
    requiredString(value, `${path}.scriptSrc`, issues);
    validateUrl(value.scriptSrc, `${path}.scriptSrc`, issues, {
      optional: false,
      allowHash: false,
    });
  }
  if (provider === 'custom') {
    requiredString(value, `${path}.scriptSrc`, issues);
    validateUrl(value.scriptSrc, `${path}.scriptSrc`, issues, {
      optional: false,
      allowHash: false,
    });
    if (value.dataAttributes !== undefined && !isStringRecord(value.dataAttributes)) {
      issues.push(`${path}.dataAttributes must be an object of string values when provided.`);
    }
  }
}

function validateContactCard(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  requiredBoolean(value, `${path}.enabled`, issues);
  optionalString(value, `${path}.output`, issues);
  optionalString(value, `${path}.name`, issues);
  optionalString(value, `${path}.email`, issues);
  optionalString(value, `${path}.phone`, issues);
  optionalString(value, `${path}.website`, issues);
  optionalString(value, `${path}.organization`, issues);
  optionalString(value, `${path}.title`, issues);
  validateUrl(value.website, `${path}.website`, issues, { optional: true, allowHash: false });

  if (value.enabled === true) {
    requiredString(value, `${path}.name`, issues);
    if (
      !hasNonEmptyString(value.email) &&
      !hasNonEmptyString(value.phone) &&
      !hasNonEmptyString(value.website)
    ) {
      issues.push(`${path} must include email, phone, or website when enabled.`);
    }
  }
}

function validateFooter(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  optionalString(value, `${path}.copyright`, issues);
}

function validateVisibility(value: Record<string, unknown>, path: string, issues: string[]): void {
  optionalBoolean(value, `${path}.enabled`, issues);
  optionalIsoDate(value, `${path}.visibleFrom`, issues);
  optionalIsoDate(value, `${path}.visibleUntil`, issues);

  if (
    typeof value.visibleFrom === 'string' &&
    typeof value.visibleUntil === 'string' &&
    Date.parse(value.visibleFrom) >= Date.parse(value.visibleUntil)
  ) {
    issues.push(`${path}.visibleFrom must be earlier than ${path}.visibleUntil.`);
  }
}

function validateIcon(value: unknown, path: string, issues: string[]): void {
  if (value === undefined || value === '') return;
  if (typeof value === 'string') return;

  if (!isRecord(value) || Array.isArray(value)) {
    issues.push(`${path} must be a string path/SVG path or a Simple Icons object.`);
    return;
  }

  optionalString(value, `${path}.simpleIcon`, issues);
  optionalString(value, `${path}.brand`, issues);
  optionalString(value, `${path}.slug`, issues);
  optionalStringOrNumber(value, `${path}.color`, issues);
  optionalStringOrNumber(value, `${path}.darkColor`, issues);
  optionalStringOrNumber(value, `${path}.viewbox`, issues);
  optionalStringOrNumber(value, `${path}.size`, issues);

  if (
    !hasNonEmptyString(value.simpleIcon) &&
    !hasNonEmptyString(value.brand) &&
    !hasNonEmptyString(value.slug)
  ) {
    issues.push(`${path} Simple Icons object must include simpleIcon, brand, or slug.`);
  }
}

function validateUrl(
  value: unknown,
  path: string,
  issues: string[],
  options: { optional: boolean; allowHash: boolean }
): void {
  if (value === undefined || value === '') {
    if (!options.optional) issues.push(`${path} must be a valid URL.`);
    return;
  }
  if (typeof value !== 'string') return;
  if (options.allowHash && value.startsWith('#')) return;
  if (value.startsWith('/')) return;

  try {
    const url = new URL(value);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      issues.push(`${path} must use http, https, mailto, tel, or a root-relative path.`);
    }
  } catch {
    issues.push(`${path} must be a valid URL or root-relative path.`);
  }
}

function requiredString(record: Record<string, unknown>, path: string, issues: string[]): void {
  const value = getByPath(record, path);
  if (typeof value !== 'string' || value.trim() === '') {
    issues.push(`${path} must be a non-empty string.`);
  }
}

function optionalString(record: Record<string, unknown>, path: string, issues: string[]): void {
  const value = getByPath(record, path);
  if (value !== undefined && typeof value !== 'string') {
    issues.push(`${path} must be a string when provided.`);
  }
}

function optionalStringOrNumber(
  record: Record<string, unknown>,
  path: string,
  issues: string[]
): void {
  const value = getByPath(record, path);
  if (value !== undefined && typeof value !== 'string' && typeof value !== 'number') {
    issues.push(`${path} must be a string or number when provided.`);
  }
}

function requiredBoolean(record: Record<string, unknown>, path: string, issues: string[]): void {
  const value = getByPath(record, path);
  if (typeof value !== 'boolean') {
    issues.push(`${path} must be true or false.`);
  }
}

function optionalBoolean(record: Record<string, unknown>, path: string, issues: string[]): void {
  const value = getByPath(record, path);
  if (value !== undefined && typeof value !== 'boolean') {
    issues.push(`${path} must be true or false when provided.`);
  }
}

function requiredEnum<T extends string>(
  record: Record<string, unknown>,
  path: string,
  options: Set<T>,
  issues: string[]
): void {
  const value = getByPath(record, path);
  if (typeof value !== 'string' || !options.has(value as T)) {
    issues.push(`${path} must be one of: ${formatOptions(options)}.`);
  }
}

function optionalEnum<T extends string>(
  record: Record<string, unknown>,
  path: string,
  options: Set<T>,
  issues: string[]
): void {
  const value = getByPath(record, path);
  if (value !== undefined && (typeof value !== 'string' || !options.has(value as T))) {
    issues.push(`${path} must be one of: ${formatOptions(options)}.`);
  }
}

function optionalNonNegativeNumber(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: string[]
): void {
  const value = record[key];
  if (value === undefined) return;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    issues.push(`${path}.${key} must be a number greater than or equal to 0.`);
  }
}

function requiredHexColor(record: Record<string, unknown>, path: string, issues: string[]): void {
  const value = getByPath(record, path);
  if (typeof value !== 'string' || !HEX_COLOR_RE.test(value)) {
    issues.push(`${path} must be a hex color like "#10B981".`);
  }
}

function optionalHexColor(record: Record<string, unknown>, path: string, issues: string[]): void {
  const value = getByPath(record, path);
  if (value !== undefined && (typeof value !== 'string' || !HEX_COLOR_RE.test(value))) {
    issues.push(`${path} must be a hex color like "#a78bfa" when provided.`);
  }
}

function requiredTime(record: Record<string, unknown>, path: string, issues: string[]): void {
  const value = getByPath(record, path);
  if (typeof value !== 'string' || !TIME_RE.test(value)) {
    issues.push(`${path} must use 24-hour HH:MM format, for example "21:00".`);
  }
}

function optionalIsoDate(record: Record<string, unknown>, path: string, issues: string[]): void {
  const value = getByPath(record, path);
  if (value !== undefined && (typeof value !== 'string' || Number.isNaN(Date.parse(value)))) {
    issues.push(`${path} must be a valid ISO date string such as "2026-06-15T12:00:00Z".`);
  }
}

function getByPath(record: Record<string, unknown>, path: string): unknown {
  const key = path.slice(path.lastIndexOf('.') + 1);
  return record[key];
}

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function formatOptions(options: Iterable<string>): string {
  return Array.from(options)
    .map((option) => `"${option}"`)
    .join(', ');
}
