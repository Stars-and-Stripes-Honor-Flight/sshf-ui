import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

import { ConflictChip } from '@/components/main/waitlist/waitlist-indicators';

function chipClassName(label) {
  return screen.getByText(label).closest('.MuiChip-root').className;
}

describe('ConflictChip', () => {
  test('renders Cold War and Gulf War as neutral chips like Afghanistan and Iraq', () => {
    render(
      <>
        <ConflictChip vetType="WWII" />
        <ConflictChip vetType="Korea" />
        <ConflictChip vetType="Vietnam" />
        <ConflictChip vetType="Cold War" />
        <ConflictChip vetType="Gulf War" />
        <ConflictChip vetType="Afghanistan" />
        <ConflictChip vetType="Iraq" />
      </>
    );

    const neutral = chipClassName('Afghanistan');
    expect(chipClassName('Cold War')).toBe(neutral);
    expect(chipClassName('Gulf War')).toBe(neutral);
    expect(chipClassName('Iraq')).toBe(neutral);
    expect(chipClassName('WWII')).not.toBe(neutral);
    expect(chipClassName('Korea')).not.toBe(neutral);
    expect(chipClassName('Vietnam')).not.toBe(neutral);
  });
});
