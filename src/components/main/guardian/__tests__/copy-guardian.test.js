import { buildCopiedGuardianPayload } from '../copy-guardian';

const copiedAt = new Date('2026-10-22T15:04:05.987Z');

function savedGuardian() {
  return {
    _id: 'guardian-source-1',
    _rev: '4-source-rev',
    type: 'Guardian',
    name: {
      first: 'Jane',
      middle: 'B',
      last: 'Smith',
      nickname: 'Janey',
    },
    address: {
      street: '456 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      county: 'Sangamon',
      phone_day: '555-123-4567',
      phone_eve: '555-987-6543',
      phone_mbl: '555-456-7890',
      email: 'jane.smith@example.com',
    },
    birth_date: '1985-03-15',
    gender: 'F',
    weight: '140',
    occupation: 'Teacher',
    app_date: '2020-05-01',
    notes: {
      service: 'Y',
      other: 'Prior service notes',
    },
    medical: {
      level: 'B',
      food_restriction: 'Gluten Free',
      can_push: true,
      can_lift: false,
      limitations: 'Needs a ramp',
      experience: 'First aid certified',
      release: true,
      form: true,
    },
    flight: {
      status: 'Flown',
      id: 'SSHF-24',
      group: 'Group A',
      bus: 'Alpha1',
      seat: '12A',
      waiver: true,
      vaccinated: true,
      training: 'Main',
      training_complete: true,
      training_see_doc: true,
      training_notes: 'Completed main training',
      status_note: 'Already flew',
      mediaWaiver: true,
      infection_test: true,
      nofly: true,
      booksOrdered: 2,
      confirmed_date: '2024-02-01',
      confirmed_by: 'John Admin',
      paid: true,
      exempt: true,
      history: [
        { id: '2024-01-01T00:00:00Z', change: 'old flight history' },
        { id: '2024-06-01T00:00:00Z', change: 'status changed' },
      ],
    },
    call: {
      assigned_to: 'Call Center Rep',
      notes: 'Initial contact made',
      fm_number: '12345',
      email_sent: true,
      mail_sent: true,
      how_heard_about: 'family or friend',
      history: [{ id: '2024-01-15T00:00:00Z', change: 'old call history' }],
    },
    emerg_contact: {
      name: 'Bob Smith',
      relation: 'Spouse',
      address: {
        phone: '555-999-8888',
        email: 'bob.smith@example.com',
      },
    },
    veteran: {
      pref_notes: 'Prefers WWII veterans',
      pairings: [{ id: 'vet-456', name: 'John Veteran' }],
      history: [{ id: '2024-01-20T00:00:00Z', change: 'paired to John Veteran' }],
    },
    shirt: { size: 'M' },
    apparel: {
      item: 'Both',
      jacket_size: 'L',
      shirt_size: 'M',
      delivery: 'Training',
      date: '2024-01-25',
      by: 'Admin User',
      notes: 'Sent to training',
    },
    accommodations: {
      hotel_name: 'Springfield Hotel',
      room_type: 'Single',
      arrival_date: '2024-02-10',
      notes: 'Late arrival',
    },
    mail_call: {
      received: '2024-03-01',
      name: 'Pat Smith',
      relation: 'Child',
      notes: 'Call after 5',
      address: {
        phone: '555-222-3333',
        email: 'pat@example.com',
      },
    },
    metadata: {
      created_at: '2020-05-01T10:00:00Z',
      created_by: 'Original User',
      updated_at: '2024-06-01T14:30:00Z',
      updated_by: 'Original User',
    },
  };
}

describe('buildCopiedGuardianPayload', () => {
  test('keeps identity fields and blanks the legacy copy-new fields', () => {
    const source = savedGuardian();
    const payload = buildCopiedGuardianPayload(source, {
      copiedBy: 'Ada Lovelace',
      now: copiedAt,
    });

    expect(payload).not.toHaveProperty('_id');
    expect(payload).not.toHaveProperty('_rev');
    expect(payload).not.toHaveProperty('metadata');
    expect(payload.type).toBe('Guardian');
    expect(payload.app_date).toBe('2026-10-22');

    expect(payload.name).toEqual(source.name);
    expect(payload.address).toEqual(source.address);
    expect(payload.birth_date).toBe(source.birth_date);
    expect(payload.gender).toBe(source.gender);
    expect(payload.weight).toBe(source.weight);
    expect(payload.occupation).toBe(source.occupation);
    expect(payload.shirt).toEqual(source.shirt);
    expect(payload.notes).toEqual(source.notes);
    expect(payload.emerg_contact).toEqual(source.emerg_contact);
    expect(payload.accommodations).toEqual(source.accommodations);
    expect(payload.mail_call).toEqual(source.mail_call);
    expect(payload.medical).toEqual({
      ...source.medical,
      release: false,
      limitations: '',
    });

    expect(payload.call).toEqual({
      assigned_to: '',
      notes: '',
      fm_number: '',
      email_sent: false,
      mail_sent: false,
      how_heard_about: 'Unknown',
    });
    expect(payload.call).not.toHaveProperty('history');

    expect(payload.flight).toEqual({
      id: 'None',
      status: 'Copied',
      group: '',
      bus: 'None',
      seat: '',
      confirmed_date: '',
      confirmed_by: '',
      status_note: '',
      nofly: false,
      vaccinated: false,
      mediaWaiver: false,
      infection_test: false,
      waiver: false,
      training: 'None',
      training_notes: '',
      training_see_doc: false,
      training_complete: false,
      paid: false,
      exempt: false,
      booksOrdered: 0,
      history: [
        {
          id: '2026-10-22T15:04:05Z',
          change: 'copied guardian from doc id: guardian-source-1 rev: 4-source-rev by: Ada Lovelace',
        },
      ],
    });

    expect(payload.veteran).toEqual({
      pref_notes: '',
      pairings: [],
    });
    expect(payload.veteran).not.toHaveProperty('history');

    expect(payload.apparel).toEqual({
      item: 'None',
      jacket_size: 'None',
      shirt_size: 'None',
      delivery: 'None',
      date: '',
      by: '',
      notes: '',
    });
  });

  test('writes one flight history entry with a UTC timestamp and no milliseconds', () => {
    const payload = buildCopiedGuardianPayload(savedGuardian(), {
      copiedBy: 'Ada Lovelace',
      now: copiedAt,
    });

    expect(payload.flight.status).toBe('Copied');
    expect(payload.flight.history).toHaveLength(1);
    expect(payload.flight.history[0].id).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(payload.flight.history[0].id).toBe('2026-10-22T15:04:05Z');
    expect(payload.flight.history[0].change).toBe(
      'copied guardian from doc id: guardian-source-1 rev: 4-source-rev by: Ada Lovelace'
    );
    expect(payload.flight.history[0].change).not.toContain('old flight history');
  });

  test('does not mutate the source guardian', () => {
    const source = savedGuardian();
    const snapshot = JSON.parse(JSON.stringify(source));

    buildCopiedGuardianPayload(source, {
      copiedBy: 'Ada Lovelace',
      now: copiedAt,
    });

    expect(source).toEqual(snapshot);
  });
});
