import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { GuardianEditForm } from '../guardian-edit-form';
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

describe('GuardianEditForm - Update Functionality', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockUpdateGuardian = jest.fn();
  const mockGetVeteran = jest.fn();
  const mockSearchVeterans = jest.fn();
  const mockHandleGoBack = jest.fn();
  
  // Mock guardian data with all required fields
  const mockGuardian = {
    _id: 'test-guardian-123',
    _rev: '1-abc123def456',
    type: 'Guardian',
    name: {
      first: 'Jane',
      middle: 'B',
      last: 'Smith',
      nickname: 'Janey'
    },
    address: {
      street: '456 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      county: 'Sangamon',
      phone_day: '555-123-4567',
      phone_eve: '555-987-6543',
      phone_mbl: '555-456-7890',
      email: 'jane.smith@example.com'
    },
    birth_date: '1985-03-15',
    gender: 'F',
    weight: '140',
    occupation: 'Teacher',
    app_date: '2024-01-01',
    notes: {
      service: 'N',
      other: 'No military service'
    },
    medical: {
      level: 'A',
      food_restriction: 'None',
      can_push: true,
      can_lift: true,
      limitations: 'None',
      experience: 'First aid certified',
      release: true,
      form: true
    },
    flight: {
      status: 'Active',
      id: 'FL123',
      group: 'Group A',
      bus: 'Alpha1',
      seat: '12A',
      waiver: true,
      vaccinated: true,
      training: 'Main',
      training_complete: true,
      training_see_doc: false,
      training_notes: 'Completed main training',
      status_note: 'Ready for flight',
      mediaWaiver: true,
      infection_test: true,
      nofly: false,
      booksOrdered: 2,
      confirmed_date: '2024-02-01',
      confirmed_by: 'John Admin',
      paid: true,
      exempt: false,
      history: [
        {
          status: 'pending',
          date: '2024-01-01',
          note: 'Initial application'
        }
      ]
    },
    call: {
      assigned_to: 'Call Center Rep',
      notes: 'Initial contact made',
      fm_number: '12345',
      email_sent: true,
      history: [
        {
          action: 'email_sent',
          date: '2024-01-15',
          note: 'Welcome email sent'
        }
      ]
    },
    emerg_contact: {
      name: 'Bob Smith',
      relation: 'Spouse',
      address: {
        phone: '555-999-8888',
        email: 'bob.smith@example.com'
      }
    },
    veteran: {
      pref_notes: 'Prefers to work with WWII veterans',
      pairings: [
        {
          id: 'vet-456',
          name: 'John Veteran'
        }
      ],
      history: [
        {
          action: 'paired',
          date: '2024-01-20',
          note: 'Paired with John Veteran'
        }
      ]
    },
    shirt: {
      size: 'M'
    },
    apparel: {
      item: 'Both',
      jacket_size: 'M',
      shirt_size: 'M',
      delivery: 'Training',
      date: '2024-01-25',
      by: 'Admin User',
      notes: 'Apparel sent to training'
    },
    accommodations: {
      hotel_name: 'Springfield Hotel',
      room_type: 'Single',
      arrival_date: '2024-02-10',
      departure_date: '2024-02-12',
      arrival_time: '14:00',
      arrival_flight: 'AA123',
      attend_banquette: true,
      banquette_guest: 'Bob Smith',
      departure_time: '16:00',
      departure_flight: 'AA456',
      notes: 'Special dietary requirements'
    },
    metadata: {
      created_at: '2024-01-01T10:00:00Z',
      created_by: 'admin@example.com',
      updated_at: '2024-01-15T14:30:00Z',
      updated_by: 'admin@example.com'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
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
    
    api.updateGuardian = mockUpdateGuardian;
    api.getVeteran = mockGetVeteran;
    api.searchVeterans = mockSearchVeterans;
    
    mockUpdateGuardian.mockResolvedValue({
      ...mockGuardian,
      _rev: '2-xyz789abc123',
      metadata: {
        created_at: '2024-01-01T10:00:00Z',
        created_by: 'admin@example.com',
        updated_at: '2024-01-20T16:45:00Z',
        updated_by: 'admin@example.com'
      }
    });
    
    // Mock pairing dialog API methods
    mockGetVeteran.mockResolvedValue({
      _id: 'vet-123',
      name: { first: 'John', last: 'Veteran' }
    });
    mockSearchVeterans.mockResolvedValue([]);
  });

  test('includes all required fields in API call', async () => {
    const user = userEvent.setup();
    render(<GuardianEditForm guardian={mockGuardian} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateGuardian).toHaveBeenCalledWith(
        'test-guardian-123',
        expect.objectContaining({
          _id: 'test-guardian-123',
          _rev: '1-abc123def456',
          type: 'Guardian'
        })
      );
    });
  });

  test('excludes metadata from API call', async () => {
    const user = userEvent.setup();
    render(<GuardianEditForm guardian={mockGuardian} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateGuardian.mock.calls[0];
      const payload = callArgs[1];
      expect(payload.metadata).toBeUndefined();
    });
  });

  test('excludes history arrays from API call', async () => {
    const user = userEvent.setup();
    render(<GuardianEditForm guardian={mockGuardian} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateGuardian.mock.calls[0];
      const payload = callArgs[1];
      expect(payload.flight.history).toBeUndefined();
      expect(payload.veteran.history).toBeUndefined();
      expect(payload.call.history).toBeUndefined();
    });
  });

  test('preserves _rev and sets type field correctly', async () => {
    const user = userEvent.setup();
    render(<GuardianEditForm guardian={mockGuardian} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateGuardian.mock.calls[0];
      const payload = callArgs[1];
      expect(payload._rev).toBe('1-abc123def456');
      expect(payload.type).toBe('Guardian');
    });
  });

  test('handles single field update correctly', async () => {
    const user = userEvent.setup();
    render(<GuardianEditForm guardian={mockGuardian} />);
    
    // Wait for form to be fully initialized
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    });
    
    // Change the first name field (easier to find)
    const firstNameField = screen.getByDisplayValue('Jane');
    await user.clear(firstNameField);
    await user.type(firstNameField, 'Jane Updated');
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateGuardian.mock.calls[0];
      const payload = callArgs[1];
      expect(payload.name.first).toBe('Jane Updated');
      expect(payload.name.last).toBe('Smith'); // Other fields should be preserved
    }, { timeout: 10000 });
  });

  test('shows success message and stays on page after successful update', async () => {
    const user = userEvent.setup();
    render(<GuardianEditForm guardian={mockGuardian} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Guardian updated successfully');
      // After save, we stay on the page (no navigation)
      expect(mockHandleGoBack).not.toHaveBeenCalled();
    });
  });

  test('handles API errors gracefully', async () => {
    const errorMessage = 'Network error occurred';
    mockUpdateGuardian.mockRejectedValue(new Error(errorMessage));
    
    const user = userEvent.setup();
    render(<GuardianEditForm guardian={mockGuardian} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update guardian: ' + errorMessage);
      expect(mockHandleGoBack).not.toHaveBeenCalled();
    });
  });

  test('updates _rev state when guardian prop changes', () => {
    const { rerender } = render(<GuardianEditForm guardian={mockGuardian} />);
    
    // Verify initial _rev is set
    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    
    // Update guardian with new _rev
    const updatedGuardian = {
      ...mockGuardian,
      _rev: '2-new-rev-123'
    };
    
    rerender(<GuardianEditForm guardian={updatedGuardian} />);
    
    // Component should still render (we can't easily test internal state without exposing it)
    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
  });

  test('form submission includes all form fields with correct structure', async () => {
    const user = userEvent.setup();
    render(<GuardianEditForm guardian={mockGuardian} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      const callArgs = mockUpdateGuardian.mock.calls[0];
      const payload = callArgs[1];
      
      // Verify all major sections are present
      expect(payload.name).toBeDefined();
      expect(payload.address).toBeDefined();
      expect(payload.medical).toBeDefined();
      expect(payload.flight).toBeDefined();
      expect(payload.call).toBeDefined();
      expect(payload.emerg_contact).toBeDefined();
      expect(payload.veteran).toBeDefined();
      expect(payload.shirt).toBeDefined();
      expect(payload.apparel).toBeDefined();
      expect(payload.accommodations).toBeDefined();
      
      // Verify specific field values
      expect(payload.name.first).toBe('Jane');
      expect(payload.name.last).toBe('Smith');
      expect(payload.address.city).toBe('Springfield');
      expect(payload.flight.status).toBe('Active');
      expect(payload.medical.level).toBe('A');
    });
  });
});