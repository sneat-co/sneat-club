import { IUserSpaceBrief } from '@sneat/auth-models';
import { IIdAndBrief } from '@sneat/core';
import { clubSpacesOnly } from './club-spaces';

const space = (
  id: string,
  type: string,
  title?: string,
): IIdAndBrief<IUserSpaceBrief> =>
  ({ id, brief: { type, title } }) as unknown as IIdAndBrief<IUserSpaceBrief>;

describe('clubSpacesOnly', () => {
  it('drops personal/family/company spaces and keeps clubs, sorted by title', () => {
    const result = clubSpacesOnly([
      space('p1', 'personal', 'Me'),
      space('c2', 'club', 'Zebras FC'),
      space('f1', 'family', 'Family'),
      space('c1', 'club', 'Limerick Celtics'),
      space('co1', 'company', 'A Venue'),
    ]);
    expect(result.map((s) => s.id)).toEqual(['c1', 'c2']);
  });

  it('returns empty for a user with no clubs', () => {
    expect(clubSpacesOnly([space('p1', 'personal')])).toEqual([]);
  });
});
