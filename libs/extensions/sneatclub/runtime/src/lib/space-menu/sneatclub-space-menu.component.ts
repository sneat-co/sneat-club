import { TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  MenuController,
} from '@ionic/angular';
import { ISneatUserState } from '@sneat/auth-core';
import { IUserSpaceBrief } from '@sneat/auth-models';
import { AuthMenuItemComponent } from '@sneat/auth-ui';
import { IIdAndBrief } from '@sneat/core';
import {
  SpaceBaseComponent,
  SpaceComponentBaseParams,
} from '@sneat/space-components';
import { SpaceServiceModule } from '@sneat/space-services';
import { zipMapBriefsWithIDs } from '@sneat/space-models';
import { ClassName } from '@sneat/ui';
import { takeUntil } from 'rxjs/operators';
import { clubMenuItemsFor } from '../club-menu-items';
import { clubSpacesOnly } from '../club-spaces';

// sneatclub-specific side menu rendered in the space "menu" outlet. Unlike the
// generic @sneat SpaceMenuComponent (which hardcodes every sneat-app extension —
// Assets, Budget, Calendar, Contacts, Debts, …, none of which exist in
// sneatclub-app), this shows a space selector (to switch spaces, like
// sneat-app) and the club's sections: Teams, Staff, Players, Parents, Venues,
// Gear — the same items the overview page's Menu card renders.
@Component({
  selector: 'sneatclub-space-menu',
  templateUrl: './sneatclub-space-menu.component.html',
  imports: [
    TitleCasePipe,
    RouterLink,
    SpaceServiceModule,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonLabel,
    AuthMenuItemComponent,
  ],
  providers: [
    { provide: ClassName, useValue: 'SneatclubSpaceMenuComponent' },
    SpaceComponentBaseParams,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SneatclubSpaceMenuComponent extends SpaceBaseComponent {
  // A team (child Space) has no sub-teams — its menu drops the Teams entry
  // and gains a link up to the club (rendered in the template). The URL's
  // space type answers instantly; parentSpaceID covers pre-migration briefs.
  protected readonly $parentSpaceID = computed(
    () => this.$space().dbo?.parentSpaceID,
  );
  protected readonly $isTeam = computed(
    () =>
      (this.$spaceType() as string) === 'team' || !!this.$parentSpaceID(),
  );
  protected readonly $menuItems = computed(() =>
    clubMenuItemsFor(this.$isTeam()),
  );
  protected readonly $spaces = signal<
    readonly IIdAndBrief<IUserSpaceBrief>[] | undefined
  >(undefined);
  protected readonly $disabled = computed(() => !this.$spaceID());

  private readonly menuCtrl = inject(MenuController);

  constructor() {
    super();
    this.spaceParams.userService.userState
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (userState: ISneatUserState) =>
          this.$spaces.set(
            userState?.record
              ? clubSpacesOnly(
                  zipMapBriefsWithIDs(userState.record.spaces) || [],
                )
              : undefined,
          ),
        error: this.errorLogger.logErrorHandler('failed to get user state'),
      });
  }

  protected onSpaceSelected(event: Event): void {
    const spaceID = (event as CustomEvent).detail.value as string;
    if (spaceID === this.space?.id) {
      return;
    }
    const space = this.$spaces()?.find((t) => t.id === spaceID);
    if (space) {
      this.setSpaceRef(space);
      this.spaceNav
        .navigateToSpace(space)
        .catch(
          this.errorLogger.logErrorHandler(
            'Failed to navigate to selected space',
          ),
        );
    }
    this.closeMenu();
  }

  protected closeMenu(): void {
    this.menuCtrl.close().catch(this.errorLogger.logError);
  }
}
