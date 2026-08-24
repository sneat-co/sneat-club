import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SneatApiService } from '@sneat/api';
import { of, throwError } from 'rxjs';
import { RegisterClubPageComponent } from './register-club-page.component';

interface IPostCall {
  readonly endpoint: string;
  readonly body: Record<string, unknown>;
}

function setup(options?: {
  registerResponse?: unknown;
  registerFails?: boolean;
  manageable?: unknown;
  manageableFails?: boolean;
}) {
  const calls: IPostCall[] = [];
  const api = {
    post: (endpoint: string, body: Record<string, unknown>) => {
      calls.push({ endpoint, body });
      if (endpoint === 'spaces/list_manageable') {
        return options?.manageableFails
          ? throwError(() => new Error('nope'))
          : of(options?.manageable ?? { spaces: [] });
      }
      return options?.registerFails
        ? throwError(() => new Error('Slug already taken'))
        : of(options?.registerResponse ?? { spaceID: 'sp1', modules: ['sneatclub'] });
    },
  };

  TestBed.configureTestingModule({
    imports: [RegisterClubPageComponent],
    providers: [
      // Stub the destinations this page navigates to, so a successful
      // registration's real navigation resolves instead of raising NG04002.
      provideRouter([
        { path: 'space/:spaceType/:spaceID/dashboard', children: [] },
        { path: '**', children: [] },
      ]),
      { provide: SneatApiService, useValue: api },
    ],
  });

  const fixture = TestBed.createComponent(RegisterClubPageComponent);
  fixture.detectChanges();
  return { fixture, calls, router: TestBed.inject(Router) };
}

describe('RegisterClubPageComponent', () => {
  it('offers the clubs the operator already manages', () => {
    const { fixture } = setup({
      manageable: {
        spaces: [{ spaceID: 'sp9', title: "Limerick Celtics", spaceType: 'company' }],
      },
    });
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain("Limerick Celtics");
  });

  it('still lets you register when the existing-clubs lookup fails', () => {
    // Listing is a convenience, not a precondition — a failure there must not
    // block an operator from registering their first club.
    const { fixture } = setup({ manageableFails: true });
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('ion-button')).toBeTruthy();
  });

  it('registers with the extension id and no space type', () => {
    const { fixture, calls } = setup();
    const component = fixture.componentInstance as unknown as {
      title: string;
      slug: string;
      countryID: string;
      register(): void;
    };
    component.title = "Limerick Celtics";
    component.slug = 'limerick-celtics';
    component.countryID = 'ie';
    component.register();

    const register = calls.find((c) => c.endpoint === 'spaces/register_space');
    expect(register).toBeTruthy();
    expect(register?.body['extensionID']).toBe('sneatclub');
    expect(register?.body['title']).toBe("Limerick Celtics");
    // Country is normalised for the API's ISO expectation.
    expect(register?.body['countryID']).toBe('IE');
    // The client must never name a space type: the server takes it from the
    // extension's registration profile.
    expect(register?.body['type']).toBeUndefined();
    // Idempotency key is present, so a resubmit replays rather than creating
    // a second club.
    expect(register?.body['requestID']).toMatch(/^sneatclub-club-/);
  });

  it('resends the same requestID on a retry', () => {
    const { fixture, calls } = setup({ registerFails: true });
    const component = fixture.componentInstance as unknown as {
      title: string;
      register(): void;
    };
    component.title = 'Club';
    component.register();
    component.register();

    const ids = calls
      .filter((c) => c.endpoint === 'spaces/register_space')
      .map((c) => c.body['requestID']);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(ids[1]);
  });

  it('surfaces a failed registration instead of navigating', () => {
    const { fixture, router } = setup({ registerFails: true });
    const navigate = vi.spyOn(router, 'navigate');
    const component = fixture.componentInstance as unknown as {
      title: string;
      register(): void;
    };
    component.title = 'Club';
    component.register();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Slug already taken');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('navigates to the new club after registering', () => {
    const { fixture, router } = setup({
      registerResponse: { spaceID: 'sp42', modules: ['sneatclub'], publicSlug: 'x' },
    });
    const navigate = vi.spyOn(router, 'navigate');
    const component = fixture.componentInstance as unknown as {
      title: string;
      register(): void;
    };
    component.title = 'Club';
    component.register();

    expect(navigate).toHaveBeenCalledWith(
      ['space', 'club', 'sp42', 'dashboard'],
      { replaceUrl: true },
    );
  });
});
