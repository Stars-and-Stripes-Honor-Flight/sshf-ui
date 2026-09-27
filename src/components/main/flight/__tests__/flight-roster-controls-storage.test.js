import {
  DEFAULT_ROSTER_CONTROLS,
  getFlightRosterControlsStorageKey,
  loadFlightRosterControls,
  saveFlightRosterControls,
  resetFlightRosterControls,
  ROSTER_CONTROLS_SCHEMA_VERSION,
} from '../flight-roster-controls-storage';

describe('flight-roster-controls-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getFlightRosterControlsStorageKey', () => {
    test('includes flight id and version in key', () => {
      expect(getFlightRosterControlsStorageKey('flight-abc')).toBe(
        'sshf.flightRosterControls.v1.flight-abc'
      );
    });

    test('different flight ids produce different keys', () => {
      expect(getFlightRosterControlsStorageKey('a')).not.toBe(
        getFlightRosterControlsStorageKey('b')
      );
    });
  });

  describe('loadFlightRosterControls', () => {
    test('returns defaults when key is missing', () => {
      expect(loadFlightRosterControls('missing-flight')).toEqual(DEFAULT_ROSTER_CONTROLS);
    });

    test('returns defaults when flight id is empty', () => {
      expect(loadFlightRosterControls('')).toEqual(DEFAULT_ROSTER_CONTROLS);
      expect(loadFlightRosterControls(null)).toEqual(DEFAULT_ROSTER_CONTROLS);
    });

    test('returns defaults for invalid JSON', () => {
      localStorage.setItem(getFlightRosterControlsStorageKey('bad-json'), '{not json');
      expect(loadFlightRosterControls('bad-json')).toEqual(DEFAULT_ROSTER_CONTROLS);
    });

    test('loads saved controls', () => {
      saveFlightRosterControls('flight-1', {
        nameFilter: 'smith',
        statusFilter: 'issues',
        busFilter: 'Bus 2',
        assignedCallerFilter: 'Jane Doe',
        sortBy: 'seat',
      });

      expect(loadFlightRosterControls('flight-1')).toEqual({
        nameFilter: 'smith',
        statusFilter: 'issues',
        busFilter: 'Bus 2',
        assignedCallerFilter: 'Jane Doe',
        sortBy: 'seat',
        noGuardianOnly: false,
        trainingTypeFilter: [],
        trainingGuardiansFocus: true,
      });
    });

    test('round-trips the training type filter and guardians focus', () => {
      saveFlightRosterControls('flight-1', {
        ...DEFAULT_ROSTER_CONTROLS,
        trainingTypeFilter: ['Web', 'Alt'],
        trainingGuardiansFocus: false,
      });

      const loaded = loadFlightRosterControls('flight-1');
      expect(loaded.trainingTypeFilter).toEqual(['Web', 'Alt']);
      expect(loaded.trainingGuardiansFocus).toBe(false);
    });

    test('defaults training controls for legacy saved controls', () => {
      localStorage.setItem(
        getFlightRosterControlsStorageKey('legacy-training'),
        JSON.stringify({
          version: ROSTER_CONTROLS_SCHEMA_VERSION,
          nameFilter: '',
          statusFilter: 'all',
          busFilter: 'all',
          assignedCallerFilter: 'all',
          sortBy: 'name',
          noGuardianOnly: false,
        })
      );

      const loaded = loadFlightRosterControls('legacy-training');
      expect(loaded.trainingTypeFilter).toEqual([]);
      expect(loaded.trainingGuardiansFocus).toBe(true);
    });

    test('drops invalid training type filter values', () => {
      localStorage.setItem(
        getFlightRosterControlsStorageKey('flight-bad-training'),
        JSON.stringify({
          version: ROSTER_CONTROLS_SCHEMA_VERSION,
          trainingTypeFilter: ['Web', 3, '', 'Alt'],
          trainingGuardiansFocus: 'yes',
        })
      );

      const loaded = loadFlightRosterControls('flight-bad-training');
      expect(loaded.trainingTypeFilter).toEqual(['Web', 'Alt']);
      expect(loaded.trainingGuardiansFocus).toBe(true);
    });

    test('round-trips the No guardian filter', () => {
      saveFlightRosterControls('flight-1', {
        ...DEFAULT_ROSTER_CONTROLS,
        noGuardianOnly: true,
      });

      expect(loadFlightRosterControls('flight-1').noGuardianOnly).toBe(true);
    });

    test('defaults noGuardianOnly to false for legacy saved controls', () => {
      localStorage.setItem(
        getFlightRosterControlsStorageKey('legacy'),
        JSON.stringify({
          version: ROSTER_CONTROLS_SCHEMA_VERSION,
          nameFilter: 'smith',
          statusFilter: 'issues',
          busFilter: 'all',
          assignedCallerFilter: 'all',
          sortBy: 'name',
        })
      );

      expect(loadFlightRosterControls('legacy').noGuardianOnly).toBe(false);
    });

    test('coerces a non-boolean noGuardianOnly value to false', () => {
      localStorage.setItem(
        getFlightRosterControlsStorageKey('flight-bad-flag'),
        JSON.stringify({
          ...DEFAULT_ROSTER_CONTROLS,
          version: ROSTER_CONTROLS_SCHEMA_VERSION,
          noGuardianOnly: 'yes',
        })
      );

      expect(loadFlightRosterControls('flight-bad-flag').noGuardianOnly).toBe(false);
    });

    test('persists flight group sort option', () => {
      saveFlightRosterControls('flight-1', {
        ...DEFAULT_ROSTER_CONTROLS,
        sortBy: 'group',
      });

      expect(loadFlightRosterControls('flight-1').sortBy).toBe('group');
    });

    test('per-flight storage does not collide', () => {
      saveFlightRosterControls('flight-a', {
        ...DEFAULT_ROSTER_CONTROLS,
        nameFilter: 'alpha',
        sortBy: 'bus',
      });
      saveFlightRosterControls('flight-b', {
        ...DEFAULT_ROSTER_CONTROLS,
        nameFilter: 'beta',
        sortBy: 'seat',
      });

      expect(loadFlightRosterControls('flight-a').nameFilter).toBe('alpha');
      expect(loadFlightRosterControls('flight-a').sortBy).toBe('bus');
      expect(loadFlightRosterControls('flight-b').nameFilter).toBe('beta');
      expect(loadFlightRosterControls('flight-b').sortBy).toBe('seat');
    });

    test('coerces invalid enum fields to defaults', () => {
      localStorage.setItem(
        getFlightRosterControlsStorageKey('flight-invalid'),
        JSON.stringify({
          version: ROSTER_CONTROLS_SCHEMA_VERSION,
          nameFilter: 123,
          statusFilter: 'bogus',
          busFilter: null,
          assignedCallerFilter: undefined,
          sortBy: 'invalid',
        })
      );

      expect(loadFlightRosterControls('flight-invalid')).toEqual(DEFAULT_ROSTER_CONTROLS);
    });

    test('handles localStorage read errors gracefully', () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(loadFlightRosterControls('flight-1')).toEqual(DEFAULT_ROSTER_CONTROLS);

      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe('saveFlightRosterControls', () => {
    test('persists JSON with schema version', () => {
      saveFlightRosterControls('flight-1', DEFAULT_ROSTER_CONTROLS);

      const raw = localStorage.getItem(getFlightRosterControlsStorageKey('flight-1'));
      expect(JSON.parse(raw)).toEqual({
        version: ROSTER_CONTROLS_SCHEMA_VERSION,
        ...DEFAULT_ROSTER_CONTROLS,
      });
    });

    test('no-ops when flight id is missing', () => {
      saveFlightRosterControls('', { ...DEFAULT_ROSTER_CONTROLS, nameFilter: 'x' });
      expect(localStorage.length).toBe(0);
    });

    test('handles localStorage write errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() =>
        saveFlightRosterControls('flight-1', { ...DEFAULT_ROSTER_CONTROLS, sortBy: 'bus' })
      ).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('resetFlightRosterControls', () => {
    test('writes defaults to localStorage and returns them', () => {
      saveFlightRosterControls('flight-1', {
        ...DEFAULT_ROSTER_CONTROLS,
        nameFilter: 'smith',
        sortBy: 'seat',
        statusFilter: 'issues',
      });

      expect(resetFlightRosterControls('flight-1')).toEqual(DEFAULT_ROSTER_CONTROLS);
      expect(loadFlightRosterControls('flight-1')).toEqual(DEFAULT_ROSTER_CONTROLS);
    });

    test('no-ops when flight id is missing', () => {
      expect(resetFlightRosterControls('')).toEqual(DEFAULT_ROSTER_CONTROLS);
      expect(localStorage.length).toBe(0);
    });
  });
});
