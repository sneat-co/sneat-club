import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
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
} from '@ionic/angular/standalone';
import {
  SpaceBaseComponent,
  SpaceComponentBaseParams,
} from '@sneat/space-components';
import { SpaceServiceModule } from '@sneat/space-services';
import { ClassName } from '@sneat/ui';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { clubMenuItems } from '../../club-menu-items';
import {
  ChildSpacesService,
  IChildSpaceBrief,
} from '../../services/child-spaces.service';

// The club's main page: a Teams card listing the club's teams (child spaces),
// and a Menu card that mirrors the side menu — shown only below the lg
// breakpoint, where the split pane collapses and the side menu is hidden
// behind the burger (same pattern as sneat-app's Extensions card).
@Component({
  selector: 'sneatclub-club-page',
  templateUrl: './club-page.component.html',
  imports: [
    SpaceServiceModule,
    RouterLink,
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
    { provide: ClassName, useValue: 'ClubPageComponent' },
    SpaceComponentBaseParams,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClubPageComponent extends SpaceBaseComponent {
  protected readonly menuItems = clubMenuItems;
  protected readonly $teams = signal<IChildSpaceBrief[] | undefined>(undefined);
  protected readonly $teamsError = signal<string | undefined>(undefined);

  private readonly childSpacesService = inject(ChildSpacesService);

  constructor() {
    super();
    this.spaceIDChanged$
      .pipe(
        this.takeUntilDestroyed(),
        distinctUntilChanged(),
        switchMap((spaceID) => {
          this.$teams.set(undefined);
          this.$teamsError.set(undefined);
          if (!spaceID) {
            return of(undefined);
          }
          // catchError INSIDE the switchMap: a failed load must not complete
          // the outer stream, or switching space would stop loading teams.
          return this.childSpacesService.listChildSpaces(spaceID).pipe(
            catchError((err) => {
              this.errorLogger.logError(err, 'Failed to load club teams');
              this.$teamsError.set('Failed to load teams.');
              return of(undefined);
            }),
          );
        }),
      )
      .subscribe((teams) => this.$teams.set(teams));
  }
}
