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
  setupFeedbackActions(signal);
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
  const container = document.querySelector<HTMLElement>('#announcement-banner-container');
  const banner = document.querySelector<HTMLElement>('#announcement-banner');
  const closeButton = document.querySelector<HTMLButtonElement>('#announcement-close-btn');
  const key = banner?.dataset.announcementKey;
  if (!container || !banner || !closeButton || !key) return;

  const root = document.documentElement;
  const clearAnnouncementSpace = (): void => {
    root.dataset.announcementState = 'dismissed';
    root.style.setProperty('--announcement-clearance', '0px');
  };

  if (getCookie('starrybioAnnouncement') === key) {
    clearAnnouncementSpace();
    container.remove();
    return;
  }

  root.dataset.announcementState = 'visible';
  const updateClearance = (): void => {
    root.style.setProperty(
      '--announcement-clearance',
      `${Math.ceil(Math.max(0, banner.getBoundingClientRect().bottom))}px`
    );
  };
  const resizeObserver = new ResizeObserver(updateClearance);
  resizeObserver.observe(banner);
  updateClearance();
  window.addEventListener('resize', updateClearance, { passive: true, signal });

  let removeTimer: number | undefined;
  signal.addEventListener(
    'abort',
    () => {
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
      resizeObserver.disconnect();
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
        resizeObserver.disconnect();
        clearAnnouncementSpace();
        container.remove();
      };
      banner.addEventListener('animationend', remove, { once: true, signal });
      removeTimer = window.setTimeout(remove, 450);
    },
    { signal }
  );
}

interface FeedbackActionOptions {
  control: HTMLButtonElement | HTMLAnchorElement;
  feedback: HTMLElement;
  successText: string;
  errorText: string;
  perform: () => Promise<void>;
}

const FEEDBACK_ENTER_DELAY = 140;
const FEEDBACK_VISIBLE_DURATION = 1_650;
const FEEDBACK_EXIT_DURATION = 180;

function setupFeedbackActions(signal: AbortSignal): void {
  document
    .querySelectorAll<HTMLButtonElement>('.copy-button-active[data-copy-value]')
    .forEach((button) => {
      const text = button.dataset.copyValue;
      const feedback = button.querySelector<HTMLElement>('[data-feedback-live]');
      if (!text || !feedback) return;
      bindFeedbackAction(
        {
          control: button,
          feedback,
          successText: 'Copied!',
          errorText: 'Copy failed',
          perform: () => copyText(text),
        },
        signal
      );
    });

  document.querySelectorAll<HTMLAnchorElement>('[data-download-feedback]').forEach((link) => {
    const feedback = link.querySelector<HTMLElement>('[data-feedback-live]');
    if (!feedback || !link.href || !link.hasAttribute('download')) return;
    bindFeedbackAction(
      {
        control: link,
        feedback,
        successText: 'QR code downloaded',
        errorText: 'Download failed',
        perform: () => triggerDownload(link),
      },
      signal
    );
  });
}

function bindFeedbackAction(options: FeedbackActionOptions, signal: AbortSignal): void {
  const { control, feedback } = options;
  const originalText = feedback.textContent || '';
  const timers = new Set<number>();
  const schedule = (callback: () => void, delay: number): void => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  };
  signal.addEventListener('abort', () => timers.forEach((timer) => window.clearTimeout(timer)), {
    once: true,
  });

  const activate = async (): Promise<void> => {
    if (control.dataset.feedbackState) return;
    control.dataset.feedbackState = 'copying';
    control.setAttribute('aria-busy', 'true');
    control.classList.add('feedback-changing');
    let succeeded = false;
    try {
      await options.perform();
      succeeded = true;
    } catch {
      succeeded = false;
    }

    schedule(() => {
      const message = succeeded ? options.successText : options.errorText;
      feedback.textContent = message;
      control.classList.toggle('show-success-feedback', succeeded);
      control.dataset.feedbackState = succeeded ? 'success' : 'error';
      control.classList.remove('feedback-changing');

      schedule(() => {
        control.classList.add('feedback-changing');
        schedule(() => {
          feedback.textContent = originalText;
          control.classList.remove('show-success-feedback');
          requestAnimationFrame(() => {
            control.classList.remove('feedback-changing');
            control.removeAttribute('data-feedback-state');
            control.removeAttribute('aria-busy');
          });
        }, FEEDBACK_EXIT_DURATION);
      }, FEEDBACK_VISIBLE_DURATION);
    }, FEEDBACK_ENTER_DELAY);
  };

  control.addEventListener(
    'click',
    (event) => {
      if (control.dataset.feedbackState) {
        if (control instanceof HTMLAnchorElement) event.preventDefault();
        return;
      }
      if (control instanceof HTMLAnchorElement) event.preventDefault();
      void activate();
    },
    { signal }
  );
}

async function triggerDownload(link: HTMLAnchorElement): Promise<void> {
  const response = await fetch(link.href, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Download failed with status ${response.status}`);
  const objectUrl = URL.createObjectURL(await response.blob());
  const download = document.createElement('a');
  download.href = objectUrl;
  download.download = link.download || link.href.split('/').at(-1) || 'download';
  download.hidden = true;
  document.body.append(download);
  download.click();
  download.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
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
