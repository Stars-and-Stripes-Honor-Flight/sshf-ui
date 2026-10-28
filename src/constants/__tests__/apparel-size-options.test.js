import { guardianSchema } from '@/schemas/guardian';
import {
  APPAREL_JACKET_SIZE_VALUES,
  APPAREL_SHIRT_SIZE_VALUES,
} from '@/constants/apparel-size-options';

function zodEnumValues(zodField) {
  const enumSchema = zodField._def?.innerType ?? zodField;
  return enumSchema._def.values;
}

describe('apparel-size-options', () => {
  const apparelFields = guardianSchema.shape.apparel.unwrap().shape;

  test('exports jacket and shirt values from guardian apparel Zod enums', () => {
    expect(APPAREL_JACKET_SIZE_VALUES).toEqual(zodEnumValues(apparelFields.jacket_size));
    expect(APPAREL_SHIRT_SIZE_VALUES).toEqual(zodEnumValues(apparelFields.shirt_size));
    expect(APPAREL_JACKET_SIZE_VALUES).toContain('None');
    expect(APPAREL_SHIRT_SIZE_VALUES).toContain('None');
    expect(APPAREL_SHIRT_SIZE_VALUES).toContain('WM');
  });
});
