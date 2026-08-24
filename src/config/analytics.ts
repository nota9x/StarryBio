import type { AnalyticsConfig } from './schema';

const RESERVED_CUSTOM_DATA_ATTRIBUTES = new Set([
  'starrybio-provider',
  'measurement-id',
  'send-page-view',
  'config',
]);

export interface AnalyticsScriptDescriptor {
  src: string;
  loading: 'async' | 'defer' | 'module';
  attrs: Record<string, string | boolean>;
}

export function createAnalyticsScript(
  analytics: AnalyticsConfig | undefined
): AnalyticsScriptDescriptor | null {
  if (!analytics || analytics.provider === 'none') return null;

  switch (analytics.provider) {
    case 'cloudflare':
      return {
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        loading: 'module',
        attrs: { 'data-cf-beacon': serializeJsonAttribute({ token: analytics.token }) },
      };
    case 'google':
      return {
        src:
          analytics.scriptSrc ||
          `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analytics.measurementId)}`,
        loading: 'async',
        attrs: {
          'data-starrybio-provider': analytics.provider,
          'data-measurement-id': analytics.measurementId,
          'data-send-page-view': String(analytics.sendPageView ?? true),
          'data-config': serializeJsonAttribute(analytics.config || {}),
        },
      };
    case 'plausible':
      return {
        src: analytics.scriptSrc || 'https://plausible.io/js/script.js',
        loading: 'defer',
        attrs: analytics.domain ? { 'data-domain': analytics.domain } : {},
      };
    case 'umami':
      return {
        src: analytics.scriptSrc,
        loading: 'defer',
        attrs: { 'data-website-id': analytics.websiteId },
      };
    case 'custom':
      return {
        src: analytics.scriptSrc,
        loading: 'defer',
        attrs: analytics.dataAttributes
          ? Object.fromEntries(
              Object.entries(analytics.dataAttributes)
                .filter(([key]) => !RESERVED_CUSTOM_DATA_ATTRIBUTES.has(key))
                .map(([key, value]) => [`data-${key}`, value])
            )
          : {},
      };
  }
}

export function serializeJsonAttribute(value: unknown): string {
  return JSON.stringify(value)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}
