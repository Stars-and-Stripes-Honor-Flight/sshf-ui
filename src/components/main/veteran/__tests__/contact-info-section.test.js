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
    expect(screen.getByText('Call Center Information')).toBeInTheDocument();
    expect(screen.getByText('Emergency Contact')).toBeInTheDocument();
  });

  test('renders call center information fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ call: { assigned_to: 'Staff', notes: 'Notes' } }}>
        <ContactInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          onManagePairing={mockOnManagePairing}
        />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="call.assigned_to"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="call.notes"]') || container.querySelector('textarea[name="call.notes"]')).toBeInTheDocument();
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
      call: {
        assigned_to: { message: 'Assigned to is required' }
      },
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

    expect(screen.getByText('Assigned to is required')).toBeInTheDocument();
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
});

