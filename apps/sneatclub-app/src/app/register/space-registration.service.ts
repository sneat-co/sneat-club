import { inject, Injectable } from '@angular/core';
import { SneatApiService } from '@sneat/api';
import { Observable, map } from 'rxjs';

/** What ensureUserRecord needs to know about the signed-in account. */
export interface IAuthUserSnapshot {
  readonly email?: string | null;
  readonly emailVerified?: boolean;
  readonly providerId?: string;
  readonly displayName?: string | null;
}

/**
 * The honest message out of a failed Sneat API call. Angular's
 * HttpErrorResponse is NOT an instanceof Error, so `err.message` guards hid
 * every real backend error behind the generic fallback — which is exactly how
 * a missing-user-record 500 reached an operator as "please try again".
 */
export function registrationErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as { error?: { error?: { message?: string }; message?: string }; message?: string };
    const apiMessage = e.error?.error?.message || e.error?.message;
    if (apiMessage) {
      return apiMessage;
    }
    if (typeof e.message === 'string' && e.message) {
      return e.message;
    }
  }
  return fallback;
}

/**
 * The extension id sneat.club registers Spaces under. The backend reads it
 * to find this product's registration profile, which supplies the space type
 * (`company`) and the slug namespace — so the client never names either, and
 * cannot ask for a kind of Space this product does not own.
 *
 * See sneat-specs decision 0006, unified space registration.
 */
export const SNEATCLUB_EXTENSION_ID = 'sneatclub';

/**
 * A club registration. Deliberately carries no space type: the platform takes
 * it from the extension's registration profile.
 */
export interface IRegisterClubRequest {
  readonly extensionID: string;
  readonly title: string;
  /**
   * Stable for one registration attempt, minted when the form is opened. The
   * backend hashes `userID + requestID` into the space id, so resubmitting
   * after a failure resolves to the same club instead of registering a
   * second one.
   */
  readonly requestID?: string;
  readonly countryID?: string;
  readonly slug?: string;
}

export interface IRegisteredClub {
  readonly spaceID: string;
  /** The club's module markers — contains `communitycentrum` after registering. */
  readonly modules: readonly string[];
  readonly publicSlug?: string;
}

/** A club the signed-in user already manages. */
export interface IManageableSpace {
  readonly spaceID: string;
  readonly title: string;
  readonly spaceType: string;
}

interface IListManageableResponse {
  readonly spaces?: readonly IManageableSpace[];
}

/**
 * Registers community clubs through the platform's unified space-registration
 * endpoints, shared by every Sneat product (school-portal.app, gametable.space,
 * noticeboard.cc, sneat.club). NoticeBoard owns no registration logic of its
 * own — only which fields a club is asked for.
 */
@Injectable({ providedIn: 'root' })
export class SpaceRegistrationService {
  private readonly api = inject(SneatApiService);
  private userRecordEnsured = false;

  /**
   * Creates the users/{uid} record if it does not exist yet.
   *
   * The full Sneat apps do this reactively (SneatUserService watches the user
   * doc and posts users/init_user_record when it is absent); the registration
   * wizard bypasses that machinery, and its audience is precisely NEW
   * accounts — whose first ever API call is register_space, which requires
   * the record and 500s without it. So the wizard creates it explicitly,
   * right before registering. The endpoint is idempotent (create-if-missing).
   */
  public ensureUserRecord(user: IAuthUserSnapshot): Observable<unknown> {
    if (this.userRecordEnsured) {
      return new Observable((subscriber) => {
        subscriber.next(undefined);
        subscriber.complete();
      });
    }
    const request: Record<string, unknown> = {
      email: user.email || undefined,
      emailIsVerified: user.emailVerified ?? false,
      authProvider: user.providerId || undefined,
    };
    if (user.displayName) {
      request['names'] = { fullName: user.displayName };
    }
    return this.api.post<unknown>('users/init_user_record', request).pipe(
      map((result) => {
        this.userRecordEnsured = true;
        return result;
      }),
    );
  }

  /**
   * Registers a club. One call creates the Space, records the
   * `communitycentrum` module marker on it, stores the country and claims the
   * public slug.
   */
  public registerClub(
    request: Omit<IRegisterClubRequest, 'extensionID'>,
  ): Observable<IRegisteredClub> {
    return this.api.post<IRegisteredClub>('spaces/register_space', {
      ...request,
      extensionID: SNEATCLUB_EXTENSION_ID,
    });
  }

  /**
   * Lists clubs the signed-in user already manages, so registration can offer
   * them rather than pushing someone into registering a duplicate.
   *
   * The role filter is server-side and not a parameter here on purpose: a
   * client that could choose its own filter could enumerate Spaces it may not
   * manage.
   */
  public listManageableClubs(): Observable<readonly IManageableSpace[]> {
    return this.api
      .post<IListManageableResponse>('spaces/list_manageable', {
        extensionID: SNEATCLUB_EXTENSION_ID,
      })
      .pipe(map((response) => response?.spaces ?? []));
  }
}


