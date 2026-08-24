import { clubMenuItems, clubMenuItemsFor } from './club-menu-items';

describe('clubMenuItemsFor', () => {
  it('gives a club the full menu including Teams', () => {
    expect(clubMenuItemsFor(false)).toEqual(clubMenuItems);
    expect(clubMenuItemsFor(false).some((i) => i.path === 'teams')).toBe(true);
  });

  it('drops Teams for a team (child space) — teams have no sub-teams', () => {
    const items = clubMenuItemsFor(true);
    expect(items.some((i) => i.path === 'teams')).toBe(false);
    expect(items.map((i) => i.path)).toEqual([
      'staff',
      'players',
      'parents',
      'venues',
      'gear',
    ]);
  });
});
