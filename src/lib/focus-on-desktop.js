/** Focus a field on desktop only — avoids mobile scroll jumps that hide the env banner. */
export function focusOnDesktop(inputRef) {
  if (typeof window === 'undefined' || !inputRef?.current) {
    return;
  }

  const isDesktop =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(min-width: 900px)').matches;

  if (isDesktop) {
    inputRef.current.focus();
  }
}
