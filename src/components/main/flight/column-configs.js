/**
 * Column configurations for flight details grid activity presets
 */

export const ACTIVITY_PRESETS = {
  OPS: 'ops',
  CALLER: 'caller',
  MEDICAL: 'medical',
  APPAREL: 'apparel',
};

export const ACTIVITY_PRESET_LABELS = {
  [ACTIVITY_PRESETS.OPS]: 'Ops',
  [ACTIVITY_PRESETS.CALLER]: 'Caller',
  [ACTIVITY_PRESETS.MEDICAL]: 'Medical',
  [ACTIVITY_PRESETS.APPAREL]: 'Apparel',
};

/**
 * Column definitions for each activity preset
 * Each column has: id, label, width (optional), align (optional)
 */
export const COLUMN_CONFIGS = {
  [ACTIVITY_PRESETS.OPS]: [
    { id: 'seat', label: 'Seat', width: 112, minWidth: 112 },
    { id: 'bus', label: 'Bus', width: 140 },
    { id: 'assigned_to', label: 'Assigned to Call', width: 150 },
    { id: 'status', label: 'Status', width: 200 },
  ],
  [ACTIVITY_PRESETS.CALLER]: [
    { id: 'assigned_to', label: 'Assigned to', width: 150 },
    { id: 'confirmed', label: 'Confirmed', width: 100, align: 'center' },
    { id: 'phone', label: 'Phone', width: 140 },
    { id: 'fm_number', label: 'FM #', width: 80 },
  ],
  [ACTIVITY_PRESETS.MEDICAL]: [
    { id: 'medical_level', label: 'Level / Med Experience', width: 180 },
    { id: 'medical_form', label: 'Form complete', width: 130, align: 'center' },
    { id: 'limitations', label: 'Limitations / No-Fly', width: 200 },
  ],
  [ACTIVITY_PRESETS.APPAREL]: [
    { id: 'shirt_size', label: 'Shirt size', width: 120 },
    { id: 'jacket_size', label: 'Jacket size', width: 120 },
    { id: 'notes', label: 'Notes', width: 200 },
  ],
};

/**
 * Get the column configuration for a given activity preset
 * @param {string} preset - The activity preset (ops, caller, medical, apparel)
 * @returns {Array} Array of column definitions
 */
export function getColumnConfig(preset) {
  return COLUMN_CONFIGS[preset] || COLUMN_CONFIGS[ACTIVITY_PRESETS.OPS];
}

/**
 * Get the default activity preset
 * @returns {string} The default preset
 */
export function getDefaultPreset() {
  return ACTIVITY_PRESETS.OPS;
}

/**
 * Storage key for persisting the selected activity preset
 */
export const ACTIVITY_PRESET_STORAGE_KEY = 'sshf-flight-detail-activity-preset';

/**
 * Load the saved activity preset from localStorage
 * @returns {string} The saved preset or the default
 */
export function loadSavedPreset() {
  if (typeof window === 'undefined') return getDefaultPreset();
  
  try {
    const saved = localStorage.getItem(ACTIVITY_PRESET_STORAGE_KEY);
    if (saved && Object.values(ACTIVITY_PRESETS).includes(saved)) {
      return saved;
    }
  } catch (error) {
    console.warn('Failed to load saved activity preset:', error);
  }
  
  return getDefaultPreset();
}

/**
 * Save the selected activity preset to localStorage
 * @param {string} preset - The preset to save
 */
export function savePreset(preset) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ACTIVITY_PRESET_STORAGE_KEY, preset);
  } catch (error) {
    console.warn('Failed to save activity preset:', error);
  }
}
