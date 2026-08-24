import { NgModule } from '@angular/core';
import {
  ISneatclubAppStateService,
  SneatclubAppStateService,
} from './sneatclub-app-state.service';

// Provides the template UI-state service. The concrete ListService is no longer
// provided here — it is bound to the SNEATCLUB_SERVICE contract token by
// provideSneatclub() at app bootstrap (the app is the composition root).
@NgModule({
  providers: [
    {
      provide: ISneatclubAppStateService,
      useClass: SneatclubAppStateService,
    },
  ],
})
export class SneatclubCoreServicesModule {}
