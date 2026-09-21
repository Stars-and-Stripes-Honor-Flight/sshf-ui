import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { ReviewApplicationsView } from '@/components/main/review/review-applications-view';
import { api } from '@/lib/api';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useSearchParams: () => new URLSearchParams('status=New'),
}));

jest.mock('@/lib/api', () => ({
  api: {
    listReviewApplications: jest.fn(),
  },
}));

describe('ReviewApplicationsView', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPush.mockClear();
    api.listReviewApplications.mockResolvedValue([
      {
        id: 'vet-app-1',
        type: 'VeteranApp',
        name: 'John Public',
        city: 'Madison',
        app_date: '2024-03-05',
        app_status: 'New',
        pairing: '',
        email: 'john@example.com',
      },
    ]);
  });

  test('loads and displays applications for the selected status', async () => {
    render(<ReviewApplicationsView />);

    await waitFor(() => {
      expect(screen.getByText('John Public')).toBeInTheDocument();
    });

    expect(api.listReviewApplications).toHaveBeenCalledWith({ status: 'New', limit: 100 });
  });

  test('navigates to detail when a row is clicked', async () => {
    const user = userEvent.setup();
    render(<ReviewApplicationsView />);

    await waitFor(() => {
      expect(screen.getByText('John Public')).toBeInTheDocument();
    });

    await user.click(screen.getByText('John Public'));
    expect(mockPush).toHaveBeenCalledWith('/review/applications/detail?id=vet-app-1');
  });
});
