// @vitest-environment jsdom
// @vitest-environment-options {"url": "https://sneat.club/app/"}
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { getStandardSneatProviders, provideAppInfo } from '@sneat/app';
import { SneatApp } from '@sneat/core';
import { provideContactus } from '@sneat/extension-contactus';
import { SneatUserService } from '@sneat/auth-core';
import { provideSneatclub } from '@sneat/extension-sneatclub';
import { RandomIdService } from '@sneat/random';
import { BehaviorSubject } from 'rxjs';
import { sneatclubAppEnvironmentConfig } from '../environments/environment';
import { appRoutes } from './app.routes';
import { App } from './app';

// Navigating from the home page into a club died in production with NG0201
// (some provider missing while activating the space route) — a class of
// failure that only surfaces when the destination route's components actually
// construct. This spec performs the real navigation with the real routes, so
// the missing token is named here instead of minified in a user's console.
describe('space route DI', () => {
  const userState$ = new BehaviorSubject<unknown>({
    status: 'authenticated',
    user: { uid: 'u1', isAnonymous: false, emailVerified: true, providerData: [] },
    record: {
      title: 'Test User',
      spaces: { c1: { title: 'Limerick Celtics', type: 'club', roles: ['creator'] } },
    },
  });

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        // Mirrors main.ts exactly — the point is to construct the space route
        // under the SAME providers production bootstraps with.
        ...getStandardSneatProviders(sneatclubAppEnvironmentConfig),
        ...provideContactus(),
        RandomIdService,
        ...provideSneatclub(),
        provideAppInfo({ appId: 'sneatclub' as SneatApp, appTitle: 'Sneat Club' }),
        provideRouter(appRoutes),
        {
          provide: SneatUserService,
          useValue: { userState: userState$, currentUserID: 'u1', userChanged: userState$ },
        },
      ],
    }),
  );

  it('activates space/club/:id inside the real app shell without DI errors', async () => {
    // The real shell matters: the space route mounts a component into the
    // split pane's named 'menu' outlet as well as the primary outlet, and a
    // provider missing from THAT tree only surfaces when both render — which
    // is exactly how production failed while a router-harness spec passed.
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/space/club/c1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toContain('/space/club/c1');
  });
});
