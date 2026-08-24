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
