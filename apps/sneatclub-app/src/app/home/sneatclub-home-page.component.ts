import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonList,
  IonMenuButton,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { SneatUserService } from '@sneat/auth-core';
import { UserRequiredFieldsService } from '@sneat/auth-ui';
import { ISpaceContext } from '@sneat/space-models';
import { SpacesListComponent } from '@sneat/space-components';
import { SpaceService } from '@sneat/space-services';

// Authenticated landing page for Sneat Club. Shows ONLY the user's clubs —
// a Sneat account also holds family/company/etc spaces from other products,
// and listing them all made the club app read as a generic space browser
// (founder feedback, 2026-08-24: "Clubs: Limerick Celtics").
//
// SpacesCardComponent gained title/spaceType/canAdd inputs upstream
// (sneat-libs#52) for exactly this, but that shipped on the Angular 22 /
// Ionic 9 release line (0.26.1+) and this app is on Angular 21 — so the
// filter lives here until the app takes the framework upgrade, then this
// collapses to <sneat-spaces-card title="Clubs" spaceType="club" [canAdd]="false" />.
@Component({
  selector: 'sneatclub-home-page',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonNote,
    RouterLink,
    SpacesListComponent,
  ],
  // SpaceService and UserRequiredFieldsService are @Injectable() (not
  // providedIn:'root' before @sneat 0.9.1). SpacesList needs both, so this
  // root-level landing page provides them.
  providers: [SpaceService, UserRequiredFieldsService],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>Sneat Club</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Clubs</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          @if (clubs(); as clubs) {
            @if (clubs.length) {
              <ion-list>
                <sneat-spaces-list [userID]="userID()" [spaces]="clubs" />
              </ion-list>
            } @else {
              <ion-note>You are not a member of any club yet.</ion-note>
            }
          } @else {
            <ion-note>Loading…</ion-note>
          }
        </ion-card-content>
      </ion-card>
      <ion-button expand="block" fill="outline" routerLink="/register">
        <ion-icon name="add-outline" slot="start" />
        Register your club
      </ion-button>
    </ion-content>
  `,
})
export class SneatclubHomePageComponent {
  private readonly userService = inject(SneatUserService);

  private readonly userState = toSignal(this.userService.userState);

  protected readonly userID = computed(() => this.userState()?.user?.uid ?? '');

  // undefined => record not loaded yet.
  protected readonly clubs = computed<ISpaceContext[] | undefined>(() => {
    const record = this.userState()?.record;
    if (!record) {
      return undefined;
    }
    return Object.entries(record.spaces ?? {})
      // The published SpaceType union predates 'club' (fixed upstream with
      // sneat-libs#52); compare as strings until the lib upgrade lands.
      .filter(([, brief]) => (brief?.type as string) === 'club')
      .map(([id, brief]) => ({ id, type: brief?.type, brief }) as ISpaceContext)
      .sort((a, b) =>
        (a.brief?.title || a.id).localeCompare(b.brief?.title || b.id),
      );
  });
}
