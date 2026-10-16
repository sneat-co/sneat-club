// Merge the Angular app build into the landing `dist/` under /app/, producing
// the single static distribution Cloudflare serves (assets-only: no Worker).
//
// Sneat Club mounts the app at /app: the Astro landing owns real public pages
// (/, /sports/*, /privacy, /preview) and the app owns /app/* — the same split
// gametable.space and noticeboard.cc use, so registration is /app/register on
// all of them.
//
// Layout produced:
//   dist/landing.html   the Astro landing home (public/_redirects serves it at `/`)
//   dist/<page>/...     the other landing pages, untouched
//   dist/app/...        the whole Angular build (base-href /app/)
//   dist/index.html     the SPA fallback (assets.not_found_handling =
//                       single-page-application): the app's index.html plus a tiny
//                       script that sends any non-/app/ path to /app/<path>, so a
//                       mistyped landing URL lands in the app instead of a blank shell.
//
// Run AFTER `astro build` (writes dist/) and the app build (writes browser/).
import { access, cp, readFile, rename, writeFile } from 'node:fs/promises';

const BROWSER = '../dist/apps/sneatclub-app/browser';
const DIST = './dist';

try {
  await access(`${BROWSER}/index.html`);
} catch {
  throw new Error(
    `App build not found at ${BROWSER}/index.html — run the app build first (pnpm run build:app).`,
  );
}

// The landing home moves out of the way; the SPA fallback takes dist/index.html.
await rename(`${DIST}/index.html`, `${DIST}/landing.html`);
await cp(BROWSER, `${DIST}/app`, { recursive: true, force: true });

const LEGACY_REDIRECT =
  "<script>if(!/^\\/app(\\/|$)/.test(location.pathname))" +
  "location.replace('/app'+location.pathname+location.search+location.hash)</script>";
const shell = await readFile(`${BROWSER}/index.html`, 'utf8');
if (!/<head[^>]*>/i.test(shell)) {
  throw new Error('App index.html has no <head> to inject the redirect into.');
}
await writeFile(`${DIST}/index.html`, shell.replace(/<head[^>]*>/i, (m) => m + LEGACY_REDIRECT));

console.log(
  'Assembled Angular app into dist/app; SPA fallback: dist/index.html; landing home: dist/landing.html.',
);
