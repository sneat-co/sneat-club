import { Provider } from '@angular/core';
import { SNEATCLUB_SERVICE } from '@sneat/extension-sneatclub-contract';
import { ChildSpacesService, ListService } from './services';

// The extension's single root register function: binds EVERY always-on contract
// token to its concrete implementation in one place, so a host enables the whole
// extension by calling provideSneatclub() once at bootstrap. Consumers
// depend only on the contract tokens/interfaces and never import this factory or
// the impl classes directly.
//
// Heavy, route-only capabilities (a details page that pulls in a sibling
// extension's service, etc.) are NOT bound here — ship them as lazy, route-scoped
// provider bundles instead, so they load only when their route is opened. See the
// README "Wiring extension services (DI)" section and the frontend-apps standard:
// https://github.com/sneat-co/sneat-libs/blob/main/docs/extension-standards/frontend-apps.md
export function provideSneatclub(): Provider[] {
  return [
    ListService,
    ChildSpacesService,
    { provide: SNEATCLUB_SERVICE, useExisting: ListService },
  ];
}
