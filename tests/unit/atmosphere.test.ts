import { describe, expect, it } from 'vitest';
import { createAtmosphere, illuminateStar, PULSAR_PERIOD } from '../../src/scripts/atmosphere';

const effects = ['eclipse-corona', 'black-hole-lensing', 'pulsar-beams'] as const;
const anchor = { x: 340, y: 290 };

describe('continuous atmospheric fields', () => {
  for (const effect of effects) {
    it(`${effect} has bounded star illumination and no spatial cutoffs`, () => {
      const field = createAtmosphere(effect, 1440, 900, anchor, 7.5, 0.72)!;
      for (let x = -100; x <= 1600; x += 25) {
        for (let y = -100; y <= 1000; y += 25) {
          const sample = field(x, y);
          const nearby = field(x + 0.001, y + 0.001);
          for (const channel of ['warm', 'cool', 'shadow'] as const) {
            expect(Number.isFinite(sample[channel])).toBe(true);
            expect(sample[channel]).toBeGreaterThanOrEqual(0);
            expect(Math.abs(sample[channel] - nearby[channel])).toBeLessThan(0.00001);
          }
          for (const opacity of [0, 0.1, 0.5, 1]) {
            const illuminated = illuminateStar(opacity, sample);
            expect(illuminated).toBeGreaterThanOrEqual(0);
            expect(illuminated).toBeLessThanOrEqual(1);
          }
        }
      }
    });
  }

  it('Pulsar repeats the entire light field and its velocity across the cycle seam', () => {
    const epsilon = 0.00001;
    for (const size of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const at = (time: number) =>
        createAtmosphere('pulsar-beams', size.width, size.height, anchor, time, 0.72, 0.35)!;
      for (let x = 0; x <= size.width; x += 65) {
        for (let y = 0; y <= size.height; y += 65) {
          for (const channel of ['warm', 'cool', 'shadow'] as const) {
            expect(at(0)(x, y)[channel]).toBeCloseTo(at(PULSAR_PERIOD)(x, y)[channel], 12);
            const before = (at(0)(x, y)[channel] - at(-epsilon)(x, y)[channel]) / epsilon;
            const after =
              (at(PULSAR_PERIOD + epsilon)(x, y)[channel] - at(PULSAR_PERIOD)(x, y)[channel]) /
              epsilon;
            expect(before).toBeCloseTo(after, 6);
          }
        }
      }
    }
  });

  it('Black Hole establishes depth through the same field that suppresses stars', () => {
    const field = createAtmosphere('black-hole-lensing', 1440, 900, { x: 331, y: 576 }, 7.5, 0.72)!;
    const dark = field(100, 700);
    const lit = field(1350, 80);
    expect(dark.shadow - lit.shadow).toBeGreaterThan(0.3);
    expect(illuminateStar(0.8, dark)).toBeLessThan(illuminateStar(0.8, lit) * 0.65);
  });

  it('Pulsar diffusion continues along the light instead of closing into an oval', () => {
    const field = createAtmosphere('pulsar-beams', 1440, 900, anchor, 0, 0.72)!;
    const center = field(anchor.x, anchor.y).warm;
    // Sample beyond the viewport as well: a localized longitudinal envelope
    // must not reappear when the scene rotates or the viewport changes shape.
    for (const distance of [-2880, -1440, 1440, 2880]) {
      expect(field(anchor.x + distance, anchor.y).warm).toBeGreaterThan(center * 0.35);
    }
  });
});
