import {
  buildVeteranGuardianPreferenceNote,
  mapServiceBranchForAcceptPreview,
} from '@/lib/review/mapping';

describe('review logistics mapping preview', () => {
  test('buildVeteranGuardianPreferenceNote folds phone and email into notes', () => {
    expect(
      buildVeteranGuardianPreferenceNote({
        pref_notes: 'Son Bob',
        pref_phone: '608-555-0000',
        pref_email: 'bob@example.com',
      })
    ).toBe('Son Bob (Phone: 608-555-0000, Email: bob@example.com)');
  });

  test('buildVeteranGuardianPreferenceNote returns notes when no contact details', () => {
    expect(buildVeteranGuardianPreferenceNote({ pref_notes: 'Daughter' })).toBe('Daughter');
  });

  test('mapServiceBranchForAcceptPreview clears Unknown branch', () => {
    expect(mapServiceBranchForAcceptPreview('Unknown')).toBe('');
  });
});
