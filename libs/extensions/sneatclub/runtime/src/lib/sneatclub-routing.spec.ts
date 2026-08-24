import { sneatclubRoutes } from './sneatclub-routing';

describe('sneatclubRoutes', () => {
  it('exposes the lists overview route', () => {
    expect(sneatclubRoutes.some((r) => r.path === 'lists')).toBe(true);
  });

  it('exposes the list detail route with listType + listID params', () => {
    expect(
      sneatclubRoutes.some((r) => r.path === 'list/:listType/:listID'),
    ).toBe(true);
  });

  it('lazy-loads every route via loadComponent', () => {
    for (const route of sneatclubRoutes) {
      expect(typeof route.loadComponent).toBe('function');
    }
  });
});
