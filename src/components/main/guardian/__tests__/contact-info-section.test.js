import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import '@testing-library/jest-dom';
import { guardianSchema } from '@/schemas/guardian';
import { ContactInfoSection } from '../contact-info-section';

// Mock dependencies
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

  const mockGuardian = {
    emerg_contact: {
      name: 'Jane Doe',
      relation: 'Spouse'
    },
    veteran: {
      pairings: [
        { id: 'vet-1', name: 'Veteran One' }
      ]
    }
  };

  const mockOnManagePairing = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders contact information section with all cards', () => {
    render(
      <TestWrapper>
        <ContactInfoSection 
          errors={{}} 
          guardian={mockGuardian}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByTestId('address-information-card')).toBeInTheDocument();
    expect(screen.getByText('Emergency Contact')).toBeInTheDocument();
    expect(screen.getByText('Veteran Pairing Information')).toBeInTheDocument();
  });

  test('renders emergency contact fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ emerg_contact: { name: 'Jane Doe', relation: 'Spouse' } }}>
        <ContactInfoSection 
          errors={{}} 
          guardian={mockGuardian}
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
        name: { message: 'Name is required' },
        relation: { message: 'Relation is required' }
      }
    };

    render(
      <TestWrapper>
        <ContactInfoSection 
          errors={errors} 
          guardian={mockGuardian}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Relation is required')).toBeInTheDocument();
  });

  test('calls onManagePairing when manage pairing button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ContactInfoSection 
          errors={{}} 
          guardian={mockGuardian}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    const manageButton = screen.getByText('Manage Pairing');
    await user.click(manageButton);
    expect(mockOnManagePairing).toHaveBeenCalledTimes(1);
  });

  test('renders veteran pairing information card', () => {
    render(
      <TestWrapper>
        <ContactInfoSection 
          errors={{}} 
          guardian={mockGuardian}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('pairing-information-card')).toBeInTheDocument();
  });
});

const FORMATTED = '414-555-1212';

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

describe('guardian ContactInfoSection emergency phone mask', () => {
  const guardian = {
    veteran: { pairings: [] },
  };

  test('typing 4145551212 in the emergency phone shows and saves 414-555-1212', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const fieldSchema = guardianSchema.shape.emerg_contact.shape.address.shape.phone;
    const schema = z.object({
      emerg_contact: z.object({
        address: z.object({ phone: fieldSchema }),
      }),
    });

    const { container } = render(
      <MaskedPhoneForm
        schema={schema}
        defaultValues={{ emerg_contact: { address: { phone: '' } } }}
        onSubmit={onSubmit}
      >
        {({ control, errors }) => (
          <ContactInfoSection control={control} errors={errors} guardian={guardian} onManagePairing={jest.fn()} />
        )}
      </MaskedPhoneForm>
    );

    const input = container.querySelector('input[name="emerg_contact.address.phone"]');
    expect(input).toBeTruthy();
    await user.type(input, '4145551212');

    expect(input).toHaveValue(FORMATTED);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    const saved = onSubmit.mock.calls[0][0];
    expect(saved).toEqual({ emerg_contact: { address: { phone: FORMATTED } } });
    expect(fieldSchema.safeParse(saved.emerg_contact.address.phone).success).toBe(true);
  });
});
