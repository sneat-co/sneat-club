// Merge the Angular app build into the landing `dist/` under /app/, producing
// the single distribution the Cloudflare Worker serves.
//
// Unlike the ext-template's root-mounted assembly, Sneat Club mounts the app at
// /app: the Astro landing owns real public pages (/, /sports/*, /privacy,
// /preview) and the app owns /app/* — the same split gametable.space and
// noticeboard.cc use, so registration is /app/register on all of them.
//
// Run AFTER `astro build` (writes dist/) and the app build (writes browser/).
import { cp, access } from 'node:fs/promises';

const BROWSER = '../dist/apps/sneatclub-app/browser';
const DIST = './dist/app';

try {
  await access(`${BROWSER}/index.html`);
} catch {
  throw new Error(
    `App build not found at ${BROWSER}/index.html — run the app build first (pnpm run build:app).`,
  );
}

await cp(BROWSER, DIST, { recursive: true, force: true });
console.log('Assembled Angular app into landing dist/app.');
