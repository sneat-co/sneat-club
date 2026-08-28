import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { IonApp } from '@ionic/angular/ion-app';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonMenu } from '@ionic/angular/ion-menu';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';
import { IonSplitPane } from '@ionic/angular/ion-split-pane';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { BaseAppComponent } from '@sneat/app';
import { AuthMenuItemComponent } from '@sneat/auth-ui';
import { filter, map } from 'rxjs';

// Extends BaseAppComponent for the shared app lifecycle (redirect sign-in
// completion, title strategy, analytics, current-space clearing). Hosts a side
// menu (like sneat-app): on a space route it renders that space's menu via the
// named "menu" outlet (which the space routes mount SpaceMenuComponent into —
// without this outlet the space route fails to activate and its pages, e.g.
// lists, never render); elsewhere it shows the spaces list + signed-in user.
@Component({
  selector: 'sneatclub-root',
  template: `
    <ion-app>
      <ion-split-pane contentId="main" [when]="splitPaneWhen()">
        <ion-menu menuId="mainMenu" contentId="main" #menu>
          <ion-header>
            <ion-toolbar color="light">
              <ion-title [routerLink]="'/'" tappable (click)="menu.close()">
                Sneat Club
              </ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            @if (showRouteMenu()) {
              <ion-router-outlet name="menu" [animated]="false" />
            } @else {
              <sneat-auth-menu-item />
            }
          </ion-content>
        </ion-menu>
        <ion-router-outlet id="main" />
      </ion-split-pane>
    </ion-app>
  `,
  imports: [
    IonApp,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRouterOutlet,
    RouterLink,
    AuthMenuItemComponent,
  ],
})
export class App extends BaseAppComponent {
  private readonly appRouter = inject(Router);

  private readonly currentUrl = toSignal(
    this.appRouter.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.appRouter.url },
  );

  // On a space route, render the space-specific side menu via the named outlet.
  protected readonly showRouteMenu = computed(() =>
    this.currentUrl().startsWith('/space/'),
  );

  // Focused routes render without the side pane: registration is entered from
  // the marketing landing and should read as a continuation of it — one job,
  // no app chrome — rather than a page deep inside the app.
  private readonly isFocusedRoute = computed(
    () =>
      this.currentUrl().startsWith('/register') ||
      // Invite links open for people who are not members yet — no app chrome.
      this.currentUrl().startsWith('/join') ||
      // The login page with the side pane open showed a weird, empty panel —
      // there is nothing to put in a menu before sign-in.
      this.currentUrl().startsWith('/login'),
  );

  // ion-split-pane's `when` accepts a media query or a boolean; `false` keeps
  // the pane collapsed even on wide screens, which is what focused mode needs.
  protected readonly splitPaneWhen = computed(() =>
    this.isFocusedRoute() ? false : '(min-width: 992px)',
  );
}
