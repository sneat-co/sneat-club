// Edge router for sneat.club: the Astro landing owns the public pages, the
// Angular app (dist/app, base-href /app/) owns /app/*.

async function fetchAssetFollowingRedirect(request, env, assetPath, origin) {
  const assetUrl = new URL(assetPath, origin);
  let res = await env.ASSETS.fetch(new Request(assetUrl, request));
  if (res.status >= 301 && res.status <= 308) {
    const loc = res.headers.get('location');
    if (loc) {
      res = await env.ASSETS.fetch(new Request(new URL(loc, origin), request));
    }
  }
  return res;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;

    // Registration lives in the Angular app (the unified focused frame —
    // sneat-specs decision 0006), at the same path every Sneat product uses.
    if (p === '/register' || p === '/register/') {
      return Response.redirect(new URL('/app/register', url.origin).toString(), 301);
    }

    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;

    // Angular SPA deep links (e.g. /app/register, /app/space/...) have no
    // static file; serve the app's own shell.
    if (p === '/app' || p.startsWith('/app/')) {
      const appFallbackRes = await fetchAssetFollowingRedirect(
        request,
        env,
        '/app/index.html',
        url.origin,
      );
      if (appFallbackRes.status === 200) {
        return new Response(appFallbackRes.body, {
          status: 200,
          headers: appFallbackRes.headers,
        });
      }
    }

    return res;
  },
};
