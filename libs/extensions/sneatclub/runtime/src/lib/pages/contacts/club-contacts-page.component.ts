import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
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

// One page, four routes: Staff, Players, Parents and Venues are all the club's
// contacts filtered differently. The filter comes from route data:
//   { title, emoji, roles?: string[], contactType?: string }
// — roles matches people by contact role, contactType matches by contact type
// (venues are 'location' contacts).
export interface IClubContactsRouteData {
  readonly title: string;
  readonly emoji: string;
  readonly roles?: readonly string[];
  readonly contactType?: string;
}

@Component({
  selector: 'sneatclub-club-contacts-page',
  templateUrl: './club-contacts-page.component.html',
  imports: [
    SpaceServiceModule,
    IonBackButton,
    IonButtons,
    IonCard,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonSkeletonText,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  providers: [
    { provide: ClassName, useValue: 'ClubContactsPageComponent' },
    SpaceComponentBaseParams,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClubContactsPageComponent extends SpaceBaseComponent {
  protected readonly $pageData = signal<IClubContactsRouteData>({
    title: 'Contacts',
    emoji: '👥',
  });
  protected readonly $contacts = signal<
    IIdAndBrief<IContactBrief>[] | undefined
  >(undefined);
  protected readonly $error = signal<string | undefined>(undefined);

  private readonly contactusSpaceService = inject(CONTACTUS_SPACE_SERVICE);

  constructor() {
    super();
    combineLatest([
      this.route.data,
      this.spaceIDChanged$.pipe(distinctUntilChanged()),
    ])
      .pipe(
        this.takeUntilDestroyed(),
        switchMap(([data, spaceID]) => {
          const pageData = data as IClubContactsRouteData;
          this.$pageData.set(pageData);
          this.$contacts.set(undefined);
          this.$error.set(undefined);
          if (!spaceID) {
            return of(undefined);
          }
          return this.contactusSpaceService.watchContactBriefs(spaceID).pipe(
            map((contacts) => contacts.filter((c) => matches(pageData, c.brief))),
            // catchError INSIDE the switchMap: a failed watch must not
            // complete the outer stream, or switching space would go dead.
            catchError((err) => {
              this.errorLogger.logError(
                err,
                `Failed to load club ${pageData.title.toLowerCase()}`,
              );
              this.$error.set(`Failed to load ${pageData.title.toLowerCase()}.`);
              return of(undefined);
            }),
          );
        }),
      )
      .subscribe((contacts) => this.$contacts.set(contacts));
  }

  protected contactTitle(contact: IIdAndBrief<IContactBrief>): string {
    return contact.brief.title || contact.id;
  }
}

function matches(data: IClubContactsRouteData, brief: IContactBrief): boolean {
  if (data.contactType) {
    return (brief.type as string) === data.contactType;
  }
  const roles = brief.roles || [];
  return !!data.roles?.some((role) => roles.includes(role));
}
