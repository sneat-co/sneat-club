import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonItem,
  IonMenuButton,
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

// Gear — the club's assets (balls, kits, nets). The assetus extension is not
// wired into sneat.club yet, so this page is an honest placeholder holding the
// route and the frame; it gains real data when assetus lands here.
@Component({
  selector: 'sneatclub-gear-page',
  templateUrl: './gear-page.component.html',
  imports: [
    SpaceServiceModule,
    IonBackButton,
    IonButtons,
    IonCard,
    IonContent,
    IonHeader,
    IonItem,
    IonMenuButton,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  providers: [
    { provide: ClassName, useValue: 'GearPageComponent' },
    SpaceComponentBaseParams,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GearPageComponent extends SpaceBaseComponent {}
