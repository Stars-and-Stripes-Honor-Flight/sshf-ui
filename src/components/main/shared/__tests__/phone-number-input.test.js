import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { PhoneNumberInput } from '@/components/main/shared/phone-number-input';

/**
 * Caret rule: after an edit, count the digits to the left of the caret in the raw
 * edited value, then place the caret just after that many digits in the formatted
 * value. If the mask inserts a hyphen immediately after that digit, the caret sits
 * after the hyphen. Typing at the end therefore stays at the end.
 */
function PhoneHarness({ initialValue = '', onBlur = () => {} }) {
  const [value, setValue] = useState(initialValue);
  return (
    <PhoneNumberInput
      value={value}
      onChange={setValue}
      onBlur={onBlur}
      name="phone"
      inputProps={{ 'aria-label': 'Phone number' }}
    />
  );
}

function expectCaret(input, position) {
  expect(input.selectionStart).toBe(position);
  expect(input.selectionEnd).toBe(position);
}

describe('PhoneNumberInput', () => {
  test('formats digits typed at the end and keeps the caret at the end', async () => {
    const user = userEvent.setup();
    const onBlur = jest.fn();
    render(<PhoneHarness onBlur={onBlur} />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.type(input, '4145551212');

    expect(input).toHaveValue('414-555-1212');
    expectCaret(input, '414-555-1212'.length);

    await user.tab();
    expect(onBlur).toHaveBeenCalledWith('414-555-1212');
  });

  test.each([
    ['4145', '414-5'],
    ['4145551', '414-555-1'],
    ['1414', '141-4'],
  ])('typing %s shows %s with the caret at the end', async (typed, expected) => {
    const user = userEvent.setup();
    render(<PhoneHarness />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.type(input, typed);

    expect(input).toHaveValue(expected);
    expectCaret(input, expected.length);
  });

  test('drops a leading 1 once the typed value reaches 11 digits and keeps the caret at the end', async () => {
    const user = userEvent.setup();
    render(<PhoneHarness />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.type(input, '14145551212');

    expect(input).toHaveValue('414-555-1212');
    expectCaret(input, '414-555-1212'.length);
  });

  test('ignores an 11th digit that is not a leading country code', async () => {
    const user = userEvent.setup();
    render(<PhoneHarness />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.type(input, '41455512123');

    expect(input).toHaveValue('414-555-1212');
    expectCaret(input, '414-555-1212'.length);
  });

  test.each(['(414) 555-1212', '414.555.1212', '414 555 1212'])(
    'pasting %s normalizes to 414-555-1212',
    async (pasted) => {
      const user = userEvent.setup();
      render(<PhoneHarness />);

      const input = screen.getByRole('textbox', { name: 'Phone number' });
      await user.click(input);
      await user.paste(pasted);

      expect(input).toHaveValue('414-555-1212');
      expectCaret(input, '414-555-1212'.length);
    }
  );

  test('pasting a leading country code normalizes to 10 digits', async () => {
    const user = userEvent.setup();
    render(<PhoneHarness />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.click(input);
    await user.paste('+1 (414) 555-1212');

    expect(input).toHaveValue('414-555-1212');
    expectCaret(input, '414-555-1212'.length);
  });

  test('inserting a digit before the exchange hyphen keeps the caret after that digit', async () => {
    const user = userEvent.setup();
    render(<PhoneHarness initialValue="414-555-1212" />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.click(input);
    // 414|-555-1212
    input.setSelectionRange(3, 3);
    await user.keyboard('9');

    // First 10 digits of 41495551212. Caret follows the inserted 9: 414-9|55-5121
    expect(input).toHaveValue('414-955-5121');
    expectCaret(input, 5);
  });

  test('backspacing the hyphen after the area code leaves the caret after that hyphen', async () => {
    const user = userEvent.setup();
    render(<PhoneHarness initialValue="414-555-1212" />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.click(input);
    // 414-|555-1212 — Backspace deletes the hyphen, not a digit.
    input.setSelectionRange(4, 4);
    await user.keyboard('{Backspace}');

    expect(input).toHaveValue('414-555-1212');
    expectCaret(input, 4);
  });

  test('backspacing a digit inside the exchange keeps the caret after the area-code hyphen', async () => {
    const user = userEvent.setup();
    render(<PhoneHarness initialValue="414-555-1212" />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.click(input);
    // 414-5|55-1212 — Backspace deletes the first 5 of the exchange.
    input.setSelectionRange(5, 5);
    await user.keyboard('{Backspace}');

    // 414-|551-212
    expect(input).toHaveValue('414-551-212');
    expectCaret(input, 4);
  });

  test('uses type tel and inputMode tel on the native input', () => {
    render(<PhoneHarness />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('inputmode', 'tel');
  });

  test('clearing the field yields an empty string', async () => {
    const user = userEvent.setup();
    const onBlur = jest.fn();
    render(<PhoneHarness initialValue="414-555-1212" onBlur={onBlur} />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.clear(input);

    expect(input).toHaveValue('');
    await user.tab();
    expect(onBlur).toHaveBeenCalledWith('');
  });
});
