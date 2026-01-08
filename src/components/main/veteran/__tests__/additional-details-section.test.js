import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import '@testing-library/jest-dom';
import { AdditionalDetailsSection } from '../additional-details-section';

// Mock dependencies
jest.mock('@/components/main/shared/form-section-header', () => ({
  FormSectionHeader: ({ title, icon: Icon }) => (
    <div data-testid="form-section-header">
      {title}
      {Icon && <Icon data-testid="header-icon" />}
    </div>
  )
}));

jest.mock('@/components/main/shared/form-text-field', () => ({
  FormTextField: ({ label, name, control }) => (
    <div data-testid={`form-text-field-${name}`}>
      <label>{label}</label>
      <input name={name} />
    </div>
  )
}));

describe('AdditionalDetailsSection', () => {
  const TestWrapper = ({ children, defaultValues = {} }) => {
    const { control } = useForm({ defaultValues });
    return <>{React.cloneElement(children, { control })}</>;
  };

  test('renders additional details section with all cards', () => {
    render(
      <TestWrapper defaultValues={{ apparel: { item: '', jacket_size: '', shirt_size: '', delivery: '' } }}>
        <AdditionalDetailsSection errors={{}} />
      </TestWrapper>
    );

    expect(screen.getByText('Additional Details')).toBeInTheDocument();
    expect(screen.getByText('Apparel Information')).toBeInTheDocument();
    expect(screen.getByText('Homecoming Information')).toBeInTheDocument();
    expect(screen.getByText('Media Permissions')).toBeInTheDocument();
    // Metadata might be rendered differently, check for the form fields instead
    expect(screen.getByTestId('form-text-field-metadata.created_at')).toBeInTheDocument();
  });

  test('renders apparel information fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ apparel: { item: 'Jacket', jacket_size: 'L', shirt_size: 'L' } }}>
        <AdditionalDetailsSection errors={{}} />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="apparel.item"]') || container.querySelector('select[name="apparel.item"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="apparel.jacket_size"]') || container.querySelector('select[name="apparel.jacket_size"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="apparel.shirt_size"]') || container.querySelector('select[name="apparel.shirt_size"]')).toBeInTheDocument();
  });

  test('renders homecoming information fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ homecoming: { destination: 'Home Airport' } }}>
        <AdditionalDetailsSection errors={{}} />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="homecoming.destination"]')).toBeInTheDocument();
  });

  test('renders media permissions fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ media_newspaper_ok: 'Yes', media_interview_ok: 'No' }}>
        <AdditionalDetailsSection errors={{}} />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="media_newspaper_ok"]') || container.querySelector('select[name="media_newspaper_ok"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="media_interview_ok"]') || container.querySelector('select[name="media_interview_ok"]')).toBeInTheDocument();
  });

  test('renders metadata fields using FormTextField', () => {
    render(
      <TestWrapper defaultValues={{ metadata: { created_at: '2024-01-01', created_by: 'admin', updated_at: '2024-01-02', updated_by: 'admin' } }}>
        <AdditionalDetailsSection errors={{}} />
      </TestWrapper>
    );

    expect(screen.getByTestId('form-text-field-metadata.created_at')).toBeInTheDocument();
    expect(screen.getByTestId('form-text-field-metadata.created_by')).toBeInTheDocument();
    expect(screen.getByTestId('form-text-field-metadata.updated_at')).toBeInTheDocument();
    expect(screen.getByTestId('form-text-field-metadata.updated_by')).toBeInTheDocument();
  });

  test('displays error messages for apparel fields', () => {
    const errors = {
      apparel: {
        item: { message: 'Item is required' },
        jacket_size: { message: 'Jacket size is required' }
      }
    };

    render(
      <TestWrapper>
        <AdditionalDetailsSection errors={errors} />
      </TestWrapper>
    );

    expect(screen.getByText('Item is required')).toBeInTheDocument();
    expect(screen.getByText('Jacket size is required')).toBeInTheDocument();
  });

  test('displays error messages for homecoming fields', () => {
    const errors = {
      homecoming: {
        destination: { message: 'Destination is required' }
      }
    };

    render(
      <TestWrapper>
        <AdditionalDetailsSection errors={errors} />
      </TestWrapper>
    );

    expect(screen.getByText('Destination is required')).toBeInTheDocument();
  });
});

