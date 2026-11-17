import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import '@testing-library/jest-dom';

import { guardianSchema } from '@/schemas/guardian';

import { AddressFields } from '@/components/main/shared/address-fields';

const FORMATTED = '414-555-1212';

function nestSchema(path, fieldSchema) {
  const keys = path.split('.');
  const leaf = keys.pop();
  return keys.reduceRight((inner, key) => z.object({ [key]: inner }), z.object({ [leaf]: fieldSchema }));
}

function nestValue(path, value) {
  return path.split('.').reduceRight((inner, key) => ({ [key]: inner }), value);
}

function MaskedPhoneForm({ schema, defaultValues, onSubmit, children }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues, resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {children({ control, errors })}
      <button type="submit">Save</button>
    </form>
  );
}

describe('AddressFields phone mask', () => {
  const emptyAddress = {
    street: '',
    city: '',
    county: '',
    state: '',
    zip: '',
    phone_day: '',
    phone_eve: '',
    phone_mbl: '',
    email: '',
  };

  test.each([
    ['address.phone_day', guardianSchema.shape.address.shape.phone_day],
    ['address.phone_eve', guardianSchema.shape.address.shape.phone_eve.unwrap()],
    ['address.phone_mbl', guardianSchema.shape.address.shape.phone_mbl.unwrap()],
  ])('typing 4145551212 in %s shows and saves 414-555-1212', async (path, fieldSchema) => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const field = path.split('.').pop();

    const { container } = render(
      <MaskedPhoneForm
        schema={nestSchema(path, fieldSchema)}
        defaultValues={{ address: emptyAddress }}
        onSubmit={onSubmit}
      >
        {({ control, errors }) => <AddressFields control={control} errors={errors} showPhoneEve showPhoneMbl />}
      </MaskedPhoneForm>
    );

    const input = container.querySelector(`input[name="${path}"]`);
    expect(input).toBeTruthy();
    await user.type(input, '4145551212');

    expect(input).toHaveValue(FORMATTED);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    const saved = onSubmit.mock.calls[0][0];
    expect(saved).toEqual(nestValue(path, FORMATTED));
    expect(fieldSchema.safeParse(saved.address[field]).success).toBe(true);
  });

  test('clearing the optional evening phone saves an empty string', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const fieldSchema = z.union([z.literal(''), guardianSchema.shape.address.shape.phone_eve.unwrap()]);
    const path = 'address.phone_eve';

    const { container } = render(
      <MaskedPhoneForm
        schema={nestSchema(path, fieldSchema)}
        defaultValues={{ address: { ...emptyAddress, phone_eve: FORMATTED } }}
        onSubmit={onSubmit}
      >
        {({ control, errors }) => <AddressFields control={control} errors={errors} showPhoneEve />}
      </MaskedPhoneForm>
    );

    const input = container.querySelector('input[name="address.phone_eve"]');
    await user.clear(input);
    expect(input).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    const saved = onSubmit.mock.calls[0][0];
    expect(saved).toEqual({ address: { phone_eve: '' } });
    expect(fieldSchema.safeParse(saved.address.phone_eve).success).toBe(true);
  });
});
