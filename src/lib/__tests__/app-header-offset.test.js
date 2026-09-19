import {
  APP_HEADER_OFFSET_CSS_VAR,
  clearAppHeaderOffset,
  setAppHeaderOffsetPx,
} from '@/lib/app-header-offset';

describe('app-header-offset', () => {
  afterEach(() => {
    clearAppHeaderOffset();
  });

  test('setAppHeaderOffsetPx writes the CSS variable on the document root', () => {
    setAppHeaderOffsetPx(72);
    expect(
      document.documentElement.style.getPropertyValue(APP_HEADER_OFFSET_CSS_VAR)
    ).toBe('72px');
  });

  test('setAppHeaderOffsetPx clamps negative values to zero', () => {
    setAppHeaderOffsetPx(-10);
    expect(
      document.documentElement.style.getPropertyValue(APP_HEADER_OFFSET_CSS_VAR)
    ).toBe('0px');
  });

  test('clearAppHeaderOffset removes the CSS variable', () => {
    setAppHeaderOffsetPx(48);
    clearAppHeaderOffset();
    expect(
      document.documentElement.style.getPropertyValue(APP_HEADER_OFFSET_CSS_VAR)
    ).toBe('');
  });
});
