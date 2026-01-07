import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import '@testing-library/jest-dom';
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

