import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { CheckoutService } from './checkout.service';
import { loadRegisteredResult } from './registration-draft.service';

/**
 * Stripe returns the payer here after embedded checkout (the storefront's
 * ReturnURL in the paymentus catalogue). The session is verified server-side
 * — the provisioner acts on the webhook, never on this page — so this page
 * only REPORTS: paid, open, or failed-to-verify, and hands the operator on to
 * onboarding either way.
 */
@Component({
  selector: 'sneatclub-register-return-page',
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
    IonSpinner,
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
        <ion-card>
          @if (state() === 'checking') {
            <ion-card-content>
              <ion-spinner name="dots" /> Confirming your payment…
            </ion-card-content>
          } @else if (state() === 'paid') {
            <ion-card-header>
              <ion-card-title>🎉 Business is active</ion-card-title>
              <ion-card-subtitle>Thank you — your receipt is on its way by email</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <ion-button expand="block" (click)="continueToWelcome()">Continue</ion-button>
            </ion-card-content>
          } @else {
            <ion-card-header>
              <ion-card-title>Payment not confirmed</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><ion-note>{{ detail() }}</ion-note></p>
              <ion-button expand="block" fill="outline" (click)="backToPlans()">Back to plans</ion-button>
              <ion-button expand="block" fill="clear" (click)="continueToWelcome()">
                Continue with Free for now
              </ion-button>
            </ion-card-content>
          }
        </ion-card>
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
export class RegisterReturnPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly checkout = inject(CheckoutService);

  protected readonly state = signal<'checking' | 'paid' | 'not-paid'>('checking');
  protected readonly detail = signal('');

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    const sessionId = params.get('session_id');
    if (!sessionId) {
      this.state.set('not-paid');
      this.detail.set('No checkout session to confirm.');
      return;
    }
    this.checkout
      .sessionStatus(sessionId, params.get('mode') ?? undefined)
      .then((status) => {
        if (status.status === 'complete' || status.status === 'paid') {
          this.state.set('paid');
        } else {
          this.state.set('not-paid');
          this.detail.set(`Stripe reports the session as "${status.status}". You have not been charged.`);
        }
      })
      .catch((err: unknown) => {
        this.state.set('not-paid');
        this.detail.set(err instanceof Error ? err.message : 'Could not verify the session.');
      });
  }

  protected backToPlans(): void {
    void this.router.navigate(['/register/plan'], { replaceUrl: true });
  }

  protected continueToWelcome(): void {
    const registered = loadRegisteredResult();
    void this.router.navigate([registered ? '/register/welcome' : '/register/start'], {
      replaceUrl: true,
    });
  }
}
