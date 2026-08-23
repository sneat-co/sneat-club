// Real club registration for sneat.club, against the Sneat platform.
//
// Registering a club is the same platform operation every Sneat product uses —
// POST /v0/spaces/register_space with an extension id (sneat-specs decision
// 0006). The server takes the space type and slug namespace from Sneat Club's
// registration profile, so this client never names either.
//
// Mirrors gametable/web's client: Firebase Auth against project sneat-eur3-1,
// then an authenticated call to api.sneat.cloud.

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';

/** The extension id Sneat Club registers Spaces under. */
export const SNEATCLUB_EXTENSION_ID = 'sneatclub';

export const SNEAT_API_BASE_URL = 'https://api.sneat.cloud';

// Same Sneat identity the rest of the ecosystem signs in with, so a club
// registered here is owned by the operator's existing Sneat account.
const FIREBASE_CONFIG = {
  projectId: 'sneat-eur3-1',
  appId: '1:588648831063:web:303af7e0c5f8a7b10d6b12',
  apiKey: 'AIzaSyCeQu1WC182yD0VHrRm4nHUxVf27fY-MLQ',
  authDomain: 'auth.sneat.co',
  messagingSenderId: '588648831063',
  measurementId: 'G-TYBDTV738R',
};

let cachedApp: FirebaseApp | undefined;
let cachedAuth: Auth | undefined;

function firebaseApp(): FirebaseApp {
  if (!cachedApp) {
    cachedApp = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  }
  return cachedApp;
}

export function firebaseAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(firebaseApp());
  }
  return cachedAuth;
}

export function onSignedInUserChanged(handler: (user: User | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth(), handler);
}

export function signInWithGoogle(): Promise<unknown> {
  return signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
}

export function signInWithEmail(email: string, password: string): Promise<unknown> {
  return signInWithEmailAndPassword(firebaseAuth(), email, password);
}

export function signOutOfSneat(): Promise<void> {
  return signOut(firebaseAuth());
}

async function authHeaders(): Promise<Record<string, string>> {
  const user = firebaseAuth().currentUser;
  if (!user) {
    throw new Error('Sign in to register your club.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await user.getIdToken()}`,
  };
}

export interface RegisterClubRequest {
  title: string;
  /**
   * Stable for one registration attempt, minted when the form is opened. The
   * backend hashes `userID + requestID` into the space id, so resubmitting
   * after a failure resolves to the same club instead of registering a second.
   */
  requestID?: string;
  countryID?: string;
  slug?: string;
}

export interface RegisteredClub {
  spaceID: string;
  /** Module markers on the club — contains `sneatclub` after registering. */
  modules: string[];
  publicSlug?: string;
}

export interface ManageableSpace {
  spaceID: string;
  title: string;
  spaceType: string;
}

/**
 * Registers a club. One call creates the Space (of type `club` — a club's
 * players, guardians, coaches and volunteers are members, not customers),
 * records the `sneatclub` marker on it, stores the country and claims the
 * public slug.
 */
export async function registerClub(request: RegisterClubRequest): Promise<RegisteredClub> {
  const response = await fetch(`${SNEAT_API_BASE_URL}/v0/spaces/register_space`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ ...request, extensionID: SNEATCLUB_EXTENSION_ID }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Could not register your club: ${response.status} ${detail}`);
  }
  return response.json() as Promise<RegisteredClub>;
}

/**
 * Lists clubs the signed-in user already manages, so registration can offer
 * them instead of pushing someone into registering a duplicate. The role
 * filter is server-side, never a parameter here.
 */
export async function listManageableClubs(): Promise<ManageableSpace[]> {
  const response = await fetch(`${SNEAT_API_BASE_URL}/v0/spaces/list_manageable`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ extensionID: SNEATCLUB_EXTENSION_ID }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Could not list your clubs: ${response.status} ${detail}`);
  }
  const body = (await response.json()) as { spaces?: ManageableSpace[] };
  return body.spaces ?? [];
}

const REQUEST_ID_KEY = 'sneat_club_registration_request_id';

/**
 * The id that makes one registration attempt idempotent.
 *
 * Minted when the form is opened and kept in sessionStorage, so a retry after
 * a network error — or after a reload — resends the same id and replays the
 * original request instead of registering a second club. Minting it at submit
 * time would make every attempt a new registration.
 */
export function registrationRequestId(): string {
  const existing = sessionStorage.getItem(REQUEST_ID_KEY);
  if (existing) {
    return existing;
  }
  const requestId = `sneatclub-club-${globalThis.crypto.randomUUID()}`;
  sessionStorage.setItem(REQUEST_ID_KEY, requestId);
  return requestId;
}

export function clearRegistrationRequestId(): void {
  sessionStorage.removeItem(REQUEST_ID_KEY);
}

/** Turns a club name into a candidate public slug. */
export function slugifyClubName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
