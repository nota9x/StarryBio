interface Star {
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  depth: number;
  driftX: number;
  driftY: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

const DEFAULT_STAR_COLORS = ['#ffffff', '#ffe9c4', '#d4fbff', '#d4fbff', '#b3cde0'];
const DEFAULT_STAR_COUNT = 200;
const REDUCED_STAR_COUNT = 80;
const DEFAULT_SHOOTING_STAR_CHANCE = 0.05;

let controller: StarfieldController | undefined;

export function ensureStarfield(): void {
  const container = document.querySelector<HTMLElement>('.stars-container');
  if (!container) return;
  if (!controller) controller = new StarfieldController(container);
  controller.configure(container);
}

class StarfieldController {
  private container: HTMLElement;
  private readonly canvas = document.createElement('canvas');
  private readonly context: CanvasRenderingContext2D | null;
  private readonly stars: Star[] = [];
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private frameId?: number;
  private shootingStarTimeout?: number;
  private width = 0;
  private height = 0;
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;
  private animationTime = 0;
  private starMultiplier = 1;
  private shootingStarMultiplier = 1;
  private starColors = DEFAULT_STAR_COLORS;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas.className = 'starfield-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.context = this.canvas.getContext('2d');
    container.prepend(this.canvas);

    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => this.syncAnimation());
    document.addEventListener('pointermove', (event) => {
      this.targetMouseX = event.clientX / window.innerWidth - 0.5;
      this.targetMouseY = event.clientY / window.innerHeight - 0.5;
    });
    this.reducedMotion.addEventListener('change', () => this.rebuild());
    this.resize();
  }

  configure(container: HTMLElement): void {
    this.container = container;
    if (!container.contains(this.canvas)) container.prepend(this.canvas);

    const intensity = container.dataset.animationIntensity || 'normal';
    const styles = window.getComputedStyle(container);
    this.starColors = DEFAULT_STAR_COLORS.map(
      (fallback, index) => styles.getPropertyValue(`--star-color-${index + 1}`).trim() || fallback
    );
    this.starMultiplier = parseMultiplier(container.dataset.starMultiplier);
    this.shootingStarMultiplier = parseMultiplier(container.dataset.shootingStarMultiplier);
    if (intensity === 'none') {
      this.starMultiplier = 0;
      this.shootingStarMultiplier = 0;
    } else if (intensity === 'subtle') {
      this.starMultiplier *= 0.55;
      this.shootingStarMultiplier *= 0.45;
    } else if (intensity === 'high') {
      this.starMultiplier *= 1.35;
      this.shootingStarMultiplier *= 1.35;
    }
    this.rebuild();
  }

  private rebuild(): void {
    this.stop();
    const count = Math.round(
      (this.reducedMotion.matches ? REDUCED_STAR_COUNT : DEFAULT_STAR_COUNT) * this.starMultiplier
    );
    this.stars.length = 0;
    for (let index = 0; index < count; index += 1) {
      const depth = Math.random();
      this.stars.push({
        baseX: Math.random() * 100,
        baseY: Math.random() * 100,
        size: Math.random() * 2.2 + 0.5,
        color: this.starColors[Math.floor(Math.random() * this.starColors.length)],
        depth,
        driftX: (Math.random() - 0.5) * 0.002 * (depth + 0.2),
        driftY: (Math.random() - 0.5) * 0.002 * (depth + 0.2),
        twinkleSpeed: Math.random() * 0.03 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    this.render(false);
    this.syncAnimation();
  }

  private resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * pixelRatio);
    this.canvas.height = Math.round(this.height * pixelRatio);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.render(false);
  }

  private syncAnimation(): void {
    if (document.hidden || this.reducedMotion.matches) {
      this.stop();
      this.render(false);
      return;
    }
    this.startAnimation();
    this.scheduleShootingStar();
  }

  private startAnimation(): void {
    if (this.frameId !== undefined || !this.context || this.starMultiplier === 0) return;
    const animate = () => {
      if (document.hidden || this.reducedMotion.matches) {
        this.frameId = undefined;
        return;
      }
      this.render(true);
      this.frameId = window.requestAnimationFrame(animate);
    };
    this.frameId = window.requestAnimationFrame(animate);
  }

  private scheduleShootingStar(): void {
    if (this.shootingStarTimeout !== undefined || this.shootingStarMultiplier === 0) return;
    const spawn = () => {
      if (Math.random() < DEFAULT_SHOOTING_STAR_CHANCE * this.shootingStarMultiplier) {
        const element = document.createElement('span');
        element.className = 'shooting-star';
        element.style.top = `${Math.random() * 55}%`;
        element.style.left = `${Math.random() * 80}%`;
        element.style.setProperty('--angle', `${Math.random() * 25 + 25}deg`);
        const duration = Math.random() * 1.5 + 2.5;
        element.style.animationDuration = `${duration}s`;
        this.container.append(element);
        window.setTimeout(() => element.remove(), duration * 1000);
      }
      this.shootingStarTimeout = window.setTimeout(spawn, 500);
    };
    this.shootingStarTimeout = window.setTimeout(spawn, 1_500);
  }

  private stop(): void {
    if (this.frameId !== undefined) window.cancelAnimationFrame(this.frameId);
    if (this.shootingStarTimeout !== undefined) window.clearTimeout(this.shootingStarTimeout);
    this.frameId = undefined;
    this.shootingStarTimeout = undefined;
    this.container.querySelectorAll('.shooting-star').forEach((element) => element.remove());
  }

  private render(update: boolean): void {
    if (!this.context) return;
    this.context.clearRect(0, 0, this.width, this.height);
    if (update) {
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
      this.animationTime += 1;
    }

    this.stars.forEach((star) => {
      if (update) {
        star.baseX = wrapPercentage(star.baseX + star.driftX);
        star.baseY = wrapPercentage(star.baseY + star.driftY);
      }
      const twinkle = Math.sin(this.animationTime * star.twinkleSpeed + star.twinklePhase);
      const scale = update ? 1 + twinkle * 0.3 : 1;
      const opacity = update
        ? Math.max(0.1, Math.min(1, star.depth + 0.2 + twinkle * 0.3))
        : Math.max(0.25, star.depth);
      const x = ((star.baseX + this.mouseX * star.depth * 10) / 100) * this.width;
      const y = ((star.baseY + this.mouseY * star.depth * 10) / 100) * this.height;

      this.context!.globalAlpha = opacity;
      this.context!.fillStyle = star.color;
      this.context!.shadowBlur = star.size * 2;
      this.context!.shadowColor = star.color;
      this.context!.beginPath();
      this.context!.arc(x, y, (star.size * scale) / 2, 0, Math.PI * 2);
      this.context!.fill();
    });
    this.context.globalAlpha = 1;
    this.context.shadowBlur = 0;
  }
}

function parseMultiplier(value: string | undefined): number {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
}

function wrapPercentage(value: number): number {
  if (value > 105) return -5;
  if (value < -5) return 105;
  return value;
}
