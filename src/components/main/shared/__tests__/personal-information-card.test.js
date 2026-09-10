import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import '@testing-library/jest-dom';
import { PersonalInformationCard } from '../personal-information-card';

// Mock dependencies
jest.mock('../form-section-header', () => ({
  FormSectionHeader: ({ title, icon: Icon }) => (
    <div data-testid="form-section-header">
      {title}
      {Icon && <Icon data-testid="header-icon" />}
    </div>
  )
}));

jest.mock('../form-text-field', () => ({
  FormTextField: ({ label, name, control }) => (
    <div data-testid={`form-text-field-${name}`}>
      <label>{label}</label>
      <input name={name} />
    </div>
  )
}));

jest.mock('../form-select-field', () => ({
  FormSelectField: ({ label, name, control, options }) => (
    <div data-testid={`form-select-field-${name}`}>
      <label>{label}</label>
      <select name={name}>
        {options?.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}));

jest.mock('../name-fields', () => ({
  NameFields: ({ control, errors, nicknameGridProps }) => (
    <div data-testid="name-fields">
      <input name="name.first" placeholder="First Name" />
      <input name="name.last" placeholder="Last Name" />
      {nicknameGridProps && <input name="name.nickname" placeholder="Nickname" />}
    </div>
  )
}));

describe('PersonalInformationCard', () => {
  const TestWrapper = ({ children, defaultValues = {} }) => {
    const { control } = useForm({ defaultValues });
    return <>{React.cloneElement(children, { control })}</>;
  };

  test('renders personal information card with all fields', () => {
    render(
      <TestWrapper>
        <PersonalInformationCard errors={{}} />
      </TestWrapper>
    );

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Birth Date')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument();
  });

  test('renders nickname field when nicknameGridProps is provided', () => {
    const nicknameGridProps = { xs: 12, md: 6 };

    render(
      <TestWrapper>
        <PersonalInformationCard 
          errors={{}} 
          nicknameGridProps={nicknameGridProps}
        />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Nickname')).toBeInTheDocument();
  });

  test('does not render nickname field when nicknameGridProps is not provided', () => {
    render(
      <TestWrapper>
        <PersonalInformationCard errors={{}} />
      </TestWrapper>
    );

    expect(screen.queryByPlaceholderText('Nickname')).not.toBeInTheDocument();
  });

  test('renders application shirt size field when shirtSizeOptions is provided', () => {
    const shirtSizeOptions = [
      { value: '', label: 'Select size' },
      { value: 'M', label: 'Medium' }
    ];

    render(
      <TestWrapper defaultValues={{ shirt: { size: 'M' } }}>
        <PersonalInformationCard
          errors={{}}
          shirtSizeOptions={shirtSizeOptions}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('form-select-field-shirt.size')).toBeInTheDocument();
    expect(screen.getByText('Application Shirt Size')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  test('renders application shirt size immediately after the gender field', () => {
    const shirtSizeOptions = [{ value: 'M', label: 'Medium' }];

    const { container } = render(
      <TestWrapper defaultValues={{ shirt: { size: 'M' } }}>
        <PersonalInformationCard
          errors={{}}
          shirtSizeOptions={shirtSizeOptions}
        />
      </TestWrapper>
    );

    const fields = [...container.querySelectorAll('[data-testid^="form-text-field-"], [data-testid^="form-select-field-"]')];
    const genderIndex = fields.findIndex((field) => field.getAttribute('data-testid') === 'form-select-field-gender');
    expect(fields[genderIndex + 1]).toHaveAttribute('data-testid', 'form-select-field-shirt.size');
  });

  test('does not render application shirt size field when shirtSizeOptions is not provided', () => {
    render(
      <TestWrapper>
        <PersonalInformationCard errors={{}} />
      </TestWrapper>
    );

    expect(screen.queryByTestId('form-select-field-shirt.size')).not.toBeInTheDocument();
    expect(screen.queryByText('Application Shirt Size')).not.toBeInTheDocument();
  });

  test('displays gender options correctly', () => {
    render(
      <TestWrapper>
        <PersonalInformationCard errors={{}} />
      </TestWrapper>
    );

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Female')).toBeInTheDocument();
  });
});

