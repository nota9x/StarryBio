interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Serve Static Assets
    // The `env.ASSETS` binding is automatically provided by Cloudflare when 'assets' is configured in wrangler.jsonc
    // It handles map requests to files in src/site
    try {
      const response = await env.ASSETS.fetch(request);

      // If found (200) or not modified (304), return it
      if (response.status >= 200 && response.status < 400) {
        return response;
      }

      // If 404, we can serve our custom 404 page
      if (response.status === 404) {
        const notFoundPage = await env.ASSETS.fetch(new Request(new URL('/404.html', request.url)));
        if (notFoundPage.status === 200) {
          return new Response(notFoundPage.body, { status: 404, headers: notFoundPage.headers });
        }
      }

      return response;
    } catch (e) {
      // Fallback for internal errors
      return new Response('Internal Error', { status: 500 });
    }
  },
};
