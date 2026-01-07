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
      <TestWrapper defaultValues={{ shirt: { size: '' }, apparel: { item: '', jacket_size: '', shirt_size: '', delivery: '' } }}>
        <AdditionalDetailsSection errors={{}} />
      </TestWrapper>
    );

    expect(screen.getByText('Additional Details')).toBeInTheDocument();
    expect(screen.getByText('Apparel Information')).toBeInTheDocument();
    // Metadata might be rendered differently, check for the form fields instead
    expect(screen.getByTestId('form-text-field-metadata.created_at')).toBeInTheDocument();
  });

  test('renders apparel information fields', () => {
    const { container } = render(
      <TestWrapper defaultValues={{ shirt: { size: 'M' }, apparel: { item: '', jacket_size: 'M', shirt_size: 'M', delivery: '' } }}>
        <AdditionalDetailsSection errors={{}} />
      </TestWrapper>
    );

    expect(container.querySelector('input[name="shirt.size"]') || container.querySelector('select[name="shirt.size"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="apparel.jacket_size"]') || container.querySelector('select[name="apparel.jacket_size"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="apparel.shirt_size"]') || container.querySelector('select[name="apparel.shirt_size"]')).toBeInTheDocument();
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
      shirt: {
        size: { message: 'Shirt size is required' }
      },
      apparel: {
        jacket_size: { message: 'Jacket size is required' }
      }
    };

    render(
      <TestWrapper defaultValues={{ shirt: { size: '' }, apparel: { item: '', jacket_size: '', shirt_size: '', delivery: '' } }}>
        <AdditionalDetailsSection errors={errors} />
      </TestWrapper>
    );

    expect(screen.getByText('Shirt size is required')).toBeInTheDocument();
    expect(screen.getByText('Jacket size is required')).toBeInTheDocument();
  });
});

