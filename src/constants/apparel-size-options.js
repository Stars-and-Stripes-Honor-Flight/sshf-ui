import { Veteran } from '@/schemas/generated/veteran.zod';

const veteranApparelFields = Veteran.shape.apparel.unwrap().shape;

/** Apparel jacket size codes (shared by veterans and guardians; matches generated API Zod enums). */
export const APPAREL_JACKET_SIZE_VALUES = veteranApparelFields.jacket_size.removeDefault().options;

/** Apparel shirt size codes (shared by veterans and guardians; matches generated API Zod enums). */
export const APPAREL_SHIRT_SIZE_VALUES = veteranApparelFields.shirt_size.removeDefault().options;

const UNISEX_APPAREL_SIZE_LABELS = {
  None: 'None',
  XS: 'X-Small',
  S: 'Small',
  M: 'Medium',
  L: 'Large',
  XL: 'X-Large',
  '2XL': '2X-Large',
  '3XL': '3X-Large',
  '4XL': '4X-Large',
  '5XL': '5X-Large',
};

const WOMENS_APPAREL_SIZE_LABELS = {
  WXS: 'WX-Small',
  WS: 'W-Small',
  WM: 'W-Medium',
  WL: 'W-Large',
  WXL: 'WX-Large',
  W2XL: 'W2X-Large',
  W3XL: 'W3X-Large',
  W4XL: 'W4X-Large',
  W5XL: 'W5X-Large',
};

/** Guardian/veteran edit form display order for apparel shirt sizes. */
export const APPAREL_SHIRT_SIZE_FORM_ORDER = [
  'None',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL',
  'WXS',
  'WS',
  'WM',
  'WL',
  'WXL',
  'W2XL',
  'W3XL',
  'W4XL',
  'W5XL',
];

export function getApparelJacketSizeLabel(value) {
  return UNISEX_APPAREL_SIZE_LABELS[value] ?? value;
}

export function getApparelShirtSizeLabel(value) {
  return UNISEX_APPAREL_SIZE_LABELS[value] ?? WOMENS_APPAREL_SIZE_LABELS[value] ?? value;
}

/** Map blank roster/API values to the canonical "None" code for apparel sizes. */
export function normalizeApparelSizeValue(value) {
  if (value === undefined || value === null || value === '') {
    return 'None';
  }
  return value;
}
