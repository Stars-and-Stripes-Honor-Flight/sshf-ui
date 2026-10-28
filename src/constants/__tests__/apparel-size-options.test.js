import { Guardian } from '@/schemas/generated/guardian.zod';
import { Veteran } from '@/schemas/generated/veteran.zod';
import {
  APPAREL_JACKET_SIZE_VALUES,
  APPAREL_SHIRT_SIZE_VALUES,
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
});
