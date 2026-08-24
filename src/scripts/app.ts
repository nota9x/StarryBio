import { ensureStarfield } from './starfield';
import { setupStatus } from './status';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let pageController: AbortController | undefined;
let statusCleanup: (() => void) | undefined;
const initializedAnalytics = new Set<string>();

document.addEventListener('astro:page-load', initializePage);
document.addEventListener('astro:before-swap', cleanupPage);

function initializePage(): void {
  cleanupPage();
  pageController = new AbortController();
  const { signal } = pageController;

  ensureStarfield();
  setupAnnouncement(signal);
  setupCopyButtons(signal);
  statusCleanup = setupStatus(signal);
  initializeAnalytics();
  document.body.style.opacity = '1';
}

function cleanupPage(): void {
  pageController?.abort();
  pageController = undefined;
  statusCleanup?.();
  statusCleanup = undefined;
}

function setupAnnouncement(signal: AbortSignal): void {
  const banner = document.querySelector<HTMLElement>('#announcement-banner');
  const closeButton = document.querySelector<HTMLButtonElement>('#announcement-close-btn');
  const key = banner?.dataset.announcementKey;
  if (!banner || !closeButton || !key) return;

  if (getCookie('starrybioAnnouncement') === key) {
    banner.remove();
    return;
  }

  let removeTimer: number | undefined;
  signal.addEventListener(
    'abort',
    () => {
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    },
    { once: true }
  );

  closeButton.addEventListener(
    'click',
    () => {
      if (removeTimer !== undefined) return;
      setCookie('starrybioAnnouncement', key, 7);
      banner.classList.add('closing');
      const remove = () => {
        if (removeTimer !== undefined) window.clearTimeout(removeTimer);
        banner.remove();
      };
      banner.addEventListener('animationend', remove, { once: true, signal });
      removeTimer = window.setTimeout(remove, 450);
    },
    { signal }
  );
}

function setupCopyButtons(signal: AbortSignal): void {
  document
    .querySelectorAll<HTMLButtonElement>('.copy-button-active[data-copy-value]')
    .forEach((button) => {
      const text = button.dataset.copyValue;
      const feedback = button.querySelector<HTMLElement>('[data-copy-feedback]');
      if (!text || !feedback) return;

      const originalText = feedback.textContent || '';
      const timers = new Set<number>();
      const schedule = (callback: () => void, delay: number): void => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          callback();
        }, delay);
        timers.add(timer);
      };
      signal.addEventListener(
        'abort',
        () => timers.forEach((timer) => window.clearTimeout(timer)),
        { once: true }
      );

      button.addEventListener(
        'click',
        async () => {
          if (button.disabled) return;
          button.disabled = true;
          button.classList.add('copy-feedback-changing');
          let copied = false;
          try {
            await copyText(text);
            copied = true;
          } catch {
            copied = false;
          }

          schedule(() => {
            feedback.textContent = copied ? 'Copied!' : 'Copy failed';
            button.classList.toggle('show-copied-feedback', copied);
            button.classList.remove('copy-feedback-changing');

            schedule(() => {
              button.classList.add('copy-feedback-changing');

              schedule(() => {
                feedback.textContent = originalText;
                button.classList.remove('show-copied-feedback');
                requestAnimationFrame(() => {
                  button.classList.remove('copy-feedback-changing');
                  button.disabled = false;
                });
              }, 180);
            }, 1_650);
          }, 140);
        },
        { signal }
      );
    });
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.append(textArea);
  textArea.select();
  const copied = (
    document as unknown as { execCommand(commandId: string, showUi?: boolean): boolean }
  ).execCommand('copy');
  textArea.remove();
  if (!copied) throw new Error('Clipboard API unavailable');
}

function initializeAnalytics(): void {
  const script = document.querySelector<HTMLScriptElement>('#starrybio-analytics');
  if (script?.dataset.starrybioProvider !== 'google') return;

  const measurementId = script.dataset.measurementId;
  if (!measurementId) return;
  const sendPageView = script.dataset.sendPageView !== 'false';
  let config: Record<string, string | number | boolean> = {};
  try {
    config = JSON.parse(script.dataset.config || '{}') as typeof config;
  } catch {
    console.warn('[StarryBio] Unable to parse Google Analytics config.');
  }

  window.dataLayer ||= [];
  window.gtag ||= (...args: unknown[]) => window.dataLayer!.push(args);

  if (!initializedAnalytics.has(measurementId)) {
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { ...config, send_page_view: sendPageView });
    initializedAnalytics.add(measurementId);
  } else if (sendPageView) {
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}
