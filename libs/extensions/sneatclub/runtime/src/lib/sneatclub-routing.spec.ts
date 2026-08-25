import { sneatclubRoutes } from './sneatclub-routing';
import { clubMenuItems } from './club-menu-items';

describe('sneatclubRoutes', () => {
  it('has a route for every side-menu item', () => {
    // The menu and the routes are defined separately; a menu item without a
    // route dies with NG04002 the moment a member taps it.
    for (const item of clubMenuItems) {
      expect(
        sneatclubRoutes.some((r) => r.path === item.path),
        `menu item "${item.title}" points at missing route "${item.path}"`,
      ).toBe(true);
    }
  });

  it('exposes the new-team route', () => {
    expect(sneatclubRoutes.some((r) => r.path === 'new-team')).toBe(true);
  });

  it('exposes the invite route, and Players/Parents point at it', () => {
    expect(sneatclubRoutes.some((r) => r.path === 'invite/:role')).toBe(true);
    const players = sneatclubRoutes.find((r) => r.path === 'players');
    expect(players?.data?.['inviteRole']).toBe('player');
    const parents = sneatclubRoutes.find((r) => r.path === 'parents');
    expect(parents?.data?.['inviteRole']).toBe('parent');
  });

  it('keeps the lists routes reachable even though they left the menu', () => {
    expect(sneatclubRoutes.some((r) => r.path === 'lists')).toBe(true);
    expect(
      sneatclubRoutes.some((r) => r.path === 'list/:listType/:listID'),
    ).toBe(true);
  });

  it('lazy-loads every route via loadComponent', () => {
    for (const route of sneatclubRoutes) {
      expect(typeof route.loadComponent).toBe('function');
    }
  });

  it('filters people pages by roles and venues by contact type', () => {
    const staff = sneatclubRoutes.find((r) => r.path === 'staff');
    expect(staff?.data?.['roles']).toContain('coach');
    const players = sneatclubRoutes.find((r) => r.path === 'players');
    expect(players?.data?.['roles']).toEqual(['player']);
    const parents = sneatclubRoutes.find((r) => r.path === 'parents');
    expect(parents?.data?.['roles']).toContain('parent');
    const venues = sneatclubRoutes.find((r) => r.path === 'venues');
    expect(venues?.data?.['contactType']).toBe('location');
  });
});
