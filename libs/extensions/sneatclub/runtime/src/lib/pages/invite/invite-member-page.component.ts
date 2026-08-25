import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import {
  SpaceBaseComponent,
  SpaceComponentBaseParams,
} from '@sneat/space-components';
import { SpaceServiceModule } from '@sneat/space-services';
import { ClassName } from '@sneat/ui';
import {
  childSpacesErrorMessage,
} from '../../services/child-spaces.service';
import {
  ITeamInviteLink,
  TeamInvitesService,
} from '../../services/team-invites.service';

type InviteRole = 'player' | 'parent';

// Invites a player or a parent to the team: creates the member contact with
// the role (contactus) and mints a personal invite link (invitus). The link
// is shown for the organiser to share; claiming it links the invitee's
// account to the member contact, role included.
@Component({
  selector: 'sneatclub-invite-member-page',
  templateUrl: './invite-member-page.component.html',
  imports: [
    SpaceServiceModule,
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
  providers: [
    { provide: ClassName, useValue: 'InviteMemberPageComponent' },
    SpaceComponentBaseParams,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteMemberPageComponent extends SpaceBaseComponent {
  private readonly teamInvites = inject(TeamInvitesService);
  private readonly location = inject(Location);

  private readonly $routeRole = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('role'))),
  );
  protected readonly $role = computed<InviteRole>(() =>
    this.$routeRole() === 'parent' ? 'parent' : 'player',
  );
  protected readonly $roleTitle = computed(() =>
    this.$role() === 'parent' ? 'parent' : 'player',
  );

  protected firstName = '';
  protected lastName = '';
  protected message = '';
  protected readonly $busy = signal(false);
  protected readonly $error = signal<string | undefined>(undefined);
  protected readonly $link = signal<string | undefined>(undefined);
  protected readonly $copied = signal(false);

  protected create(): void {
    const spaceID = this.$spaceID();
    const firstName = this.firstName.trim();
    if (!spaceID || !firstName || this.$busy()) {
      return;
    }
    this.$error.set(undefined);
    this.$busy.set(true);
    this.teamInvites
      .invitePersonToTeam(
        spaceID,
        this.$role(),
        firstName,
        this.lastName.trim(),
        this.message.trim(),
      )
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (invite) => {
          this.$busy.set(false);
          this.$link.set(this.composeJoinLink(invite));
        },
        error: (err) => {
          this.$busy.set(false);
          this.$error.set(
            childSpacesErrorMessage(err, 'We could not create the invite.'),
          );
          this.errorLogger.logError(err, 'Failed to invite a team member');
        },
      });
  }

  // The join page route is /join/:spaceType?id=<inviteID>#pin=<pin> — same
  // shape the platform's SMS invites use. prepareExternalUrl folds in the
  // app's base href (/app/).
  private composeJoinLink(invite: ITeamInviteLink): string {
    const path = this.location.prepareExternalUrl(
      `/join/${this.$spaceType() || 'team'}?id=${invite.inviteID}`,
    );
    return `${window.location.origin}${path}#pin=${invite.pin}`;
  }

  protected copyLink(): void {
    const link = this.$link();
    if (!link) {
      return;
    }
    navigator.clipboard
      .writeText(link)
      .then(() => this.$copied.set(true))
      .catch(this.errorLogger.logErrorHandler('Failed to copy invite link'));
  }

  protected shareLink(): void {
    const link = this.$link();
    if (!link || !navigator.share) {
      return;
    }
    const spaceTitle = this.$space().brief?.title || 'our team';
    navigator
      .share({ title: `Join ${spaceTitle}`, url: link })
      .catch(() => undefined); // user cancelling the share sheet is not an error
  }

  protected readonly canShare =
    typeof navigator !== 'undefined' && !!navigator.share;

  protected inviteAnother(): void {
    this.firstName = '';
    this.lastName = '';
    this.message = '';
    this.$link.set(undefined);
    this.$copied.set(false);
  }
}
