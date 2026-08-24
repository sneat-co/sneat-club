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
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {
  IManageableSpace,
  newRegistrationRequestId,
  slugifyClubName,
  SpaceRegistrationService,
} from './space-registration.service';

/**
 * Registers a sports club on sneat.club.
 *
 * The flow is the one every Sneat product shares (sneat-specs decision 0006):
 * offer the clubs this user already manages, then register a new one through
 * `POST /v0/spaces/register_space`. What is product-specific is only the copy
 * and which fields a club is asked for — the space type and slug namespace
 * come from Sneat Club's registration profile on the server — which says `club`, not `company`: membership is the relationship.
 *
 * On success it navigates to the new club's dashboard, per the screen-flow
 * standard: a create redirects to the created entity's details page, with
 * replaceUrl so Back does not return to the form.
 */
@Component({
  selector: 'sneatclub-register-club-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonNote,
    IonSpinner,
  ],
  template: `
    <!-- Focused mode: no side menu, no menu button (the app shell collapses
         the split pane for /register). The header wears the product wordmark
         linking back to the landing, so the page reads as a continuation of
         sneat.club rather than a screen deep inside the app. -->
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
      @if (existing().length) {
        <ion-card>
          <ion-card-header>
            <ion-card-title>Clubs you manage</ion-card-title>
            <ion-card-subtitle>Open one instead of registering it again</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              @for (space of existing(); track space.spaceID) {
                <ion-item button (click)="openClub(space)">
                  <ion-label>{{ space.title }}</ion-label>
                </ion-item>
              }
            </ion-list>
          </ion-card-content>
        </ion-card>
      }

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
                [disabled]="busy()"
              />
            </ion-item>
            <ion-item>
              <ion-input
                label="Public web address"
                labelPlacement="stacked"
                placeholder="limerick-celtics"
                [(ngModel)]="slug"
                [disabled]="busy()"
              />
            </ion-item>
            <ion-item>
              <ion-input
                label="Country"
                labelPlacement="stacked"
                placeholder="IE"
                maxlength="2"
                [(ngModel)]="countryID"
                [disabled]="busy()"
              />
            </ion-item>
          </ion-list>

          <p>
            <ion-note>sneat.club/c/{{ slug || 'your-club' }}</ion-note>
          </p>

          @if (error(); as message) {
            <p>
              <ion-note color="danger">{{ message }}</ion-note>
            </p>
          }

          <ion-button
            expand="block"
            [disabled]="busy() || !title.trim()"
            (click)="register()"
          >
            @if (busy()) {
              <ion-spinner name="dots" />
            } @else {
              Register this club
            }
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
export class RegisterClubPageComponent {
  private readonly registration = inject(SpaceRegistrationService);
  private readonly router = inject(Router);

  protected title = '';
  protected slug = '';
  protected countryID = '';

  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly existing = signal<readonly IManageableSpace[]>([]);

  // Minted once, when the form is opened — see newRegistrationRequestId. A
  // retry after a failure must resend this same value.
  private readonly requestID = newRegistrationRequestId();

  constructor() {
    this.registration.listManageableClubs().subscribe({
      next: (spaces) => this.existing.set(spaces),
      // Not being able to list existing clubs must not block registering a
      // new one — it is a convenience, not a precondition.
      error: () => this.existing.set([]),
    });
  }

  protected onTitleChange(value: string): void {
    // Only autofill while the operator has not typed their own slug.
    if (!this.slug || this.slug === slugifyClubName(this.title)) {
      this.slug = slugifyClubName(value);
    }
  }

  protected openClub(space: IManageableSpace): void {
    void this.router.navigate(['space', space.spaceType, space.spaceID, 'dashboard']);
  }

  protected register(): void {
    const title = this.title.trim();
    if (!title || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.error.set('');

    this.registration
      .registerClub({
        title,
        requestID: this.requestID,
        countryID: this.countryID.trim().toUpperCase() || undefined,
        slug: this.slug.trim() || undefined,
      })
      .subscribe({
        next: (club) => {
          this.busy.set(false);
          void this.router.navigate(
            ['space', 'club', club.spaceID, 'dashboard'],
            { replaceUrl: true },
          );
        },
        error: (err: unknown) => {
          this.busy.set(false);
          this.error.set(
            err instanceof Error
              ? err.message
              : 'We could not register your club. Please try again.',
          );
        },
      });
  }
}
