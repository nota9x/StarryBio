import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { getThemePresetDefinition, getThemeStyle } from '../src/config/themes';
import { PULSAR_PERIOD } from '../src/scripts/atmosphere';

/** A test-only bridge injected into the served module, never into the build. */
const bridge = `
window.atmosphereAudit = {
  render(time) { controller.time = time; controller.render(false); },
  state() { return {time:controller.time, stars:JSON.stringify(controller.stars), pointer:{...controller.pointer}}; },
  raster() { const c=controller.atmosphere.canvas;return Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data); },
  canvas() { return controller.canvas.toDataURL(); },
  frames(cycle = 0) {
    return new Promise(resolve => {
      const intervals = []; let previous = 0; const started = controller.time; let lastPhase = started; let resets = 0;
      const frame = time => {
        if (previous) intervals.push(time - previous);
        previous = time;
        if (controller.time < lastPhase) resets += 1;
        lastPhase = controller.time;
        if (cycle ? controller.time - started < cycle : intervals.length < 90) requestAnimationFrame(frame);
        else {
          intervals.sort((a,b) => a-b);
          resolve({frameP95Ms:intervals[Math.floor(intervals.length*0.95)],frameMaxMs:intervals.at(-1), elapsedPhase:controller.time-started, resets});
        }
      };
      requestAnimationFrame(frame);
    });
  }
};`;

declare global {
  interface Window {
    atmosphereAudit: {
      render(time: number): void;
      state(): { time: number; stars: string; pointer: { x: number; y: number } };
      raster(): number[];
      canvas(): string;
      frames(
        cycle?: number
      ): Promise<{ frameP95Ms: number; frameMaxMs: number; elapsedPhase: number; resets: number }>;
    };
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

export async function runAtmosphereAudit(baseUrl: string, output: string): Promise<void> {
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch();
  const report: Record<string, unknown>[] = [];
  try {
    const themes = process.argv.includes('--pulsar')
      ? (['pulsar'] as const)
      : (['eclipse', 'black-hole', 'pulsar'] as const);
    for (const name of themes) {
      for (const [viewport, size] of [
        ['desktop', { width: 1440, height: 900 }],
        ['mobile', { width: 390, height: 844 }],
      ] as const) {
        const page = await browser.newPage({ viewport: size, reducedMotion: 'reduce' });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route(/\/src\/scripts\/starfield\.ts(?:\?.*)?$/, async (route) => {
          const response = await route.fetch();
          await route.fulfill({ response, body: (await response.text()) + bridge });
        });
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        const definition = getThemePresetDefinition(name);
        await page.evaluate(
          ({ name, style, effect }) => {
            document.documentElement.style.cssText = style;
            document.documentElement.dataset.theme = name;
            const stars = document.querySelector<HTMLElement>('.stars-container')!;
            stars.dataset.starfieldEffect = effect;
            stars.dataset.animationIntensity = 'normal';
            stars.dataset.shootingStarMultiplier = '0';
            document.dispatchEvent(new Event('astro:page-load'));
          },
          {
            name,
            style: getThemeStyle({
              preset: name,
              accent: definition.accent,
              background: 'starfield',
              cardRadius: 28,
              buttonRadius: 16,
            }),
            effect: definition.starfieldEffect,
          }
        );
        await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(output, `${name}-${viewport}-reduced.png`) });

        // Same-theme navigation and resize must preserve both phase and stars.
        await page.evaluate(() => window.atmosphereAudit.render(43.25));
        const before = await page.evaluate(() => ({
          state: window.atmosphereAudit.state(),
          image: window.atmosphereAudit.canvas(),
        }));
        await page.evaluate(() => document.dispatchEvent(new Event('astro:page-load')));
        const reinitialized = await page.evaluate(() => ({
          state: window.atmosphereAudit.state(),
          image: window.atmosphereAudit.canvas(),
        }));
        assert(
          JSON.stringify(before) === JSON.stringify(reinitialized),
          `${name}/${viewport}: reinitialization reset`
        );
        await page.setViewportSize({ width: size.width - 1, height: size.height });
        await page.setViewportSize(size);
        assert(
          (await page.evaluate(() => window.atmosphereAudit.state().time)) === 43.25,
          'Resize reset phase'
        );
        await page.evaluate(() => {
          const stars = document.querySelector<HTMLElement>('.stars-container')!;
          stars.dataset.animationIntensity = 'none';
          document.dispatchEvent(new Event('astro:page-load'));
        });
        const disabled = await page.evaluate(() => ({
          state: window.atmosphereAudit.state(),
          image: window.atmosphereAudit.canvas(),
        }));
        assert(
          JSON.stringify(before) === JSON.stringify(disabled),
          `${name}/${viewport}: animation disabled changes frozen frame`
        );
        await page.screenshot({ path: path.join(output, `${name}-${viewport}-disabled.png`) });

        // Deterministic motion frames, including the wrap neighborhood.
        await page.evaluate(() => {
          document.querySelector<HTMLElement>('.stars-container')!.dataset.animationIntensity =
            'normal';
          document.dispatchEvent(new Event('astro:page-load'));
        });
        const phases = [0, 0.25, 0.5, 0.75, 1 - 1 / 4000, 1, 1 + 1 / 4000];
        for (const [index, phase] of phases.entries()) {
          await page.evaluate((time) => window.atmosphereAudit.render(time), phase * PULSAR_PERIOD);
          await page.screenshot({
            path: path.join(output, `${name}-${viewport}-phase-${index}.png`),
          });
        }
        const statistics = await page.evaluate((period) => {
          const audit = window.atmosphereAudit;
          audit.render(0);
          const start = audit.raster();
          audit.render(period);
          const end = audit.raster();
          const seam = Math.max(...end.map((value, index) => Math.abs(value - start[index])));
          const durations: number[] = [];
          // Render a complete cycle rather than testing only its endpoints.
          for (let index = 0; index <= 240; index += 1) {
            const startTime = performance.now();
            audit.render((index / 240) * period);
            durations.push(performance.now() - startTime);
          }
          durations.sort((a, b) => a - b);
          return {
            seamMaxByteDifference: seam,
            renderP95Ms: durations[Math.floor(durations.length * 0.95)],
            renderMaxMs: durations.at(-1),
          };
        }, PULSAR_PERIOD);
        if (name === 'pulsar')
          assert(statistics.seamMaxByteDifference <= 1, `${viewport}: Pulsar raster seam`);

        // Unobstructed scene for checking shapes that the card could conceal.
        await page.addStyleTag({
          content: 'body > :not(.stars-container){display:none!important}',
        });
        await page.evaluate(() => window.atmosphereAudit.render(7.5));
        await page.screenshot({ path: path.join(output, `${name}-${viewport}-background.png`) });
        if (name === 'pulsar')
          await page.screenshot({
            path: path.join(output, `pulsar-${viewport}-upper-left.png`),
            clip: {
              x: 0,
              y: 0,
              width: Math.round(size.width * 0.5),
              height: Math.round(size.height * 0.55),
            },
          });
        if (name === 'pulsar') {
          await mkdir(path.join(output, `pulsar-${viewport}-cycle`), { recursive: true });
          for (let index = 0; index < 48; index += 1) {
            await page.evaluate(
              (time) => window.atmosphereAudit.render(time),
              (index / 48) * PULSAR_PERIOD
            );
            await page.screenshot({
              path: path.join(output, `pulsar-${viewport}-cycle`, `${index}.png`),
            });
          }
          await page.evaluate(() => window.atmosphereAudit.render(7.5));
        }
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.mouse.move(size.width * 0.9, size.height * 0.2, { steps: 8 });
        await page.waitForTimeout(600);
        const frameTiming = await page.evaluate(() => window.atmosphereAudit.frames());
        const liveCycle =
          name === 'pulsar' && viewport === 'desktop' && !process.argv.includes('--stills')
            ? await page.evaluate((period) => window.atmosphereAudit.frames(period), PULSAR_PERIOD)
            : undefined;
        if (liveCycle)
          assert(
            liveCycle.resets === 0 && liveCycle.elapsedPhase >= PULSAR_PERIOD,
            'Live Pulsar cycle reset'
          );
        const moving = await page.evaluate(() => window.atmosphereAudit.state());
        await page.evaluate(() => {
          Object.defineProperty(document, 'hidden', { configurable: true, value: true });
          document.dispatchEvent(new Event('visibilitychange'));
        });
        const hidden = await page.evaluate(() => ({
          state: window.atmosphereAudit.state(),
          image: window.atmosphereAudit.canvas(),
        }));
        await page.waitForTimeout(100);
        assert(
          (await page.evaluate(() => window.atmosphereAudit.state().time)) === hidden.state.time,
          'Hidden scene advanced time'
        );
        await page.evaluate(() => {
          Reflect.deleteProperty(document, 'hidden');
          document.dispatchEvent(new Event('visibilitychange'));
        });
        const resumed = await page.evaluate(() => window.atmosphereAudit.state().time);
        assert(
          resumed >= hidden.state.time && resumed - hidden.state.time < 0.06,
          'Resume reset or caught up hidden time'
        );
        assert(moving.time > 7.5, `${name}: animation failed to resume`);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const frozen = await page.evaluate(() => ({
          state: window.atmosphereAudit.state(),
          image: window.atmosphereAudit.canvas(),
        }));
        await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
        assert(
          (await page.evaluate(() => window.atmosphereAudit.canvas())) === frozen.image,
          'Visibility event changed held frame'
        );
        await page.waitForTimeout(100);
        assert(
          (await page.evaluate(() => window.atmosphereAudit.state().time)) === frozen.state.time,
          'Reduced motion advanced time'
        );
        assert(errors.length === 0, errors.join('\n'));
        report.push({
          name,
          viewport,
          ...statistics,
          ...frameTiming,
          liveCycle,
          lifecycle: 'passed',
          runtimeErrors: errors,
        });
        console.log(`✓ Atmosphere ${name}/${viewport}`, statistics);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  const rows = ['eclipse', 'black-hole', 'pulsar']
    .map(
      (name) =>
        `<section><h2>${name}</h2><div>${['desktop', 'mobile'].map((size) => `<figure><img src="${name}-${size}-reduced.png"><figcaption>${size}: reduced motion</figcaption></figure><figure><img src="${name}-${size}-background.png"><figcaption>${size}: unobstructed field</figcaption></figure>`).join('')}</div></section>`
    )
    .join('');
  await writeFile(
    path.join(output, 'index.html'),
    `<!doctype html><html lang="en"><meta charset="utf-8"><title>Atmospheric theme verification</title><style>body{background:#141414;color:#eee;font:16px system-ui;margin:24px}section div{display:grid;grid-template-columns:2fr 2fr 1fr 1fr;gap:16px}figure{margin:0}img{width:100%;display:block}figcaption{margin:8px 0 24px}input{width:100%}</style><h1>Atmospheric theme verification</h1><p>Deterministic desktop/mobile renders. Pulsar completes one cycle in approximately 107 seconds at normal intensity.</p>${rows}<h2>Pulsar: complete cycle</h2><p>Drag the slider to inspect orientation and diffusion through a full revolution.</p><input type="range" id="phase" min="0" max="48" value="0"><img id="cycle" src="pulsar-desktop-cycle/0.png"><script>document.querySelector('#phase').oninput=e=>document.querySelector('#cycle').src='pulsar-desktop-cycle/'+(Number(e.target.value)%48)+'.png'</script></html>`
  );
}
