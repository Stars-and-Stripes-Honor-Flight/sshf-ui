import { ReviewApplication, Veteran } from '@/schemas/generated';
import { reviewApplicationFormSchema } from '@/schemas/review-application';
import { veteranCreateSchema, veteranSchema } from '@/schemas/veteran';

import { VET_TYPES } from '@/lib/review/constants';

const VET_TYPE_ORDER = ['WWII', 'Korea', 'Vietnam', 'Cold War', 'Gulf War', 'Afghanistan', 'Iraq', 'Other'];

function enumOptions(field) {
  let current = field;
  while (current && !Array.isArray(current.options) && current._def?.innerType) {
    current = current._def.innerType;
  }
  return current.options;
}

const validCreate = {
  name: { first: 'John', last: 'Smith' },
  address: {
    street: '123 Main St',
    city: 'Madison',
    county: 'Dane',
    state: 'WI',
    zip: '53703',
    phone_day: '608-555-1234',
  },
  service: { branch: 'Army' },
  vet_type: 'Cold War',
};

const validReview = {
  type: 'VeteranApp',
  name: { first: 'John', last: 'Smith' },
  address: {},
  vet_type: 'Gulf War',
};

describe('veteran conflict values', () => {
  test.each([
    ['veteran form schema', veteranSchema.shape.vet_type],
    ['veteran API schema', Veteran.shape.vet_type],
    ['review form schema', reviewApplicationFormSchema.shape.vet_type],
    ['review API schema', ReviewApplication.shape.vet_type],
  ])('%s lists Cold War and Gulf War in the API order', (_label, field) => {
    expect(enumOptions(field)).toEqual(VET_TYPE_ORDER);
  });

  test('VET_TYPES matches the API order', () => {
    expect(VET_TYPES).toEqual(VET_TYPE_ORDER);
  });

  test.each(['Cold War', 'Gulf War'])('veteran create schema accepts %s', (vetType) => {
    const parsed = veteranCreateSchema.safeParse({ ...validCreate, vet_type: vetType });
    expect(parsed.success).toBe(true);
  });

  test('veteran create schema rejects an unknown conflict', () => {
    const parsed = veteranCreateSchema.safeParse({ ...validCreate, vet_type: 'Desert Storm' });
    expect(parsed.success).toBe(false);
  });

  test.each(['Cold War', 'Gulf War'])('review form schema accepts %s', (vetType) => {
    const parsed = reviewApplicationFormSchema.safeParse({ ...validReview, vet_type: vetType });
    expect(parsed.success).toBe(true);
  });

  test('review form schema rejects an unknown conflict', () => {
    const parsed = reviewApplicationFormSchema.safeParse({ ...validReview, vet_type: 'Desert Storm' });
    expect(parsed.success).toBe(false);
  });

  test.each(['Cold War', 'Gulf War'])('generated Veteran schema accepts %s', (vetType) => {
    expect(Veteran.shape.vet_type.safeParse(vetType).success).toBe(true);
  });

  test('generated Veteran schema rejects an unknown conflict', () => {
    expect(Veteran.shape.vet_type.safeParse('Desert Storm').success).toBe(false);
  });

  test.each(['Cold War', 'Gulf War'])('generated ReviewApplication schema accepts %s', (vetType) => {
    expect(ReviewApplication.shape.vet_type.safeParse(vetType).success).toBe(true);
  });

  test('generated ReviewApplication schema rejects an unknown conflict', () => {
    expect(ReviewApplication.shape.vet_type.safeParse('Desert Storm').success).toBe(false);
  });
});
