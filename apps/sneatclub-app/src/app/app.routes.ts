import { Route } from '@angular/router';
import { AuthGuard } from '@angular/fire/auth-guard';
import { redirectToLoginIfNotSignedIn } from '@sneat/auth-core';

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
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectToLoginIfNotSignedIn },
  },
  {
    // Space-scoped routes host the template pages, mirroring sneat-app's
    // space/:spaceType/:spaceID mount point.
    path: 'space/:spaceType/:spaceID',
    loadChildren: () =>
      import('./space/sneatclub-space.routes').then((m) => m.sneatclubSpaceRoutes),
  },
  {
    // Register a club — the unified space-registration flow (sneat-specs
    // decision 0006). Guarded: registering creates a Space owned by the
    // signed-in user, so there must be one.
    path: 'register',
    loadComponent: () =>
      import('./register/register-club-page.component').then(
        (m) => m.RegisterClubPageComponent,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'Register your club',
      authGuardPipe: () => redirectToLoginIfNotSignedIn,
    },
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
    canActivate: [AuthGuard],
    data: { title: 'My profile', authGuardPipe: () => redirectToLoginIfNotSignedIn },
  },
];
