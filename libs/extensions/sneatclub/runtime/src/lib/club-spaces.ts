import { IUserSpaceBrief } from '@sneat/auth-models';
import { IIdAndBrief } from '@sneat/core';

// Only clubs — the user record also carries personal/family spaces, which are
// not what sneat.club navigates. The published SpaceType union predates 'club'
// (fixed upstream with sneat-libs#52); compare as strings until the lib
// upgrade lands. Used by the side menu's space selector; the home page applies
// the same rule.
export function clubSpacesOnly(
  spaces: readonly IIdAndBrief<IUserSpaceBrief>[],
): IIdAndBrief<IUserSpaceBrief>[] {
  return spaces
    .filter((s) => (s.brief?.type as string) === 'club')
    .sort((a, b) =>
      (a.brief?.title || a.id).localeCompare(b.brief?.title || b.id),
    );
}
