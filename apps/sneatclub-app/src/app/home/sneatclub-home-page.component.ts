import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { UserRequiredFieldsService } from '@sneat/auth-ui';
import { SpacesCardComponent } from '@sneat/space-components';
import { SpaceService } from '@sneat/space-services';

// Authenticated landing page for sneatclub.app. Reuses the shared
// SpacesCardComponent to list the user's spaces. The menu button opens the side
// menu (in the app shell) which shows the signed-in user + sign-out.
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
    RouterLink,
    SpacesCardComponent,
  ],
  // SpaceService and UserRequiredFieldsService are @Injectable() (not
  // providedIn:'root' before @sneat 0.9.1). The embedded SpacesCard -> SpacesList
  // chain needs both, so this root-level landing page provides them.
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
      <sneat-spaces-card />
      <!-- The entry point into registration. Without it the /register page is
           an orphan, which the screen-flow standard treats as unfinished. -->
      <ion-button expand="block" fill="outline" routerLink="/register">
        <ion-icon name="add-outline" slot="start" />
        Register your club
      </ion-button>
    </ion-content>
  `,
})
export class SneatclubHomePageComponent {}
