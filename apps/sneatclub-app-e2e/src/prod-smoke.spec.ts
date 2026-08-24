import { expect, test } from '@playwright/test';

/**
 * Production-bundle smoke: walks every expected route of the built app and
 * fails on ANY Angular runtime error in the console.
 *
 * Exists because a class of failure lives only in the production bundle:
 * duplicated pnpm peer instances gave the app two copies of @sneat/ui — two
 * InjectionToken('className') objects — and opening a club died with NG0201
 * in production while every unit test (dev-mode module resolution collapses
 * the duplicates) stayed green. Unit tests prove logic; only the built
 * artifact proves the bundle.
 *
 * Run against a server serving dist/ with SPA fallback:
 *   pnpm exec nx build sneatclub-app
 *   node tools/spa-server.mjs dist/apps/sneatclub-app/browser &
 *   BASE_URL=http://localhost:4299 pnpm exec playwright test src/prod-smoke.spec.ts
 */

// Every route a visitor can land on. Auth-gated pages redirect to /login —
// that is an expected path too, and it must render without errors.
const ROUTES = [
  '/',
  '/login',
  '/register/start',
  '/register/sign-in',
  '/register/plan',
  '/register/welcome',
  '/register/return',
  '/space/club/probe-club-id',
  '/space/club/probe-club-id/teams',
  '/space/club/probe-club-id/new-team',
  '/space/club/probe-club-id/staff',
  '/space/club/probe-club-id/players',
  '/space/club/probe-club-id/parents',
  '/space/club/probe-club-id/venues',
  '/space/club/probe-club-id/gear',
  '/space/club/probe-club-id/lists',
  '/space/team/probe-team-id',
  '/space/team/probe-team-id/players',
  '/my',
];

// Angular runtime errors (NG0201 no-provider, NG04002 no-route, ...). Network
// noise from Firebase against a probe backend is not a bundle defect and is
// deliberately not matched.
const ANGULAR_ERROR = /NG0\d{3,4}/;

for (const route of ROUTES) {
  test(`renders ${route} without Angular runtime errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' && ANGULAR_ERROR.test(m.text())) {
        errors.push(m.text());
      }
    });
    page.on('pageerror', (e) => {
      if (ANGULAR_ERROR.test(String(e))) {
        errors.push(String(e));
      }
    });

    await page.goto(route);
    await expect(page.locator('ion-app')).toBeVisible();
    // Wait until Angular reports the app settled — lazy chunks loaded, route
    // activation finished — so late DI failures have surfaced. Deterministic,
    // unlike a sleep. Testability is exposed in production builds by default.
    await page.waitForFunction(() => {
      const w = window as unknown as {
        getAllAngularTestabilities?: () => { isStable(): boolean }[];
      };
      const all = w.getAllAngularTestabilities?.();
      return !all || all.every((t) => t.isStable());
    });

    expect(errors, `Angular errors on ${route}:\n${errors.join('\n')}`).toEqual([]);
  });
}
