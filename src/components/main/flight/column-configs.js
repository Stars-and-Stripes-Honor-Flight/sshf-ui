/**
 * Column configurations for flight details grid activity presets
 */

export const ACTIVITY_PRESETS = {
  OPS: 'ops',
  CALLER: 'caller',
  MEDICAL: 'medical',
  APPAREL: 'apparel',
  TRAINING: 'training',
  MAIL_CALL: 'mailcall',
};

export const ACTIVITY_PRESET_LABELS = {
  [ACTIVITY_PRESETS.OPS]: 'Ops',
  [ACTIVITY_PRESETS.CALLER]: 'Caller',
  [ACTIVITY_PRESETS.MEDICAL]: 'Medical',
  [ACTIVITY_PRESETS.APPAREL]: 'Apparel',
  [ACTIVITY_PRESETS.TRAINING]: 'Training',
  [ACTIVITY_PRESETS.MAIL_CALL]: 'Mail Call',
};

/**
 * Column definitions for each activity preset
 * Each column has: id, label, width (optional), align (optional)
 */
export const COLUMN_CONFIGS = {
  [ACTIVITY_PRESETS.OPS]: [
    { id: 'seat', label: 'Seat', width: 112, minWidth: 112 },
    { id: 'bus', label: 'Bus', width: 140 },
    { id: 'flt_grp_med_exp', label: 'Flt Grp / Med Exp', width: 160 },
    { id: 'med_lvl', label: 'Med Lvl', width: 100 },
    { id: 'status', label: 'Status', width: 200 },
  ],
  [ACTIVITY_PRESETS.CALLER]: [
    { id: 'assigned_to', label: 'Assigned to', width: 150 },
    { id: 'confirmed', label: 'Confirmed', width: 100, align: 'center' },
    { id: 'phone', label: 'Phone', width: 140 },
    { id: 'fm_number', label: 'FM #', width: 80 },
  ],
  [ACTIVITY_PRESETS.MEDICAL]: [
    { id: 'medical_level', label: 'Med Notes / Med Experience', width: 180 },
    { id: 'medical_form', label: 'Form complete', width: 130, align: 'center' },
    { id: 'limitations', label: 'Limitations / No-Fly', width: 200 },
  ],
  [ACTIVITY_PRESETS.APPAREL]: [
    { id: 'shirt_size', label: 'Shirt size', width: 120 },
    { id: 'jacket_size', label: 'Jacket size', width: 120 },
    { id: 'notes', label: 'Notes', width: 200 },
  ],
  [ACTIVITY_PRESETS.TRAINING]: [
    { id: 'name_middle', label: 'Middle', width: 120 },
    { id: 'phone_mbl', label: 'Mobile', width: 160 },
    { id: 'birth_date', label: 'DOB', width: 120 },
    { id: 'training', label: 'Training', width: 160 },
    { id: 'training_notes', label: 'Training notes', width: 260, minWidth: 200 },
    { id: 'flight_waiver', label: 'Waivers', width: 96, align: 'center' },
    { id: 'flight_training_see_doc', label: 'See Doc', width: 96, align: 'center' },
  ],
  [ACTIVITY_PRESETS.MAIL_CALL]: [
    { id: 'mail_call_received', label: 'Mail Rcvd', width: 120, align: 'center' },
    { id: 'mail_call_adopt', label: 'Mail Adopt', width: 120, align: 'center' },
    { id: 'mail_call_notes', label: 'Mail Call Notes', width: 260, minWidth: 200 },
  ],
};

/**
 * Get the column configuration for a given activity preset.
 * Training headers name the veteran mail-call fields unless guardians focus
 * is on and those paired veteran rows are hidden.
 * @param {string} preset - The activity preset (ops, caller, medical, apparel, training)
 * @param {boolean} [guardiansFocus=false] - Keep the guardian-only training labels
 * @returns {Array} Array of column definitions
 */
export function getColumnConfig(preset, guardiansFocus = false) {
  if (preset !== ACTIVITY_PRESETS.TRAINING) {
    return COLUMN_CONFIGS[preset] || COLUMN_CONFIGS[ACTIVITY_PRESETS.OPS];
  }

  const columns = COLUMN_CONFIGS[ACTIVITY_PRESETS.TRAINING];
  if (guardiansFocus) return columns;

  return columns.map((column) => {
    if (column.id === 'training') {
      return { ...column, label: 'Mail Rcvd / Training' };
    }
    if (column.id === 'training_notes') {
      return { ...column, label: 'Mail Adopt / Training Notes' };
    }
    return column;
  });
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
