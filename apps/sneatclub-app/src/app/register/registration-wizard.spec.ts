import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SneatApiService } from '@sneat/api';
import { SneatAuthStateService } from '@sneat/auth-core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { RegisterStartPageComponent } from './register-start-page.component';
import { RegisterSignInPageComponent } from './register-sign-in-page.component';
import {
  clearRegistrationDraft,
  loadRegistrationDraft,
  saveRegistrationDraft,
} from './registration-draft.service';

interface IPostCall {
  readonly endpoint: string;
  readonly body: Record<string, unknown>;
}

const wizardRoutes = [
  { path: 'register/start', children: [] },
  { path: 'register/sign-in', children: [] },
  { path: 'register/plan', children: [] },
  { path: 'register/welcome', children: [] },
  { path: 'space/:spaceType/:spaceID/dashboard', children: [] },
  { path: '**', children: [] },
];

describe('RegisterStartPageComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [RegisterStartPageComponent],
      providers: [provideRouter(wizardRoutes)],
    });
  });

  it('is reachable without signing in and saves a draft with a stable requestID', () => {
    const fixture = TestBed.createComponent(RegisterStartPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      title: string;
      slug: string;
      countryID: string;
      continueToSignIn(): void;
    };
    component.title = "Limerick Celtics";
    component.slug = 'limerick-celtics';
    component.countryID = 'ie';
    component.continueToSignIn();

    const draft = loadRegistrationDraft();
    expect(draft?.title).toBe("Limerick Celtics");
    expect(draft?.countryID).toBe('IE');
    expect(draft?.requestID).toMatch(/^sneatclub-club-/);

    // Coming back to edit must keep the SAME requestID: it is what makes a
    // retry replay instead of registering a second club.
    const again = TestBed.createComponent(RegisterStartPageComponent);
    (again.componentInstance as unknown as { continueToSignIn(): void; title: string }).title = 'Renamed';
    (again.componentInstance as unknown as { continueToSignIn(): void }).continueToSignIn();
    expect(loadRegistrationDraft()?.requestID).toBe(draft?.requestID);
  });
});

function setupSignIn(options?: {
  authenticated?: boolean;
  registerFails?: boolean;
  manageable?: unknown;
}) {
  sessionStorage.clear();
  saveRegistrationDraft({
    title: "Limerick Celtics",
    slug: 'limerick-celtics',
    countryID: 'IE',
    requestID: 'sneatclub-club-11111111-2222-3333-4444-555555555555',
  });

  const calls: IPostCall[] = [];
  const api = {
    post: (endpoint: string, body: Record<string, unknown>) => {
      calls.push({ endpoint, body });
      if (endpoint === 'spaces/list_manageable') {
        return of(options?.manageable ?? { spaces: [] });
      }
      if (endpoint === 'users/init_user_record') {
        return of({});
      }
      return options?.registerFails
        ? throwError(() => new Error('Slug already taken'))
        : of({ spaceID: 'sp1', modules: ['sneatclub'], publicSlug: 'x' });
    },
  };
  const authState = {
    authStatus: new BehaviorSubject(options?.authenticated ? 'authenticated' : 'notAuthenticated'),
    authUser: new BehaviorSubject(
      options?.authenticated ? { displayName: 'Alex', email: 'a@b.c', uid: 'u1' } : undefined,
    ),
    signInWith: () => Promise.resolve(undefined),
    fbAuth: {},
  };

  TestBed.configureTestingModule({
    imports: [RegisterSignInPageComponent],
    providers: [
      provideRouter(wizardRoutes),
      { provide: SneatApiService, useValue: api },
      { provide: SneatAuthStateService, useValue: authState },
    ],
  });
  const fixture = TestBed.createComponent(RegisterSignInPageComponent);
  fixture.detectChanges();
  return { fixture, calls, router: TestBed.inject(Router) };
}

describe('RegisterSignInPageComponent', () => {
  afterEach(() => clearRegistrationDraft());

  it('previews the draft while asking an anonymous visitor to sign in', () => {
    const { fixture, calls } = setupSignIn({ authenticated: false });
    const host = fixture.nativeElement as HTMLElement;
    // Their data stays on screen through sign-in — the point of the step.
    expect(host.textContent).toContain("Limerick Celtics");
    expect(host.textContent).toContain('Continue with Google');
    // No create call and no listing before authentication.
    expect(calls).toHaveLength(0);
  });

  it('offers existing clubs and a create button once signed in', () => {
    const { fixture } = setupSignIn({
      authenticated: true,
      manageable: { spaces: [{ spaceID: 'sp9', title: 'Old Hall', spaceType: 'company' }] },
    });
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Old Hall');
    expect(host.textContent).toContain("Create Limerick Celtics");
  });

  it('creates with the draft requestID, no space type, and moves to the plan step', () => {
    const { fixture, calls, router } = setupSignIn({ authenticated: true });
    const navigate = vi.spyOn(router, 'navigate');
    (fixture.componentInstance as unknown as { create(): void }).create();

    const endpoints = calls.map((c) => c.endpoint);
    expect(endpoints.indexOf('users/init_user_record')).toBeGreaterThanOrEqual(0);
    expect(endpoints.indexOf('users/init_user_record')).toBeLessThan(
      endpoints.indexOf('spaces/register_space'),
    );
    const register = calls.find((c) => c.endpoint === 'spaces/register_space');
    expect(register?.body['extensionID']).toBe('sneatclub');
    expect(register?.body['requestID']).toBe('sneatclub-club-11111111-2222-3333-4444-555555555555');
    expect(register?.body['type']).toBeUndefined();
    expect(navigate).toHaveBeenCalledWith(['/register/plan'], { replaceUrl: true });
  });

  it('surfaces a failed create instead of navigating', () => {
    const { fixture, router } = setupSignIn({ authenticated: true, registerFails: true });
    const navigate = vi.spyOn(router, 'navigate');
    (fixture.componentInstance as unknown as { create(): void }).create();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Slug already taken');
    expect(navigate).not.toHaveBeenCalledWith(['/register/plan'], { replaceUrl: true });
  });
});
