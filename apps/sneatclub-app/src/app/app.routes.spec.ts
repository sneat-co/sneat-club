import { sneatAuthGuard } from '@sneat/auth-core';
import { appRoutes } from './app.routes';

describe('appRoutes', () => {
  it('serves an authenticated home component at the root path', () => {
    const root = appRoutes.find((r) => r.path === '');
    expect(root?.pathMatch).toBe('full');
    // Root must render a landing component, NOT redirect to login (which would
    // bounce signed-in users straight back to the login page).
    expect(root?.redirectTo).toBeUndefined();
    expect(typeof root?.loadComponent).toBe('function');
  });

  it('guards the root path so unauthenticated users go to login', () => {
    const root = appRoutes.find((r) => r.path === '');
    expect(root?.canActivate?.length).toBeGreaterThan(0);
    // sneatAuthGuard actually blocks and redirects to /login (unlike the
    // permissive no-op SneatAuthGuard class) — this is a direct behavioral
    // match for the removed @angular/fire AuthGuard + authGuardPipe.
    expect(root?.canActivate?.[0]).toBe(sneatAuthGuard);
  });

  it('mounts the invite landing at join/:spaceType, UNGUARDED', () => {
    // This route once vanished in a bad edit and only the prod smoke caught
    // it: every invite link 404s (NG04002) without it, and a guard here would
    // put a login wall in front of an invitee who has no account yet.
    const join = appRoutes.find((r) => r.path === 'join/:spaceType');
    expect(join).toBeDefined();
    expect(typeof join?.loadComponent).toBe('function');
    expect(join?.canActivate).toBeUndefined();
  });

  it('mounts the space-scoped routes lazily', () => {
    const space = appRoutes.find(
      (r) => r.path === 'space/:spaceType/:spaceID',
    );
    expect(space).toBeDefined();
    expect(typeof space?.loadChildren).toBe('function');
  });
});
