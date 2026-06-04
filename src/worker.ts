interface Env {
  ASSETS: Fetcher;
}

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
};

function getCacheControl(pathname: string): string {
  if (pathname === '/' || pathname.endsWith('.html')) {
    return 'public, max-age=0, must-revalidate';
  }

  if (pathname.endsWith('/config.js')) {
    return 'public, max-age=0, must-revalidate';
  }

  if (pathname.endsWith('.css') || pathname.endsWith('.js')) {
    return 'public, max-age=3600, must-revalidate';
  }

  if (/\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(pathname)) {
    return 'public, max-age=86400, must-revalidate';
  }

  return 'public, max-age=0, must-revalidate';
}

function withHeaders(response: Response, pathname: string): Response {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  headers.set('Cache-Control', getCacheControl(pathname));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    try {
      const response = await env.ASSETS.fetch(request);

      if (response.status >= 200 && response.status < 400) {
        return withHeaders(response, url.pathname);
      }

      if (response.status === 404) {
        const notFoundPage = await env.ASSETS.fetch(new Request(new URL('/404.html', request.url)));
        if (notFoundPage.status === 200) {
          return withHeaders(
            new Response(notFoundPage.body, {
              status: 404,
              statusText: 'Not Found',
              headers: notFoundPage.headers,
            }),
            '/404.html'
          );
        }
      }

      return withHeaders(response, url.pathname);
    } catch {
      return withHeaders(new Response('Internal Error', { status: 500 }), url.pathname);
    }
  },
};
