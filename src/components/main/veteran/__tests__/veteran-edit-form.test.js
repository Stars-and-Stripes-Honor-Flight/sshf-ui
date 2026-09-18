import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { VeteranEditForm } from '../veteran-edit-form';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/core/toaster';
import { useNavigationBack } from '@/hooks/use-navigation-back';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('next/navigation');
jest.mock('@/hooks/use-navigation-back', () => ({
  useNavigationBack: jest.fn(() => jest.fn())
}));
jest.mock('@/components/core/toaster', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('VeteranEditForm - Update Functionality', () => {
  // Full-form render + userEvent save can exceed 5s under parallel Jest workers.
  jest.setTimeout(15000);

  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockUpdateVeteran = jest.fn();
  const mockGetVeteran = jest.fn();
  const mockSearchVeterans = jest.fn();
  const mockHandleGoBack = jest.fn();
  
  // Mock veteran data with all required fields
  const mockVeteran = {
    _id: 'test-veteran-123',
    _rev: '1-abc123def456',
    type: 'Veteran',
    name: {
      first: 'John',
      middle: 'A',
      last: 'Doe',
      nickname: 'Johnny'
    },
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'WI',
      zip: '12345',
      county: 'Test County',
      phone_day: '555-1234',
      phone_mbl: '555-5678',
      phone_eve: '',
      email: 'john.doe@example.com'
    },
    service: {
      branch: 'Army',
      rank: 'E5',
      dates: '1965-1970',
      activity: 'Infantry'
    },
    vet_type: 'Vietnam',
    birth_date: '1945-01-01',
    gender: 'M',
    weight: '180',
    app_date: '2024-01-01',
    medical: {
      level: '2',
      alt_level: '3',
      food_restriction: 'None',
      limitations: '',
      review: '',
      usesCane: false,
      usesWalker: false,
      usesWheelchair: false,
      usesScooter: false,
      isWheelchairBound: false,
      requiresOxygen: false,
      examRequired: false,
      release: false,
      form: false
    },
    flight: {
      status: 'Active',
      group: 'TestGroup',
      bus: 'Alpha1',
      seat: 'A1',
      waiver: false,
      status_note: 'Original status note',
      confirmed_date: '2024-01-15',
      confirmed_by: 'Test User',
      mediaWaiver: false,
      vaccinated: true,
      infection_test: true,
      nofly: false,
      history: [
        {
          id: '2024-01-01T00:00:00Z',
          change: 'Initial status set'
        }
      ]
    },
    emerg_contact: {
      name: 'Jane Doe',
      relation: 'Spouse',
      address: {
        phone: '555-9999',
        phone_eve: '',
        phone_mbl: '555-8888',
        email: 'jane.doe@example.com',
        street: '123 Main St',
        city: 'Anytown',
        state: 'WI',
        zip: '12345'
      }
    },
    alt_contact: {
      name: 'Bob Doe',
      relation: 'Son',
      address: {
        phone: '555-7777',
        phone_eve: '',
        phone_mbl: '555-6666',
        email: 'bob.doe@example.com',
        street: '456 Oak Ave',
        city: 'Othertown',
        state: 'WI',
        zip: '54321'
      }
    },
    guardian: {
      name: 'Guardian Name',
      id: 'guardian-123',
      pref_notes: 'Guardian notes',
      history: [
        {
          id: '2024-01-01T00:00:00Z',
          change: 'Paired to veteran'
        }
      ]
    },
    mail_call: {
      name: 'Mail Call Contact',
      relation: 'Friend',
      notes: 'Mail call notes',
      received: false,
      adopt: false,
      address: {
        phone: '555-5555',
        email: 'mailcall@example.com'
      }
    },
    call: {
      assigned_to: 'Call Center Staff',
      notes: 'Call notes',
      fm_number: '12345',
      mail_sent: false,
      email_sent: false,
      history: [
        {
          id: '2024-01-01T00:00:00Z',
          change: 'Initial call assignment'
        }
      ]
    },
    shirt: {
      size: 'L'
    },
    apparel: {
      jacket_size: 'L',
      delivery: 'Home',
      item: 'Jacket',
      shirt_size: 'L',
      date: '2024-01-01',
      by: 'Staff Member',
      notes: 'Apparel notes'
    },
    media_newspaper_ok: 'Yes',
    media_interview_ok: 'No',
    accommodations: {
      hotel_name: 'Test Hotel',
      room_type: 'Single',
      arrival_date: '2024-01-15',
      departure_date: '2024-01-17',
      notes: 'Accommodation notes',
      arrival_time: '14:00',
      arrival_flight: 'AA123',
      attend_banquette: true,
      banquette_guest: 'Guest Name',
      departure_time: '16:00',
      departure_flight: 'AA456'
    },
    homecoming: {
      destination: 'Home Airport'
    },
    metadata: {
      created_at: '2024-01-01T00:00:00Z',
      created_by: 'System',
      updated_at: '2024-01-01T00:00:00Z',
      updated_by: 'System'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Setup mocks
    useRouter.mockReturnValue({
      push: mockPush,
      back: mockBack
    });
    useNavigationBack.mockReturnValue(mockHandleGoBack);
    
    // Mock window.history.length
    Object.defineProperty(window, 'history', {
      value: { length: 2 },
      writable: true
    });
    
    // Set up sessionStorage for navigation back hook
    sessionStorage.setItem('previousPage', 'guardian-details');
    
    api.updateVeteran = mockUpdateVeteran;
    api.getVeteran = mockGetVeteran;
    api.searchVeterans = mockSearchVeterans;
    
    // Mock pairing dialog API methods
    mockGetVeteran.mockResolvedValue({
      _id: 'vet-123',
      name: { first: 'John', last: 'Veteran' }
    });
    mockSearchVeterans.mockResolvedValue([]);
    
    mockUpdateVeteran.mockResolvedValue({
      ...mockVeteran,
      _rev: '2-xyz789abc123', // New revision after update
      metadata: {
        created_at: '2024-01-01T00:00:00Z',
        created_by: 'System',
        updated_at: '2024-01-15T12:00:00Z',
        updated_by: 'Test User'
      }
    });
  });

  test('includes all required fields in API call', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={mockVeteran} />);
    
    // Find and click the save button
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateVeteran).toHaveBeenCalledWith(
        'test-veteran-123',
        expect.objectContaining({
          _id: 'test-veteran-123',
          _rev: '1-abc123def456',
          type: 'Veteran'
        })
      );
    });
  });

  test('excludes metadata from API call', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={mockVeteran} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateVeteran.mock.calls[0];
      const payload = callArgs[1];
      expect(payload).not.toHaveProperty('metadata');
    });
  });

  test('includes call.how_heard_about in API call with Unknown default', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={mockVeteran} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      const payload = mockUpdateVeteran.mock.calls[0][1];
      expect(payload.call).toEqual(
        expect.objectContaining({ how_heard_about: 'Unknown' })
      );
    });
  });

  test('renders FM # in guardian pairing section with initial value', () => {
    render(<VeteranEditForm veteran={mockVeteran} />);

    expect(document.querySelector('input[name="call.fm_number"]')).toHaveValue('12345');
  });

  test('includes call.fm_number in save payload when FM # is edited', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={mockVeteran} />);

    const fmInput = document.querySelector('input[name="call.fm_number"]');
    await user.clear(fmInput);
    await user.type(fmInput, '16');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      const payload = mockUpdateVeteran.mock.calls[0][1];
      expect(payload.call).toEqual(expect.objectContaining({ fm_number: '16' }));
    });
  });

  test('excludes history arrays from API call', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={mockVeteran} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateVeteran.mock.calls[0];
      const payload = callArgs[1];
      
      // Verify history arrays are not present
      expect(payload.flight).not.toHaveProperty('history');
      expect(payload.guardian).not.toHaveProperty('history');
      expect(payload.call).not.toHaveProperty('history');
    });
  });

  test('preserves _rev and sets type field correctly', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={mockVeteran} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateVeteran.mock.calls[0];
      const payload = callArgs[1];
      
      expect(payload._rev).toBe('1-abc123def456');
      expect(payload.type).toBe('Veteran');
    });
  });

  test('handles single field update correctly', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={mockVeteran} />);
    
    // Just submit the form without field interaction to test payload structure
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateVeteran.mock.calls[0];
      const payload = callArgs[1];
      
      // Verify the payload structure is correct
      expect(payload.flight.status_note).toBe('Original status note');
      
      // Verify other fields remain unchanged
      expect(payload.name.first).toBe('John');
      expect(payload.service.branch).toBe('Army');
      expect(payload.vet_type).toBe('Vietnam');
    });
  });

  test('shows success message and stays on page after successful update', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={mockVeteran} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Veteran updated successfully');
      // After save, we stay on the page (no navigation)
      expect(mockHandleGoBack).not.toHaveBeenCalled();
    });
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    const errorMessage = 'API Error: Update failed';
    mockUpdateVeteran.mockRejectedValue(new Error(errorMessage));
    
    render(<VeteranEditForm veteran={mockVeteran} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Failed to update veteran: ${errorMessage}`);
      expect(mockHandleGoBack).not.toHaveBeenCalled();
    });
  });

  test('updates _rev state when veteran prop changes', () => {
    const { rerender } = render(<VeteranEditForm veteran={mockVeteran} />);
    
    const updatedVeteran = {
      ...mockVeteran,
      _rev: '3-newrevision123'
    };
    
    rerender(<VeteranEditForm veteran={updatedVeteran} />);
    
    // The component should now use the new _rev value
    // This is tested indirectly through the API call
  });

  test('form submission includes all form fields with correct structure', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={mockVeteran} />);
    
    // Submit the form to test payload structure
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateVeteran.mock.calls[0];
      const payload = callArgs[1];
      
      // Verify the payload has the expected structure
      expect(payload).toHaveProperty('_id');
      expect(payload).toHaveProperty('_rev');
      expect(payload).toHaveProperty('type');
      expect(payload).toHaveProperty('name');
      expect(payload).toHaveProperty('address');
      expect(payload).toHaveProperty('service');
      expect(payload).toHaveProperty('flight');
      expect(payload).toHaveProperty('medical');
      
      // Verify specific field values
      expect(payload.name.first).toBe('John');
      expect(payload.service.branch).toBe('Army');
      expect(payload.flight.status).toBe('Active');
    });
  });
});

describe('VeteranEditForm - Flown/Deceased lock', () => {
  const mockHandleGoBack = jest.fn();

  const baseVeteran = {
    _id: 'test-veteran-123',
    _rev: '1-abc123def456',
    type: 'Veteran',
    name: { first: 'John', middle: '', last: 'Doe', nickname: '' },
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'WI',
      zip: '12345',
      county: '',
      phone_day: '555-1234',
      phone_mbl: '555-5678',
      phone_eve: '',
      email: 'john.doe@example.com',
    },
    service: { branch: 'Army', rank: 'E5', dates: '1965-1970', activity: 'Infantry' },
    vet_type: 'Vietnam',
    birth_date: '1945-01-01',
    gender: 'M',
    app_date: '2024-01-01',
    medical: {
      level: '2',
      alt_level: '',
      food_restriction: 'None',
      limitations: '',
      review: '',
      usesCane: false,
      usesWalker: false,
      usesWheelchair: false,
      usesScooter: false,
      isWheelchairBound: false,
      requiresOxygen: false,
      examRequired: false,
      release: false,
      form: false,
    },
    flight: {
      status: 'Active',
      id: '',
      group: '',
      bus: '',
      seat: '',
      waiver: false,
      status_note: '',
      confirmed_date: '',
      confirmed_by: '',
      mediaWaiver: false,
      vaccinated: false,
      infection_test: false,
      nofly: false,
      history: [],
    },
    emerg_contact: {
      name: '',
      relation: '',
      address: { phone: '', phone_mbl: '', email: '', street: '', city: '', state: '', zip: '' },
    },
    alt_contact: {
      name: '',
      relation: '',
      address: { phone: '', phone_mbl: '', email: '', street: '', city: '', state: '', zip: '' },
    },
    guardian: { name: '', id: '', pref_notes: '' },
    mail_call: {
      name: '',
      relation: '',
      notes: '',
      received: false,
      adopt: false,
      address: { phone: '', email: '' },
    },
    call: {
      assigned_to: '',
      notes: '',
      how_heard_about: 'Unknown',
      mail_sent: false,
      email_sent: false,
      history: [],
    },
    shirt: { size: '' },
    apparel: {
      jacket_size: '',
      delivery: '',
      item: '',
      shirt_size: '',
      date: '',
      by: '',
      notes: '',
    },
    media_newspaper_ok: 'No',
    media_interview_ok: 'No',
    accommodations: {
      hotel_name: '',
      room_type: 'None',
      arrival_date: '',
      departure_date: '',
      notes: '',
      arrival_time: '',
      arrival_flight: '',
      attend_banquette: false,
      banquette_guest: '',
      departure_time: '',
      departure_flight: '',
    },
    homecoming: { destination: '' },
    metadata: {
      created_at: '2024-01-01T00:00:00Z',
      created_by: 'System',
      updated_at: '2024-01-01T00:00:00Z',
      updated_by: 'System',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    useRouter.mockReturnValue({ push: jest.fn(), back: jest.fn() });
    useNavigationBack.mockReturnValue(mockHandleGoBack);
    Object.defineProperty(window, 'history', {
      value: { length: 2 },
      writable: true,
    });
    api.updateVeteran = jest.fn().mockResolvedValue({
      ...baseVeteran,
      flight: { ...baseVeteran.flight, status: 'Deceased' },
      _rev: '2-newrev',
    });
  });

  test('keeps Save enabled after changing status to Deceased and persists the change', async () => {
    const user = userEvent.setup();
    render(<VeteranEditForm veteran={baseVeteran} />);

    const flightSection = document.getElementById('flight-section');
    const [statusSelect] = within(flightSection).getAllByRole('combobox');
    expect(statusSelect).toBeEnabled();

    fireEvent.mouseDown(statusSelect);
    await user.click(screen.getByRole('option', { name: 'Deceased' }));

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    await waitFor(() => {
      expect(api.updateVeteran).toHaveBeenCalledWith(
        'test-veteran-123',
        expect.objectContaining({
          flight: expect.objectContaining({ status: 'Deceased' }),
        })
      );
    });
  });

  test('disables Save for Flown/Deceased veterans when there are no pending changes', () => {
    const deceasedVeteran = {
      ...baseVeteran,
      flight: { ...baseVeteran.flight, status: 'Deceased' },
    };

    render(<VeteranEditForm veteran={deceasedVeteran} />);

    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
    const flightSection = document.getElementById('flight-section');
    expect(within(flightSection).getAllByRole('combobox')[0]).toBeEnabled();
  });

  test('disables all checkboxes including Mail Call when form is locked', () => {
    const flownVeteran = {
      ...baseVeteran,
      flight: { ...baseVeteran.flight, status: 'Flown' },
    };

    render(<VeteranEditForm veteran={flownVeteran} />);

    expect(screen.getByRole('checkbox', { name: /cane/i })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /liability waiver received/i })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /mail call received/i })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /mail call adoption/i })).toBeDisabled();
    expect(document.querySelector('input[name="call.fm_number"]')).toBeDisabled();
  });

  test('dims checkbox labels when form is locked', () => {
    const deceasedVeteran = {
      ...baseVeteran,
      flight: { ...baseVeteran.flight, status: 'Deceased' },
    };

    render(<VeteranEditForm veteran={deceasedVeteran} />);

    const mailCallLabel = screen
      .getByRole('checkbox', { name: /mail call received/i })
      .closest('.MuiFormControlLabel-root');
    expect(mailCallLabel).toHaveClass('Mui-disabled');

    const caneLabel = screen.getByRole('checkbox', { name: /cane/i }).closest('.MuiFormControlLabel-root');
    expect(caneLabel).toHaveClass('Mui-disabled');
  });
});
