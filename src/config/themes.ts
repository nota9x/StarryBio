export const THEME_PRESET_NAMES = [
  'nebula',
  'midnight',
  'classic-blue',
  'aurora',
  'eclipse',
  'minimal',
  'terminal',
  'supernova',
  'black-hole',
  'pulsar',
  'mars',
  'starlight',
  'voyager',
] as const;

export const LEGACY_THEME_PRESET_ALIASES = {
  'cosmic-gold': 'eclipse',
  andromeda: 'nebula',
  lunar: 'midnight',
  'solar-flare': 'supernova',
  'deep-space': 'midnight',
  'event-horizon': 'black-hole',
  quasar: 'supernova',
  apollo: 'voyager',
  alien: 'aurora',
  'cyber-orbit': 'terminal',
  'ice-moon': 'pulsar',
  titan: 'mars',
  saturn: 'eclipse',
  'red-giant': 'supernova',
  'white-dwarf': 'pulsar',
} as const satisfies Record<string, ThemePreset>;

export const LEGACY_THEME_PRESET_NAMES = Object.keys(
  LEGACY_THEME_PRESET_ALIASES
) as LegacyThemePreset[];

export const THEME_INPUT_NAMES = [...THEME_PRESET_NAMES, ...LEGACY_THEME_PRESET_NAMES] as readonly [
  ThemeInputPreset,
  ...ThemeInputPreset[],
];

export type ThemePreset = (typeof THEME_PRESET_NAMES)[number];
export type LegacyThemePreset = keyof typeof LEGACY_THEME_PRESET_ALIASES;
export type ThemeInputPreset = ThemePreset | LegacyThemePreset;
export type ThemeAppearance = 'dark' | 'light';
export type ThemeBackground = 'starfield' | 'gradient' | 'minimal';
export type RadiusValue = number | readonly [number, number];
export type ProfileImageShape = 'circle' | 'rounded-square' | 'square';
export type ResolvedProfileImageShape = ProfileImageShape | 'organic';
export type StarfieldEffectKind =
  | 'none'
  | 'nebula-drift'
  | 'aurora-ribbons'
  | 'eclipse-corona'
  | 'terminal-scan'
  | 'supernova-bloom'
  | 'black-hole-lensing'
  | 'pulsar-beams'
  | 'mars-dust'
  | 'starlight-glints';
type ButtonStyle = 'glass' | 'solid' | 'outline' | 'minimal' | 'terminal';
type ThemeLayout = 'centered' | 'terminal';
type ThemeLinkStyle = 'cards' | 'terminal';
type StarColors = readonly [string, string, string, string, string];

export interface ThemePresetDefinition {
  appearance: ThemeAppearance;
  accent: string;
  /** An opaque color safe for metadata, generated SVG assets, and CSS fallbacks. */
  bgColor: string;
  /** The complete decorative page background used by gradient and starfield modes. */
  bgStars: string;
  text: string;
  muted: string;
  heading: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cardInset: string;
  cardBackdrop: string;
  cardHoverTransform: string;
  cardHoverShadow: string;
  cardPadding: string;
  cardPaddingWide: string;
  buttonBg: string;
  buttonBorder: string;
  buttonHoverBg: string;
  buttonShadow: string;
  buttonHoverShadow: string;
  buttonHoverTransform: string;
  buttonActiveTransform: string;
  buttonPadding: string;
  glow: string;
  statusBg: string;
  modalBg: string;
  modalBorder: string;
  modalShadow: string;
  modalBackdrop: string;
  tooltipBg: string;
  tooltipText: string;
  tooltipMuted: string;
  tooltipAccent: string;
  tooltipDivider: string;
  tooltipBorder: string;
  tooltipShadow: string;
  announcementBg: string;
  announcementBorder: string;
  announcementShadow: string;
  imageBorder: string;
  imageShadow: string;
  imageRadius: string;
  roundedImageRadius: string;
  defaultImageShape: ResolvedProfileImageShape;
  imageHoverTransform: string;
  iconBg: string;
  iconBorder: string;
  iconRadius: string;
  divider: string;
  decoration: string;
  decorationOpacity: string;
  decorationSize: string;
  cardRadius: string;
  buttonRadius: string;
  radiusPolicy: 'configurable' | 'square';
  badgeRadius: string;
  fontFamily: string;
  headingFontFamily: string;
  headingWeight: string;
  headingTracking: string;
  headingTransform: string;
  headingShadow: string;
  sectionTracking: string;
  sectionTransform: string;
  linkGap: string;
  sectionGap: string;
  focusWidth: string;
  focusOffset: string;
  copySuccessBg: string;
  copySuccessBorder: string;
  copySuccessShadow: string;
  copySuccessText: string;
  copyErrorBg: string;
  copyErrorBorder: string;
  copyErrorText: string;
  starfieldEffect: StarfieldEffectKind;
  effectPrimary: string;
  effectSecondary: string;
  effectIntensity: string;
  effectSpeed: string;
  starColors: StarColors;
  defaultBackground?: ThemeBackground;
  defaultButtonStyle?: ButtonStyle;
  defaultLayout?: ThemeLayout;
  defaultLinkStyle?: ThemeLinkStyle;
}

type ThemeSeed = Pick<
  ThemePresetDefinition,
  'appearance' | 'accent' | 'bgColor' | 'bgStars' | 'text' | 'muted' | 'heading' | 'cardBg'
> &
  Partial<
    Omit<
      ThemePresetDefinition,
      'appearance' | 'accent' | 'bgColor' | 'bgStars' | 'text' | 'muted' | 'heading' | 'cardBg'
    >
  >;

const darkStars: StarColors = ['#ffffff', '#ffe9c4', '#d4fbff', '#c4b5fd', '#b3cde0'];
const lightStars: StarColors = ['#24476b', '#4f6f8f', '#7b8fa5', '#315f86', '#7890a8'];

function defineTheme(seed: ThemeSeed): ThemePresetDefinition {
  const light = seed.appearance === 'light';
  return {
    ...seed,
    cardBorder:
      seed.cardBorder ||
      `1px solid color-mix(in srgb, var(--accent-color) ${light ? '20%' : '18%'}, transparent)`,
    cardShadow:
      seed.cardShadow ||
      (light ? '0 20px 50px rgba(29, 50, 72, 0.14)' : '0 24px 62px rgba(0, 0, 0, 0.58)'),
    cardInset:
      seed.cardInset ||
      `0 0 0 1px color-mix(in srgb, var(--text-color) ${light ? '3%' : '5%'}, transparent) inset`,
    cardBackdrop: seed.cardBackdrop || 'blur(16px) saturate(120%)',
    cardHoverTransform: seed.cardHoverTransform || 'translateY(-4px)',
    cardHoverShadow:
      seed.cardHoverShadow ||
      '0 12px 34px color-mix(in srgb, var(--accent-color) 18%, transparent)',
    cardPadding: seed.cardPadding || '2rem 1.5rem',
    cardPaddingWide: seed.cardPaddingWide || '2.5rem',
    buttonBg: seed.buttonBg || 'color-mix(in srgb, var(--card-bg) 88%, var(--accent-color))',
    buttonBorder:
      seed.buttonBorder ||
      `1px solid color-mix(in srgb, var(--accent-color) ${light ? '24%' : '20%'}, transparent)`,
    buttonHoverBg:
      seed.buttonHoverBg || 'color-mix(in srgb, var(--card-bg) 68%, var(--accent-color))',
    buttonShadow:
      seed.buttonShadow ||
      (light ? '0 5px 16px rgba(30, 50, 70, 0.08)' : '0 6px 18px rgba(0, 0, 0, 0.2)'),
    buttonHoverShadow:
      seed.buttonHoverShadow ||
      '0 10px 24px color-mix(in srgb, var(--accent-color) 20%, transparent)',
    buttonHoverTransform: seed.buttonHoverTransform || 'translateY(-2px)',
    buttonActiveTransform: seed.buttonActiveTransform || 'translateY(0) scale(.99)',
    buttonPadding: seed.buttonPadding || '1rem 1.25rem',
    glow:
      seed.glow || `color-mix(in srgb, var(--accent-color) ${light ? '22%' : '36%'}, transparent)`,
    statusBg: seed.statusBg || 'color-mix(in srgb, var(--card-bg) 92%, var(--accent-color))',
    modalBg:
      seed.modalBg || `color-mix(in srgb, var(--card-bg) 96%, ${light ? '#ffffff' : '#000000'})`,
    modalBorder:
      seed.modalBorder || '1px solid color-mix(in srgb, var(--text-color) 14%, transparent)',
    modalShadow:
      seed.modalShadow ||
      (light ? '0 30px 70px rgba(30, 50, 70, .2)' : '0 32px 76px rgba(0, 0, 0, .72)'),
    modalBackdrop: seed.modalBackdrop || 'rgba(2, 4, 10, .72)',
    tooltipBg:
      seed.tooltipBg || `color-mix(in srgb, var(--card-bg) 98%, ${light ? '#ffffff' : '#000000'})`,
    tooltipText: seed.tooltipText || seed.text,
    tooltipMuted: seed.tooltipMuted || seed.muted,
    tooltipAccent: seed.tooltipAccent || seed.accent,
    tooltipDivider:
      seed.tooltipDivider || 'color-mix(in srgb, var(--tooltip-text) 14%, transparent)',
    tooltipBorder:
      seed.tooltipBorder || '1px solid color-mix(in srgb, var(--text-color) 14%, transparent)',
    tooltipShadow:
      seed.tooltipShadow ||
      (light ? '0 10px 30px rgba(30, 50, 70, .16)' : '0 12px 34px rgba(0, 0, 0, .46)'),
    announcementBg:
      seed.announcementBg || 'color-mix(in srgb, var(--card-bg) 86%, var(--accent-color))',
    announcementBorder:
      seed.announcementBorder || '1px solid color-mix(in srgb, var(--text-color) 14%, transparent)',
    announcementShadow:
      seed.announcementShadow ||
      '0 10px 30px color-mix(in srgb, var(--accent-color) 16%, transparent)',
    imageBorder:
      seed.imageBorder || '2px solid color-mix(in srgb, var(--text-color) 18%, transparent)',
    imageShadow: seed.imageShadow || '0 0 24px var(--theme-glow)',
    imageRadius: seed.imageRadius || '50%',
    roundedImageRadius: seed.roundedImageRadius || '18px',
    defaultImageShape: seed.defaultImageShape || 'circle',
    imageHoverTransform: seed.imageHoverTransform || 'scale(1.035)',
    iconBg: seed.iconBg || 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
    iconBorder:
      seed.iconBorder || '1px solid color-mix(in srgb, var(--accent-color) 18%, transparent)',
    iconRadius: seed.iconRadius || '12px',
    divider: seed.divider || '1px solid color-mix(in srgb, var(--text-color) 11%, transparent)',
    decoration: seed.decoration || 'none',
    decorationOpacity: seed.decorationOpacity || '0',
    decorationSize: seed.decorationSize || 'auto',
    cardRadius: seed.cardRadius || '28px',
    buttonRadius: seed.buttonRadius || '16px',
    radiusPolicy: seed.radiusPolicy || 'configurable',
    badgeRadius: seed.badgeRadius || '999px',
    fontFamily: seed.fontFamily || "'Inter', sans-serif",
    headingFontFamily: seed.headingFontFamily || "'Nunito Sans', sans-serif",
    headingWeight: seed.headingWeight || '800',
    headingTracking: seed.headingTracking || '0',
    headingTransform: seed.headingTransform || 'none',
    headingShadow: seed.headingShadow || 'none',
    sectionTracking: seed.sectionTracking || '.08em',
    sectionTransform: seed.sectionTransform || 'uppercase',
    linkGap: seed.linkGap || '1rem',
    sectionGap: seed.sectionGap || '1.25rem',
    focusWidth: seed.focusWidth || '3px',
    focusOffset: seed.focusOffset || '3px',
    copySuccessBg:
      seed.copySuccessBg || 'color-mix(in srgb, var(--card-bg) 72%, var(--accent-color))',
    copySuccessBorder:
      seed.copySuccessBorder || '1px solid color-mix(in srgb, var(--accent-color) 72%, white)',
    copySuccessShadow:
      seed.copySuccessShadow ||
      '0 0 0 1px color-mix(in srgb, var(--accent-color) 20%, transparent) inset, 0 0 24px var(--theme-glow)',
    copySuccessText: seed.copySuccessText || seed.text,
    copyErrorBg: seed.copyErrorBg || 'color-mix(in srgb, var(--card-bg) 78%, #dc2626)',
    copyErrorBorder: seed.copyErrorBorder || '1px solid rgba(248,113,113,.72)',
    copyErrorText: seed.copyErrorText || seed.text,
    starfieldEffect: seed.starfieldEffect || 'none',
    effectPrimary: seed.effectPrimary || seed.accent,
    effectSecondary: seed.effectSecondary || seed.text,
    effectIntensity: seed.effectIntensity || '1',
    effectSpeed: seed.effectSpeed || '1',
    starColors: seed.starColors || (light ? lightStars : darkStars),
  };
}

export const THEME_PRESETS = {
  nebula: defineTheme({
    appearance: 'dark',
    accent: '#d8b4fe',
    bgColor: '#070711',
    bgStars:
      'radial-gradient(circle at 18% 18%, rgba(216,180,254,.24), transparent 28%), radial-gradient(circle at 82% 24%, rgba(94,234,212,.16), transparent 30%), radial-gradient(ellipse at bottom, #21172f 0%, #070711 72%)',
    text: '#f4f0ff',
    muted: '#c9c1dc',
    heading: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 46%, #99f6e4 100%)',
    cardBg: 'rgba(15,13,25,.68)',
    cardBorder: '1px solid rgba(255,255,255,.11)',
    cardShadow: '0 26px 64px rgba(9,7,18,.68)',
    buttonBg: 'rgba(24,22,35,.58)',
    buttonHoverBg: 'rgba(102,79,130,.48)',
    glow: 'rgba(216,180,254,.3)',
    decoration:
      'radial-gradient(circle at 12% 8%, rgba(216,180,254,.18), transparent 26%), radial-gradient(circle at 88% 82%, rgba(94,234,212,.1), transparent 28%)',
    decorationOpacity: '.75',
    starfieldEffect: 'nebula-drift',
    effectPrimary: '#d8b4fe',
    effectSecondary: '#5eead4',
    effectIntensity: '.7',
    effectSpeed: '.45',
    starColors: ['#fff', '#ead7ff', '#99f6e4', '#d8b4fe', '#b8c5ff'],
  }),
  midnight: defineTheme({
    appearance: 'dark',
    accent: '#a9bad0',
    bgColor: '#07090d',
    bgStars:
      'radial-gradient(ellipse at 50% 100%, rgba(34,48,66,.72) 0%, #0b1018 42%, #07090d 82%)',
    text: '#edf2f8',
    muted: '#aeb9c8',
    heading: 'linear-gradient(135deg, #ffffff 0%, #c8d4e2 70%, #91a6bf 100%)',
    cardBg: 'rgba(11,14,20,.84)',
    cardBorder: '1px solid rgba(197,211,227,.09)',
    cardShadow: '0 26px 64px rgba(0,0,0,.7)',
    cardBackdrop: 'blur(10px) saturate(108%)',
    cardHoverTransform: 'translateY(-2px)',
    buttonBg: 'rgba(21,25,33,.76)',
    buttonBorder: '1px solid rgba(197,211,227,.09)',
    buttonHoverBg: 'rgba(45,53,65,.86)',
    buttonHoverTransform: 'translateY(-1px)',
    glow: 'rgba(137,159,184,.18)',
    linkGap: '.75rem',
  }),
  'classic-blue': defineTheme({
    appearance: 'dark',
    accent: '#9ec5ff',
    bgColor: '#0b1c36',
    bgStars: 'linear-gradient(135deg, #07162c 0%, #123160 48%, #234f8d 100%)',
    text: '#f2f7ff',
    muted: '#bfd0e7',
    heading: 'linear-gradient(135deg, #ffffff 0%, #b9d5ff 52%, #7db2ff 100%)',
    cardBg: 'rgba(8,31,65,.72)',
    cardBorder: '2px solid rgba(158,197,255,.28)',
    cardShadow: '0 20px 44px rgba(2,11,28,.52)',
    cardInset: '0 0 0 1px rgba(255,255,255,.045) inset',
    cardBackdrop: 'blur(16px) saturate(116%)',
    buttonBg: 'rgba(21,61,113,.68)',
    buttonBorder: '1px solid rgba(176,207,255,.32)',
    buttonHoverBg: 'rgba(49,101,171,.94)',
    buttonShadow: '0 5px 0 rgba(3,18,43,.34)',
    buttonHoverShadow: '0 7px 0 rgba(3,18,43,.3)',
    buttonHoverTransform: 'translateY(-2px)',
    badgeRadius: '6px',
    imageBorder: '4px solid rgba(222,235,255,.76)',
    imageShadow: '0 10px 28px rgba(1,17,45,.48)',
    defaultBackground: 'gradient',
  }),
  aurora: defineTheme({
    appearance: 'dark',
    accent: '#84e1a3',
    bgColor: '#06110d',
    bgStars:
      'linear-gradient(128deg, rgba(24,185,116,0) 0%, rgba(24,185,116,.34) 22%, rgba(190,242,100,.14) 38%, rgba(236,72,153,.18) 56%, rgba(168,85,247,.14) 72%, rgba(3,7,18,.06) 100%), radial-gradient(ellipse at bottom, #0d1f17 0%, #06110d 70%)',
    text: '#effff4',
    muted: '#b9e6c7',
    heading: 'linear-gradient(135deg, #ffffff 0%, #9cffac 34%, #f0abfc 72%, #fef7cd 100%)',
    cardBg: 'rgba(5,25,16,.62)',
    cardBorder: '1px solid rgba(190,242,100,.15)',
    cardShadow: '0 26px 66px rgba(2,44,26,.44)',
    cardBackdrop: 'blur(22px) saturate(135%)',
    buttonBg: 'rgba(11,42,28,.56)',
    buttonHoverBg: 'rgba(55,105,70,.54)',
    glow: 'rgba(125,223,155,.3)',
    imageRadius: '44% 56% 48% 52% / 52% 44% 56% 48%',
    defaultImageShape: 'organic',
    decoration:
      'linear-gradient(118deg, transparent 12%, rgba(156,255,172,.08) 38%, rgba(240,171,252,.08) 58%, transparent 82%)',
    decorationOpacity: '.9',
    starfieldEffect: 'aurora-ribbons',
    effectPrimary: '#84e1a3',
    effectSecondary: '#f0abfc',
    effectIntensity: '.76',
    effectSpeed: '.4',
    starColors: ['#fff', '#bbf7d0', '#f5d0fe', '#d9f99d', '#99f6e4'],
  }),
  eclipse: defineTheme({
    appearance: 'dark',
    accent: '#f6c177',
    bgColor: '#080706',
    bgStars: 'linear-gradient(145deg, #100c09 0%, #080706 52%, #19100d 100%)',
    text: '#fff7ec',
    muted: '#e2c5a4',
    heading: 'linear-gradient(135deg, #fffaf3 0%, #f6c177 56%, #d99867 100%)',
    cardBg: 'rgba(18,12,10,.78)',
    cardBorder: '1px solid rgba(246,193,119,.18)',
    cardShadow: '0 28px 72px rgba(0,0,0,.76), 0 0 36px rgba(246,193,119,.08)',
    cardBackdrop: 'blur(12px) saturate(110%)',
    buttonBg: 'rgba(39,27,21,.66)',
    buttonBorder: '1px solid rgba(246,193,119,.17)',
    buttonHoverBg: 'rgba(89,57,37,.78)',
    glow: 'rgba(246,193,119,.24)',
    decoration:
      'linear-gradient(115deg, transparent 12%, rgba(246,193,119,.045) 48%, transparent 72%)',
    decorationOpacity: '.58',
    starfieldEffect: 'eclipse-corona',
    effectPrimary: '#f6c177',
    effectSecondary: '#fff7ec',
    effectIntensity: '.58',
    effectSpeed: '.22',
    starColors: ['#fff', '#fde7c2', '#f6c177', '#ffe6ba', '#d7b08a'],
  }),
  minimal: defineTheme({
    appearance: 'light',
    accent: '#26364a',
    bgColor: '#f3f1eb',
    bgStars:
      'linear-gradient(90deg, transparent 0 12%, rgba(38,54,74,.045) 12% 12.15%, transparent 12.15% 88%, rgba(38,54,74,.045) 88% 88.15%, transparent 88.15%), #f3f1eb',
    text: '#18202a',
    muted: '#56606b',
    heading: 'linear-gradient(135deg, #111820 0%, #3c4d60 100%)',
    cardBg: '#fffdfa',
    cardBorder: '1px solid #d8d4ca',
    cardShadow: '0 12px 34px rgba(40,47,53,.08)',
    cardInset: 'none',
    cardBackdrop: 'none',
    cardHoverTransform: 'translateY(-2px)',
    buttonBg: '#fffdfa',
    buttonBorder: '1px solid #d6d2c8',
    buttonHoverBg: '#ece9e1',
    buttonShadow: 'none',
    buttonHoverShadow: 'none',
    badgeRadius: '3px',
    headingFontFamily: "'Inter', sans-serif",
    headingWeight: '700',
    headingTracking: '-.035em',
    sectionTracking: '.14em',
    linkGap: '.55rem',
    sectionGap: '1.75rem',
    imageBorder: '1px solid #c8c4bb',
    imageShadow: 'none',
    imageRadius: '4px',
    defaultImageShape: 'rounded-square',
    divider: '1px solid #d8d4ca',
    copySuccessBg: '#f4fbf7',
    copySuccessBorder: '2px solid #397058',
    copySuccessShadow: '0 0 0 3px rgba(57,112,88,.13), 0 8px 22px rgba(57,112,88,.12)',
    copySuccessText: '#173f2d',
    defaultBackground: 'minimal',
    defaultButtonStyle: 'minimal',
  }),
  terminal: defineTheme({
    appearance: 'dark',
    accent: '#9cffac',
    bgColor: '#030604',
    bgStars:
      'linear-gradient(rgba(156,255,172,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(156,255,172,.035) 1px, transparent 1px), radial-gradient(ellipse at bottom, #071a0f 0%, #030604 74%)',
    text: '#dfffe6',
    muted: '#98dca5',
    heading: 'linear-gradient(135deg, #effff2 0%, #9cffac 100%)',
    cardBg: 'rgba(1,12,7,.92)',
    cardBorder: '1px solid rgba(156,255,172,.34)',
    cardShadow: '10px 10px 0 rgba(29,76,42,.24)',
    cardInset: 'none',
    cardBackdrop: 'none',
    cardHoverTransform: 'translate(-2px, -2px)',
    cardHoverShadow: '12px 12px 0 rgba(29,76,42,.28)',
    buttonBg: '#061a0e',
    buttonBorder: '1px solid rgba(156,255,172,.28)',
    buttonHoverBg: '#10331d',
    buttonShadow: 'none',
    buttonHoverShadow: 'none',
    buttonHoverTransform: 'translateX(3px)',
    buttonPadding: '.9rem 1rem',
    glow: 'rgba(156,255,172,.22)',
    decoration:
      'linear-gradient(rgba(156,255,172,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(156,255,172,.04) 1px, transparent 1px)',
    decorationSize: '22px 22px',
    decorationOpacity: '.7',
    cardRadius: '0px',
    buttonRadius: '0px',
    radiusPolicy: 'square',
    badgeRadius: '2px',
    imageRadius: '2px',
    defaultImageShape: 'square',
    iconRadius: '2px',
    fontFamily: 'var(--font-mono)',
    headingFontFamily: 'var(--font-mono)',
    headingWeight: '700',
    headingTracking: '-.03em',
    sectionTracking: '.04em',
    sectionTransform: 'none',
    linkGap: '.55rem',
    defaultButtonStyle: 'terminal',
    defaultLayout: 'terminal',
    defaultLinkStyle: 'terminal',
    starfieldEffect: 'terminal-scan',
    effectPrimary: '#9cffac',
    effectSecondary: '#63b974',
    effectIntensity: '.4',
    effectSpeed: '.65',
    starColors: ['#eaffee', '#9cffac', '#70d982', '#c7ffd1', '#63b974'],
  }),
  supernova: defineTheme({
    appearance: 'dark',
    accent: '#ff8a4c',
    bgColor: '#090308',
    bgStars:
      'radial-gradient(circle at 14% 12%, rgba(255,138,76,.42), transparent 24%), radial-gradient(circle at 82% 22%, rgba(236,72,153,.3), transparent 28%), radial-gradient(circle at 46% 96%, rgba(124,58,237,.3), transparent 34%), #090308',
    text: '#fff5f8',
    muted: '#e7bdcf',
    heading: 'linear-gradient(118deg, #fff 0%, #ffc05c 28%, #f15ca7 62%, #b8a1ff 100%)',
    cardBg: 'rgba(30,7,23,.7)',
    cardBorder: '1px solid rgba(255,160,113,.22)',
    cardShadow: '0 30px 76px rgba(92,8,54,.52)',
    cardBackdrop: 'blur(18px) saturate(128%)',
    cardHoverShadow: '0 16px 42px rgba(236,72,153,.24)',
    buttonBg: 'linear-gradient(105deg, rgba(89,31,45,.85), rgba(61,23,71,.82))',
    buttonBorder: '1px solid rgba(255,180,129,.22)',
    buttonHoverBg: 'linear-gradient(105deg, rgba(135,50,48,.92), rgba(102,35,105,.9))',
    glow: 'rgba(255,103,137,.32)',
    headingTracking: '-.02em',
    decoration:
      'radial-gradient(circle at 12% 8%, rgba(255,138,76,.11), transparent 32%), radial-gradient(circle at 88% 76%, rgba(236,72,153,.1), transparent 36%)',
    decorationOpacity: '.72',
    starfieldEffect: 'supernova-bloom',
    effectPrimary: '#ff8a4c',
    effectSecondary: '#ec4899',
    effectIntensity: '.9',
    effectSpeed: '.5',
    starColors: ['#fff', '#ffd2a8', '#ff95c8', '#c4b5fd', '#ffe8c7'],
  }),
  'black-hole': defineTheme({
    appearance: 'dark',
    accent: '#e7e5e4',
    bgColor: '#010101',
    bgStars: 'linear-gradient(125deg, #040405 0%, #090909 58%, #111112 100%)',
    text: '#fafaf9',
    muted: '#b6b3b0',
    heading: 'linear-gradient(135deg, #fff 0%, #d6d3d1 58%, #8b8581 100%)',
    cardBg: 'rgba(7,7,8,.94)',
    cardBorder: '1px solid #292929',
    cardShadow: '0 32px 90px rgba(0,0,0,.96), 0 0 0 1px rgba(255,255,255,.025)',
    cardInset: 'none',
    cardBackdrop: 'none',
    cardHoverTransform: 'translateY(-2px)',
    cardHoverShadow: '0 38px 100px rgba(0,0,0,1)',
    buttonBg: '#0d0d0e',
    buttonBorder: '1px solid #343434',
    buttonHoverBg: '#202022',
    buttonShadow: 'none',
    buttonHoverShadow: '0 0 0 1px #5a5a5a',
    glow: 'rgba(255,255,255,.1)',
    badgeRadius: '3px',
    imageRadius: '50%',
    imageBorder: '2px solid #fafaf9',
    imageShadow: '0 0 0 7px #111, 0 0 0 8px #363636',
    headingFontFamily: "'Inter', sans-serif",
    headingTracking: '-.055em',
    decoration: 'linear-gradient(120deg, transparent 15%, rgba(255,255,255,.025), transparent 74%)',
    decorationOpacity: '.7',
    starfieldEffect: 'black-hole-lensing',
    effectPrimary: '#e7e5e4',
    effectSecondary: '#78716c',
    effectIntensity: '.72',
    effectSpeed: '.28',
    starColors: ['#fff', '#d6d3d1', '#a8a29e', '#fafaf9', '#78716c'],
  }),
  pulsar: defineTheme({
    appearance: 'dark',
    accent: '#67e8f9',
    bgColor: '#020713',
    bgStars: 'linear-gradient(155deg, #020713 0%, #041021 60%, #071629 100%)',
    text: '#effcff',
    muted: '#a9dbe4',
    heading: 'linear-gradient(135deg, #fff 0%, #a5f3fc 52%, #38bdf8 100%)',
    cardBg: 'rgba(3,14,30,.76)',
    cardBorder: '1px solid rgba(103,232,249,.28)',
    cardShadow: '0 28px 68px rgba(0,111,145,.27)',
    cardBackdrop: 'blur(10px) saturate(118%)',
    buttonBg: 'rgba(5,29,54,.7)',
    buttonBorder: '1px solid rgba(103,232,249,.24)',
    buttonHoverBg: 'rgba(8,61,88,.92)',
    buttonHoverShadow: '0 0 24px rgba(103,232,249,.2)',
    buttonHoverTransform: 'translateX(3px)',
    glow: 'rgba(103,232,249,.26)',
    decoration: 'radial-gradient(ellipse at 50% 8%, rgba(165,243,252,.08), transparent 38%)',
    decorationOpacity: '.8',
    starfieldEffect: 'pulsar-beams',
    effectPrimary: '#67e8f9',
    effectSecondary: '#f0f9ff',
    effectIntensity: '.72',
    effectSpeed: '.62',
    starColors: ['#fff', '#cffafe', '#67e8f9', '#bae6fd', '#f0f9ff'],
  }),
  mars: defineTheme({
    appearance: 'dark',
    accent: '#ef9461',
    bgColor: '#160b08',
    bgStars:
      'radial-gradient(circle at 18% 20%, rgba(194,65,28,.28), transparent 30%), radial-gradient(circle at 82% 70%, rgba(217,119,6,.18), transparent 32%), linear-gradient(155deg, #35170f 0%, #1c0d09 48%, #0c0908 100%)',
    text: '#fff1e6',
    muted: '#dfbda7',
    heading: 'linear-gradient(135deg, #fff3e5 0%, #f5a06d 48%, #d66a3e 100%)',
    cardBg: '#2c1711',
    cardBorder: '1px solid #70402f',
    cardShadow: '10px 12px 0 rgba(8,4,3,.34), 0 24px 56px rgba(57,15,5,.32)',
    cardInset: 'none',
    cardBackdrop: 'none',
    buttonBg: '#3a2018',
    buttonBorder: '1px solid #7b4734',
    buttonHoverBg: '#573023',
    buttonShadow: '3px 4px 0 rgba(10,5,3,.32)',
    buttonHoverShadow: '4px 5px 0 rgba(10,5,3,.32)',
    badgeRadius: '5px',
    imageRadius: '16px',
    defaultImageShape: 'rounded-square',
    imageBorder: '3px solid #a66345',
    imageShadow: '6px 8px 0 rgba(9,4,3,.3)',
    decoration: 'linear-gradient(155deg, rgba(239,148,97,.045), transparent 42%)',
    decorationOpacity: '.7',
    starfieldEffect: 'mars-dust',
    effectPrimary: '#ef9461',
    effectSecondary: '#d66a3e',
    effectIntensity: '.66',
    effectSpeed: '.38',
    starColors: ['#ffe8d2', '#f6c7a5', '#fff', '#edaa7c', '#d7c0ad'],
  }),
  starlight: defineTheme({
    appearance: 'light',
    accent: '#356a9a',
    bgColor: '#edf5fc',
    bgStars:
      'radial-gradient(circle at 18% 16%, rgba(125,177,222,.2), transparent 24%), radial-gradient(circle at 86% 24%, rgba(203,213,225,.3), transparent 28%), linear-gradient(180deg, #fff 0%, #e8f2fa 100%)',
    text: '#14283c',
    muted: '#536a7e',
    heading: 'linear-gradient(135deg, #102a43 0%, #356a9a 55%, #71869b 100%)',
    cardBg: 'rgba(255,255,255,.8)',
    cardBorder: '1px solid rgba(53,106,154,.14)',
    cardShadow: '0 24px 64px rgba(39,75,108,.14)',
    cardBackdrop: 'blur(24px) saturate(112%)',
    buttonBg: 'rgba(246,251,255,.76)',
    buttonBorder: '1px solid rgba(53,106,154,.18)',
    buttonHoverBg: '#e3f0fa',
    buttonShadow: '0 7px 20px rgba(39,75,108,.08)',
    buttonHoverShadow: '0 12px 26px rgba(39,75,108,.14)',
    glow: 'rgba(53,106,154,.16)',
    imageBorder: '5px solid rgba(255,255,255,.9)',
    imageShadow: '0 14px 34px rgba(53,106,154,.2)',
    decoration:
      'radial-gradient(circle at 16% 10%, rgba(53,106,154,.08), transparent 28%), radial-gradient(circle at 86% 78%, rgba(125,177,222,.1), transparent 34%)',
    decorationOpacity: '.7',
    copySuccessBg: 'rgba(249,253,255,.96)',
    copySuccessBorder: '2px solid #356a9a',
    copySuccessShadow: '0 0 0 3px rgba(53,106,154,.13), 0 12px 28px rgba(53,106,154,.18)',
    copySuccessText: '#173d60',
    starfieldEffect: 'starlight-glints',
    effectPrimary: '#7db1de',
    effectSecondary: '#ffffff',
    effectIntensity: '.62',
    effectSpeed: '.35',
  }),
  voyager: defineTheme({
    appearance: 'light',
    accent: '#a84727',
    bgColor: '#e9dfca',
    bgStars:
      'linear-gradient(rgba(61,88,104,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(61,88,104,.08) 1px, transparent 1px), linear-gradient(145deg, #f7efdf 0%, #e4d5bc 100%)',
    text: '#222a31',
    muted: '#58636a',
    heading: 'linear-gradient(135deg, #202a32 0%, #456a80 48%, #a84727 100%)',
    cardBg: 'rgba(250,244,231,.94)',
    cardBorder: '2px solid #526875',
    cardShadow: '8px 10px 0 rgba(42,53,58,.14), 0 22px 48px rgba(49,47,38,.12)',
    cardInset: 'none',
    cardBackdrop: 'none',
    cardHoverTransform: 'translate(-2px, -2px)',
    cardHoverShadow: '10px 12px 0 rgba(42,53,58,.16)',
    buttonBg: '#f4ead7',
    buttonBorder: '1px solid #74828a',
    buttonHoverBg: '#e5d4b8',
    buttonShadow: '3px 4px 0 rgba(42,53,58,.14)',
    buttonHoverShadow: '4px 5px 0 rgba(42,53,58,.16)',
    buttonHoverTransform: 'translate(-1px, -1px)',
    badgeRadius: '2px',
    imageRadius: '2px',
    defaultImageShape: 'square',
    iconRadius: '2px',
    fontFamily: "'Inter', sans-serif",
    headingFontFamily: 'var(--font-mono)',
    headingWeight: '700',
    headingTracking: '-.045em',
    sectionTracking: '.12em',
    divider: '1px solid #9b9588',
    copySuccessBg: '#fff9ed',
    copySuccessBorder: '2px solid #a84727',
    copySuccessShadow: '0 0 0 3px rgba(168,71,39,.12), 4px 5px 0 rgba(42,53,58,.14)',
    copySuccessText: '#6f2d18',
    decoration:
      'linear-gradient(rgba(61,88,104,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(61,88,104,.09) 1px, transparent 1px)',
    decorationSize: '28px 28px',
    decorationOpacity: '.42',
    defaultBackground: 'gradient',
    defaultButtonStyle: 'outline',
    starColors: ['#27485f', '#a84727', '#667a86', '#3d5f75', '#83624f'],
  }),
} satisfies Record<ThemePreset, ThemePresetDefinition>;

export interface ThemeStyleConfig {
  preset: ThemePreset;
  accent: string;
  background: ThemeBackground;
  cardRadius?: RadiusValue;
  buttonRadius?: RadiusValue;
}

export function isLegacyThemePreset(value: string): value is LegacyThemePreset {
  return Object.hasOwn(LEGACY_THEME_PRESET_ALIASES, value);
}

export function resolveThemePreset(preset: ThemeInputPreset): ThemePreset {
  return isLegacyThemePreset(preset) ? LEGACY_THEME_PRESET_ALIASES[preset] : preset;
}

export function getThemePresetDefinition(preset: ThemePreset): ThemePresetDefinition {
  return THEME_PRESETS[preset];
}

export function getThemePresetTokens(theme: ThemeStyleConfig): ThemePresetDefinition {
  const preset = getThemePresetDefinition(theme.preset);
  return { ...preset, accent: theme.accent || preset.accent };
}

export function resolveProfileImageShape(
  preset: ThemePreset,
  shape?: ProfileImageShape
): ResolvedProfileImageShape {
  return shape || getThemePresetDefinition(preset).defaultImageShape;
}

export function getThemeStyle(theme: ThemeStyleConfig, imageShape?: ProfileImageShape): string {
  const tokens = getThemePresetTokens(theme);
  const background = theme.background === 'gradient' ? tokens.bgStars : tokens.bgColor;
  const starsBackground = theme.background === 'starfield' ? tokens.bgStars : 'transparent';
  const imageRadius =
    imageShape === 'circle'
      ? '50%'
      : imageShape === 'square'
        ? '0px'
        : imageShape === 'rounded-square'
          ? tokens.roundedImageRadius
          : tokens.imageRadius;
  const cardRadius =
    tokens.radiusPolicy === 'square'
      ? '0px'
      : radiusValueToCss(theme.cardRadius, tokens.cardRadius);
  const buttonRadius =
    tokens.radiusPolicy === 'square'
      ? '0px'
      : radiusValueToCss(theme.buttonRadius, tokens.buttonRadius);
  const [cardRadiusTopLeft, cardRadiusTopRight, cardRadiusBottomRight, cardRadiusBottomLeft] =
    radiusCssToCorners(cardRadius);
  const [
    buttonRadiusTopLeft,
    buttonRadiusTopRight,
    buttonRadiusBottomRight,
    buttonRadiusBottomLeft,
  ] = radiusCssToCorners(buttonRadius);

  const variables: Record<string, string> = {
    '--accent-color': tokens.accent,
    '--bg-color': background,
    '--bg-stars': starsBackground,
    '--text-color': tokens.text,
    '--muted-color': tokens.muted,
    '--heading-gradient': tokens.heading,
    '--card-bg': tokens.cardBg,
    '--card-border': tokens.cardBorder,
    '--card-shadow': tokens.cardShadow,
    '--card-inset': tokens.cardInset,
    '--card-backdrop': tokens.cardBackdrop,
    '--card-hover-transform': tokens.cardHoverTransform,
    '--card-hover-shadow': tokens.cardHoverShadow,
    '--card-padding': tokens.cardPadding,
    '--card-padding-wide': tokens.cardPaddingWide,
    '--btn-bg': tokens.buttonBg,
    '--btn-border': tokens.buttonBorder,
    '--btn-hover-bg': tokens.buttonHoverBg,
    '--btn-shadow': tokens.buttonShadow,
    '--btn-hover-shadow': tokens.buttonHoverShadow,
    '--btn-hover-transform': tokens.buttonHoverTransform,
    '--btn-active-transform': tokens.buttonActiveTransform,
    '--btn-padding': tokens.buttonPadding,
    '--theme-glow': tokens.glow,
    '--status-bg': tokens.statusBg,
    '--modal-bg': tokens.modalBg,
    '--modal-border': tokens.modalBorder,
    '--modal-shadow': tokens.modalShadow,
    '--modal-backdrop': tokens.modalBackdrop,
    '--tooltip-bg': tokens.tooltipBg,
    '--tooltip-text': tokens.tooltipText,
    '--tooltip-muted': tokens.tooltipMuted,
    '--tooltip-accent': tokens.tooltipAccent,
    '--tooltip-divider': tokens.tooltipDivider,
    '--tooltip-border': tokens.tooltipBorder,
    '--tooltip-shadow': tokens.tooltipShadow,
    '--focus-color': tokens.accent,
    '--focus-width': tokens.focusWidth,
    '--focus-offset': tokens.focusOffset,
    '--copy-success-bg': tokens.copySuccessBg,
    '--copy-success-border': tokens.copySuccessBorder,
    '--copy-success-shadow': tokens.copySuccessShadow,
    '--copy-success-text': tokens.copySuccessText,
    '--copy-error-bg': tokens.copyErrorBg,
    '--copy-error-border': tokens.copyErrorBorder,
    '--copy-error-text': tokens.copyErrorText,
    '--announcement-bg': tokens.announcementBg,
    '--announcement-border': tokens.announcementBorder,
    '--announcement-shadow': tokens.announcementShadow,
    '--img-border': tokens.imageBorder,
    '--img-shadow': tokens.imageShadow,
    '--img-radius': imageRadius,
    '--img-hover-transform': tokens.imageHoverTransform,
    '--icon-bg': tokens.iconBg,
    '--icon-border': tokens.iconBorder,
    '--icon-radius': tokens.iconRadius,
    '--divider': tokens.divider,
    '--theme-decoration': tokens.decoration,
    '--theme-decoration-opacity': tokens.decorationOpacity,
    '--theme-decoration-size': tokens.decorationSize,
    '--card-radius': cardRadius,
    '--card-radius-top-left': cardRadiusTopLeft,
    '--card-radius-top-right': cardRadiusTopRight,
    '--card-radius-bottom-right': cardRadiusBottomRight,
    '--card-radius-bottom-left': cardRadiusBottomLeft,
    '--button-radius': buttonRadius,
    '--button-radius-top-left': buttonRadiusTopLeft,
    '--button-radius-top-right': buttonRadiusTopRight,
    '--button-radius-bottom-right': buttonRadiusBottomRight,
    '--button-radius-bottom-left': buttonRadiusBottomLeft,
    '--badge-radius': tokens.badgeRadius,
    '--modal-radius': cardRadius,
    '--tooltip-radius': buttonRadius,
    '--theme-font-family': tokens.fontFamily,
    '--heading-font-family': tokens.headingFontFamily,
    '--heading-weight': tokens.headingWeight,
    '--heading-tracking': tokens.headingTracking,
    '--heading-transform': tokens.headingTransform,
    '--heading-shadow': tokens.headingShadow,
    '--section-tracking': tokens.sectionTracking,
    '--section-transform': tokens.sectionTransform,
    '--link-gap': tokens.linkGap,
    '--section-gap': tokens.sectionGap,
    '--effect-primary': tokens.effectPrimary,
    '--effect-secondary': tokens.effectSecondary,
    '--effect-intensity': tokens.effectIntensity,
    '--effect-speed': tokens.effectSpeed,
  };

  return [
    `color-scheme: ${tokens.appearance}`,
    ...Object.entries(variables).map(([name, value]) => `${name}: ${value}`),
    ...tokens.starColors.map((color, index) => `--star-color-${index + 1}: ${color}`),
  ].join('; ');
}

export function radiusValueToCss(value: RadiusValue | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return `${value}px`;
  return `${value[0]}px ${value[1]}px`;
}

function radiusCssToCorners(value: string): readonly [string, string, string, string] {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}
