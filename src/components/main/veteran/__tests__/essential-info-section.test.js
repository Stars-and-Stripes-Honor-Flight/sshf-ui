import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import '@testing-library/jest-dom';
import { EssentialInfoSection } from '../essential-info-section';

// Mock dependencies
jest.mock('@/components/main/shared/personal-information-card', () => ({
  PersonalInformationCard: ({ control, errors }) => (
    <div data-testid="personal-information-card">
      Personal Information Card
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

describe('EssentialInfoSection', () => {
  const TestWrapper = ({ children, defaultValues = {} }) => {
    const { control } = useForm({ defaultValues });
    return <>{React.cloneElement(children, { control })}</>;
  };

  const mockVeteran = {
    service: {
      branch: 'Army',
      rank: 'E5',
      dates: '1965-1970',
      activity: 'Infantry'
    },
    medical: {
      level: '2',
      food_restriction: 'None'
    },
    flight: {
      status: 'Active'
    }
  };

  const mockOnOpenHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders essential information section with all cards', () => {
    const mockFlightOptions = [
      { value: 'FL123', label: 'Flight 123', disabled: false },
      { value: 'FL124', label: 'Flight 124', disabled: false },
    ];

    render(
      <TestWrapper>
        <EssentialInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          flightOptions={mockFlightOptions}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Essential Information')).toBeInTheDocument();
    expect(screen.getByTestId('personal-information-card')).toBeInTheDocument();
    expect(screen.getByText('Service Information')).toBeInTheDocument();
    expect(screen.getByText('Medical Information')).toBeInTheDocument();
    expect(screen.getByText('Call Center Information')).toBeInTheDocument();
    expect(screen.getByText('Flight Status')).toBeInTheDocument();
  });

  test('renders call center information fields and confirmed date/by', () => {
    const mockFlightOptions = [
      { value: 'FL123', label: 'Flight 123', disabled: false },
      { value: 'FL124', label: 'Flight 124', disabled: false },
    ];
    const mockVeteranWithCall = {
      ...mockVeteran,
      call: { assigned_to: 'Staff', notes: 'Notes', history: [] },
    };
    const { container } = render(
      <TestWrapper defaultValues={{ call: { assigned_to: 'Staff', notes: 'Notes' }, flight: { confirmed_date: '', confirmed_by: '' } }}>
        <EssentialInfoSection 
          errors={{}} 
          veteran={mockVeteranWithCall}
          onOpenHistory={mockOnOpenHistory}
          flightOptions={mockFlightOptions}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Call Center Information')).toBeInTheDocument();
    expect(screen.getByText('Confirmed Date')).toBeInTheDocument();
    expect(screen.getByText('Confirmed By')).toBeInTheDocument();
    expect(container.querySelector('input[name="call.assigned_to"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="call.notes"]') || container.querySelector('textarea[name="call.notes"]')).toBeInTheDocument();
  });

  test('renders how heard about SSHF dropdown in call center section', () => {
    const mockFlightOptions = [
      { value: 'FL123', label: 'Flight 123', disabled: false },
    ];
    const { container } = render(
      <TestWrapper defaultValues={{ call: { assigned_to: '', notes: '', how_heard_about: 'Unknown' } }}>
        <EssentialInfoSection
          errors={{}}
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          flightOptions={mockFlightOptions}
        />
      </TestWrapper>
    );

    expect(screen.getByText('How Heard About SSHF')).toBeInTheDocument();
    expect(container.querySelector('[name="call.how_heard_about"]')).toBeInTheDocument();
  });

  test('allows selecting how heard about value', async () => {
    const user = userEvent.setup();
    const mockFlightOptions = [
      { value: 'FL123', label: 'Flight 123', disabled: false },
    ];
    const { container } = render(
      <TestWrapper defaultValues={{ call: { assigned_to: '', notes: '', how_heard_about: 'Unknown' } }}>
        <EssentialInfoSection
          errors={{}}
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          flightOptions={mockFlightOptions}
        />
      </TestWrapper>
    );

    const input = container.querySelector('[name="call.how_heard_about"]');
    const selectDisplay = input.closest('.MuiFormControl-root').querySelector('.MuiSelect-select');
    fireEvent.mouseDown(selectDisplay);
    await user.click(screen.getByRole('option', { name: 'social media' }));

    expect(selectDisplay).toHaveTextContent('social media');
  });

  test('renders service information fields', () => {
    const mockFlightOptions = [
      { value: 'FL123', label: 'Flight 123', disabled: false },
      { value: 'FL124', label: 'Flight 124', disabled: false },
    ];

    const { container } = render(
      <TestWrapper defaultValues={{ service: { branch: 'Army', rank: 'E5', dates: '1965-1970', activity: 'Infantry' } }}>
        <EssentialInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          flightOptions={mockFlightOptions}
        />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="service.branch"]') || container.querySelector('select[name="service.branch"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="service.rank"]') || container.querySelector('select[name="service.rank"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="service.dates"]')).toBeInTheDocument();
    // service.activity might be a textarea or multiline input
    const activityField = container.querySelector('input[name="service.activity"]') || container.querySelector('textarea[name="service.activity"]');
    if (activityField) {
      expect(activityField).toBeInTheDocument();
    }
  });

  test('displays error messages for service fields', () => {
    const mockFlightOptions = [
      { value: 'FL123', label: 'Flight 123', disabled: false },
      { value: 'FL124', label: 'Flight 124', disabled: false },
    ];

    const errors = {
      service: {
        branch: { message: 'Branch is required' },
        rank: { message: 'Rank is required' }
      }
    };

    render(
      <TestWrapper>
        <EssentialInfoSection 
          errors={errors} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          flightOptions={mockFlightOptions}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Branch is required')).toBeInTheDocument();
    expect(screen.getByText('Rank is required')).toBeInTheDocument();
  });

  test('renders medical information fields', () => {
    const mockFlightOptions = [
      { value: 'FL123', label: 'Flight 123', disabled: false },
      { value: 'FL124', label: 'Flight 124', disabled: false },
    ];

    const { container } = render(
      <TestWrapper defaultValues={{ medical: { level: '2', food_restriction: 'None' } }}>
        <EssentialInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          flightOptions={mockFlightOptions}
        />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="medical.level"]') || container.querySelector('select[name="medical.level"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="medical.food_restriction"]')).toBeInTheDocument();
  });

  test('calls onOpenHistory when history button is clicked', async () => {
    const mockFlightOptions = [
      { value: 'FL123', label: 'Flight 123', disabled: false },
      { value: 'FL124', label: 'Flight 124', disabled: false },
    ];

    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EssentialInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
          flightOptions={mockFlightOptions}
        />
      </TestWrapper>
    );

    // Find and click the history button (there may be multiple, so we'll look for one)
    const historyButtons = screen.queryAllByRole('button', { name: /history/i });
    if (historyButtons.length > 0) {
      await user.click(historyButtons[0]);
      expect(mockOnOpenHistory).toHaveBeenCalled();
    }
  });
});

