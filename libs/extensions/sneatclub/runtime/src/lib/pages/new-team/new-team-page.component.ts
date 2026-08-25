import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonMenuButton,
  IonText,
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
  ChildSpacesService,
  childSpacesErrorMessage,
} from '../../services/child-spaces.service';

// Creates a team ("Girls U14") as a child Space of the club. The requestID is
// minted when the page opens, so a retry after a failure replays onto the same
// team instead of creating a duplicate (same contract as the register wizard).
@Component({
  selector: 'sneatclub-new-team-page',
  templateUrl: './new-team-page.component.html',
  imports: [
    SpaceServiceModule,
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonMenuButton,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  providers: [
    { provide: ClassName, useValue: 'NewTeamPageComponent' },
    SpaceComponentBaseParams,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTeamPageComponent extends SpaceBaseComponent {
  protected title = '';
  protected readonly $creating = signal(false);
  protected readonly $error = signal<string | undefined>(undefined);

  private readonly requestID = crypto.randomUUID();
  private readonly childSpacesService = inject(ChildSpacesService);

  protected create(): void {
    const title = this.title.trim();
    const spaceID = this.$spaceID();
    if (!title || !spaceID || this.$creating()) {
      return;
    }
    this.$creating.set(true);
    this.$error.set(undefined);
    this.childSpacesService
      .createChildSpace(spaceID, title, this.requestID)
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.navController
            .navigateBack(this.spacePageUrl('teams'))
            .catch(
              this.errorLogger.logErrorHandler(
                'Failed to navigate to teams after creating one',
              ),
            );
        },
        error: (err) => {
          this.$creating.set(false);
          this.$error.set(
            childSpacesErrorMessage(err, 'We could not create the team.'),
          );
          this.errorLogger.logError(err, 'Failed to create a team');
        },
      });
  }
}
