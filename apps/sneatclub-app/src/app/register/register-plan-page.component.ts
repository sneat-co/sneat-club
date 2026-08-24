import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { loadRegisteredResult } from './registration-draft.service';

/**
 * Step 3 of registration: the plan — deliberately AFTER the club exists.
 *
 * The checkout rail requires a SpaceID on the entitlement, so plan selection
 * cannot precede creation; and keeping it out of the form keeps the funnel
 * measurable (an abandon here is a price objection, not form friction).
 * Registered-but-unpaid is a fully valid state, so this step is skippable by
 * construction: Free is simply what you already are.
 *
 * NoticeBoard has no paid plans in the catalogue yet; when it does they render
 * here — same step, same URL, on every Sneat product.
 */
@Component({
  selector: 'sneatclub-register-plan-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <a class="wordmark" href="https://sneat.club">Sneat&nbsp;<span>Club</span></a>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" size="small" href="https://sneat.club">
            Back to site
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="focused">
        <ion-card class="selected">
          <ion-card-header>
            <ion-card-title>Free</ion-card-title>
            <ion-card-subtitle>Your current plan</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            Teams, rosters, memberships and schedules — free while Sneat Club grows with its first clubs.
            sneat.club 
            <p><ion-note>Paid plans are coming; you will be able to upgrade any time.</ion-note></p>
          </ion-card-content>
        </ion-card>
        <ion-button expand="block" (click)="continueToWelcome()">Continue</ion-button>
      </div>
    </ion-content>
  `,
  styles: `
    .focused {
      max-width: 36rem;
      margin: 0 auto;
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .wordmark {
      color: var(--ion-text-color);
      text-decoration: none;
      font-weight: 700;
    }
    .wordmark span {
      color: var(--ion-color-primary);
    }
    .selected {
      border-left: 3px solid var(--ion-color-primary);
    }
  `,
})
export class RegisterPlanPageComponent {
  private readonly router = inject(Router);

  constructor() {
    // A deep link with nothing registered has no plan to pick.
    if (!loadRegisteredResult()) {
      void this.router.navigate(['/register/start'], { replaceUrl: true });
    }
  }

  protected continueToWelcome(): void {
    void this.router.navigate(['/register/welcome'], { replaceUrl: true });
  }
}
