import { Route } from '@angular/router';
import { SpaceComponentBaseParams } from '@sneat/space-components';
import { SneatclubSpaceMenuComponent } from './space-menu/sneatclub-space-menu.component';
import { sneatclubRoutes } from './sneatclub-routing';

export const sneatclubSpaceRoutes: Route[] = [
  {
    path: '',
    providers: [SpaceComponentBaseParams],
    children: [
      {
        path: '',
        component: SneatclubSpaceMenuComponent,
        outlet: 'menu',
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'lists',
      },
      ...sneatclubRoutes,
    ],
  },
];
