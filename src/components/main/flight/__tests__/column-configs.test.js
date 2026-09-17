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
    });
  });

  describe('ACTIVITY_PRESET_LABELS', () => {
    test('provides labels for all presets', () => {
      expect(ACTIVITY_PRESET_LABELS[ACTIVITY_PRESETS.OPS]).toBe('Ops');
      expect(ACTIVITY_PRESET_LABELS[ACTIVITY_PRESETS.CALLER]).toBe('Caller');
      expect(ACTIVITY_PRESET_LABELS[ACTIVITY_PRESETS.MEDICAL]).toBe('Medical');
      expect(ACTIVITY_PRESET_LABELS[ACTIVITY_PRESETS.APPAREL]).toBe('Apparel');
    });
  });

  describe('COLUMN_CONFIGS', () => {
    test('ops preset includes seat, bus, group, status columns', () => {
      const opsColumns = COLUMN_CONFIGS[ACTIVITY_PRESETS.OPS];
      expect(opsColumns).toHaveLength(4);
      expect(opsColumns[0].id).toBe('seat');
      expect(opsColumns[1].id).toBe('bus');
      expect(opsColumns[2].id).toBe('group');
      expect(opsColumns[2].label).toBe('Flt Grp');
      expect(opsColumns[3].id).toBe('status');
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
