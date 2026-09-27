import { buildPersonUpdatePayload } from '../person-update';

describe('buildPersonUpdatePayload', () => {
  const guardian = {
    _id: 'g1',
    _rev: '2-rev',
    type: 'Guardian',
    name: { first: 'Dawn', last: 'Brust', middle: 'M' },
    address: {
      street: '1 Main',
      city: 'Milwaukee',
      state: 'WI',
      zip: '53202',
      county: 'Milwaukee',
      phone_day: '414-555-0100',
      phone_mbl: '414-327-5999',
      email: 'dawn@example.com',
    },
    flight: {
      id: 'flight-1',
      bus: 'Alpha2',
      training: 'Main',
      training_complete: false,
      training_notes: 'old',
      waiver: true,
      training_see_doc: false,
      history: [{ id: 't', change: 'old' }],
    },
    metadata: { updated_by: 'x' },
    call: { assigned_to: 'Barb', history: [{ id: 'c', change: 'old' }] },
  };

  test('merges middle name without dropping first and last', () => {
    const payload = buildPersonUpdatePayload(guardian, { name: { middle: 'Marie' } }, 'Guardian');

    expect(payload.name).toEqual({ first: 'Dawn', last: 'Brust', middle: 'Marie' });
    expect(payload._rev).toBe('2-rev');
    expect(payload.type).toBe('Guardian');
    expect(payload.metadata).toBeUndefined();
  });

  test('merges mobile phone without dropping the rest of address', () => {
    const payload = buildPersonUpdatePayload(
      guardian,
      { address: { phone_mbl: '414-555-1212' } },
      'Guardian'
    );

    expect(payload.address.phone_mbl).toBe('414-555-1212');
    expect(payload.address.street).toBe('1 Main');
    expect(payload.address.email).toBe('dawn@example.com');
  });

  test('merges training notes and training complete into flight and drops history', () => {
    const payload = buildPersonUpdatePayload(
      guardian,
      { flight: { training_notes: 'Passport after email', training_complete: true } },
      'Guardian'
    );

    expect(payload.flight.training_notes).toBe('Passport after email');
    expect(payload.flight.training_complete).toBe(true);
    expect(payload.flight.training).toBe('Main');
    expect(payload.flight.waiver).toBe(true);
    expect(payload.flight.bus).toBe('Alpha2');
    expect(payload.flight.history).toBeUndefined();
    expect(payload.call.assigned_to).toBe('Barb');
    expect(payload.call.history).toBeUndefined();
  });
});
