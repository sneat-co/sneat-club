import { Injectable, inject } from '@angular/core';
import { SneatApiService } from '@sneat/api';
import {
  INVITE_SERVICE,
  ICreatePersonalInviteResponse,
} from '@sneat/extension-contactus-contract';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Inviting a player/parent to a team is two existing generic operations:
// contactus creates the member contact with the role, invitus mints a
// personal invite link for that contact. Claiming the invite links the
// invitee's account to the member contact, roles included.
export interface ITeamInviteLink {
  readonly memberID: string;
  readonly inviteID: string;
  readonly pin: string;
}

interface ICreatedMember {
  readonly id: string;
}

@Injectable()
export class TeamInvitesService {
  private readonly api = inject(SneatApiService);
  private readonly inviteService = inject(INVITE_SERVICE);

  public invitePersonToTeam(
    spaceID: string,
    role: 'player' | 'parent',
    firstName: string,
    lastName: string,
    message: string,
  ): Observable<ITeamInviteLink> {
    return this.api
      .post<ICreatedMember>('contactus/create_member', {
        spaceID,
        type: 'person',
        status: 'active',
        countryID: '--',
        roles: [role],
        names: { firstName, lastName },
        gender: 'unknown',
        ageGroup: 'unknown',
      })
      .pipe(
        switchMap((member) =>
          this.inviteService
            .getInviteLinkForMember({
              spaceID,
              to: { channel: 'link', memberID: member.id },
              message,
            })
            .pipe(
              map((response: ICreatePersonalInviteResponse) => ({
                memberID: member.id,
                inviteID: response.invite.id,
                pin: response.invite.pin || '',
              })),
            ),
        ),
      );
  }
}
