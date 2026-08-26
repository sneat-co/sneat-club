import { IContactBrief } from '@sneat/extension-contactus-contract';
import { IIdAndBrief } from '@sneat/core';
import { memberContactTitle } from '@sneat/extension-contactus-ui';

// The helper now ships in @sneat/extension-contactus-ui; this stays as a
// CONSUMER-side guard because the "pd" bug (ids shown instead of names) was a
// club-visible regression and the shared package carries no spec for it yet.
const contact = (id: string, brief: Partial<IContactBrief>) =>
  ({ id, brief }) as IIdAndBrief<IContactBrief>;

describe('memberContactTitle', () => {
  it('prefers the stored title', () => {
    expect(
      memberContactTitle(
        contact('pd', { title: 'Captain Pat', names: { firstName: 'Pat' } }),
      ),
    ).toBe('Captain Pat');
  });

  it('derives from structured names when title is empty — member contacts store names only', () => {
    expect(
      memberContactTitle(
        contact('pd', { names: { firstName: 'Pat', lastName: 'Dbg' } }),
      ),
    ).toBe('Pat Dbg');
    expect(
      memberContactTitle(contact('pd', { names: { firstName: 'Pat' } })),
    ).toBe('Pat');
    expect(
      memberContactTitle(contact('pd', { names: { fullName: 'Pat Full' } })),
    ).toBe('Pat Full');
  });

  it('falls back to the id only when there is truly no name', () => {
    expect(memberContactTitle(contact('pd', {}))).toBe('pd');
  });
});
