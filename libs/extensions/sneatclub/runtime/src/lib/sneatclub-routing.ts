import { Route } from '@angular/router';
import { IClubContactsRouteData } from './pages/contacts/club-contacts-page.component';

// Staff/Players/Parents/Venues are one contacts page filtered by route data —
// see ClubContactsPageComponent.
const contactsPage = () =>
  import('./pages/contacts/club-contacts-page.component').then(
    (m) => m.ClubContactsPageComponent,
  );

const contactsData = (data: IClubContactsRouteData) => ({ ...data });

export const sneatclubRoutes: Route[] = [
  {
    path: 'teams',
    data: { title: 'Teams' },
    loadComponent: () =>
      import('./pages/teams/teams-page.component').then(
        (m) => m.TeamsPageComponent,
      ),
  },
  {
    path: 'new-team',
    data: { title: 'New team' },
    loadComponent: () =>
      import('./pages/new-team/new-team-page.component').then(
        (m) => m.NewTeamPageComponent,
      ),
  },
  {
    // The invite page is the SHARED one from contactus — the role comes from
    // this param, so the club's role vocabulary (player/parent/staff) lives
    // here in the routing and the page itself stays product-neutral.
    path: 'invite/:role',
    data: { title: 'Invite' },
    loadComponent: () =>
      import('@sneat/extension-contactus-ui').then(
        (m) => m.InviteMemberPageComponent,
      ),
  },
  {
    path: 'staff',
    data: contactsData({
      title: 'Staff',
      emoji: '🧑‍🏫',
      roles: ['staff', 'coach', 'admin', 'manager', 'director', 'owner', 'creator'],
      inviteRole: 'staff',
    }),
    loadComponent: contactsPage,
  },
  {
    path: 'players',
    data: contactsData({
      title: 'Players',
      emoji: '⚽',
      roles: ['player'],
      inviteRole: 'player',
    }),
    loadComponent: contactsPage,
  },
  {
    path: 'parents',
    data: contactsData({
      title: 'Parents',
      emoji: '👪',
      roles: ['parent', 'guardian'],
      inviteRole: 'parent',
    }),
    loadComponent: contactsPage,
  },
  {
    path: 'venues',
    data: contactsData({
      title: 'Venues',
      emoji: '📍',
      contactType: 'location',
    }),
    loadComponent: contactsPage,
  },
  {
    path: 'contact/:contactID',
    data: { title: 'Member' },
    loadComponent: () =>
      import('./pages/contact/contact-details-page.component').then(
        (m) => m.ContactDetailsPageComponent,
      ),
  },
  {
    path: 'gear',
    data: { title: 'Gear' },
    loadComponent: () =>
      import('./pages/gear/gear-page.component').then(
        (m) => m.GearPageComponent,
      ),
  },
  // Lists are out of the menu for now (they never worked for clubs), but the
  // routes stay reachable so existing links do not 404.
  {
    path: 'lists',
    data: { title: 'Lists' },
    loadComponent: () =>
      import('./pages/lists/lists-page.component').then(
        (m) => m.ListsPageComponent,
      ),
  },
  {
    path: 'list/:listType/:listID',
    data: { title: 'List' },
    loadComponent: () =>
      import('./pages/list/list-page.component').then(
        (m) => m.ListPageComponent,
      ),
  },
];
