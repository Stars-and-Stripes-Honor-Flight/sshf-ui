import { render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';

import { toast, Toaster } from '@/components/core/toaster';

// Veteran and guardian edit forms pin Cancel and Save in a fixed bottom bar
// (16px padding + 40px button + 16px padding + 1px border ≈ 73px, with 80px
// of form padding). The toast must sit above that bar.
const FORM_ACTION_BAR_CLEARANCE_PX = 80;

function readOffsetPx(element, property) {
  const value = element.style.getPropertyValue(property).trim();
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value);
  if (!match) {
    throw new Error(`${property} was ${JSON.stringify(value)}, expected a px length`);
  }
  return Number(match[1]);
}

describe('Toaster', () => {
  afterEach(() => {
    toast.dismiss();
  });

  test('places the save success toast above the fixed Cancel and Save bar', async () => {
    render(<Toaster position="bottom-right" closeButton />);

    toast.success('Veteran updated successfully');

    expect(await screen.findByText('Veteran updated successfully')).toBeInTheDocument();

    const toaster = await waitFor(() => {
      const element = document.querySelector('[data-sonner-toaster]');
      expect(element).not.toBeNull();
      return element;
    });

    expect(toaster).toHaveAttribute('data-y-position', 'bottom');
    expect(toaster).toHaveAttribute('data-x-position', 'right');
    expect(readOffsetPx(toaster, '--offset-bottom')).toBeGreaterThan(FORM_ACTION_BAR_CLEARANCE_PX);
    expect(readOffsetPx(toaster, '--mobile-offset-bottom')).toBeGreaterThan(FORM_ACTION_BAR_CLEARANCE_PX);
    expect(screen.getByRole('button', { name: 'Close toast' })).toBeInTheDocument();
  });
});
