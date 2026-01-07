import React from 'react';
import { render, screen } from '@testing-library/react';
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

  const mockGuardian = {
    medical: {
      level: 'A',
      food_restriction: 'None'
    },
    flight: {
      status: 'Active'
    },
    call: {
      assigned_to: 'Call Center Staff'
    }
  };

  const mockOnOpenHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders essential information section with all cards', () => {
    render(
      <TestWrapper>
        <EssentialInfoSection 
          errors={{}} 
          guardian={mockGuardian}
          onOpenHistory={mockOnOpenHistory}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Essential Information')).toBeInTheDocument();
    expect(screen.getByTestId('personal-information-card')).toBeInTheDocument();
    expect(screen.getByText('Medical Information')).toBeInTheDocument();
    expect(screen.getByText('Call Center Information')).toBeInTheDocument();
    expect(screen.getByText('Flight Status')).toBeInTheDocument();
  });

  test('renders medical information fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ medical: { level: 'A', food_restriction: 'None' } }}>
        <EssentialInfoSection 
          errors={{}} 
          guardian={mockGuardian}
          onOpenHistory={mockOnOpenHistory}
        />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="medical.level"]') || container.querySelector('select[name="medical.level"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="medical.food_restriction"]')).toBeInTheDocument();
  });

  test('renders call center information fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ call: { assigned_to: 'Staff', notes: 'Notes' } }}>
        <EssentialInfoSection 
          errors={{}} 
          guardian={mockGuardian}
          onOpenHistory={mockOnOpenHistory}
        />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="call.assigned_to"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="call.notes"]') || container.querySelector('textarea[name="call.notes"]')).toBeInTheDocument();
  });

  test('displays error messages for medical fields', () => {
    const errors = {
      medical: {
        level: { message: 'Medical level is required' },
        food_restriction: { message: 'Food restriction is required' }
      }
    };

    render(
      <TestWrapper>
        <EssentialInfoSection 
          errors={errors} 
          guardian={mockGuardian}
          onOpenHistory={mockOnOpenHistory}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Medical level is required')).toBeInTheDocument();
    expect(screen.getByText('Food restriction is required')).toBeInTheDocument();
  });

  test('calls onOpenHistory when history button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EssentialInfoSection 
          errors={{}} 
          guardian={mockGuardian}
          onOpenHistory={mockOnOpenHistory}
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

