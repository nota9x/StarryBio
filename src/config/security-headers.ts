import { createAnalyticsScript } from './analytics';
import type { AnalyticsConfig, StarryBioConfig } from './schema';

export interface SecurityHeader {
  key: string;
  value: string;
}

export function buildSecurityHeaders(config: Pick<StarryBioConfig, 'analytics'>): SecurityHeader[] {
  return [
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy(config.analytics) },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'X-Frame-Options', value: 'DENY' },
  ];
}

export function buildContentSecurityPolicy(
  analytics: AnalyticsConfig | undefined,
  options: { includeFrameAncestors?: boolean } = {}
): string {
  const scriptSources = new Set(["'self'"]);
  const connectSources = new Set(["'self'"]);
  const script = createAnalyticsScript(analytics);

  if (script) {
    const origin = new URL(script.src).origin;
    scriptSources.add(origin);

    // These providers commonly collect through the same origin that serves
    // their script. Allowing only that origin keeps the policy narrow.
    if (
      analytics?.provider === 'plausible' ||
      analytics?.provider === 'umami' ||
      analytics?.provider === 'custom'
    ) {
      connectSources.add(origin);
    }
  }

  if (analytics?.provider === 'google') {
    connectSources.add('https://*.google-analytics.com');
    connectSources.add('https://www.googletagmanager.com');
    connectSources.add('https://stats.g.doubleclick.net');
  } else if (analytics?.provider === 'cloudflare') {
    connectSources.add('https://cloudflareinsights.com');
  }

  const directives = [
    "default-src 'self'",
    `script-src ${[...scriptSources].join(' ')}`,
    `connect-src ${[...connectSources].join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: https:",
    "object-src 'none'",
    "base-uri 'self'",
  ];

  if (options.includeFrameAncestors !== false) directives.push("frame-ancestors 'none'");
  directives.push("form-action 'self'");
  return directives.join('; ');
}
