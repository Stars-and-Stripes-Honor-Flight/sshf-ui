import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import '@testing-library/jest-dom';
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

