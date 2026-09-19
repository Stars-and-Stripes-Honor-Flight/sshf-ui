export const APP_HEADER_OFFSET_CSS_VAR = '--App-header-offset';

/** @param {number} heightPx */
export function setAppHeaderOffsetPx(heightPx) {
  const value = `${Math.max(0, heightPx)}px`;
  document.documentElement.style.setProperty(APP_HEADER_OFFSET_CSS_VAR, value);
}

export function clearAppHeaderOffset() {
  document.documentElement.style.removeProperty(APP_HEADER_OFFSET_CSS_VAR);
}
