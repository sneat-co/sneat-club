import { SNEATCLUB_SERVICE } from '@sneat/extension-sneatclub-contract';
import { ChildSpacesService, ListService } from './services';
import { provideSneatclub } from './provide-sneatclub';

describe('provideSneatclub', () => {
  it('provides ListService and binds it to SNEATCLUB_SERVICE', () => {
    const providers = provideSneatclub();
    expect(providers).toContain(ListService);
    expect(providers).toContainEqual({
      provide: SNEATCLUB_SERVICE,
      useExisting: ListService,
    });
  });

  it('provides ChildSpacesService for the Teams pages', () => {
    expect(provideSneatclub()).toContain(ChildSpacesService);
  });
});
