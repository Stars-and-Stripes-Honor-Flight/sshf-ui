import { guardianSchema } from '@/schemas/guardian';

function zodEnumValues(zodField) {
  const enumSchema = zodField._def?.innerType ?? zodField;
  return enumSchema._def.values;
}

const apparelFields = guardianSchema.shape.apparel.unwrap().shape;

/** Apparel jacket size codes (shared by veterans and guardians; matches form/API Zod enums). */
export const APPAREL_JACKET_SIZE_VALUES = zodEnumValues(apparelFields.jacket_size);

/** Apparel shirt size codes (shared by veterans and guardians; matches form/API Zod enums). */
export const APPAREL_SHIRT_SIZE_VALUES = zodEnumValues(apparelFields.shirt_size);
