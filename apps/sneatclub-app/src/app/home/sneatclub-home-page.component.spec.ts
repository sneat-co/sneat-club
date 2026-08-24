import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getStandardSneatProviders } from '@sneat/app';
import { SneatUserService } from '@sneat/auth-core';
import { BehaviorSubject } from 'rxjs';
import { sneatclubAppEnvironmentConfig } from '../../environments/environment';
import { SneatclubHomePageComponent } from './sneatclub-home-page.component';

// Renders the home page for an AUTHENTICATED user who HAS spaces, so the
// embedded SpacesCard -> SpacesList chain is actually constructed. That chain
// needs SpaceService + UserRequiredFieldsService, which only surface at runtime
// as NG0201 ("Failed to navigate back to /") — not at build time. A home-page
// spec with the default (signed-out) user does NOT render the list and would
// miss this, so we inject a user-with-spaces here.
describe('SneatclubHomePageComponent', () => {
  const userState$ = new BehaviorSubject<unknown>({
    status: 'authenticated',
    user: { uid: 'u1', isAnonymous: false, emailVerified: true, providerData: [] },
    record: {
      title: 'Test User',
      spaces: {
        s1: { title: 'Family', type: 'family', roles: ['creator'] },
        c1: { title: 'Limerick Celtics', type: 'club', roles: ['creator'] },
      },
    },
  });

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SneatclubHomePageComponent],
      providers: [
        ...getStandardSneatProviders(sneatclubAppEnvironmentConfig),
        provideRouter([]),
        // Override after the spread so the card sees a user with spaces.
        {
          provide: SneatUserService,
          useValue: { userState: userState$, currentUserID: 'u1' },
        },
      ],
    }),
  );

  it('renders the spaces list for a user with spaces (all DI resolves, no NG0201)', () => {
    const fixture = TestBed.createComponent(SneatclubHomePageComponent);
    // detectChanges constructs the embedded SpacesListComponent; if a provider
    // (SpaceService / UserRequiredFieldsService) is missing this throws NG0201.
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('sneat-spaces-list')).toBeTruthy();
    // Only clubs are listed: the family space must NOT appear (founder
    // feedback 2026-08-24 — the club app is not a generic space browser).
    expect(host.textContent).toContain('Limerick Celtics');
    expect(host.textContent).not.toContain('Family');
  });
});
