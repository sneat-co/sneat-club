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
    role: ClubInviteRole,
    firstName: string,
    lastName: string,
    message: string,
    email?: string,
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
        switchMap((member) => this.linkForMember(spaceID, member.id, message, email)),
      );
  }

  // Get-or-REUSE: calling again for the same member returns the SAME invite,
  // so "copy link" for a pending member is safe to call repeatedly.
  public linkForMember(
    spaceID: string,
    memberID: string,
    message = '',
    email?: string,
  ): Observable<ITeamInviteLink> {
    const toShape = (response: ICreatePersonalInviteResponse) => ({
      memberID,
      inviteID: response.invite.id,
      pin: response.invite.pin || '',
    });
    if (email) {
      // Email channel: the backend also QUEUES delivery (send: true — the
      // published request type predates the flag, hence the cast).
      const request = {
        spaceID,
        to: { channel: 'email', address: email, memberID },
        message,
        send: true,
      } as unknown as Parameters<typeof this.inviteService.createInviteForMember>[0];
      return this.inviteService.createInviteForMember(request).pipe(map(toShape));
    }
    return this.inviteService
      .getInviteLinkForMember({
        spaceID,
        to: { channel: 'link', memberID },
        message,
      })
      .pipe(map(toShape));
  }

  public removeMember(spaceID: string, contactID: string): Observable<unknown> {
    return this.api.post<unknown>('contactus/remove_space_member', {
      spaceID,
      contactID,
    });
  }
}

export type ClubInviteRole = 'player' | 'parent' | 'staff';
