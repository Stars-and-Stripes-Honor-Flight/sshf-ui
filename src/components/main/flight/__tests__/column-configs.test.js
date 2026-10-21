import {
  ACTIVITY_PRESETS,
  ACTIVITY_PRESET_LABELS,
  COLUMN_CONFIGS,
  getColumnConfig,
  getDefaultPreset,
  loadSavedPreset,
  savePreset,
  ACTIVITY_PRESET_STORAGE_KEY,
} from '../column-configs';

describe('column-configs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('ACTIVITY_PRESETS', () => {
    test('defines all required presets', () => {
      expect(ACTIVITY_PRESETS.OPS).toBe('ops');
      expect(ACTIVITY_PRESETS.CALLER).toBe('caller');
      expect(ACTIVITY_PRESETS.MEDICAL).toBe('medical');
      expect(ACTIVITY_PRESETS.APPAREL).toBe('apparel');
      expect(ACTIVITY_PRESETS.TRAINING).toBe('training');
    });
  });

  describe('ACTIVITY_PRESET_LABELS', () => {
    test('provides labels for all presets', () => {
      expect(ACTIVITY_PRESET_LABELS[ACTIVITY_PRESETS.OPS]).toBe('Ops');
      expect(ACTIVITY_PRESET_LABELS[ACTIVITY_PRESETS.CALLER]).toBe('Caller');
      expect(ACTIVITY_PRESET_LABELS[ACTIVITY_PRESETS.MEDICAL]).toBe('Medical');
      expect(ACTIVITY_PRESET_LABELS[ACTIVITY_PRESETS.APPAREL]).toBe('Apparel');
      expect(ACTIVITY_PRESET_LABELS[ACTIVITY_PRESETS.TRAINING]).toBe('Training');
    });
  });

  describe('COLUMN_CONFIGS', () => {
    test('ops preset places Med Lvl immediately left of Status', () => {
      const opsColumns = COLUMN_CONFIGS[ACTIVITY_PRESETS.OPS];
      expect(opsColumns.map((column) => column.id)).toEqual([
        'seat',
        'bus',
        'flt_grp_med_exp',
        'med_lvl',
        'status',
      ]);
      expect(opsColumns.map((column) => column.label)).toEqual([
        'Seat',
        'Bus',
        'Flt Grp / Med Exp',
        'Med Lvl',
        'Status',
      ]);
      expect(opsColumns.map((column) => column.id)).not.toContain('medical_level');
    });

    test('caller preset includes assigned_to, confirmed, phone, fm_number columns', () => {
      const callerColumns = COLUMN_CONFIGS[ACTIVITY_PRESETS.CALLER];
      expect(callerColumns).toHaveLength(4);
      expect(callerColumns[0].id).toBe('assigned_to');
      expect(callerColumns[1].id).toBe('confirmed');
      expect(callerColumns[2].id).toBe('phone');
      expect(callerColumns[3].id).toBe('fm_number');
    });

    test('medical preset includes medical_level, medical_form, limitations columns', () => {
      const medicalColumns = COLUMN_CONFIGS[ACTIVITY_PRESETS.MEDICAL];
      expect(medicalColumns).toHaveLength(3);
      expect(medicalColumns[0].id).toBe('medical_level');
      expect(medicalColumns[0].label).toBe('Med Notes / Med Experience');
      expect(medicalColumns[1].id).toBe('medical_form');
      expect(medicalColumns[2].id).toBe('limitations');
    });

    test('apparel preset includes shirt_size, jacket_size, notes columns', () => {
      const apparelColumns = COLUMN_CONFIGS[ACTIVITY_PRESETS.APPAREL];
      expect(apparelColumns).toHaveLength(3);
      expect(apparelColumns[0].id).toBe('shirt_size');
      expect(apparelColumns[1].id).toBe('jacket_size');
      expect(apparelColumns[2].id).toBe('notes');
    });

    test('training preset lists middle, mobile, dob, training, notes, waivers, and see doc', () => {
      const trainingColumns = COLUMN_CONFIGS[ACTIVITY_PRESETS.TRAINING];
      expect(trainingColumns.map((column) => column.id)).toEqual([
        'name_middle',
        'phone_mbl',
        'birth_date',
        'training',
        'training_notes',
        'flight_waiver',
        'flight_training_see_doc',
      ]);
      expect(trainingColumns.map((column) => column.label)).toEqual([
        'Middle',
        'Mobile',
        'DOB',
        'Training',
        'Training notes',
        'Waivers',
        'See Doc',
      ]);
      expect(trainingColumns.map((column) => column.id)).not.toContain('gender');
      expect(trainingColumns.map((column) => column.id)).not.toContain('bus');
    });
  });

  describe('getColumnConfig', () => {
    test('returns ops config for ops preset', () => {
      const config = getColumnConfig(ACTIVITY_PRESETS.OPS);
      expect(config).toEqual(COLUMN_CONFIGS[ACTIVITY_PRESETS.OPS]);
    });

    test('returns caller config for caller preset', () => {
      const config = getColumnConfig(ACTIVITY_PRESETS.CALLER);
      expect(config).toEqual(COLUMN_CONFIGS[ACTIVITY_PRESETS.CALLER]);
    });

    test('returns the stored training columns when guardians focus is on', () => {
      const config = getColumnConfig(ACTIVITY_PRESETS.TRAINING, true);
      expect(config).toEqual(COLUMN_CONFIGS[ACTIVITY_PRESETS.TRAINING]);
      expect(config.find((column) => column.id === 'training').label).toBe('Training');
      expect(config.find((column) => column.id === 'training_notes').label).toBe('Training notes');
    });

    test('uses mail call headers on the training preset when guardians focus is off', () => {
      const config = getColumnConfig(ACTIVITY_PRESETS.TRAINING, false);
      expect(config.map((column) => column.id)).toEqual(
        COLUMN_CONFIGS[ACTIVITY_PRESETS.TRAINING].map((column) => column.id)
      );
      expect(config.find((column) => column.id === 'training')).toEqual(
        expect.objectContaining({ label: 'Mail Rcvd / Training', width: 160 })
      );
      expect(config.find((column) => column.id === 'training_notes')).toEqual(
        expect.objectContaining({ label: 'Mail Adopt / Training Notes', width: 260, minWidth: 200 })
      );
      expect(config.find((column) => column.id === 'name_middle').label).toBe('Middle');
      expect(config.find((column) => column.id === 'flight_waiver').label).toBe('Waivers');
    });

    test('defaults training headers to the veteran-visible mail call labels', () => {
      const config = getColumnConfig(ACTIVITY_PRESETS.TRAINING);
      expect(config.find((column) => column.id === 'training').label).toBe('Mail Rcvd / Training');
      expect(config.find((column) => column.id === 'training_notes').label).toBe('Mail Adopt / Training Notes');
    });

    test('does not relabel non-training presets when guardians focus is passed', () => {
      expect(getColumnConfig(ACTIVITY_PRESETS.OPS, false)).toEqual(COLUMN_CONFIGS[ACTIVITY_PRESETS.OPS]);
      expect(getColumnConfig(ACTIVITY_PRESETS.OPS, true)).toEqual(COLUMN_CONFIGS[ACTIVITY_PRESETS.OPS]);
      expect(getColumnConfig('invalid', false)).toEqual(COLUMN_CONFIGS[ACTIVITY_PRESETS.OPS]);
    });

    test('returns ops config as fallback for invalid preset', () => {
      const config = getColumnConfig('invalid');
      expect(config).toEqual(COLUMN_CONFIGS[ACTIVITY_PRESETS.OPS]);
    });
  });

  describe('getDefaultPreset', () => {
    test('returns ops as default', () => {
      expect(getDefaultPreset()).toBe(ACTIVITY_PRESETS.OPS);
    });
  });

  describe('loadSavedPreset and savePreset', () => {
    test('returns default when no saved preset exists', () => {
      expect(loadSavedPreset()).toBe(ACTIVITY_PRESETS.OPS);
    });

    test('saves and loads caller preset', () => {
      savePreset(ACTIVITY_PRESETS.CALLER);
      expect(loadSavedPreset()).toBe(ACTIVITY_PRESETS.CALLER);
    });

    test('saves and loads medical preset', () => {
      savePreset(ACTIVITY_PRESETS.MEDICAL);
      expect(loadSavedPreset()).toBe(ACTIVITY_PRESETS.MEDICAL);
    });

    test('saves and loads training preset', () => {
      savePreset(ACTIVITY_PRESETS.TRAINING);
      expect(loadSavedPreset()).toBe(ACTIVITY_PRESETS.TRAINING);
    });

    test('returns default for invalid saved value', () => {
      localStorage.setItem(ACTIVITY_PRESET_STORAGE_KEY, 'invalid');
      expect(loadSavedPreset()).toBe(ACTIVITY_PRESETS.OPS);
    });

    test('handles localStorage errors gracefully', () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(loadSavedPreset()).toBe(ACTIVITY_PRESETS.OPS);

      Storage.prototype.getItem = originalGetItem;
    });
  });
});
