import { inject, Injectable } from '@angular/core';
import { SneatApiService } from '@sneat/api';
import { Observable, map } from 'rxjs';

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


