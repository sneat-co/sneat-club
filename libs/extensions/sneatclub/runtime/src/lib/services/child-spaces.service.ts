import { Injectable, inject } from '@angular/core';
import { SneatApiService } from '@sneat/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// A club's teams ("Girls U14") are child Spaces: Spaces whose parentSpaceID is
// the club. The backend scopes the listing to members of the PARENT space.
export interface IChildSpaceBrief {
  readonly id: string;
  readonly title: string;
  readonly type: string;
}

interface IListChildSpacesResponse {
  readonly spaces?: IChildSpaceBrief[];
}

interface ICreateChildSpaceResponse {
  readonly space: IChildSpaceBrief;
}

@Injectable()
export class ChildSpacesService {
  private readonly api = inject(SneatApiService);

  public listChildSpaces(spaceID: string): Observable<IChildSpaceBrief[]> {
    return this.api
      .post<IListChildSpacesResponse>('spaces/list_child_spaces', { spaceID })
      .pipe(map((response) => response?.spaces ?? []));
  }

  // requestID is minted when the form opens (same contract as register_space):
  // resubmitting after a failure replays onto the same team instead of
  // creating a second one.
  public createChildSpace(
    spaceID: string,
    title: string,
    requestID: string,
  ): Observable<IChildSpaceBrief> {
    return this.api
      .post<ICreateChildSpaceResponse>('spaces/create_child_space', {
        spaceID,
        title,
        requestID,
      })
      .pipe(map((response) => response.space));
  }
}

// Angular's HttpErrorResponse is NOT `instanceof Error`, so a naive
// `err instanceof Error ? err.message : fallback` swallows every backend
// message. Dig the API error message out of the places it actually lives.
export function childSpacesErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    error?: { error?: { message?: string }; message?: string };
    message?: string;
  };
  return (
    e?.error?.error?.message || e?.error?.message || e?.message || fallback
  );
}
