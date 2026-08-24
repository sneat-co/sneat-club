import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
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
} from '@ionic/angular/standalone';
import {
  SpaceBaseComponent,
  SpaceComponentBaseParams,
} from '@sneat/space-components';
import { SpaceServiceModule } from '@sneat/space-services';
import { ClassName } from '@sneat/ui';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  ChildSpacesService,
  IChildSpaceBrief,
} from '../../services/child-spaces.service';

// The club's teams — child Spaces of the club (e.g. "Girls U14").
@Component({
  selector: 'sneatclub-teams-page',
  templateUrl: './teams-page.component.html',
  imports: [
    SpaceServiceModule,
    RouterLink,
    IonBackButton,
    IonButton,
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
    { provide: ClassName, useValue: 'TeamsPageComponent' },
    SpaceComponentBaseParams,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsPageComponent extends SpaceBaseComponent {
  protected readonly $teams = signal<IChildSpaceBrief[] | undefined>(undefined);
  protected readonly $error = signal<string | undefined>(undefined);

  private readonly childSpacesService = inject(ChildSpacesService);

  constructor() {
    super();
    this.spaceIDChanged$
      .pipe(
        this.takeUntilDestroyed(),
        distinctUntilChanged(),
        switchMap((spaceID) => {
          this.$teams.set(undefined);
          this.$error.set(undefined);
          if (!spaceID) {
            return of(undefined);
          }
          // catchError INSIDE the switchMap: a failed load must not complete
          // the outer stream, or switching space would stop loading teams.
          return this.childSpacesService.listChildSpaces(spaceID).pipe(
            catchError((err) => {
              this.errorLogger.logError(err, 'Failed to load club teams');
              this.$error.set('Failed to load teams.');
              return of(undefined);
            }),
          );
        }),
      )
      .subscribe((teams) => this.$teams.set(teams));
  }
}
