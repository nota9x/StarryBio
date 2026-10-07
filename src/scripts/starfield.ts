import type { StarfieldEffectKind } from '../config/themes';
import {
  AtmosphereRenderer,
  createAtmosphere,
  illuminateStar,
  type AtmosphereField,
} from './atmosphere';

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  depth: number;
  dx: number;
  dy: number;
  speed: number;
  phase: number;
}

interface Point {
  x: number;
  y: number;
}

const COLORS = ['#ffffff', '#ffe9c4', '#d4fbff', '#d4fbff', '#b3cde0'];
const EFFECTS = new Set<StarfieldEffectKind>([
  'none',
  'nebula-drift',
  'aurora-ribbons',
  'eclipse-corona',
  'terminal-scan',
  'supernova-bloom',
  'black-hole-lensing',
  'pulsar-beams',
  'mars-dust',
  'starlight-glints',
]);
let controller: StarfieldController | undefined;

export function ensureStarfield(): void {
  const container = document.querySelector<HTMLElement>('.stars-container');
  if (!container) return;
  controller ||= new StarfieldController(container);
  controller.configure(container);
}

class StarfieldController {
  private container: HTMLElement;
  private readonly canvas = document.createElement('canvas');
  private readonly context = this.canvas.getContext('2d');
  private readonly atmosphere = new AtmosphereRenderer();
  private starSignature = '';
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  private readonly finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  private readonly stars: Star[] = [];
  private width = 0;
  private height = 0;
  private time = 7.5;
  private previousTime = 0;
  private pointer = { x: 0, y: 0 };
  private pointerTarget = { x: 0, y: 0 };
  private frame?: number;
  private shootingTimer?: number;
  private starMultiplier = 1;
  private shootingMultiplier = 1;
  private motion = 1;
  private effect: StarfieldEffectKind = 'none';
  private primary = '#ffffff';
  private secondary = '#d4fbff';
  private effectIntensity = 1;
  private effectSpeed = 1;
  private starColors = COLORS;
  private seed = 1;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas.className = 'starfield-canvas';
    this.canvas.ariaHidden = 'true';
    container.prepend(this.canvas);
    addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => this.sync());
    addEventListener('pointermove', (event) => {
      if (!this.finePointer.matches) return;
      this.pointerTarget = {
        x: event.clientX / innerWidth - 0.5,
        y: event.clientY / innerHeight - 0.5,
      };
    });
    this.reducedMotion.addEventListener('change', () => this.sync());
    this.resize();
  }

  configure(container: HTMLElement): void {
    this.container = container;
    if (!container.contains(this.canvas)) container.prepend(this.canvas);
    const styles = getComputedStyle(container);
    this.starColors = COLORS.map(
      (fallback, index) => styles.getPropertyValue(`--star-color-${index + 1}`).trim() || fallback
    );
    this.primary = styles.getPropertyValue('--effect-primary').trim() || '#ffffff';
    this.secondary = styles.getPropertyValue('--effect-secondary').trim() || '#d4fbff';
    this.effectIntensity = numberValue(styles.getPropertyValue('--effect-intensity'));
    this.effectSpeed = numberValue(styles.getPropertyValue('--effect-speed'));
    this.effect = effectValue(container.dataset.starfieldEffect);
    this.starMultiplier = numberValue(container.dataset.starMultiplier);
    this.shootingMultiplier = numberValue(container.dataset.shootingStarMultiplier);
    const intensity = container.dataset.animationIntensity || 'normal';
    this.motion =
      intensity === 'none' ? 0 : intensity === 'subtle' ? 0.55 : intensity === 'high' ? 1.3 : 1;
    if (intensity === 'subtle') {
      this.starMultiplier *= 0.7;
      this.shootingMultiplier *= 0.45;
    } else if (intensity === 'high') {
      this.starMultiplier *= 1.25;
      this.shootingMultiplier *= 1.35;
    } else if (intensity === 'none') {
      this.shootingMultiplier = 0;
    }
    this.seed = hash(`${document.documentElement.dataset.theme || 'theme'}:${this.effect}`);
    const signature = JSON.stringify([this.seed, this.starMultiplier, this.starColors]);
    if (signature !== this.starSignature) {
      this.starSignature = signature;
      this.rebuild();
    } else {
      this.render(false);
      this.sync();
    }
  }

  private rebuild(): void {
    this.stop();
    const random = mulberry32(this.seed);
    const count = Math.round(200 * this.starMultiplier);
    this.stars.length = 0;
    for (let index = 0; index < count; index += 1) {
      const depth = random();
      this.stars.push({
        x: random() * 100,
        y: random() * 100,
        size: random() * 2.2 + 0.5,
        color: this.starColors[Math.floor(random() * this.starColors.length)],
        depth,
        dx: (random() - 0.5) * 0.12 * (depth + 0.2),
        dy: (random() - 0.5) * 0.12 * (depth + 0.2),
        speed: random() * 1.2 + 0.35,
        phase: random() * Math.PI * 2,
      });
    }
    this.render(false);
    this.sync();
  }

  private resize(): void {
    this.width = innerWidth;
    this.height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.render(false);
  }

  private sync(): void {
    if (document.hidden || this.reducedMotion.matches || this.motion === 0) {
      this.stop();
      this.render(false);
      return;
    }
    this.animate();
    this.scheduleShootingStar();
  }

  private animate(): void {
    if (this.frame !== undefined || !this.context) return;
    const tick = (timestamp: number) => {
      if (document.hidden || this.reducedMotion.matches || this.motion === 0) {
        this.frame = undefined;
        return;
      }
      const delta = this.previousTime ? Math.min((timestamp - this.previousTime) / 1000, 0.05) : 0;
      this.previousTime = timestamp;
      this.time += delta * this.motion * this.effectSpeed;
      this.render(true, delta);
      this.frame = requestAnimationFrame(tick);
    };
    this.previousTime = 0;
    this.frame = requestAnimationFrame(tick);
  }

  private scheduleShootingStar(): void {
    if (this.shootingTimer !== undefined || this.shootingMultiplier === 0) return;
    const spawn = () => {
      if (Math.random() < 0.05 * this.shootingMultiplier) {
        const star = document.createElement('span');
        star.className = 'shooting-star';
        star.style.top = `${Math.random() * 55}%`;
        star.style.left = `${Math.random() * 80}%`;
        star.style.setProperty('--angle', `${Math.random() * 25 + 25}deg`);
        const duration = Math.random() * 1.5 + 2.5;
        star.style.animationDuration = `${duration}s`;
        this.container.append(star);
        setTimeout(() => star.remove(), duration * 1000);
      }
      this.shootingTimer = window.setTimeout(spawn, 500);
    };
    this.shootingTimer = window.setTimeout(spawn, 1500);
  }

  private stop(): void {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    if (this.shootingTimer !== undefined) clearTimeout(this.shootingTimer);
    this.frame = undefined;
    this.shootingTimer = undefined;
    this.previousTime = 0;
    this.container.querySelectorAll('.shooting-star').forEach((star) => star.remove());
  }

  private render(update: boolean, delta = 0): void {
    const context = this.context;
    if (!context) return;
    context.clearRect(0, 0, this.width, this.height);
    if (update) {
      const smoothing = Math.min(1, delta * 3);
      this.pointer.x += (this.pointerTarget.x - this.pointer.x) * smoothing;
      this.pointer.y += (this.pointerTarget.y - this.pointer.y) * smoothing;
    }
    const anchor = this.anchor();
    const field = createAtmosphere(
      this.effect,
      this.width,
      this.height,
      anchor,
      this.time,
      this.effectIntensity,
      this.pointer.x
    );
    if (field)
      this.atmosphere.draw(
        context,
        this.width,
        this.height,
        field,
        this.primary,
        this.secondary,
        // The overlapping Pulsar fields vary over hundreds of pixels; this
        // sampling density preserves diffusion while leaving time for compositing.
        this.effect === 'pulsar-beams' ? 128 : 192
      );
    else this.drawEffect(context, anchor);
    this.drawStars(context, update, delta, field);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    context.shadowBlur = 0;
    context.filter = 'none';
  }

  private anchor(): Point {
    const rect = document
      .querySelector<HTMLElement>('.profile-image-wrapper')
      ?.getBoundingClientRect();
    const profileAnchor =
      rect && rect.width > 0 && rect.bottom > 0 && rect.top < this.height
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : { x: this.width / 2, y: Math.min(this.height * 0.22, 210) };

    const parallax = {
      x: this.pointer.x * Math.min(26, this.width * 0.035),
      y: this.pointer.y * Math.min(18, this.height * 0.025),
    };
    if (this.effect === 'eclipse-corona') {
      return {
        x: this.width * (this.width < 900 ? 0.78 : 0.76) + parallax.x,
        y: this.height * (this.width < 900 ? 0.24 : 0.27) + parallax.y,
      };
    }
    if (this.effect === 'black-hole-lensing') {
      return {
        x: this.width * (this.width < 900 ? 0.2 : 0.23) - parallax.x * 0.8,
        y: this.height * (this.width < 900 ? 0.68 : 0.64) - parallax.y * 0.8,
      };
    }
    if (this.effect === 'pulsar-beams') {
      return {
        x: this.width * (this.width < 900 ? 0.52 : 0.2) + parallax.x * 0.65,
        y: this.height * (this.width < 900 ? 0.2 : 0.32) + parallax.y * 0.65,
      };
    }
    return profileAnchor;
  }

  private drawEffect(context: CanvasRenderingContext2D, anchor: Point): void {
    const amount = this.effectIntensity;
    if (this.effect === 'nebula-drift' || this.effect === 'supernova-bloom') {
      const phase = this.time * 0.08;
      glow(
        context,
        anchor.x - this.width * 0.28 + Math.sin(phase) * 28,
        anchor.y + this.height * 0.18,
        Math.max(this.width, this.height) * 0.42,
        this.primary,
        0.08 * amount
      );
      glow(
        context,
        anchor.x + this.width * 0.3 + Math.cos(phase * 0.8) * 24,
        anchor.y + this.height * 0.34,
        Math.max(this.width, this.height) * 0.38,
        this.secondary,
        0.065 * amount
      );
      if (this.effect === 'supernova-bloom')
        glow(
          context,
          anchor.x,
          anchor.y,
          150 + Math.sin(this.time * 0.55) * 12,
          this.primary,
          0.12 * amount
        );
      return;
    }
    if (this.effect === 'aurora-ribbons') {
      context.save();
      context.globalCompositeOperation = 'screen';
      for (let band = 0; band < 3; band += 1) {
        const phase = this.time * 0.11 + band * 1.7;
        context.beginPath();
        context.moveTo(-80, this.height * (0.24 + band * 0.12));
        context.bezierCurveTo(
          this.width * 0.28,
          this.height * (0.08 + Math.sin(phase) * 0.05),
          this.width * 0.66,
          this.height * (0.5 + Math.cos(phase * 0.8) * 0.07),
          this.width + 80,
          this.height * (0.2 + band * 0.1)
        );
        context.strokeStyle = band % 2 ? this.secondary : this.primary;
        context.globalAlpha = 0.035 * amount;
        context.lineWidth = 80 - band * 14;
        context.filter = 'blur(18px)';
        context.stroke();
      }
      context.restore();
      return;
    }
    if (this.effect === 'terminal-scan') {
      const y = ((this.time * 24) % (this.height + 160)) - 80;
      const gradient = context.createLinearGradient(0, y - 55, 0, y + 55);
      gradient.addColorStop(0, alpha(this.primary, 0));
      gradient.addColorStop(0.5, alpha(this.primary, 0.045 * amount));
      gradient.addColorStop(1, alpha(this.primary, 0));
      context.fillStyle = gradient;
      context.fillRect(0, y - 55, this.width, 110);
      return;
    }
    if (this.effect === 'mars-dust') {
      const gradient = context.createLinearGradient(0, this.height * 0.48, 0, this.height);
      gradient.addColorStop(0, alpha(this.primary, 0));
      gradient.addColorStop(1, alpha(this.secondary, 0.07 * amount));
      context.fillStyle = gradient;
      context.fillRect(0, this.height * 0.48, this.width, this.height * 0.52);
      return;
    }
    if (this.effect === 'starlight-glints') {
      glow(
        context,
        this.width * 0.18 + Math.sin(this.time * 0.15) * 12,
        this.height * 0.22,
        160,
        this.primary,
        0.055 * amount
      );
      glow(
        context,
        this.width * 0.82,
        this.height * 0.62 + Math.cos(this.time * 0.15) * 12,
        190,
        this.secondary,
        0.065 * amount
      );
    }
  }

  private drawStars(
    context: CanvasRenderingContext2D,
    update: boolean,
    delta: number,
    field?: AtmosphereField
  ): void {
    for (const star of this.stars) {
      if (update) {
        star.x = wrap(star.x + star.dx * delta);
        star.y = wrap(star.y + star.dy * delta);
      }
      const twinkle = Math.sin(this.time * star.speed + star.phase);
      let opacity = clamp(star.depth + 0.2 + twinkle * 0.24, 0.1, 1);
      const x = ((star.x + this.pointer.x * star.depth * 8) / 100) * this.width;
      const y = ((star.y + this.pointer.y * star.depth * 8) / 100) * this.height;
      if (field) opacity = illuminateStar(opacity, field(x, y));
      else if (this.effect === 'mars-dust') opacity *= 0.78;
      context.globalAlpha = opacity;
      context.fillStyle = star.color;
      context.shadowBlur = star.size * (this.effect === 'starlight-glints' ? 3.4 : 2);
      context.shadowColor = star.color;
      context.beginPath();
      context.arc(x, y, (star.size * (1 + twinkle * 0.24)) / 2, 0, Math.PI * 2);
      context.fill();
    }
  }
}

function glow(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  opacity: number
): void {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, alpha(color, opacity));
  gradient.addColorStop(0.45, alpha(color, opacity * 0.4));
  gradient.addColorStop(1, alpha(color, 0));
  context.fillStyle = gradient;
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function alpha(color: string, opacity: number): string {
  if (!/^#[\da-f]{6}$/i.test(color)) return color;
  return `rgba(${Number.parseInt(color.slice(1, 3), 16)}, ${Number.parseInt(color.slice(3, 5), 16)}, ${Number.parseInt(color.slice(5, 7), 16)}, ${clamp(opacity, 0, 1)})`;
}

function effectValue(value: string | undefined): StarfieldEffectKind {
  return EFFECTS.has(value as StarfieldEffectKind) ? (value as StarfieldEffectKind) : 'none';
}

function numberValue(value: string | undefined): number {
  const number = Number(value?.trim() || 1);
  return Number.isFinite(number) && number >= 0 ? number : 1;
}

function wrap(value: number): number {
  return value > 105 ? -5 : value < -5 ? 105 : value;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function hash(value: string): number {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.codePointAt(0) || 0;
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
