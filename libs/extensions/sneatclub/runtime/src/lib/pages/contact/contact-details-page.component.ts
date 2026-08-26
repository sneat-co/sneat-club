import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AlertController,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { IIdAndBrief } from '@sneat/core';
import {
  CONTACTUS_SPACE_SERVICE,
  IContactBrief,
} from '@sneat/extension-contactus-contract';
import {
  SpaceBaseComponent,
  SpaceComponentBaseParams,
} from '@sneat/space-components';
import { SpaceServiceModule } from '@sneat/space-services';
import { ClassName } from '@sneat/ui';
import { combineLatest, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { clubContactTitle } from '../contacts/club-contacts-page.component';
import { childSpacesErrorMessage } from '../../services/child-spaces.service';
import { TeamInvitesService } from '../../services/team-invites.service';

// One member of the club/team: name, roles, joined state — with the two
// organiser actions that matter: copy their invite link (get-or-REUSE, so it
// is always the same link) while they have not joined, and remove them.
@Component({
  selector: 'sneatclub-contact-details-page',
  templateUrl: './contact-details-page.component.html',
  imports: [
    SpaceServiceModule,
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonSkeletonText,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  providers: [
    { provide: ClassName, useValue: 'ContactDetailsPageComponent' },
    SpaceComponentBaseParams,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailsPageComponent extends SpaceBaseComponent {
  private readonly contactusSpaceService = inject(CONTACTUS_SPACE_SERVICE);
  private readonly teamInvites = inject(TeamInvitesService);
  private readonly location = inject(Location);
  private readonly alertCtrl = inject(AlertController);

  private readonly $contactID = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('contactID'))),
  );

  protected readonly $contact = signal<
    IIdAndBrief<IContactBrief> | null | undefined
  >(undefined);
  protected readonly $error = signal<string | undefined>(undefined);
  protected readonly $busy = signal(false);
  protected readonly $copied = signal(false);

  protected readonly $title = computed(() => {
    const contact = this.$contact();
    return contact ? clubContactTitle(contact) : 'Member';
  });
  protected readonly $notJoined = computed(() => {
    const contact = this.$contact();
    return (
      !!contact &&
      (contact.brief.type as string) === 'person' &&
      !contact.brief.userID
    );
  });

  constructor() {
    super();
    combineLatest([
      this.route.paramMap.pipe(map((p) => p.get('contactID'))),
      this.spaceIDChanged$.pipe(distinctUntilChanged()),
    ])
      .pipe(
        this.takeUntilDestroyed(),
        switchMap(([contactID, spaceID]) => {
          this.$contact.set(undefined);
          this.$error.set(undefined);
          if (!spaceID || !contactID) {
            return of(undefined);
          }
          return this.contactusSpaceService.watchContactBriefs(spaceID).pipe(
            map(
              (contacts) =>
                contacts.find((c) => c.id === contactID) ?? null,
            ),
            catchError((err) => {
              this.errorLogger.logError(err, 'Failed to load the member');
              this.$error.set('Failed to load the member.');
              return of(undefined);
            }),
          );
        }),
      )
      .subscribe((contact) => this.$contact.set(contact));
  }

  protected copyInviteLink(): void {
    const spaceID = this.$spaceID();
    const contactID = this.$contactID();
    if (!spaceID || !contactID || this.$busy()) {
      return;
    }
    this.$busy.set(true);
    this.teamInvites
      .linkForMember(spaceID, contactID)
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (invite) => {
          this.$busy.set(false);
          const path = this.location.prepareExternalUrl(
            `/join/${this.$spaceType() || 'team'}?id=${invite.inviteID}`,
          );
          const link = `${window.location.origin}${path}#pin=${invite.pin}`;
          navigator.clipboard
            .writeText(link)
            .then(() => this.$copied.set(true))
            .catch(
              this.errorLogger.logErrorHandler('Failed to copy invite link'),
            );
        },
        error: (err) => {
          this.$busy.set(false);
          this.$error.set(
            childSpacesErrorMessage(err, 'We could not get the invite link.'),
          );
        },
      });
  }

  protected async confirmRemove(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: `Remove ${this.$title()}?`,
      message: 'They will lose access to this space.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Remove', role: 'destructive', handler: () => this.remove() },
      ],
    });
    await alert.present();
  }

  private remove(): void {
    const spaceID = this.$spaceID();
    const contactID = this.$contactID();
    if (!spaceID || !contactID || this.$busy()) {
      return;
    }
    this.$busy.set(true);
    this.teamInvites
      .removeMember(spaceID, contactID)
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.navController
            .navigateBack(this.$defaultBackUrl())
            .catch(this.errorLogger.logError);
        },
        error: (err) => {
          this.$busy.set(false);
          this.$error.set(
            childSpacesErrorMessage(err, 'We could not remove the member.'),
          );
          this.errorLogger.logError(err, 'Failed to remove a member');
        },
      });
  }
}
