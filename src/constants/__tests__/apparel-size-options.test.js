import { Guardian } from '@/schemas/generated/guardian.zod';
import { Veteran } from '@/schemas/generated/veteran.zod';
import {
  APPAREL_JACKET_SIZE_VALUES,
  APPAREL_SHIRT_SIZE_FORM_ORDER,
  APPAREL_SHIRT_SIZE_VALUES,
  normalizeApparelSizeValue,
} from '@/constants/apparel-size-options';

describe('apparel-size-options', () => {
  const veteranApparelFields = Veteran.shape.apparel.unwrap().shape;
  const guardianApparelFields = Guardian.shape.apparel.unwrap().shape;

  test('exports jacket and shirt values from generated Veteran/Guardian apparel Zod enums', () => {
    expect(APPAREL_JACKET_SIZE_VALUES).toEqual(
      veteranApparelFields.jacket_size.removeDefault().options
    );
    expect(APPAREL_SHIRT_SIZE_VALUES).toEqual(
      veteranApparelFields.shirt_size.removeDefault().options
    );
    expect(APPAREL_JACKET_SIZE_VALUES).toEqual(
      guardianApparelFields.jacket_size.removeDefault().options
    );
    expect(APPAREL_SHIRT_SIZE_VALUES).toEqual(
      guardianApparelFields.shirt_size.removeDefault().options
    );
    expect(APPAREL_JACKET_SIZE_VALUES).toContain('None');
    expect(APPAREL_SHIRT_SIZE_VALUES).toContain('None');
    expect(APPAREL_SHIRT_SIZE_VALUES).toContain('WM');
  });

  test('form shirt size order lists unisex sizes before womens sizes', () => {
    expect(APPAREL_SHIRT_SIZE_FORM_ORDER[0]).toBe('None');
    expect(APPAREL_SHIRT_SIZE_FORM_ORDER).toEqual(
      expect.arrayContaining(APPAREL_SHIRT_SIZE_VALUES)
    );
    expect(APPAREL_SHIRT_SIZE_FORM_ORDER.length).toBe(APPAREL_SHIRT_SIZE_VALUES.length);
  });

  test('normalizeApparelSizeValue maps blank values to None', () => {
    expect(normalizeApparelSizeValue('')).toBe('None');
    expect(normalizeApparelSizeValue(null)).toBe('None');
    expect(normalizeApparelSizeValue(undefined)).toBe('None');
    expect(normalizeApparelSizeValue('M')).toBe('M');
    expect(normalizeApparelSizeValue('None')).toBe('None');
  });
});
