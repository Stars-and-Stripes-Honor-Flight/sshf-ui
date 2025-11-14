export function isNavItemActive({ disabled, external, href, matcher, pathname }) {
  if (disabled || !href || external) {
    return false;
  }

  // Check href match first
  const hrefMatches = pathname === href;

  if (matcher) {
    if (matcher.type === 'startsWith') {
      return pathname.startsWith(matcher.href) || hrefMatches;
    }

    if (matcher.type === 'equals') {
      return pathname === matcher.href || hrefMatches;
    }

    return hrefMatches;
  }

  return hrefMatches;
}
