/**
 * The registration draft: what the visitor typed BEFORE being asked to sign
 * in. Filling the form is the low-friction first step; authentication happens
 * at the commit point, with this draft still on screen — asking for an account
 * up front is where registrations die.
 *
 * Kept in sessionStorage so the draft — and crucially its requestID — survives
 * the sign-in round trip (a Google popup, an email verification, even a
 * reload). The requestID is minted once per draft: the backend hashes
 * `userID + requestID` into the space id, so retrying a failed create replays
 * the original request instead of registering a second club.
 */
export interface IRegistrationDraft {
  title: string;
  slug: string;
  countryID: string;
  requestID: string;
}

/** What the wizard remembers once the space is created — feeds plan/welcome. */
export interface IRegisteredResult {
  spaceID: string;
  spaceType: string;
  title: string;
  publicSlug?: string;
}

const DRAFT_KEY = 'sneatclub_registration_draft';
const RESULT_KEY = 'sneatclub_registration_result';

export function loadRegistrationDraft(): IRegistrationDraft | undefined {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as IRegistrationDraft) : undefined;
  } catch {
    return undefined;
  }
}

export function saveRegistrationDraft(draft: IRegistrationDraft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Private mode with storage disabled: the wizard still works within one
    // navigation; only reload-resilience is lost.
  }
}

export function newDraftRequestID(): string {
  return `sneatclub-club-${globalThis.crypto.randomUUID()}`;
}

export function clearRegistrationDraft(): void {
  sessionStorage.removeItem(DRAFT_KEY);
}

export function loadRegisteredResult(): IRegisteredResult | undefined {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as IRegisteredResult) : undefined;
  } catch {
    return undefined;
  }
}

export function saveRegisteredResult(result: IRegisteredResult): void {
  try {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
  } catch {
    // See saveRegistrationDraft.
  }
}

/** Turns a club name into a candidate public slug. */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
