import { IContactBrief } from '@sneat/extension-contactus-contract';
import { IIdAndBrief } from '@sneat/core';
import { clubContactTitle } from './club-contacts-page.component';

const contact = (id: string, brief: Partial<IContactBrief>) =>
  ({ id, brief }) as IIdAndBrief<IContactBrief>;

describe('clubContactTitle', () => {
  it('prefers the stored title', () => {
    expect(
      clubContactTitle(
        contact('pd', { title: 'Captain Pat', names: { firstName: 'Pat' } }),
      ),
    ).toBe('Captain Pat');
  });

  it('derives from structured names when title is empty — member contacts store names only', () => {
    expect(
      clubContactTitle(
        contact('pd', { names: { firstName: 'Pat', lastName: 'Dbg' } }),
      ),
    ).toBe('Pat Dbg');
    expect(
      clubContactTitle(contact('pd', { names: { firstName: 'Pat' } })),
    ).toBe('Pat');
    expect(
      clubContactTitle(contact('pd', { names: { fullName: 'Pat Full' } })),
    ).toBe('Pat Full');
  });

  it('falls back to the id only when there is truly no name', () => {
    expect(clubContactTitle(contact('pd', {}))).toBe('pd');
  });
});
