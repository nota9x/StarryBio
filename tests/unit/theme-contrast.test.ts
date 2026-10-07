import { describe, expect, it } from 'vitest';
import { THEME_PRESET_NAMES, getThemePresetDefinition } from '../../src/config/themes';

type Rgb = readonly [number, number, number];

function parseHex(value: string): Rgb {
  const hex = value.slice(1);
  const expanded = hex.length === 3 ? [...hex].map((digit) => digit + digit).join('') : hex;
  return [0, 2, 4].map((offset) =>
    Number.parseInt(expanded.slice(offset, offset + 2), 16)
  ) as unknown as Rgb;
}

function composite(value: string, background: Rgb): Rgb {
  if (value.startsWith('#')) return parseHex(value);
  const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(value);
  if (!match) throw new Error(`Unsupported contrast color: ${value}`);
  const foreground: Rgb = [Number(match[1]), Number(match[2]), Number(match[3])];
  const alpha = Number(match[4] ?? 1);
  return foreground.map((channel, index) =>
    Math.round(channel * alpha + background[index] * (1 - alpha))
  ) as unknown as Rgb;
}

function luminance(color: Rgb): number {
  const channels = color.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(first: Rgb, second: Rgb): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('theme contrast', () => {
  it.each(THEME_PRESET_NAMES)('%s meets core WCAG contrast thresholds', (preset) => {
    const theme = getThemePresetDefinition(preset);
    const page = parseHex(theme.bgColor);
    const card = composite(theme.cardBg, page);

    expect(contrast(parseHex(theme.text), page), 'text on page').toBeGreaterThanOrEqual(4.5);
    expect(contrast(parseHex(theme.text), card), 'text on card').toBeGreaterThanOrEqual(4.5);
    expect(contrast(parseHex(theme.muted), card), 'muted text on card').toBeGreaterThanOrEqual(4.5);
    expect(contrast(parseHex(theme.accent), page), 'focus ring on page').toBeGreaterThanOrEqual(3);
  });
});
