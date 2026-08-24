import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
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
import { SneatAuthStateService } from '@sneat/auth-core';
import {
  IManageableSpace,
  SpaceRegistrationService,
} from './space-registration.service';
import {
  IRegistrationDraft,
  loadRegistrationDraft,
  saveRegisteredResult,
} from './registration-draft.service';

/**
 * Step 2 of registration: the commit point.
 *
 * The visitor's club — everything they typed on the start step — is
 * previewed at the top of this page while they sign in or sign up, so
 * authentication reads as "one step from creating THIS", not as a wall in
 * front of an empty app. Once signed in, one press creates the club.
 *
 * Also the anti-duplicate moment: the clubs the account already manages are
 * listed here (this is the first step where we CAN know them), right before
 * the create button.
 */
@Component({
  selector: 'sneatclub-register-sign-in-page',
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
    IonLabel,
    IonInput,
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
        @if (draft; as d) {
          <!-- The preview: their data stays on screen through sign-in. -->
          <ion-card class="preview">
            <ion-card-header>
              <ion-card-title>{{ d.title }}</ion-card-title>
              <ion-card-subtitle>
                sneat.club/c/{{ d.slug || 'your-club' }}
                @if (d.countryID) {
                  · {{ d.countryID }}
                }
              </ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <ion-button fill="clear" size="small" (click)="edit()">Edit details</ion-button>
            </ion-card-content>
          </ion-card>

          @if (!isAuthenticated()) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>One step left</ion-card-title>
                <ion-card-subtitle>
                  Sign in — your club will be owned by your Sneat account
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <ion-button expand="block" [disabled]="busy()" (click)="signInWithGoogle()">
                  Continue with Google
                </ion-button>
                <ion-list>
                  <ion-item>
                    <ion-input
                      label="Email"
                      labelPlacement="stacked"
                      type="email"
                      autocomplete="email"
                      [(ngModel)]="email"
                      [disabled]="busy()"
                    />
                  </ion-item>
                  <ion-item>
                    <ion-input
                      label="Password"
                      labelPlacement="stacked"
                      type="password"
                      [autocomplete]="signUpMode() ? 'new-password' : 'current-password'"
                      [(ngModel)]="password"
                      [disabled]="busy()"
                    />
                  </ion-item>
                </ion-list>
                @if (error(); as message) {
                  <p><ion-note color="danger">{{ message }}</ion-note></p>
                }
                <ion-button expand="block" fill="outline" [disabled]="busy()" (click)="continueWithEmail()">
                  @if (busy()) {
                    <ion-spinner name="dots" />
                  } @else {
                    {{ signUpMode() ? 'Create account & continue' : 'Sign in & continue' }}
                  }
                </ion-button>
                <ion-button expand="block" fill="clear" size="small" (click)="toggleSignUp()">
                  {{ signUpMode() ? 'I already have an account' : "I'm new here — create an account" }}
                </ion-button>
              </ion-card-content>
            </ion-card>
          } @else {
            @if (existing().length) {
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Clubs you already manage</ion-card-title>
                  <ion-card-subtitle>Open one instead of registering it again</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <ion-list>
                    @for (space of existing(); track space.spaceID) {
                      <ion-item button (click)="openExisting(space)">
                        <ion-label>{{ space.title }}</ion-label>
                      </ion-item>
                    }
                  </ion-list>
                </ion-card-content>
              </ion-card>
            }
            <ion-card>
              <ion-card-content>
                <p><ion-note>Signed in as {{ signedInAs() }}</ion-note></p>
                @if (error(); as message) {
                  <p><ion-note color="danger">{{ message }}</ion-note></p>
                }
                <ion-button expand="block" [disabled]="busy()" (click)="create()">
                  @if (busy()) {
                    <ion-spinner name="dots" />
                  } @else {
                    Create {{ d.title }}
                  }
                </ion-button>
              </ion-card-content>
            </ion-card>
          }
        } @else {
          <!-- Deep link with no draft: nothing to preview, start over. -->
          <ion-card>
            <ion-card-content>
              <ion-button expand="block" (click)="edit()">Start your registration</ion-button>
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
    .preview {
      border-left: 3px solid var(--ion-color-primary);
    }
  `,
})
export class RegisterSignInPageComponent {
  private readonly router = inject(Router);
  private readonly authState = inject(SneatAuthStateService);
  private readonly registration = inject(SpaceRegistrationService);

  protected readonly draft: IRegistrationDraft | undefined = loadRegistrationDraft();

  protected email = '';
  protected password = '';
  protected readonly signUpMode = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly existing = signal<readonly IManageableSpace[]>([]);
  private existingLoaded = false;

  private readonly authStatus = toSignal(this.authState.authStatus);
  private readonly authUser = toSignal(this.authState.authUser);
  protected readonly isAuthenticated = computed(
    () => this.authStatus() === 'authenticated',
  );

  constructor() {
    // The first moment we can know the account's clubs is right after
    // sign-in — surface them just before the create button, as the
    // anti-duplicate check. An effect (not a computed side effect): loading is
    // work, computeds are for values.
    effect(() => {
      if (this.isAuthenticated() && !this.existingLoaded) {
        this.existingLoaded = true;
        this.registration.listManageableClubs().subscribe({
          next: (spaces) => this.existing.set(spaces),
          error: () => this.existing.set([]),
        });
      }
    });
  }
  protected readonly signedInAs = computed(() => {
    const user = this.authUser();
    return user?.displayName || user?.email || user?.uid || '';
  });

  protected edit(): void {
    void this.router.navigate(['/register/start']);
  }

  protected toggleSignUp(): void {
    this.signUpMode.update((v) => !v);
    this.error.set('');
  }

  protected signInWithGoogle(): void {
    this.error.set('');
    this.authState
      .signInWith('google.com')
      .catch((err: unknown) => this.error.set(err instanceof Error ? err.message : String(err)));
  }

  protected continueWithEmail(): void {
    this.error.set('');
    const auth = this.authState.fbAuth;
    const attempt = this.signUpMode()
      ? createUserWithEmailAndPassword(auth, this.email, this.password)
      : signInWithEmailAndPassword(auth, this.email, this.password);
    attempt.catch((err: unknown) =>
      this.error.set(err instanceof Error ? err.message : String(err)),
    );
  }

  protected openExisting(space: IManageableSpace): void {
    void this.router.navigate(['space', space.spaceType, space.spaceID, 'dashboard']);
  }

  protected create(): void {
    const draft = this.draft;
    if (!draft || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.registration
      .registerClub({
        title: draft.title,
        // Minted when the draft began; stable across sign-in and retries, so
        // a resubmit replays instead of creating a second club.
        requestID: draft.requestID,
        countryID: draft.countryID || undefined,
        slug: draft.slug || undefined,
      })
      .subscribe({
        next: (club) => {
          this.busy.set(false);
          saveRegisteredResult({
            spaceID: club.spaceID,
            spaceType: 'club',
            title: draft.title,
            publicSlug: club.publicSlug,
          });
          void this.router.navigate(['/register/plan'], { replaceUrl: true });
        },
        error: (err: unknown) => {
          this.busy.set(false);
          // A registration that failed must read as failed.
          this.error.set(
            err instanceof Error ? err.message : 'We could not register your club. Please try again.',
          );
        },
      });
  }
}
