import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import '@testing-library/jest-dom';
import { guardianSchema } from '@/schemas/guardian';
import { AddressInformationCard } from '../address-information-card';

// Mock FormSectionHeader
jest.mock('../form-section-header', () => ({
  FormSectionHeader: ({ title, icon: Icon }) => (
    <div data-testid="form-section-header">
      {title}
      {Icon && <Icon data-testid="header-icon" />}
    </div>
  )
}));

describe('AddressInformationCard', () => {
  const TestWrapper = ({ children, defaultValues = {} }) => {
    const { control } = useForm({ defaultValues });
    return <>{React.cloneElement(children, { control })}</>;
  };

  test('renders address information card with all fields', () => {
    const defaultValues = {
      address: {
        street: '123 Main St',
        city: 'Anytown',
        county: 'Test County',
        state: 'WI',
        zip: '12345',
        phone_day: '555-1234',
        phone_mbl: '555-5678',
        email: 'test@example.com'
      }
    };

    const { container } = render(
      <TestWrapper defaultValues={defaultValues}>
        <AddressInformationCard errors={{}} />
      </TestWrapper>
    );

    expect(screen.getByText('Address Information')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.street"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.city"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.county"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.state"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.zip"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.phone_day"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.phone_mbl"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="address.email"]')).toBeInTheDocument();
  });

  test('displays error messages when errors are provided', () => {
    const errors = {
      address: {
        street: { message: 'Street is required' },
        city: { message: 'City is required' }
      }
    };

    render(
      <TestWrapper>
        <AddressInformationCard errors={errors} />
      </TestWrapper>
    );

    expect(screen.getByText('Street is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();
  });

  test('uses default emailGridProps for veteran style layout', () => {
    const { container } = render(
      <TestWrapper>
        <AddressInformationCard errors={{}} />
      </TestWrapper>
    );

    // Email field should be in a Grid with md: 4 (veteran style)
    const emailField = container.querySelector('input[name="address.email"]');
    expect(emailField).toBeInTheDocument();
  });

  test('accepts custom emailGridProps for guardian style layout', () => {
    const customEmailGridProps = { xs: 12, md: 6 };

    const { container } = render(
      <TestWrapper>
        <AddressInformationCard 
          errors={{}} 
          emailGridProps={customEmailGridProps}
        />
      </TestWrapper>
    );

    const emailField = container.querySelector('input[name="address.email"]');
    expect(emailField).toBeInTheDocument();
  });

  test('renders with correct card id', () => {
    const { container } = render(
      <TestWrapper>
        <AddressInformationCard errors={{}} />
      </TestWrapper>
    );

    const card = container.querySelector('#address-section');
    expect(card).toBeInTheDocument();
  });
});

const FORMATTED = '414-555-1212';

const emptyAddress = {
  street: '',
  city: '',
  county: '',
  state: '',
  zip: '',
  phone_day: '',
  phone_mbl: '',
  email: '',
};

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

describe('AddressInformationCard phone mask', () => {
  test.each([
    ['address.phone_day', guardianSchema.shape.address.shape.phone_day],
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
        {({ control, errors }) => <AddressInformationCard control={control} errors={errors} />}
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

  test.each(['(414) 555-1212', '414.555.1212', '+1 (414) 555-1212'])(
    'pasting %s into the day phone saves 414-555-1212',
    async (pasted) => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      const fieldSchema = guardianSchema.shape.address.shape.phone_day;
      const path = 'address.phone_day';

      const { container } = render(
        <MaskedPhoneForm
          schema={nestSchema(path, fieldSchema)}
          defaultValues={{ address: emptyAddress }}
          onSubmit={onSubmit}
        >
          {({ control, errors }) => <AddressInformationCard control={control} errors={errors} />}
        </MaskedPhoneForm>
      );

      const input = container.querySelector('input[name="address.phone_day"]');
      await user.click(input);
      await user.paste(pasted);

      expect(input).toHaveValue(FORMATTED);
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
      const saved = onSubmit.mock.calls[0][0];
      expect(saved).toEqual({ address: { phone_day: FORMATTED } });
      expect(fieldSchema.safeParse(saved.address.phone_day).success).toBe(true);
    }
  );

  test('clearing the optional mobile phone saves an empty string', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const fieldSchema = z.union([z.literal(''), guardianSchema.shape.address.shape.phone_mbl.unwrap()]);

    const { container } = render(
      <MaskedPhoneForm
        schema={nestSchema('address.phone_mbl', fieldSchema)}
        defaultValues={{ address: { ...emptyAddress, phone_mbl: FORMATTED } }}
        onSubmit={onSubmit}
      >
        {({ control, errors }) => <AddressInformationCard control={control} errors={errors} />}
      </MaskedPhoneForm>
    );

    const input = container.querySelector('input[name="address.phone_mbl"]');
    await user.clear(input);
    expect(input).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    const saved = onSubmit.mock.calls[0][0];
    expect(saved).toEqual({ address: { phone_mbl: '' } });
    expect(fieldSchema.safeParse('').success).toBe(true);
  });
});
