// The club's navigation, defined once: the side menu and the overview page's
// mobile Menu card render the same items, so the two can never drift apart.
export interface IClubMenuItem {
  readonly path: string;
  readonly title: string;
  readonly icon: string;
}

export const clubMenuItems: readonly IClubMenuItem[] = [
  { path: 'teams', title: 'Teams', icon: 'shirt-outline' },
  { path: 'staff', title: 'Staff', icon: 'id-card-outline' },
  { path: 'players', title: 'Players', icon: 'football-outline' },
  { path: 'parents', title: 'Parents', icon: 'people-outline' },
  { path: 'venues', title: 'Venues', icon: 'location-outline' },
  { path: 'gear', title: 'Gear', icon: 'tennisball-outline' },
];

// A team is a child Space of a club (it shares the club's space TYPE — what
// differs is having a parent). Teams have no sub-teams, so a team's menu has
// no Teams entry.
export function clubMenuItemsFor(
  isChildSpace: boolean,
): readonly IClubMenuItem[] {
  return isChildSpace
    ? clubMenuItems.filter((item) => item.path !== 'teams')
    : clubMenuItems;
}
