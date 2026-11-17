import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import '@testing-library/jest-dom';
import { veteranSchema } from '@/schemas/veteran';
import { ContactInfoSection } from '../contact-info-section';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })
}));
jest.mock('@/components/main/shared/address-information-card', () => ({
  AddressInformationCard: ({ control, errors }) => (
    <div data-testid="address-information-card">
      Address Information Card
    </div>
  )
}));

jest.mock('@/components/main/shared/pairing-information-card', () => ({
  PairingInformationCard: ({ control, errors, title, onManagePairing }) => (
    <div data-testid="pairing-information-card">
      <div>{title}</div>
      <button onClick={onManagePairing}>Manage Pairing</button>
    </div>
  )
}));

jest.mock('@/components/main/shared/form-section-header', () => ({
  FormSectionHeader: ({ title, icon: Icon }) => (
    <div data-testid="form-section-header">
      {title}
      {Icon && <Icon data-testid="header-icon" />}
    </div>
  )
}));

describe('ContactInfoSection', () => {
  const TestWrapper = ({ children, defaultValues = {} }) => {
    const { control } = useForm({ defaultValues });
    return <>{React.cloneElement(children, { control })}</>;
  };

  const mockVeteran = {
    call: {
      assigned_to: 'Call Center Staff',
      notes: 'Call notes'
    },
    emerg_contact: {
      name: 'Jane Doe',
      relation: 'Spouse'
    },
    guardian: {
      id: 'guardian-123',
      name: 'John Guardian'
    }
  };

  const mockOnOpenHistory = jest.fn();
  const mockOnManagePairing = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders contact information section with all cards', () => {
    render(
      <TestWrapper>
        <ContactInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByTestId('address-information-card')).toBeInTheDocument();
    expect(screen.getByText('Emergency Contact')).toBeInTheDocument();
  });

  test('renders emergency contact fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ emerg_contact: { name: 'Jane Doe', relation: 'Spouse' } }}>
        <ContactInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="emerg_contact.name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="emerg_contact.relation"]')).toBeInTheDocument();
  });

  test('displays error messages for contact fields', () => {
    const errors = {
      emerg_contact: {
        name: { message: 'Name is required' }
      }
    };

    render(
      <TestWrapper>
        <ContactInfoSection 
          errors={errors} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  test('calls onManagePairing when manage pairing button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ContactInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    const manageButton = screen.getByText('Manage Pairing');
    await user.click(manageButton);
    expect(mockOnManagePairing).toHaveBeenCalledTimes(1);
  });

  test('renders guardian information card', () => {
    render(
      <TestWrapper>
        <ContactInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('pairing-information-card')).toBeInTheDocument();
  });

  test('disables Mail Call checkboxes when section is disabled', () => {
    render(
      <TestWrapper
        defaultValues={{
          mail_call: { received: false, adopt: false, address: { phone: '', email: '' } },
        }}
      >
        <ContactInfoSection
          errors={{}}
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          onManagePairing={mockOnManagePairing}
          disabled
        />
      </TestWrapper>
    );

    expect(screen.getByRole('checkbox', { name: /mail call received/i })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /mail call adoption/i })).toBeDisabled();
    expect(
      screen.getByRole('checkbox', { name: /mail call received/i }).closest('.MuiFormControlLabel-root')
    ).toHaveClass('Mui-disabled');
  });
});

const FORMATTED = '414-555-1212';

// alt_contact and mail_call are not on veteranSchema. Filled values use the same
// ###-###-#### rule as emerg_contact.address.phone. Empty optional values use the
// '' union already used by veteranCreateSchema for optional phones.
const formattedPhone = () => veteranSchema.shape.emerg_contact.shape.address.shape.phone;

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

function schemaFor(path) {
  const keys = path.split('.');
  const leaf = keys.pop();
  return keys.reduceRight((inner, key) => z.object({ [key]: inner }), z.object({ [leaf]: formattedPhone() }));
}

function savedValue(saved, path) {
  return path.split('.').reduce((current, key) => current[key], saved);
}

const veteranPhoneDefaults = {
  emerg_contact: { address: { phone: '', phone_mbl: '' } },
  alt_contact: { address: { phone: '', phone_mbl: '' } },
  mail_call: { received: false, adopt: false, address: { phone: '', email: '' } },
};

describe('veteran ContactInfoSection phone mask', () => {
  const veteran = {
    guardian: { pref_notes: '' },
  };

  test.each([
    'emerg_contact.address.phone',
    'emerg_contact.address.phone_mbl',
    'alt_contact.address.phone',
    'alt_contact.address.phone_mbl',
    'mail_call.address.phone',
  ])('typing 4145551212 in %s shows and saves 414-555-1212', async (path) => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const fieldSchema = formattedPhone();

    const { container } = render(
      <MaskedPhoneForm schema={schemaFor(path)} defaultValues={veteranPhoneDefaults} onSubmit={onSubmit}>
        {({ control, errors }) => (
          <ContactInfoSection
            control={control}
            errors={errors}
            veteran={veteran}
            onOpenHistory={jest.fn()}
            onManagePairing={jest.fn()}
            watch={() => ''}
          />
        )}
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
    expect(savedValue(saved, path)).toBe(FORMATTED);
    expect(fieldSchema.safeParse(savedValue(saved, path)).success).toBe(true);
  });

  test('clearing the optional mail call phone saves an empty string', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const fieldSchema = z.union([z.literal(''), formattedPhone()]);
    const schema = z.object({
      mail_call: z.object({
        address: z.object({ phone: fieldSchema }),
      }),
    });

    const { container } = render(
      <MaskedPhoneForm
        schema={schema}
        defaultValues={{
          ...veteranPhoneDefaults,
          mail_call: { received: false, adopt: false, address: { phone: FORMATTED, email: '' } },
        }}
        onSubmit={onSubmit}
      >
        {({ control, errors }) => (
          <ContactInfoSection
            control={control}
            errors={errors}
            veteran={veteran}
            onOpenHistory={jest.fn()}
            onManagePairing={jest.fn()}
            watch={() => ''}
          />
        )}
      </MaskedPhoneForm>
    );

    const input = container.querySelector('input[name="mail_call.address.phone"]');
    await user.clear(input);
    expect(input).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    expect(onSubmit.mock.calls[0][0]).toEqual({ mail_call: { address: { phone: '' } } });
    expect(fieldSchema.safeParse('').success).toBe(true);
  });
});
