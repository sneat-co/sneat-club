import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonNote,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { SneatApiService } from '@sneat/api';
import { SneatAuthStateService } from '@sneat/auth-core';
import { switchMap } from 'rxjs/operators';

// Shape verified against the deployed API: the space id lives at the ROOT
// (spaceID), not inside `space` — the published lib's IJoinSpaceInfoResponse
// disagrees with the wire format there.
interface IJoinInfo {
  readonly spaceID: string;
  readonly space: { readonly type: string; readonly title: string };
  readonly invite: {
    readonly status?: string;
    readonly message?: string;
    readonly from?: { readonly title?: string };
    readonly to?: { readonly title?: string };
  };
}

/**
 * The landing for an invite link: /join/:spaceType?id=<inviteID>#pin=<pin>.
 *
 * Shows who is invited where BEFORE asking for authentication (same
 * philosophy as the registration wizard: the value first, the sign-in as the
 * last step), then one press joins the invitee to the team with the roles the
 * invite's member contact carries.
 */
@Component({
  selector: 'sneatclub-join-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './join-page.component.html',
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
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonNote,
    IonSpinner,
    IonText,
  ],
})
export class JoinPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(SneatApiService);
  private readonly authState = inject(SneatAuthStateService);

  protected readonly inviteID =
    this.route.snapshot.queryParamMap.get('id') || '';
  // The pin travels in the URL fragment so it never reaches server logs.
  protected readonly pin = (this.route.snapshot.fragment || '')
    .replace(/^pin=/, '')
    .trim();

  protected readonly $info = signal<IJoinInfo | undefined>(undefined);
  protected readonly $loadError = signal<string | undefined>(undefined);
  protected readonly $joining = signal(false);
  protected readonly $joinError = signal<string | undefined>(undefined);

  protected email = '';
  protected password = '';
  protected readonly signUpMode = signal(true);
  protected readonly authError = signal('');

  private readonly authStatus = toSignal(this.authState.authStatus);
  private readonly authUser = toSignal(this.authState.authUser);
  protected readonly isAuthenticated = computed(
    () => this.authStatus() === 'authenticated',
  );
  protected readonly signedInAs = computed(() => {
    const user = this.authUser();
    return user?.displayName || user?.email || user?.uid || '';
  });

  constructor() {
    if (!this.inviteID || !this.pin) {
      this.$loadError.set(
        'This invite link is incomplete. Ask the person who invited you to send it again.',
      );
      return;
    }
    this.api
      .postAsAnonymous<IJoinInfo>('space/join_info', {
        inviteID: this.inviteID,
        pin: this.pin,
      })
      .subscribe({
        next: (info) => this.$info.set(info),
        error: () =>
          this.$loadError.set(
            'We could not find this invite. It may have been withdrawn or already used.',
          ),
      });
  }

  protected signInWithGoogle(): void {
    this.authError.set('');
    this.authState
      .signInWith('google.com')
      .catch((err: unknown) =>
        this.authError.set(err instanceof Error ? err.message : String(err)),
      );
  }

  protected toggleSignUp(): void {
    this.signUpMode.update((v) => !v);
    this.authError.set('');
  }

  protected continueWithEmail(): void {
    this.authError.set('');
    const auth = this.authState.fbAuth;
    const attempt = this.signUpMode()
      ? createUserWithEmailAndPassword(auth, this.email, this.password)
      : signInWithEmailAndPassword(auth, this.email, this.password);
    attempt.catch((err: unknown) =>
      this.authError.set(err instanceof Error ? err.message : String(err)),
    );
  }

  protected join(): void {
    const info = this.$info();
    if (!info || this.$joining()) {
      return;
    }
    this.$joining.set(true);
    this.$joinError.set(undefined);
    const user = this.authUser();
    this.api
      // A brand-new invitee has no users/{uid} record yet, and joining runs a
      // user worker that requires one — the registration wizard learned this
      // the hard way. init_user_record is idempotent (create-if-missing).
      .post('users/init_user_record', {
        email: user?.email || undefined,
        emailIsVerified: user?.emailVerified ?? false,
        authProvider: user?.providerId || 'password',
        names: user?.displayName ? { fullName: user.displayName } : undefined,
      })
      .pipe(
        switchMap(() =>
          // accept_personal_invite is the CLAIM path: it links the invitee's
          // account to the invite's member contact (roles included) and adds
          // them to the space. space/join_space is a members-only operation
          // and 401s for the invitee — verified against prod.
          this.api.post('invites/accept_personal_invite', {
            spaceID: info.spaceID,
            inviteID: this.inviteID,
            pin: this.pin,
            operation: 'accept',
          }),
        ),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['space', info.space.type, info.spaceID]);
        },
        error: (err: unknown) => {
          this.$joining.set(false);
          const e = err as {
            error?: { error?: { message?: string }; message?: string };
            message?: string;
          };
          this.$joinError.set(
            e?.error?.error?.message ||
              e?.error?.message ||
              e?.message ||
              'We could not join you to this team. Please try again.',
          );
        },
      });
  }
}
