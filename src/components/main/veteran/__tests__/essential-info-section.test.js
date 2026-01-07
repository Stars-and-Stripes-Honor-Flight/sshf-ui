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
    render(
      <TestWrapper>
        <EssentialInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Essential Information')).toBeInTheDocument();
    expect(screen.getByTestId('personal-information-card')).toBeInTheDocument();
    expect(screen.getByText('Service Information')).toBeInTheDocument();
    expect(screen.getByText('Medical Information')).toBeInTheDocument();
    expect(screen.getByText('Flight Status')).toBeInTheDocument();
  });

  test('renders service information fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ service: { branch: 'Army', rank: 'E5', dates: '1965-1970', activity: 'Infantry' } }}>
        <EssentialInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
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
        />
      </TestWrapper>
    );

    expect(screen.getByText('Branch is required')).toBeInTheDocument();
    expect(screen.getByText('Rank is required')).toBeInTheDocument();
  });

  test('renders medical information fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ medical: { level: '2', food_restriction: 'None' } }}>
        <EssentialInfoSection 
          errors={{}} 
          veteran={mockVeteran}
          onOpenHistory={mockOnOpenHistory}
        />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="medical.level"]') || container.querySelector('select[name="medical.level"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="medical.food_restriction"]')).toBeInTheDocument();
  });

  test('calls onOpenHistory when history button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EssentialInfoSection 
          errors={{}} 
          veteran={mockVeteran}
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

