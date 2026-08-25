export const THEME_PRESET_NAMES = [
  'nebula',
  'midnight',
  'classic-blue',
  'aurora',
  'eclipse',
  'cosmic-gold',
  'minimal',
  'terminal',
  'supernova',
  'black-hole',
  'pulsar',
  'andromeda',
  'mars',
  'lunar',
  'solar-flare',
  'deep-space',
  'starlight',
  'event-horizon',
  'quasar',
  'voyager',
  'apollo',
  'alien',
  'cyber-orbit',
  'ice-moon',
  'titan',
  'saturn',
  'red-giant',
  'white-dwarf',
] as const;

export type ThemePreset = (typeof THEME_PRESET_NAMES)[number];
export type ThemeAppearance = 'dark' | 'light';
type ThemeBackground = 'starfield' | 'gradient' | 'minimal';
type ButtonStyle = 'glass' | 'solid' | 'outline' | 'minimal' | 'terminal';
type StarColors = readonly [string, string, string, string, string];

export interface ThemePresetDefinition {
  appearance: ThemeAppearance;
  accent: string;
  bgColor: string;
  bgStars: string;
  text: string;
  muted: string;
  heading: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  buttonBg: string;
  buttonBorder: string;
  buttonHoverBg: string;
  glow: string;
  statusBg: string;
  modalBg: string;
  tooltipBg: string;
  announcementBg?: string;
  announcementBorder?: string;
  announcementShadow?: string;
  imageBorder?: string;
  imageShadow?: string;
  decoration?: string;
  decorationOpacity?: string;
  decorationSize?: string;
  cardRadius?: string;
  buttonRadius?: string;
  fontFamily?: string;
  starColors?: StarColors;
  defaultBackground?: ThemeBackground;
  defaultButtonStyle?: ButtonStyle;
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

const darkStars: StarColors = ['#ffffff', '#ffe9c4', '#d4fbff', '#d4fbff', '#b3cde0'];
const lightStars: StarColors = ['#24476b', '#4f6f8f', '#7b8fa5', '#315f86', '#7890a8'];

function defineTheme(seed: ThemeSeed): ThemePresetDefinition {
  const light = seed.appearance === 'light';
  return {
    ...seed,
    cardBorder:
      seed.cardBorder ||
      `1px solid color-mix(in srgb, ${seed.accent} ${light ? '20%' : '18%'}, transparent)`,
    cardShadow:
      seed.cardShadow ||
      (light ? '0 24px 58px rgba(29, 50, 72, 0.15)' : '0 24px 62px rgba(0, 0, 0, 0.58)'),
    buttonBg: seed.buttonBg || `color-mix(in srgb, ${seed.cardBg} 86%, ${seed.accent})`,
    buttonBorder:
      seed.buttonBorder ||
      `1px solid color-mix(in srgb, ${seed.accent} ${light ? '22%' : '20%'}, transparent)`,
    buttonHoverBg: seed.buttonHoverBg || `color-mix(in srgb, ${seed.cardBg} 62%, ${seed.accent})`,
    glow: seed.glow || `color-mix(in srgb, ${seed.accent} ${light ? '24%' : '42%'}, transparent)`,
    statusBg: seed.statusBg || `color-mix(in srgb, ${seed.cardBg} 92%, ${seed.accent})`,
    modalBg:
      seed.modalBg || `color-mix(in srgb, ${seed.cardBg} 96%, ${light ? '#ffffff' : '#000000'})`,
    tooltipBg:
      seed.tooltipBg || `color-mix(in srgb, ${seed.cardBg} 98%, ${light ? '#ffffff' : '#000000'})`,
  };
}

export const THEME_PRESETS = {
  nebula: defineTheme({
    appearance: 'dark',
    accent: '#d8b4fe',
    bgColor: '#070711',
    bgStars:
      'radial-gradient(circle at 18% 18%, rgba(216, 180, 254, 0.24), transparent 28%), radial-gradient(circle at 82% 24%, rgba(94, 234, 212, 0.16), transparent 30%), radial-gradient(ellipse at bottom, #21172f 0%, #070711 72%)',
    text: '#f4f0ff',
    muted: '#c9c1dc',
    heading: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 46%, #99f6e4 100%)',
    cardBg: 'rgba(15, 13, 25, 0.78)',
    cardBorder: '1px solid rgba(255, 255, 255, 0.11)',
    cardShadow: '0 24px 58px rgba(9, 7, 18, 0.68)',
    buttonBg: 'rgba(24, 22, 35, 0.68)',
    buttonBorder: '1px solid rgba(255, 255, 255, 0.1)',
    buttonHoverBg: 'rgba(121, 116, 153, 0.3)',
    glow: 'rgba(216, 180, 254, 0.34)',
    statusBg: 'rgba(18, 16, 29, 0.9)',
    modalBg: 'rgba(12, 10, 20, 0.93)',
    tooltipBg: 'rgba(12, 10, 20, 0.96)',
  }),
  midnight: defineTheme({
    appearance: 'dark',
    accent: '#b0c4de',
    bgColor: '#090a0f',
    bgStars: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
    text: '#e0e7ff',
    muted: '#b0c4de',
    heading: 'linear-gradient(135deg, #e0e7ff 0%, #b0c4de 50%, #ffffff 100%)',
    cardBg: 'rgba(15, 17, 25, 0.75)',
    cardBorder: '1px solid rgba(255, 255, 255, 0.08)',
    cardShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
    buttonBg: 'rgba(20, 22, 30, 0.6)',
    buttonBorder: '1px solid rgba(255, 255, 255, 0.08)',
    buttonHoverBg: 'rgba(176, 196, 222, 0.4)',
    glow: 'rgba(176, 196, 222, 0.42)',
    statusBg: 'rgba(20, 22, 30, 0.8)',
    modalBg: 'rgba(15, 17, 25, 0.9)',
    tooltipBg: 'rgba(15, 17, 25, 0.95)',
  }),
  'classic-blue': defineTheme({
    appearance: 'dark',
    accent: '#b0c4de',
    bgColor: 'linear-gradient(135deg, #0b1c36 0%, #1a2a4d 40%, #2a3b65 100%)',
    bgStars: 'transparent',
    text: '#e0e7ff',
    muted: '#b0c4de',
    heading: 'linear-gradient(135deg, #e0e7ff 0%, #b0c4de 50%, #ffffff 100%)',
    cardBg: 'rgba(11, 28, 54, 0.6)',
    cardBorder: '1px solid rgba(176, 196, 222, 0.25)',
    cardShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    buttonBg: 'rgba(42, 59, 101, 0.6)',
    buttonBorder: '1px solid rgba(176, 196, 222, 0.3)',
    buttonHoverBg: 'rgba(176, 196, 222, 0.4)',
    glow: 'rgba(176, 196, 222, 0.4)',
    statusBg: '#1a2a4d',
    modalBg: 'rgba(11, 28, 54, 0.8)',
    tooltipBg: '#0b1c36',
    announcementBg: 'rgba(251, 191, 36, 0.25)',
    announcementBorder: '1px solid rgba(251, 191, 36, 0.5)',
    announcementShadow: '0 0 25px rgba(251, 191, 36, 0.4)',
    imageBorder: '4px solid rgba(224, 231, 255, 0.7)',
    imageShadow: '0 0 25px rgba(176, 196, 222, 0.4)',
  }),
  aurora: defineTheme({
    appearance: 'dark',
    accent: '#7ddf9b',
    bgColor: '#06110d',
    bgStars:
      'linear-gradient(130deg, rgba(24,185,116,0) 0%, rgba(24,185,116,.34) 22%, rgba(190,242,100,.16) 38%, rgba(236,72,153,.2) 56%, rgba(168,85,247,.16) 72%, rgba(3,7,18,.08) 100%), radial-gradient(ellipse at bottom, #0d1f17 0%, #06110d 70%)',
    text: '#ecfff3',
    muted: '#b7eac7',
    heading: 'linear-gradient(135deg, #ffffff 0%, #9cffac 34%, #f0abfc 72%, #fef7cd 100%)',
    cardBg: 'rgba(6, 22, 15, 0.78)',
    cardBorder: '1px solid rgba(190, 242, 100, 0.13)',
    cardShadow: '0 24px 58px rgba(2, 44, 26, 0.5)',
    buttonBg: 'rgba(11, 42, 28, 0.6)',
    buttonBorder: '1px solid rgba(236, 253, 245, 0.12)',
    buttonHoverBg: 'rgba(61, 109, 76, 0.36)',
    glow: 'rgba(125, 223, 155, 0.4)',
    statusBg: 'rgba(7, 38, 25, 0.9)',
    modalBg: 'rgba(4, 22, 14, 0.93)',
    tooltipBg: 'rgba(4, 22, 14, 0.96)',
  }),
  eclipse: defineTheme({
    appearance: 'dark',
    accent: '#f6c177',
    bgColor: '#080706',
    bgStars:
      'radial-gradient(circle at 50% 28%, rgba(246,193,119,.24) 0 8%, rgba(246,193,119,.08) 9% 16%, transparent 18%), radial-gradient(circle at 52% 30%, #020202 0 13%, transparent 14%), radial-gradient(ellipse at bottom, #26151a 0%, #080706 74%)',
    text: '#fff6ea',
    muted: '#e8c9a6',
    heading: 'linear-gradient(135deg, #fff6ea 0%, #f6c177 48%, #f4a7a1 100%)',
    cardBg: 'rgba(22, 14, 14, 0.78)',
    cardBorder: '1px solid rgba(246, 193, 119, 0.12)',
    cardShadow: '0 24px 58px rgba(0, 0, 0, 0.68)',
    buttonBg: 'rgba(37, 24, 22, 0.62)',
    buttonBorder: '1px solid rgba(255, 255, 255, 0.1)',
    buttonHoverBg: 'rgba(116, 72, 57, 0.34)',
    glow: 'rgba(246, 193, 119, 0.36)',
    statusBg: 'rgba(31, 20, 18, 0.9)',
    modalBg: 'rgba(17, 11, 11, 0.94)',
    tooltipBg: 'rgba(17, 11, 11, 0.97)',
  }),
  'cosmic-gold': defineTheme({
    appearance: 'dark',
    accent: '#f7d06b',
    bgColor: '#0a0804',
    bgStars:
      'radial-gradient(circle at 24% 18%, rgba(247,208,107,.22), transparent 26%), radial-gradient(circle at 86% 62%, rgba(168,139,92,.18), transparent 28%), radial-gradient(ellipse at bottom, #2a2110 0%, #0a0804 72%)',
    text: '#fff8e7',
    muted: '#dbc99b',
    heading: 'linear-gradient(135deg, #fffaf0 0%, #f7d06b 45%, #ffffff 100%)',
    cardBg: 'rgba(23, 18, 10, 0.78)',
    cardBorder: '1px solid rgba(247, 208, 107, 0.13)',
    cardShadow: '0 24px 58px rgba(59, 42, 8, 0.42)',
    buttonBg: 'rgba(42, 31, 14, 0.62)',
    buttonBorder: '1px solid rgba(255, 255, 255, 0.1)',
    buttonHoverBg: 'rgba(112, 87, 39, 0.34)',
    glow: 'rgba(247, 208, 107, 0.38)',
    statusBg: 'rgba(38, 28, 12, 0.9)',
    modalBg: 'rgba(20, 15, 8, 0.94)',
    tooltipBg: 'rgba(20, 15, 8, 0.97)',
  }),
  minimal: defineTheme({
    appearance: 'light',
    accent: '#334155',
    bgColor: '#f7f8fb',
    bgStars:
      'radial-gradient(circle at 20% 16%, rgba(148,163,184,.22), transparent 26%), linear-gradient(180deg, #fff 0%, #eef2f7 100%)',
    text: '#121826',
    muted: '#526074',
    heading: 'linear-gradient(135deg, #111827 0%, #475569 100%)',
    cardBg: 'rgba(255,255,255,.82)',
    cardBorder: '1px solid rgba(15,23,42,.1)',
    cardShadow: '0 24px 58px rgba(15,23,42,.13)',
    buttonBg: 'rgba(255,255,255,.78)',
    buttonBorder: '1px solid rgba(15,23,42,.12)',
    buttonHoverBg: 'rgba(226,232,240,.84)',
    glow: 'rgba(100,116,139,.24)',
    statusBg: 'rgba(255,255,255,.94)',
    modalBg: 'rgba(255,255,255,.96)',
    tooltipBg: 'rgba(255,255,255,.98)',
    defaultBackground: 'minimal',
    starColors: lightStars,
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
    cardBg: 'rgba(1,12,7,.84)',
    cardBorder: '1px solid rgba(156,255,172,.24)',
    cardShadow: '0 24px 58px rgba(0,0,0,.64)',
    buttonBg: 'rgba(5,25,13,.84)',
    buttonBorder: '1px solid rgba(156,255,172,.18)',
    buttonHoverBg: 'rgba(29,76,42,.42)',
    glow: 'rgba(156,255,172,.32)',
    statusBg: 'rgba(5,25,13,.94)',
    modalBg: 'rgba(1,12,7,.96)',
    tooltipBg: 'rgba(1,12,7,.98)',
    decoration:
      'linear-gradient(rgba(156,255,172,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(156,255,172,.045) 1px, transparent 1px)',
    decorationSize: '22px 22px',
    decorationOpacity: '.7',
    fontFamily: 'var(--font-mono)',
    defaultButtonStyle: 'terminal',
  }),

  supernova: defineTheme({
    appearance: 'dark',
    accent: '#ff7a3d',
    bgColor: '#050204',
    bgStars:
      'radial-gradient(circle at 18% 18%, rgba(255,122,61,.35), transparent 22%), radial-gradient(circle at 76% 26%, rgba(236,72,153,.28), transparent 27%), radial-gradient(circle at 48% 94%, rgba(124,58,237,.26), transparent 32%), #050204',
    text: '#fff4f8',
    muted: '#e8b8ce',
    heading: 'linear-gradient(120deg, #fff 0%, #ffb14e 28%, #ec4899 62%, #a78bfa 100%)',
    cardBg: 'rgba(20,7,18,.78)',
    cardShadow: '0 24px 62px rgba(92,8,54,.52)',
    decoration:
      'radial-gradient(circle at 18% 16%, rgba(255,214,166,.8) 0 1px, transparent 2px), radial-gradient(circle at 78% 24%, rgba(255,128,190,.8) 0 1px, transparent 2px)',
    decorationSize: '54px 54px, 70px 70px',
    decorationOpacity: '.35',
    starColors: ['#fff', '#ffd2a8', '#ff95c8', '#c4b5fd', '#ffe8c7'],
  }),
  'black-hole': defineTheme({
    appearance: 'dark',
    accent: '#d6d3d1',
    bgColor: '#020202',
    bgStars:
      'radial-gradient(circle at 50% 24%, #000 0 9%, rgba(0,0,0,.98) 10%, rgba(214,211,209,.18) 11%, rgba(168,85,247,.08) 13%, transparent 20%), radial-gradient(ellipse at bottom, #0b0b0d 0%, #020202 74%)',
    text: '#f5f5f4',
    muted: '#b4b0ad',
    heading: 'linear-gradient(135deg, #fff 0%, #c7c4c1 58%, #8b8581 100%)',
    cardBg: 'rgba(5,5,6,.9)',
    cardShadow:
      '0 0 0 1px rgba(255,255,255,.025), 0 28px 80px rgba(0,0,0,.9), 0 0 45px rgba(168,85,247,.08)',
    decoration:
      'repeating-radial-gradient(circle at 50% 18%, transparent 0 54px, rgba(231,229,228,.12) 55px, transparent 56px 72px)',
    decorationOpacity: '.32',
    buttonRadius: '10px',
  }),
  pulsar: defineTheme({
    appearance: 'dark',
    accent: '#67e8f9',
    bgColor: '#020713',
    bgStars:
      'radial-gradient(circle at 50% 16%, rgba(255,255,255,.32) 0 1%, rgba(34,211,238,.28) 2%, transparent 12%), linear-gradient(110deg, transparent 35%, rgba(34,211,238,.08) 48%, rgba(255,255,255,.15) 50%, rgba(34,211,238,.08) 52%, transparent 65%), radial-gradient(ellipse at bottom, #071a35 0%, #020713 72%)',
    text: '#effcff',
    muted: '#a9dbe4',
    heading: 'linear-gradient(135deg, #fff 0%, #a5f3fc 52%, #38bdf8 100%)',
    cardBg: 'rgba(3,14,30,.8)',
    cardShadow: '0 24px 62px rgba(0,111,145,.3)',
    decoration:
      'linear-gradient(90deg, transparent 0 47%, rgba(165,243,252,.12) 50%, transparent 53%), linear-gradient(transparent 0 47%, rgba(165,243,252,.08) 50%, transparent 53%)',
    decorationOpacity: '.7',
    starColors: ['#fff', '#cffafe', '#67e8f9', '#bae6fd', '#f0f9ff'],
  }),
  andromeda: defineTheme({
    appearance: 'dark',
    accent: '#c4b5fd',
    bgColor: '#12101b',
    bgStars:
      'radial-gradient(circle at 24% 20%, rgba(244,181,205,.22), transparent 28%), radial-gradient(circle at 78% 24%, rgba(164,183,209,.22), transparent 30%), radial-gradient(ellipse at bottom, #292438 0%, #12101b 72%)',
    text: '#fbf7ff',
    muted: '#cfc5d8',
    heading: 'linear-gradient(135deg, #fff 0%, #d8b4fe 46%, #f9a8d4 74%, #b9ccdf 100%)',
    cardBg: 'rgba(29,25,42,.76)',
    cardShadow: '0 24px 62px rgba(34,23,55,.54)',
    decoration: 'radial-gradient(circle, rgba(255,255,255,.42) 0 1px, transparent 1.5px)',
    decorationSize: '38px 38px',
    decorationOpacity: '.28',
    starColors: ['#fff', '#fbcfe8', '#ddd6fe', '#cbd5e1', '#e9d5ff'],
  }),
  mars: defineTheme({
    appearance: 'dark',
    accent: '#e9824c',
    bgColor: '#160b08',
    bgStars:
      'radial-gradient(circle at 18% 20%, rgba(194,65,28,.3), transparent 30%), radial-gradient(circle at 82% 70%, rgba(217,119,6,.2), transparent 32%), linear-gradient(155deg, #35170f 0%, #1c0d09 48%, #0c0908 100%)',
    text: '#fff1e6',
    muted: '#d9b39c',
    heading: 'linear-gradient(135deg, #fff3e5 0%, #f59e62 48%, #d65f35 100%)',
    cardBg: 'rgba(40,19,13,.8)',
    cardShadow: '0 24px 62px rgba(57,15,5,.55)',
    decoration:
      'linear-gradient(165deg, transparent 0 48%, rgba(231,151,104,.08) 49%, transparent 51%)',
    decorationSize: '68px 68px',
    decorationOpacity: '.55',
    starColors: ['#ffe8d2', '#f6c7a5', '#fff', '#edaa7c', '#d7c0ad'],
  }),
  lunar: defineTheme({
    appearance: 'dark',
    accent: '#cbd5e1',
    bgColor: '#0b0d11',
    bgStars:
      'radial-gradient(circle at 22% 18%, rgba(226,232,240,.18), transparent 23%), radial-gradient(circle at 78% 80%, rgba(125,211,252,.1), transparent 30%), linear-gradient(155deg, #1b2029 0%, #0b0d11 68%)',
    text: '#f8fafc',
    muted: '#b8c0cc',
    heading: 'linear-gradient(135deg, #fff 0%, #cbd5e1 56%, #a5dff8 100%)',
    cardBg: 'rgba(20,23,29,.82)',
    decoration:
      'radial-gradient(circle at 25% 25%, rgba(255,255,255,.1) 0 2px, transparent 3px), radial-gradient(circle at 72% 58%, rgba(255,255,255,.07) 0 4px, transparent 5px)',
    decorationSize: '90px 90px',
    decorationOpacity: '.65',
  }),
  'solar-flare': defineTheme({
    appearance: 'dark',
    accent: '#fbbf24',
    bgColor: '#080402',
    bgStars:
      'radial-gradient(circle at 100% 18%, rgba(255,246,163,.5) 0 2%, rgba(251,191,36,.34) 6%, rgba(239,68,68,.22) 16%, transparent 35%), radial-gradient(circle at 0 82%, rgba(249,115,22,.22), transparent 30%), #080402',
    text: '#fff8e7',
    muted: '#e8c59b',
    heading: 'linear-gradient(135deg, #fffbea 0%, #facc15 40%, #fb923c 72%, #ef4444 100%)',
    cardBg: 'rgba(28,13,5,.82)',
    cardShadow: '0 24px 64px rgba(128,36,4,.46)',
    decoration: 'radial-gradient(ellipse at 100% 0, rgba(253,224,71,.28), transparent 42%)',
    decorationOpacity: '.65',
    starColors: ['#fff', '#fef3c7', '#fdba74', '#fde68a', '#fff7ed'],
  }),
  'deep-space': defineTheme({
    appearance: 'dark',
    accent: '#93c5fd',
    bgColor: '#01040a',
    bgStars:
      'radial-gradient(circle at 70% 20%, rgba(59,130,246,.1), transparent 25%), radial-gradient(ellipse at bottom, #07111f 0%, #01040a 74%)',
    text: '#edf4ff',
    muted: '#a8b7ca',
    heading: 'linear-gradient(135deg, #fff 0%, #bfdbfe 58%, #7aa7d9 100%)',
    cardBg: 'rgba(4,9,17,.84)',
    cardBorder: '1px solid rgba(147,197,253,.1)',
    cardShadow: '0 28px 72px rgba(0,0,0,.76)',
    decoration: 'radial-gradient(circle, rgba(191,219,254,.32) 0 .7px, transparent 1.3px)',
    decorationSize: '64px 64px',
    decorationOpacity: '.22',
    starColors: ['#fff', '#dbeafe', '#93c5fd', '#e0f2fe', '#b6cce5'],
  }),
  starlight: defineTheme({
    appearance: 'light',
    accent: '#356a9a',
    bgColor: '#edf5fc',
    bgStars:
      'radial-gradient(circle at 18% 16%, rgba(125,177,222,.22), transparent 24%), radial-gradient(circle at 86% 24%, rgba(203,213,225,.34), transparent 28%), linear-gradient(180deg, #fff 0%, #e8f2fa 100%)',
    text: '#15283b',
    muted: '#52687c',
    heading: 'linear-gradient(135deg, #102a43 0%, #356a9a 55%, #71869b 100%)',
    cardBg: 'rgba(255,255,255,.84)',
    cardShadow: '0 24px 58px rgba(39,75,108,.15)',
    decoration: 'radial-gradient(circle, rgba(53,106,154,.3) 0 1px, transparent 1.5px)',
    decorationSize: '46px 46px',
    decorationOpacity: '.28',
    starColors: lightStars,
  }),
  'event-horizon': defineTheme({
    appearance: 'dark',
    accent: '#efb366',
    bgColor: '#030204',
    bgStars:
      'radial-gradient(ellipse at 50% 18%, #000 0 9%, rgba(0,0,0,.96) 10%, rgba(239,179,102,.26) 12%, rgba(126,34,206,.18) 15%, transparent 26%), radial-gradient(ellipse at bottom, #14091c 0%, #030204 72%)',
    text: '#fff8ee',
    muted: '#d7c0ab',
    heading: 'linear-gradient(135deg, #fff 0%, #f0bd78 50%, #c084fc 100%)',
    cardBg: 'rgba(10,6,12,.86)',
    cardShadow: '0 28px 72px rgba(0,0,0,.8), 0 0 35px rgba(126,34,206,.12)',
    decoration:
      'repeating-radial-gradient(ellipse at 50% 12%, transparent 0 62px, rgba(239,179,102,.11) 63px, rgba(126,34,206,.08) 65px, transparent 68px 83px)',
    decorationOpacity: '.48',
    starColors: ['#fff', '#fde7c2', '#d8b4fe', '#f5d0a9', '#e9d5ff'],
  }),
  quasar: defineTheme({
    appearance: 'dark',
    accent: '#60a5fa',
    bgColor: '#070318',
    bgStars:
      'radial-gradient(circle at 50% 18%, rgba(255,255,255,.34) 0 1%, rgba(96,165,250,.32) 3%, rgba(217,70,239,.24) 10%, transparent 25%), radial-gradient(circle at 18% 72%, rgba(124,58,237,.3), transparent 30%), radial-gradient(circle at 86% 66%, rgba(236,72,153,.25), transparent 28%), #070318',
    text: '#f8f5ff',
    muted: '#c8bce0',
    heading: 'linear-gradient(120deg, #fff 0%, #60a5fa 34%, #a78bfa 62%, #f472b6 100%)',
    cardBg: 'rgba(14,8,39,.78)',
    cardShadow: '0 26px 66px rgba(52,15,111,.5)',
    decoration: 'radial-gradient(circle at 50% 8%, rgba(255,255,255,.28), transparent 18%)',
    decorationOpacity: '.7',
    starColors: ['#fff', '#bfdbfe', '#e9d5ff', '#fbcfe8', '#93c5fd'],
  }),
  voyager: defineTheme({
    appearance: 'light',
    accent: '#b8562f',
    bgColor: '#e9dfca',
    bgStars:
      'linear-gradient(rgba(61,88,104,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(61,88,104,.08) 1px, transparent 1px), linear-gradient(145deg, #f7efdf 0%, #e4d5bc 100%)',
    text: '#222a31',
    muted: '#59646b',
    heading: 'linear-gradient(135deg, #202a32 0%, #456a80 48%, #b8562f 100%)',
    cardBg: 'rgba(250,244,231,.88)',
    cardShadow: '8px 10px 0 rgba(42,53,58,.12), 0 22px 48px rgba(49,47,38,.14)',
    decoration:
      'linear-gradient(rgba(61,88,104,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(61,88,104,.1) 1px, transparent 1px)',
    decorationSize: '24px 24px',
    decorationOpacity: '.55',
    cardRadius: '18px',
    buttonRadius: '8px',
    fontFamily: 'var(--font-mono)',
    starColors: lightStars,
  }),
  apollo: defineTheme({
    appearance: 'light',
    accent: '#b7432d',
    bgColor: '#ece8dd',
    bgStars:
      'radial-gradient(circle at 84% 14%, rgba(22,43,72,.12), transparent 23%), linear-gradient(155deg, #faf8f1 0%, #e6e1d3 100%)',
    text: '#14243b',
    muted: '#586577',
    heading: 'linear-gradient(135deg, #10213a 0%, #25496f 60%, #b7432d 100%)',
    cardBg: 'rgba(252,250,243,.9)',
    cardShadow: '0 24px 52px rgba(20,36,59,.14)',
    decoration:
      'linear-gradient(115deg, transparent 0 46%, rgba(20,36,59,.08) 47%, rgba(183,67,45,.1) 49%, transparent 51%)',
    decorationSize: '90px 90px',
    decorationOpacity: '.5',
    cardRadius: '20px',
    buttonRadius: '10px',
    starColors: lightStars,
  }),
  alien: defineTheme({
    appearance: 'dark',
    accent: '#b7ff3c',
    bgColor: '#030504',
    bgStars:
      'radial-gradient(circle at 22% 22%, rgba(183,255,60,.2), transparent 27%), radial-gradient(circle at 80% 28%, rgba(168,85,247,.3), transparent 32%), radial-gradient(ellipse at bottom, #101324 0%, #030504 74%)',
    text: '#f2ffe4',
    muted: '#bad39e',
    heading: 'linear-gradient(135deg, #f8ffe9 0%, #b7ff3c 42%, #c084fc 76%, #fff 100%)',
    cardBg: 'rgba(8,15,11,.8)',
    cardShadow: '0 25px 64px rgba(79,20,127,.42)',
    decoration:
      'radial-gradient(ellipse at 50% 20%, rgba(183,255,60,.14) 0 5%, transparent 6%), radial-gradient(ellipse at 50% 20%, transparent 0 12%, rgba(192,132,252,.1) 13%, transparent 15%)',
    decorationSize: '120px 82px',
    decorationOpacity: '.65',
    starColors: ['#f8ffe9', '#b7ff3c', '#d8b4fe', '#fff', '#d9f99d'],
  }),
  'cyber-orbit': defineTheme({
    appearance: 'dark',
    accent: '#22d3ee',
    bgColor: '#050711',
    bgStars:
      'linear-gradient(rgba(34,211,238,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,.04) 1px, transparent 1px), radial-gradient(circle at 20% 18%, rgba(34,211,238,.2), transparent 25%), radial-gradient(circle at 82% 74%, rgba(236,72,153,.2), transparent 28%), #050711',
    text: '#effdff',
    muted: '#acd2db',
    heading: 'linear-gradient(120deg, #fff 0%, #22d3ee 44%, #f472b6 100%)',
    cardBg: 'rgba(6,12,27,.82)',
    cardShadow: '0 24px 62px rgba(0,166,190,.2), 0 0 30px rgba(236,72,153,.1)',
    decoration:
      'repeating-radial-gradient(ellipse at 50% 12%, transparent 0 52px, rgba(34,211,238,.1) 53px, transparent 54px 69px, rgba(236,72,153,.07) 70px, transparent 71px 86px)',
    decorationOpacity: '.65',
    fontFamily: 'var(--font-mono)',
    starColors: ['#fff', '#67e8f9', '#f9a8d4', '#a5f3fc', '#f0abfc'],
  }),
  'ice-moon': defineTheme({
    appearance: 'dark',
    accent: '#bdf5ff',
    bgColor: '#03101d',
    bgStars:
      'radial-gradient(circle at 20% 20%, rgba(189,245,255,.22), transparent 25%), linear-gradient(145deg, transparent 0 42%, rgba(125,211,252,.1) 43%, transparent 44% 58%, rgba(255,255,255,.07) 59%, transparent 60%), radial-gradient(ellipse at bottom, #0a2941 0%, #03101d 72%)',
    text: '#f2fcff',
    muted: '#b5d7df',
    heading: 'linear-gradient(135deg, #fff 0%, #cffafe 46%, #7dd3fc 100%)',
    cardBg: 'rgba(5,25,40,.79)',
    cardShadow: '0 24px 62px rgba(0,70,105,.35)',
    decoration:
      'linear-gradient(140deg, transparent 0 48%, rgba(207,250,254,.1) 49%, transparent 50%), linear-gradient(40deg, transparent 0 48%, rgba(125,211,252,.08) 49%, transparent 50%)',
    decorationSize: '74px 74px',
    decorationOpacity: '.75',
    starColors: ['#fff', '#cffafe', '#bae6fd', '#e0f2fe', '#a5f3fc'],
  }),
  titan: defineTheme({
    appearance: 'dark',
    accent: '#d99a55',
    bgColor: '#0a1018',
    bgStars:
      'radial-gradient(ellipse at 58% 22%, rgba(217,154,85,.34), transparent 28%), radial-gradient(ellipse at 42% 48%, rgba(146,84,41,.22), transparent 36%), linear-gradient(165deg, #1c2330 0%, #21160f 52%, #0a1018 100%)',
    text: '#fff4df',
    muted: '#d5b99b',
    heading: 'linear-gradient(135deg, #fff8e9 0%, #e8af70 52%, #9fb3c7 100%)',
    cardBg: 'rgba(30,25,21,.8)',
    cardShadow: '0 24px 62px rgba(32,19,7,.56)',
    decoration:
      'linear-gradient(180deg, rgba(217,154,85,.09), transparent 30%, rgba(113,81,53,.08) 65%, transparent)',
    decorationOpacity: '.8',
    starColors: ['#fff', '#f6d4ad', '#d6e2eb', '#e8b77e', '#c4d0dc'],
  }),
  saturn: defineTheme({
    appearance: 'dark',
    accent: '#e4cf98',
    bgColor: '#050811',
    bgStars:
      'radial-gradient(ellipse at 86% 16%, transparent 0 8%, rgba(228,207,152,.13) 9% 10.5%, transparent 11.5%), radial-gradient(circle at 82% 14%, rgba(228,207,152,.08), transparent 18%), radial-gradient(ellipse at bottom, #11182a 0%, #050811 74%)',
    text: '#fffaf0',
    muted: '#d0c3a5',
    heading: 'linear-gradient(135deg, #fff 0%, #ead9ad 52%, #b9c8df 100%)',
    cardBg: 'rgba(13,17,28,.8)',
    decoration:
      'repeating-radial-gradient(ellipse at 50% 12%, transparent 0 56px, rgba(228,207,152,.1) 57px, transparent 59px 74px)',
    decorationOpacity: '.45',
    starColors: ['#fff', '#fef3c7', '#dbeafe', '#ead9ad', '#e2e8f0'],
  }),
  'red-giant': defineTheme({
    appearance: 'dark',
    accent: '#ff754c',
    bgColor: '#100406',
    bgStars:
      'radial-gradient(circle at 18% 18%, rgba(239,68,68,.34), transparent 30%), radial-gradient(circle at 82% 76%, rgba(249,115,22,.2), transparent 30%), radial-gradient(ellipse at bottom, #3a0d16 0%, #100406 72%)',
    text: '#fff1ef',
    muted: '#e3b0aa',
    heading: 'linear-gradient(135deg, #fff 0%, #ff8a65 48%, #dc3545 76%, #ffb16a 100%)',
    cardBg: 'rgba(35,8,13,.8)',
    cardShadow: '0 24px 64px rgba(93,10,20,.52)',
    decoration: 'radial-gradient(circle at 18% 18%, rgba(255,177,106,.2), transparent 30%)',
    decorationOpacity: '.7',
    starColors: ['#fff', '#ffd5c7', '#ff9c7f', '#ffe4d6', '#fca5a5'],
  }),
  'white-dwarf': defineTheme({
    appearance: 'dark',
    accent: '#dff8ff',
    bgColor: '#0b0e14',
    bgStars:
      'radial-gradient(circle at 50% 16%, rgba(255,255,255,.52) 0 1%, rgba(186,230,253,.3) 3%, rgba(59,130,246,.14) 10%, transparent 24%), radial-gradient(ellipse at bottom, #1a2432 0%, #0b0e14 72%)',
    text: '#fff',
    muted: '#c6d2df',
    heading: 'linear-gradient(135deg, #fff 0%, #dff8ff 50%, #7dd3fc 100%)',
    cardBg: 'rgba(20,24,31,.84)',
    cardShadow: '0 24px 62px rgba(0,0,0,.65), 0 0 28px rgba(125,211,252,.12)',
    decoration: 'radial-gradient(circle at 50% 5%, rgba(255,255,255,.2), transparent 24%)',
    decorationOpacity: '.75',
    starColors: ['#fff', '#f0f9ff', '#dff8ff', '#bae6fd', '#e2e8f0'],
  }),
} satisfies Record<ThemePreset, ThemePresetDefinition>;

export interface ThemeStyleConfig {
  preset: ThemePreset;
  accent: string;
  background: ThemeBackground;
}

export function getThemePresetDefinition(preset: ThemePreset): ThemePresetDefinition {
  return THEME_PRESETS[preset];
}

export function getThemePresetTokens(theme: ThemeStyleConfig): ThemePresetDefinition {
  const preset = getThemePresetDefinition(theme.preset);
  return { ...preset, accent: theme.accent || preset.accent };
}

export function getThemeStyle(theme: ThemeStyleConfig): string {
  const tokens = getThemePresetTokens(theme);
  const background =
    theme.background === 'minimal'
      ? tokens.bgColor
      : theme.background === 'gradient'
        ? tokens.bgStars
        : tokens.bgColor;
  const starsBackground = theme.background === 'starfield' ? tokens.bgStars : 'transparent';
  const starColors = tokens.starColors || (tokens.appearance === 'light' ? lightStars : darkStars);

  return [
    `color-scheme: ${tokens.appearance}`,
    `--accent-color: ${tokens.accent}`,
    `--bg-color: ${background}`,
    `--bg-stars: ${starsBackground}`,
    `--text-color: ${tokens.text}`,
    `--muted-color: ${tokens.muted}`,
    `--heading-gradient: ${tokens.heading}`,
    `--card-bg: ${tokens.cardBg}`,
    `--card-border: ${tokens.cardBorder}`,
    `--card-shadow: ${tokens.cardShadow}`,
    `--btn-bg: ${tokens.buttonBg}`,
    `--btn-border: ${tokens.buttonBorder}`,
    `--btn-hover-bg: ${tokens.buttonHoverBg}`,
    `--theme-glow: ${tokens.glow}`,
    `--status-bg: ${tokens.statusBg}`,
    `--modal-bg: ${tokens.modalBg}`,
    `--tooltip-bg: ${tokens.tooltipBg}`,
    `--focus-color: ${tokens.accent}`,
    `--announcement-bg: ${tokens.announcementBg || 'color-mix(in srgb, var(--card-bg) 88%, var(--accent-color))'}`,
    `--announcement-border: ${tokens.announcementBorder || '1px solid color-mix(in srgb, var(--text-color) 14%, transparent)'}`,
    `--announcement-shadow: ${tokens.announcementShadow || '0 10px 30px color-mix(in srgb, var(--accent-color) 18%, transparent)'}`,
    `--img-border: ${tokens.imageBorder || '2px solid color-mix(in srgb, var(--text-color) 18%, transparent)'}`,
    `--img-shadow: ${tokens.imageShadow || '0 0 25px var(--theme-glow)'}`,
    `--theme-decoration: ${tokens.decoration || 'none'}`,
    `--theme-decoration-opacity: ${tokens.decorationOpacity || '0'}`,
    `--theme-decoration-size: ${tokens.decorationSize || 'auto'}`,
    `--card-radius: ${tokens.cardRadius || '28px'}`,
    `--button-radius: ${tokens.buttonRadius || '16px'}`,
    `--theme-font-family: ${tokens.fontFamily || "'Inter', sans-serif"}`,
    ...starColors.map((color, index) => `--star-color-${index + 1}: ${color}`),
  ].join('; ');
}
