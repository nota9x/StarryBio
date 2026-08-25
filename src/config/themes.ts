import type { NormalizedThemeConfig, ThemePreset } from './schema';

interface ThemePresetTokens {
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
}

export const THEME_PRESETS: Record<ThemePreset, ThemePresetTokens> = {
  nebula: {
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
  },
  midnight: {
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
  },
  'classic-blue': {
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
  },
  aurora: {
    accent: '#7ddf9b',
    bgColor: '#06110d',
    bgStars:
      'linear-gradient(130deg, rgba(24, 185, 116, 0.0) 0%, rgba(24, 185, 116, 0.34) 22%, rgba(190, 242, 100, 0.16) 38%, rgba(236, 72, 153, 0.2) 56%, rgba(168, 85, 247, 0.16) 72%, rgba(3, 7, 18, 0.08) 100%), radial-gradient(ellipse at bottom, #0d1f17 0%, #06110d 70%)',
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
  },
  eclipse: {
    accent: '#f6c177',
    bgColor: '#080706',
    bgStars:
      'radial-gradient(circle at 50% 28%, rgba(246, 193, 119, 0.24) 0 8%, rgba(246, 193, 119, 0.08) 9% 16%, transparent 18%), radial-gradient(circle at 52% 30%, #020202 0 13%, transparent 14%), radial-gradient(ellipse at bottom, #26151a 0%, #080706 74%)',
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
  },
  'cosmic-gold': {
    accent: '#f7d06b',
    bgColor: '#0a0804',
    bgStars:
      'radial-gradient(circle at 24% 18%, rgba(247, 208, 107, 0.22), transparent 26%), radial-gradient(circle at 86% 62%, rgba(168, 139, 92, 0.18), transparent 28%), radial-gradient(ellipse at bottom, #2a2110 0%, #0a0804 72%)',
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
  },
  minimal: {
    accent: '#334155',
    bgColor: '#f7f8fb',
    bgStars:
      'radial-gradient(circle at 20% 16%, rgba(148, 163, 184, 0.22), transparent 26%), linear-gradient(180deg, #ffffff 0%, #eef2f7 100%)',
    text: '#121826',
    muted: '#526074',
    heading: 'linear-gradient(135deg, #111827 0%, #475569 100%)',
    cardBg: 'rgba(255, 255, 255, 0.82)',
    cardBorder: '1px solid rgba(15, 23, 42, 0.1)',
    cardShadow: '0 24px 58px rgba(15, 23, 42, 0.13)',
    buttonBg: 'rgba(255, 255, 255, 0.78)',
    buttonBorder: '1px solid rgba(15, 23, 42, 0.12)',
    buttonHoverBg: 'rgba(226, 232, 240, 0.84)',
    glow: 'rgba(100, 116, 139, 0.24)',
    statusBg: 'rgba(255, 255, 255, 0.94)',
    modalBg: 'rgba(255, 255, 255, 0.96)',
    tooltipBg: 'rgba(255, 255, 255, 0.98)',
  },
  terminal: {
    accent: '#9cffac',
    bgColor: '#030604',
    bgStars:
      'linear-gradient(rgba(156, 255, 172, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(156, 255, 172, 0.035) 1px, transparent 1px), radial-gradient(ellipse at bottom, #071a0f 0%, #030604 74%)',
    text: '#dfffe6',
    muted: '#98dca5',
    heading: 'linear-gradient(135deg, #effff2 0%, #9cffac 100%)',
    cardBg: 'rgba(1, 12, 7, 0.84)',
    cardBorder: '1px solid rgba(156, 255, 172, 0.24)',
    cardShadow: '0 24px 58px rgba(0, 0, 0, 0.64)',
    buttonBg: 'rgba(5, 25, 13, 0.84)',
    buttonBorder: '1px solid rgba(156, 255, 172, 0.18)',
    buttonHoverBg: 'rgba(29, 76, 42, 0.42)',
    glow: 'rgba(156, 255, 172, 0.32)',
    statusBg: 'rgba(5, 25, 13, 0.94)',
    modalBg: 'rgba(1, 12, 7, 0.96)',
    tooltipBg: 'rgba(1, 12, 7, 0.98)',
  },
};

const LIGHT_THEME_PRESETS: Record<ThemePreset, ThemePresetTokens> = {
  nebula: {
    accent: '#6d28d9',
    bgColor: '#f7f3ff',
    bgStars:
      'radial-gradient(circle at 18% 18%, rgba(124, 58, 237, 0.16), transparent 28%), radial-gradient(circle at 82% 24%, rgba(13, 148, 136, 0.13), transparent 30%), linear-gradient(180deg, #fdfcff 0%, #eee8fa 100%)',
    text: '#251d33',
    muted: '#62586f',
    heading: 'linear-gradient(135deg, #241633 0%, #6d28d9 48%, #0f766e 100%)',
    cardBg: 'rgba(255, 255, 255, 0.84)',
    cardBorder: '1px solid rgba(76, 29, 149, 0.14)',
    cardShadow: '0 24px 58px rgba(76, 29, 149, 0.14)',
    buttonBg: 'rgba(255, 255, 255, 0.8)',
    buttonBorder: '1px solid rgba(76, 29, 149, 0.14)',
    buttonHoverBg: 'rgba(226, 216, 246, 0.9)',
    glow: 'rgba(109, 40, 217, 0.2)',
    statusBg: 'rgba(255, 255, 255, 0.96)',
    modalBg: 'rgba(253, 252, 255, 0.97)',
    tooltipBg: 'rgba(253, 252, 255, 0.99)',
  },
  midnight: {
    accent: '#3e6085',
    bgColor: '#eef3f8',
    bgStars:
      'radial-gradient(circle at 22% 16%, rgba(92, 124, 157, 0.16), transparent 28%), linear-gradient(180deg, #f9fbfd 0%, #e5edf5 100%)',
    text: '#172335',
    muted: '#53657a',
    heading: 'linear-gradient(135deg, #111827 0%, #3e6085 55%, #64748b 100%)',
    cardBg: 'rgba(255, 255, 255, 0.84)',
    cardBorder: '1px solid rgba(30, 64, 96, 0.13)',
    cardShadow: '0 24px 58px rgba(30, 50, 72, 0.15)',
    buttonBg: 'rgba(255, 255, 255, 0.78)',
    buttonBorder: '1px solid rgba(30, 64, 96, 0.14)',
    buttonHoverBg: 'rgba(210, 222, 234, 0.9)',
    glow: 'rgba(62, 96, 133, 0.2)',
    statusBg: 'rgba(255, 255, 255, 0.96)',
    modalBg: 'rgba(249, 251, 253, 0.97)',
    tooltipBg: 'rgba(249, 251, 253, 0.99)',
  },
  'classic-blue': {
    accent: '#285b9e',
    bgColor: 'linear-gradient(135deg, #f7fbff 0%, #e8f1ff 45%, #dce9fb 100%)',
    bgStars: 'transparent',
    text: '#112844',
    muted: '#4e6683',
    heading: 'linear-gradient(135deg, #102a43 0%, #285b9e 58%, #5277aa 100%)',
    cardBg: 'rgba(255, 255, 255, 0.82)',
    cardBorder: '1px solid rgba(40, 91, 158, 0.18)',
    cardShadow: '0 24px 58px rgba(25, 69, 122, 0.16)',
    buttonBg: 'rgba(246, 250, 255, 0.88)',
    buttonBorder: '1px solid rgba(40, 91, 158, 0.18)',
    buttonHoverBg: 'rgba(207, 225, 248, 0.92)',
    glow: 'rgba(40, 91, 158, 0.22)',
    statusBg: 'rgba(248, 251, 255, 0.97)',
    modalBg: 'rgba(248, 251, 255, 0.98)',
    tooltipBg: 'rgba(248, 251, 255, 0.99)',
    announcementBg: 'rgba(255, 247, 214, 0.96)',
    announcementBorder: '1px solid rgba(161, 98, 7, 0.25)',
    announcementShadow: '0 10px 30px rgba(80, 62, 18, 0.16)',
    imageBorder: '4px solid rgba(40, 91, 158, 0.3)',
    imageShadow: '0 0 25px rgba(40, 91, 158, 0.2)',
  },
  aurora: {
    accent: '#167346',
    bgColor: '#eefbf4',
    bgStars:
      'linear-gradient(130deg, rgba(22, 163, 74, 0.05) 0%, rgba(34, 197, 94, 0.18) 25%, rgba(190, 242, 100, 0.17) 42%, rgba(236, 72, 153, 0.12) 64%, rgba(168, 85, 247, 0.1) 78%, rgba(255, 255, 255, 0.2) 100%), linear-gradient(180deg, #f8fff9 0%, #e6f6ec 100%)',
    text: '#143324',
    muted: '#4e6f5d',
    heading: 'linear-gradient(135deg, #143324 0%, #167346 42%, #9d326f 78%, #795b08 100%)',
    cardBg: 'rgba(250, 255, 252, 0.84)',
    cardBorder: '1px solid rgba(22, 115, 70, 0.15)',
    cardShadow: '0 24px 58px rgba(20, 93, 55, 0.15)',
    buttonBg: 'rgba(250, 255, 252, 0.8)',
    buttonBorder: '1px solid rgba(22, 115, 70, 0.16)',
    buttonHoverBg: 'rgba(205, 238, 217, 0.92)',
    glow: 'rgba(22, 115, 70, 0.2)',
    statusBg: 'rgba(250, 255, 252, 0.97)',
    modalBg: 'rgba(248, 255, 250, 0.98)',
    tooltipBg: 'rgba(248, 255, 250, 0.99)',
  },
  eclipse: {
    accent: '#9a4d0a',
    bgColor: '#fff7ed',
    bgStars:
      'radial-gradient(circle at 50% 28%, rgba(194, 103, 20, 0.18) 0 8%, rgba(194, 103, 20, 0.06) 9% 16%, transparent 18%), radial-gradient(circle at 52% 30%, rgba(255, 252, 247, 0.95) 0 13%, transparent 14%), linear-gradient(180deg, #fffdf9 0%, #f8e9de 100%)',
    text: '#3c271e',
    muted: '#765c4e',
    heading: 'linear-gradient(135deg, #3c271e 0%, #9a4d0a 52%, #a44848 100%)',
    cardBg: 'rgba(255, 253, 249, 0.86)',
    cardBorder: '1px solid rgba(154, 77, 10, 0.16)',
    cardShadow: '0 24px 58px rgba(111, 57, 24, 0.15)',
    buttonBg: 'rgba(255, 253, 249, 0.82)',
    buttonBorder: '1px solid rgba(154, 77, 10, 0.16)',
    buttonHoverBg: 'rgba(244, 220, 199, 0.92)',
    glow: 'rgba(154, 77, 10, 0.2)',
    statusBg: 'rgba(255, 253, 249, 0.97)',
    modalBg: 'rgba(255, 252, 247, 0.98)',
    tooltipBg: 'rgba(255, 252, 247, 0.99)',
  },
  'cosmic-gold': {
    accent: '#80600c',
    bgColor: '#fff9e8',
    bgStars:
      'radial-gradient(circle at 24% 18%, rgba(202, 152, 24, 0.18), transparent 28%), radial-gradient(circle at 86% 62%, rgba(137, 111, 62, 0.12), transparent 30%), linear-gradient(180deg, #fffef8 0%, #f7edcf 100%)',
    text: '#3b2f15',
    muted: '#756541',
    heading: 'linear-gradient(135deg, #3b2f15 0%, #80600c 50%, #9b7b27 100%)',
    cardBg: 'rgba(255, 254, 248, 0.86)',
    cardBorder: '1px solid rgba(128, 96, 12, 0.16)',
    cardShadow: '0 24px 58px rgba(95, 71, 12, 0.15)',
    buttonBg: 'rgba(255, 254, 248, 0.82)',
    buttonBorder: '1px solid rgba(128, 96, 12, 0.16)',
    buttonHoverBg: 'rgba(242, 226, 178, 0.92)',
    glow: 'rgba(128, 96, 12, 0.2)',
    statusBg: 'rgba(255, 254, 248, 0.97)',
    modalBg: 'rgba(255, 253, 245, 0.98)',
    tooltipBg: 'rgba(255, 253, 245, 0.99)',
  },
  minimal: THEME_PRESETS.minimal,
  terminal: {
    accent: '#147532',
    bgColor: '#effdf2',
    bgStars:
      'linear-gradient(rgba(20, 117, 50, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 117, 50, 0.06) 1px, transparent 1px), linear-gradient(180deg, #f8fff9 0%, #e8f8ed 100%)',
    text: '#153a20',
    muted: '#51705a',
    heading: 'linear-gradient(135deg, #153a20 0%, #147532 100%)',
    cardBg: 'rgba(248, 255, 250, 0.88)',
    cardBorder: '1px solid rgba(20, 117, 50, 0.22)',
    cardShadow: '0 24px 58px rgba(17, 83, 38, 0.14)',
    buttonBg: 'rgba(246, 255, 248, 0.88)',
    buttonBorder: '1px solid rgba(20, 117, 50, 0.2)',
    buttonHoverBg: 'rgba(205, 237, 213, 0.94)',
    glow: 'rgba(20, 117, 50, 0.2)',
    statusBg: 'rgba(248, 255, 250, 0.98)',
    modalBg: 'rgba(248, 255, 250, 0.98)',
    tooltipBg: 'rgba(248, 255, 250, 0.99)',
  },
};

const MINIMAL_DARK_PRESET: ThemePresetTokens = {
  accent: '#b8c4d4',
  bgColor: '#0b0f16',
  bgStars:
    'radial-gradient(circle at 20% 16%, rgba(148, 163, 184, 0.13), transparent 26%), linear-gradient(180deg, #111827 0%, #080b11 100%)',
  text: '#edf2f7',
  muted: '#b5c0cf',
  heading: 'linear-gradient(135deg, #ffffff 0%, #b8c4d4 100%)',
  cardBg: 'rgba(15, 20, 29, 0.84)',
  cardBorder: '1px solid rgba(226, 232, 240, 0.11)',
  cardShadow: '0 24px 58px rgba(0, 0, 0, 0.48)',
  buttonBg: 'rgba(24, 31, 43, 0.78)',
  buttonBorder: '1px solid rgba(226, 232, 240, 0.12)',
  buttonHoverBg: 'rgba(71, 85, 105, 0.72)',
  glow: 'rgba(184, 196, 212, 0.24)',
  statusBg: 'rgba(24, 31, 43, 0.96)',
  modalBg: 'rgba(15, 20, 29, 0.97)',
  tooltipBg: 'rgba(15, 20, 29, 0.99)',
};

export function getThemePresetTokens(theme: NormalizedThemeConfig): ThemePresetTokens {
  const preset =
    theme.mode === 'light'
      ? LIGHT_THEME_PRESETS[theme.preset]
      : theme.preset === 'minimal'
        ? MINIMAL_DARK_PRESET
        : THEME_PRESETS[theme.preset];

  return {
    ...preset,
    accent: theme.accent || preset.accent,
  };
}

export function getThemeStyle(theme: NormalizedThemeConfig): string {
  const tokens = getThemePresetTokens(theme);
  const background =
    theme.background === 'minimal'
      ? tokens.bgColor
      : theme.background === 'gradient'
        ? tokens.bgStars
        : tokens.bgColor;
  const starsBackground = theme.background === 'starfield' ? tokens.bgStars : 'transparent';

  const properties = [
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
  ];

  return properties.join('; ');
}
