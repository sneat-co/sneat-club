import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { CountryInputComponent } from '@sneat/components';
import {
  loadRegistrationDraft,
  newDraftRequestID,
  saveRegistrationDraft,
  slugifyName,
} from './registration-draft.service';

/**
 * Step 1 of registration: the form, before any mention of an account.
 *
 * Deliberately UNGUARDED — the previous single-page flow sat behind an
 * AuthGuard, so the first thing a visitor saw was a stock login page: a
 * sign-in wall before any value, which is where registrations die. Here the
 * visitor invests in their club first; sign-in comes at the commit step,
 * with everything they typed still on screen.
 */
@Component({
  selector: 'sneatclub-register-start-page',
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
    IonList,
    IonItem,
    IonInput,
    IonNote,
    CountryInputComponent,
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
          <ion-card-header>
            <ion-card-title>Your club</ion-card-title>
            <ion-card-subtitle>
              Players, guardians, coaches and volunteers join your club as members — in a club, membership is the relationship.
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-input
                  label="Club name"
                  labelPlacement="stacked"
                  autocomplete="organization"
                  placeholder="Limerick Celtics"
                  [(ngModel)]="title"
                  (ngModelChange)="onTitleChange($event)"
                />
              </ion-item>
              <ion-item>
                <ion-input
                  label="Public web address"
                  labelPlacement="stacked"
                  placeholder="limerick-celtics"
                  [(ngModel)]="slug"
                />
              </ion-item>
              <!-- The shared country selector (searchable, grouped by region)
                   instead of a bare two-letter text box. It lazy-loads
                   assets/data/countries.json, shipped in public/. -->
              <sneat-country-input
                label="Country"
                [countryID]="countryID"
                (countryIDChange)="countryID = $event"
              />
            </ion-list>

            <p>
              <ion-note>sneat.club/c/{{ slug || 'your-club' }}</ion-note>
            </p>

            <ion-button expand="block" [disabled]="!title.trim()" (click)="continueToSignIn()">
              Continue
            </ion-button>
          </ion-card-content>
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
export class RegisterStartPageComponent {
  private readonly router = inject(Router);

  protected title = '';
  protected slug = '';
  protected countryID = '';

  // Returning to this step (the preview's "Edit" link, a reload) restores
  // everything typed so far — including the draft's requestID, which must
  // stay stable across the whole attempt.
  private readonly draft = loadRegistrationDraft();

  constructor() {
    if (this.draft) {
      this.title = this.draft.title;
      this.slug = this.draft.slug;
      this.countryID = this.draft.countryID;
    }
  }

  protected onTitleChange(value: string): void {
    // Only autofill while the visitor has not typed their own slug.
    if (!this.slug || this.slug === slugifyName(this.title)) {
      this.slug = slugifyName(value);
    }
  }

  protected continueToSignIn(): void {
    const title = this.title.trim();
    if (!title) {
      return;
    }
    saveRegistrationDraft({
      title,
      slug: this.slug.trim(),
      countryID: this.countryID.trim().toUpperCase(),
      requestID: this.draft?.requestID || newDraftRequestID(),
    });
    void this.router.navigate(['/register/sign-in']);
  }
}
