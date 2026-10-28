import { Veteran } from '@/schemas/generated/veteran.zod';

const veteranApparelFields = Veteran.shape.apparel.unwrap().shape;

/** Apparel jacket size codes (shared by veterans and guardians; matches generated API Zod enums). */
export const APPAREL_JACKET_SIZE_VALUES = veteranApparelFields.jacket_size.removeDefault().options;

/** Apparel shirt size codes (shared by veterans and guardians; matches generated API Zod enums). */
export const APPAREL_SHIRT_SIZE_VALUES = veteranApparelFields.shirt_size.removeDefault().options;
