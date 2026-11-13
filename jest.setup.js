import '@testing-library/jest-dom';
import { toHaveValue as jestDomToHaveValue } from '@testing-library/jest-dom/matchers';

expect.extend({
  toHaveValue(element, expected) {
    if (
      element?.tagName === 'TEXTAREA' &&
      typeof expected === 'string' &&
      expected.includes('\r\n')
    ) {
      const normalize = (value) => value.replace(/\r\n/g, '\n');
      const pass = normalize(element.value) === normalize(expected);
      return {
        pass,
        message: () =>
          this.isNot
            ? `expected element not to have value ${expected}`
            : `expected element to have value ${expected} but received ${element.value}`,
      };
    }
    return jestDomToHaveValue.call(this, element, expected);
  },
});
