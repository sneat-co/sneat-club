import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutPlanFacts, CheckoutService } from './checkout.service';
import { loadRegisteredResult } from './registration-draft.service';

/**
 * Step 3 of registration: the plan — deliberately AFTER the centre exists.
 *
 * The checkout rail requires a SpaceID on the entitlement, so plan selection
 * cannot precede creation; and keeping it out of the form keeps the funnel
 * measurable. Registered-but-unpaid is a fully valid state, so this step is
 * skippable by construction: Free is simply what you already are.
 *
 * Prices come from the platform catalogue (/v0/checkout/config) — GameTable's
 * pricing, $15/month or $99/year, per founder direction 2026-08-24. Paying
 * opens embedded Stripe Checkout right here; Stripe returns the payer to
 * /register/return. If the storefront is not sellable yet (catalogue not
 * bootstrapped for this mode), only Free renders — honestly, with no dead
 * buy button.
 */
@Component({
  selector: 'sneatclub-register-plan-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
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
    IonSegment,
    IonSegmentButton,
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
        @if (checkoutOpen()) {
          <!-- Stripe mounts its embedded form here. -->
          <div id="embedded-checkout"></div>
          <ion-button expand="block" fill="clear" size="small" (click)="closeCheckout()">
            ← Back to plans
          </ion-button>
        } @else {
          <ion-card class="selected">
            <ion-card-header>
              <ion-card-title>Free</ion-card-title>
              <ion-card-subtitle>Your current plan</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              Teams, rosters, memberships and schedules.
            </ion-card-content>
          </ion-card>

          @if (monthly(); as m) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Business</ion-card-title>
                <ion-card-subtitle>
                  @if (interval === 'year' && annual(); as a) {
                    {{ price(a) }}/year — save vs {{ price(m) }}/month
                  } @else {
                    {{ price(m) }}/month
                  }
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <ion-segment [(ngModel)]="interval">
                  <ion-segment-button value="month">Monthly {{ price(m) }}</ion-segment-button>
                  @if (annual(); as a) {
                    <ion-segment-button value="year">Annual {{ price(a) }}</ion-segment-button>
                  }
                </ion-segment>
                @if (error(); as message) {
                  <p><ion-note color="danger">{{ message }}</ion-note></p>
                }
                <ion-button expand="block" [disabled]="busy()" (click)="buy()">
                  @if (busy()) {
                    <ion-spinner name="dots" />
                  } @else {
                    Continue with Business
                  }
                </ion-button>
              </ion-card-content>
            </ion-card>
          } @else if (plansUnavailable()) {
            <ion-card>
              <ion-card-content>
                <ion-note>
                  Paid plans are being set up — you are on Free and can upgrade
                  any time.
                </ion-note>
              </ion-card-content>
            </ion-card>
          }

          <ion-button expand="block" fill="outline" (click)="continueToWelcome()">
            Continue with Free
          </ion-button>
        }
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
  private readonly checkout = inject(CheckoutService);

  protected interval: 'month' | 'year' = 'month';
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly plansUnavailable = signal(false);
  protected readonly monthly = signal<CheckoutPlanFacts | undefined>(undefined);
  protected readonly annual = signal<CheckoutPlanFacts | undefined>(undefined);
  protected readonly checkoutOpen = signal(false);

  private embedded?: { destroy(): void; mount(location: string | HTMLElement): void };
  private publishableKey = '';

  constructor() {
    // A deep link with nothing registered has no plan to pick.
    if (!loadRegisteredResult()) {
      void this.router.navigate(['/register/start'], { replaceUrl: true });
      return;
    }
    this.checkout
      .fetchConfig()
      .then((config) => {
        this.publishableKey = config.publishableKey;
        this.monthly.set(config.plans.find((p) => p.interval === 'month'));
        this.annual.set(config.plans.find((p) => p.interval === 'year'));
        if (!config.plans.length) {
          this.plansUnavailable.set(true);
        }
      })
      // Not sellable yet (or offline): Free renders alone, honestly.
      .catch(() => this.plansUnavailable.set(true));
  }

  protected price(plan: CheckoutPlanFacts): string {
    return `$${Math.round(plan.amount / 100)}`;
  }

  protected buy(): void {
    const plan = this.interval === 'year' ? this.annual() : this.monthly();
    const registered = loadRegisteredResult();
    if (!plan || !registered || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.checkout
      .createSession(plan.id, registered.spaceID)
      .then(async (session) => {
        const stripe = await loadStripe(this.publishableKey);
        if (!stripe) {
          throw new Error('Stripe could not be loaded. Please try again.');
        }
        this.checkoutOpen.set(true);
        const embedded = await stripe.createEmbeddedCheckoutPage({
          clientSecret: session.clientSecret,
        });
        this.embedded = embedded;
        // The mount div exists once checkoutOpen has rendered.
        setTimeout(() => embedded.mount('#embedded-checkout'));
        this.busy.set(false);
      })
      .catch((err: unknown) => {
        this.busy.set(false);
        this.checkoutOpen.set(false);
        this.error.set(err instanceof Error ? err.message : 'Checkout is unavailable. Please try again.');
      });
  }

  protected closeCheckout(): void {
    this.embedded?.destroy();
    this.embedded = undefined;
    this.checkoutOpen.set(false);
  }

  protected continueToWelcome(): void {
    void this.router.navigate(['/register/welcome'], { replaceUrl: true });
  }
}
