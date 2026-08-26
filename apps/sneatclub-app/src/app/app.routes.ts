import { Route } from '@angular/router';
import { sneatAuthGuard } from '@sneat/auth-core';

export const appRoutes: Route[] = [
  {
    // Authenticated landing: lists the user's spaces. Unauthenticated visitors
    // are redirected to /login by the auth guard. Replaces the previous
    // redirectTo:'login', which bounced signed-in users back to the login page.
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./home/sneatclub-home-page.component').then(
        (m) => m.SneatclubHomePageComponent,
      ),
    canActivate: [sneatAuthGuard],
  },
  {
    // Space-scoped routes host the template pages, mirroring sneat-app's
    // space/:spaceType/:spaceID mount point.
    path: 'space/:spaceType/:spaceID',
    loadChildren: () =>
      import('./space/sneatclub-space.routes').then((m) => m.sneatclubSpaceRoutes),
  },
  {
    // The landing for invite links: /join/team?id=<inviteID>#pin=<pin>.
    // Unguarded — the invite preview shows before sign-in (see JoinPageComponent).
    path: 'join/:spaceType',
    loadComponent: () =>
      import('./join/join-page.component').then((m) => m.JoinPageComponent),
  },
  {
    // Register your club — the unified space-registration wizard
    // (sneat-specs decision 0006): form first, sign-in at the commit point
    // with the visitor's data still on screen, then plan, then onboarding.
    //
    // Deliberately UNGUARDED: an AuthGuard here made the first thing a visitor
    // saw a stock login page — a sign-in wall before any value. Steps that need
    // state (auth, a created space) redirect within the wizard instead.
    path: 'register',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'start' },
      {
        path: 'start',
        loadComponent: () =>
          import('./register/register-start-page.component').then(
            (m) => m.RegisterStartPageComponent,
          ),
        data: { title: 'Register your club' },
      },
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./register/register-sign-in-page.component').then(
            (m) => m.RegisterSignInPageComponent,
          ),
        data: { title: 'Sign in to create your club' },
      },
      {
        path: 'plan',
        loadComponent: () =>
          import('./register/register-plan-page.component').then(
            (m) => m.RegisterPlanPageComponent,
          ),
        data: { title: 'Choose your plan' },
      },
      {
        // Stripe's return URL after embedded checkout (paymentus catalogue).
        path: 'return',
        loadComponent: () =>
          import('./register/register-return-page.component').then(
            (m) => m.RegisterReturnPageComponent,
          ),
        data: { title: 'Payment' },
      },
      {
        path: 'welcome',
        loadComponent: () =>
          import('./register/register-welcome-page.component').then(
            (m) => m.RegisterWelcomePageComponent,
          ),
        data: { title: 'Welcome' },
      },
    ],
  },
  {
    // sneat-auth-menu-item navigates here on sign-out; mirror sneat-app and
    // redirect to the login page (where the sign-in form is shown).
    path: 'signed-out',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    // User profile (linked auth accounts, country). Linked from the side menu's
    // sneat-auth-menu-item "signed in as" row. Guarded like the home page.
    path: 'my',
    loadComponent: () =>
      import('./my/my-profile-page.component').then(
        (m) => m.MyProfilePageComponent,
      ),
    canActivate: [sneatAuthGuard],
    data: { title: 'My profile' },
  },
];
