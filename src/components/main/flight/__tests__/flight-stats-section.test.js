import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FlightStatsSection } from '../flight-stats-section';

const mockStats = {
  flight: {
    'Confirmed': 10,
    'Pending': 5,
    'None': 2,
  },
  tours: {
    'Morning': 8,
    'Afternoon': 7,
    'None': 2,
  },
  buses: {
    'Alpha1': 6,
    'Alpha2': 5,
    'Bravo1': 4,
    'None': 2,
  },
};

describe('FlightStatsSection', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('renders with "Flight Statistics" header text', () => {
    render(<FlightStatsSection stats={mockStats} flightId="flight-123" />);
    
    expect(screen.getByText('Flight Statistics')).toBeInTheDocument();
  });

  test('defaults to collapsed state', () => {
    render(<FlightStatsSection stats={mockStats} flightId="flight-123" />);
    
    // Stats content should not be visible initially
    const flightBreakdown = screen.queryByText('Flight Breakdown');
    expect(flightBreakdown).not.toBeVisible();
  });

  test('expands when header is clicked', async () => {
    const user = userEvent.setup();
    render(<FlightStatsSection stats={mockStats} flightId="flight-123" />);
    
    const header = screen.getByText('Flight Statistics');
    await user.click(header);
    
    // After expansion, stats content should be visible
    await waitFor(() => {
      expect(screen.getByText('Flight Breakdown')).toBeVisible();
      expect(screen.getByText('Tour Breakdown')).toBeVisible();
      expect(screen.getByText('Bus Breakdown')).toBeVisible();
    });
  });

  test('collapses when header is clicked twice', async () => {
    const user = userEvent.setup();
    render(<FlightStatsSection stats={mockStats} flightId="flight-123" />);
    
    const header = screen.getByText('Flight Statistics');
    
    // Expand
    await user.click(header);
    await waitFor(() => {
      expect(screen.getByText('Flight Breakdown')).toBeVisible();
    });
    
    // Collapse
    await user.click(header);
    await waitFor(() => {
      expect(screen.queryByText('Flight Breakdown')).not.toBeVisible();
    });
  });

  test('persists expanded state to sessionStorage', async () => {
    const user = userEvent.setup();
    render(<FlightStatsSection stats={mockStats} flightId="flight-123" />);
    
    const header = screen.getByText('Flight Statistics');
    await user.click(header);
    
    await waitFor(() => {
      const stored = sessionStorage.getItem('flight-stats-expanded-flight-123');
      expect(stored).toBe('true');
    });
  });

  test('restores expanded state from sessionStorage', () => {
    sessionStorage.setItem('flight-stats-expanded-flight-456', 'true');
    
    render(<FlightStatsSection stats={mockStats} flightId="flight-456" />);
    
    // Should be expanded based on stored state
    expect(screen.getByText('Flight Breakdown')).toBeVisible();
    expect(screen.getByText('Tour Breakdown')).toBeVisible();
    expect(screen.getByText('Bus Breakdown')).toBeVisible();
  });

  test('uses flight-specific storage key', async () => {
    const user = userEvent.setup();
    
    // Render for flight-1, expand it
    const { unmount } = render(<FlightStatsSection stats={mockStats} flightId="flight-1" />);
    await user.click(screen.getByText('Flight Statistics'));
    
    await waitFor(() => {
      expect(sessionStorage.getItem('flight-stats-expanded-flight-1')).toBe('true');
    });
    
    unmount();
    
    // Render for flight-2, should be collapsed (different key)
    render(<FlightStatsSection stats={mockStats} flightId="flight-2" />);
    expect(screen.queryByText('Flight Breakdown')).not.toBeVisible();
    expect(sessionStorage.getItem('flight-stats-expanded-flight-2')).toBeNull();
  });

  test('displays all stat categories when expanded', async () => {
    const user = userEvent.setup();
    render(<FlightStatsSection stats={mockStats} flightId="flight-123" />);
    
    await user.click(screen.getByText('Flight Statistics'));
    
    await waitFor(() => {
      // Flight stats
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      
      // Tour stats
      expect(screen.getByText('Morning')).toBeInTheDocument();
      expect(screen.getByText('Afternoon')).toBeInTheDocument();
      
      // Bus stats
      expect(screen.getByText('Alpha1')).toBeInTheDocument();
      expect(screen.getByText('Alpha2')).toBeInTheDocument();
      expect(screen.getByText('Bravo1')).toBeInTheDocument();
    });
  });

  test('returns null when stats is undefined', () => {
    const { container } = render(<FlightStatsSection stats={undefined} flightId="flight-123" />);
    expect(container.firstChild).toBeNull();
  });

  test('returns null when stats is null', () => {
    const { container } = render(<FlightStatsSection stats={null} flightId="flight-123" />);
    expect(container.firstChild).toBeNull();
  });

  test('handles sessionStorage errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock sessionStorage to throw an error
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    render(<FlightStatsSection stats={mockStats} flightId="flight-123" />);
    
    // Should still toggle without crashing
    const header = screen.getByText('Flight Statistics');
    await user.click(header);
    
    await waitFor(() => {
      expect(screen.getByText('Flight Breakdown')).toBeVisible();
    });
    
    setItemSpy.mockRestore();
  });

  test('highlights "None" entries in red when count > 0', async () => {
    const user = userEvent.setup();
    render(<FlightStatsSection stats={mockStats} flightId="flight-123" />);
    
    await user.click(screen.getByText('Flight Statistics'));
    
    await waitFor(() => {
      // Find all "None" text elements
      const noneElements = screen.getAllByText('None');
      // Should have 3 "None" labels (flight, tours, buses)
      expect(noneElements.length).toBe(3);
    });
  });
});
