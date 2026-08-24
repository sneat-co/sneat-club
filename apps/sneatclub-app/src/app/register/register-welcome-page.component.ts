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
import {
  clearRegistrationDraft,
  IRegisteredResult,
  loadRegisteredResult,
} from './registration-draft.service';

/**
 * Step 4 of registration: onboarding. The club exists; this page says so
 * plainly and hands the operator their first actions. Exit restores the full
 * app chrome (the dashboard), per the screen-flow standard: a create ends on
 * the created entity.
 */
@Component({
  selector: 'sneatclub-register-welcome-page',
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
        @if (result; as r) {
          <ion-card>
            <ion-card-header>
              <ion-card-title>🎉 {{ r.title }} is registered</ion-card-title>
              <ion-card-subtitle>Your club is live on sneat.club</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              @if (r.publicSlug) {
                <p>
                  Public page:
                  <a [href]="'https://sneat.club/c/' + r.publicSlug">
                    sneat.club/c/{{ r.publicSlug }}
                  </a>
                </p>
              }
              <p><ion-note>Next: add your teams, build the season roster, and invite your coaches.</ion-note></p>
              <ion-button expand="block" (click)="openDashboard()">
                Open {{ r.title }}
              </ion-button>
            </ion-card-content>
          </ion-card>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .focused {
      max-width: 36rem;
      margin: 0 auto;
      padding-top: 1.5rem;
    }
    .wordmark {
      color: var(--ion-text-color);
      text-decoration: none;
      font-weight: 700;
    }
    .wordmark span {
      color: var(--ion-color-primary);
    }
  `,
})
export class RegisterWelcomePageComponent {
  private readonly router = inject(Router);

  protected readonly result: IRegisteredResult | undefined = loadRegisteredResult();

  constructor() {
    if (!this.result) {
      void this.router.navigate(['/register/start'], { replaceUrl: true });
    }
  }

  protected openDashboard(): void {
    const r = this.result;
    if (!r) {
      return;
    }
    // The registration attempt is complete — the next visit to /register
    // starts a fresh draft with a fresh requestID.
    clearRegistrationDraft();
    void this.router.navigate(['space', r.spaceType, r.spaceID], {
      replaceUrl: true,
    });
  }
}
