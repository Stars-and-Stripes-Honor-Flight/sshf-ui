import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import { PairingInformationCard } from '../pairing-information-card';
import { pushNavigationEntry } from '@/lib/navigation-stack';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/lib/navigation-stack');
jest.mock('../form-section-header', () => ({
  FormSectionHeader: ({ title, icon: Icon }) => (
    <div data-testid="form-section-header">
      {title}
      {Icon && <Icon data-testid="header-icon" />}
    </div>
  )
}));

describe('PairingInformationCard', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush
  };

  const TestWrapper = ({ children, defaultValues = {} }) => {
    const { control } = useForm({ defaultValues });
    return <>{React.cloneElement(children, { control })}</>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });


  test('renders pairing information card with manage button', () => {
    const mockOnManagePairing = jest.fn();

    render(
      <TestWrapper>
        <PairingInformationCard
          errors={{}}
          cardId="test-pairing-card"
          title="Veteran Pairing Information"
          pairingType="veteran"
          preferenceNotesFieldName="veteran.pref_notes"
          preferenceNotesPlaceholder="Veteran preference notes"
          onManagePairing={mockOnManagePairing}
          entity={{}}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Veteran Pairing Information')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage pairing/i })).toBeInTheDocument();
  });

  test('calls onManagePairing when manage button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnManagePairing = jest.fn();

    render(
      <TestWrapper>
        <PairingInformationCard
          errors={{}}
          cardId="test-pairing-card"
          title="Veteran Pairing Information"
          pairingType="veteran"
          preferenceNotesFieldName="veteran.pref_notes"
          preferenceNotesPlaceholder="Veteran preference notes"
          onManagePairing={mockOnManagePairing}
          entity={{}}
        />
      </TestWrapper>
    );

    const manageButton = screen.getByRole('button', { name: /manage pairing/i });
    await user.click(manageButton);

    expect(mockOnManagePairing).toHaveBeenCalledTimes(1);
  });

  test('displays guardian pairing when entity has guardian', () => {
    const entity = {
      guardian: {
        id: 'guardian-123',
        name: 'John Guardian'
      }
    };

    render(
      <TestWrapper>
        <PairingInformationCard
          errors={{}}
          cardId="test-pairing-card"
          title="Guardian Information"
          pairingType="guardian"
          preferenceNotesFieldName="guardian.pref_notes"
          preferenceNotesPlaceholder="Guardian preference notes"
          onManagePairing={jest.fn()}
          entity={entity}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Currently Paired Guardian')).toBeInTheDocument();
    expect(screen.getByText('John Guardian')).toBeInTheDocument();
  });

  test('displays veteran pairings when entity has veteran pairings', () => {
    const entity = {
      veteran: {
        pairings: [
          { id: 'vet-1', name: 'Veteran One' },
          { id: 'vet-2', name: 'Veteran Two' }
        ]
      }
    };

    render(
      <TestWrapper>
        <PairingInformationCard
          errors={{}}
          cardId="test-pairing-card"
          title="Veteran Pairing Information"
          pairingType="veteran"
          preferenceNotesFieldName="veteran.pref_notes"
          preferenceNotesPlaceholder="Veteran preference notes"
          onManagePairing={jest.fn()}
          entity={entity}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Currently Paired Veterans')).toBeInTheDocument();
    expect(screen.getByText('Veteran One')).toBeInTheDocument();
    expect(screen.getByText('Veteran Two')).toBeInTheDocument();
  });

  test('navigates to guardian details when guardian pairing is clicked', async () => {
    const user = userEvent.setup();
    const entity = {
      guardian: {
        id: 'guardian-123',
        name: 'John Guardian'
      }
    };

    render(
      <TestWrapper>
        <PairingInformationCard
          errors={{}}
          cardId="test-pairing-card"
          title="Guardian Information"
          pairingType="guardian"
          preferenceNotesFieldName="guardian.pref_notes"
          preferenceNotesPlaceholder="Guardian preference notes"
          onManagePairing={jest.fn()}
          entity={entity}
        />
      </TestWrapper>
    );

    const pairingCard = screen.getByText('John Guardian').closest('div[class*="MuiCard"]');
    await user.click(pairingCard);

    expect(pushNavigationEntry).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalled();
  });

  test('displays preference notes field', () => {
    render(
      <TestWrapper defaultValues={{ guardian: { pref_notes: 'Test notes' } }}>
        <PairingInformationCard
          errors={{}}
          cardId="test-pairing-card"
          title="Guardian Information"
          pairingType="guardian"
          preferenceNotesFieldName="guardian.pref_notes"
          preferenceNotesPlaceholder="Guardian preference notes"
          onManagePairing={jest.fn()}
          entity={{}}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Guardian preference notes')).toBeInTheDocument();
  });

  test('displays error message for preference notes field', () => {
    const errors = {
      guardian: {
        pref_notes: { message: 'Preference notes error' }
      }
    };

    render(
      <TestWrapper>
        <PairingInformationCard
          errors={errors}
          cardId="test-pairing-card"
          title="Guardian Information"
          pairingType="guardian"
          preferenceNotesFieldName="guardian.pref_notes"
          preferenceNotesPlaceholder="Guardian preference notes"
          onManagePairing={jest.fn()}
          entity={{}}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Preference notes error')).toBeInTheDocument();
  });

  test('renders hidden fields when showHiddenFields is true and entity has guardian', () => {
    const entity = {
      guardian: {
        id: 'guardian-123',
        name: 'John Guardian'
      }
    };
    const { container } = render(
      <TestWrapper defaultValues={{ guardian: { id: 'guardian-123', name: 'John Guardian' } }}>
        <PairingInformationCard
          errors={{}}
          cardId="test-pairing-card"
          title="Guardian Information"
          pairingType="guardian"
          preferenceNotesFieldName="guardian.pref_notes"
          preferenceNotesPlaceholder="Guardian preference notes"
          onManagePairing={jest.fn()}
          showHiddenFields={true}
          entity={entity}
        />
      </TestWrapper>
    );

    const hiddenIdField = container.querySelector('input[name="guardian.id"][type="hidden"]');
    const hiddenNameField = container.querySelector('input[name="guardian.name"][type="hidden"]');
    
    expect(hiddenIdField).toBeInTheDocument();
    expect(hiddenNameField).toBeInTheDocument();
  });
});

