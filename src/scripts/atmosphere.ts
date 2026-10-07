import type { StarfieldEffectKind } from '../config/themes';

export interface AtmosphereSample {
  warm: number;
  cool: number;
  shadow: number;
}

export type AtmosphereField = (x: number, y: number) => AtmosphereSample;
export const PULSAR_RATE = 0.095;
export const PULSAR_PERIOD = (Math.PI * 2) / PULSAR_RATE;

const gaussian = (x: number, y: number): number => Math.exp(-0.5 * (x * x + y * y));
const bounded = (value: number): number => Math.max(0, Math.min(1, value));

/** Continuous fields have no support boundary, masks, paths, or radial cutoffs.
 * Coordinates are shared by the atmosphere raster and the stars it illuminates.
 */
export function createAtmosphere(
  effect: StarfieldEffectKind,
  width: number,
  height: number,
  anchor: { x: number; y: number },
  time: number,
  intensity: number,
  pointer = 0
): AtmosphereField | undefined {
  const amount = bounded(intensity);
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  if (effect === 'eclipse-corona') {
    const breath = Math.sin(time * 0.11) * 0.015;
    return (x, y) => {
      const u = (x - anchor.x) / w;
      const v = (y - anchor.y) / h;
      const bend = v + 0.16 * Math.sin(u * 2.1 + 0.6);
      const shade = gaussian((u + 0.32) / 0.59, (bend - 0.28) / 0.7);
      return {
        warm:
          amount *
          (0.17 + breath) *
          gaussian((u - 0.35) / 0.74, (bend + 0.48) / 0.69) *
          (1 - shade * 0.7),
        cool: amount * 0.025 * gaussian((u + 0.75) / 0.8, (v - 1) / 0.9),
        shadow: amount * 0.62 * shade,
      };
    };
  }
  if (effect === 'black-hole-lensing') {
    const drift = Math.sin(time * 0.045) * 0.012;
    return (x, y) => {
      const u = (x - anchor.x) / w;
      const v = (y - anchor.y) / h;
      const bend = u + 0.2 * Math.sin(v * 2 + 0.8);
      const depth = gaussian((bend + 0.3 + drift) / 0.63, (v - 0.22) / 0.85);
      return {
        warm: amount * 0.1 * gaussian((u - 0.8) / 0.85, (v + 0.7) / 0.8) * (1 - depth * 0.8),
        cool: amount * 0.06 * gaussian((u - 0.95) / 0.8, (v - 0.55) / 1.1) * (1 - depth * 0.7),
        shadow: amount * 0.94 * depth,
      };
    };
  }
  if (effect === 'pulsar-beams') {
    // Every changing quantity is a harmonic of this phase. At 2π both
    // values and derivatives agree, including illumination of nearby stars.
    const phase = time * PULSAR_RATE;
    const angle = phase + pointer * 0.12;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const pulse = 0.88 + 0.12 * Math.cos(phase * 2);
    const driftX = Math.cos(phase) * 0.35;
    const driftY = Math.sin(phase) * 0.28;
    const scale = Math.max(w, h);
    return (x, y) => {
      const dx = (x - anchor.x) / scale;
      const dy = (y - anchor.y) / scale;
      const along = dx * cosine + dy * sine;
      const across = -dx * sine + dy * cosine;
      // Domain variation belongs to the scene, rather than a rigidly rotating
      // ellipse. The bands extend beyond the viewport: no longitudinal envelope
      // closes their contours into a capsule, even when the direction turns.
      const terrain =
        0.11 * Math.sin(dx * 3.1 + dy * 1.7 + driftX) +
        0.065 * Math.sin(dx * -2.3 + dy * 4.2 - driftY);
      const width = 0.24 + 0.075 * Math.sin(along * 3.7 + driftY + 0.8);
      const first = (across + terrain + 0.13 * Math.sin(along * 2.8 + driftX)) / width;
      const second =
        (across - along * 0.26 - terrain * 0.6 + 0.29) /
        (0.38 + 0.09 * Math.sin(along * 2.1 - driftX));
      const third =
        (across + along * 0.34 + terrain * 0.8 - 0.38) /
        (0.52 + 0.12 * Math.sin(along * 1.6 + driftY + 1.4));
      // Different tails and offset widths dissolve into one another. No layer
      // carries a common oval edge or a localized radial ambient highlight.
      const near = Math.exp(-0.5 * first * first);
      const middle = 1 / (1 + second * second);
      const far = 1 / Math.sqrt(1 + third * third);
      const variation = 0.88 + 0.12 * Math.sin(along * 2.4 + terrain * 3 + driftX);
      const diffusion = near * 0.43 * variation + middle * 0.34 + far * 0.23;
      const ambient =
        0.52 +
        0.18 * Math.sin(dx * 2.3 + dy * 1.1 + 0.4) +
        0.13 * Math.sin(dx * -1.6 + dy * 3.1 - 1.2);
      return {
        warm: amount * pulse * (diffusion * 0.072 + ambient * 0.013),
        cool: amount * pulse * (middle * 0.007 + far * 0.005),
        shadow: 0,
      };
    };
  }

  return undefined;
}

export function illuminateStar(opacity: number, sample: AtmosphereSample): number {
  return bounded(opacity * (1 - sample.shadow * 0.94) * (1 + (sample.warm + sample.cool) * 4));
}

/** Reuses one small raster; only the stars need device-pixel resolution. */
export class AtmosphereRenderer {
  private readonly canvas = document.createElement('canvas');
  private readonly context = this.canvas.getContext('2d');
  private pixels?: ImageData;

  draw(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    field: AtmosphereField,
    primary: string,
    secondary: string,
    rasterSize = 192
  ): void {
    if (!this.context || width <= 0 || height <= 0) return;
    const ratio = rasterSize / Math.max(width, height);
    const w = Math.max(2, Math.round(width * ratio));
    const h = Math.max(2, Math.round(height * ratio));
    if (!this.pixels || this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.pixels = this.context.createImageData(w, h);
    }
    const first = rgb(primary);
    const second = rgb(secondary);
    const data = this.pixels.data;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const sample = field(((x + 0.5) / w) * width, ((y + 0.5) / h) * height);
        const opacity = Math.min(1, sample.shadow + sample.warm + sample.cool);
        const index = (y * w + x) * 4;
        for (let channel = 0; channel < 3; channel += 1) {
          data[index + channel] =
            opacity > 0
              ? (first[channel] * sample.warm + second[channel] * sample.cool) / opacity
              : 0;
        }
        data[index + 3] = opacity * 255;
      }
    }
    this.context.putImageData(this.pixels, 0, 0);
    context.save();
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    context.shadowBlur = 0;
    context.filter = 'none';
    context.imageSmoothingEnabled = true;
    // Bilinear interpolation is sufficient for these broad fields. High-quality
    // resampling makes the full-viewport blit miss frames in software rendering.
    context.imageSmoothingQuality = 'low';
    context.drawImage(this.canvas, 0, 0, width, height);
    context.restore();
  }
}

function rgb(color: string): number[] {
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? [...hex].map((value) => value + value).join('') : hex;
  return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16) || 0);
}
