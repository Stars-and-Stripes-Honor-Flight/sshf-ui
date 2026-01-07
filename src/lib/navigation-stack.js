/**
 * Navigation stack utility for managing navigation history
 * Uses sessionStorage to persist navigation stack across page loads
 */

const STACK_KEY = 'navigationStack';
const MAX_STACK_SIZE = 50;

/**
 * Navigation stack entry
 * @typedef {Object} NavigationEntry
 * @property {string} type - Page type: 'search', 'veteran-details', 'guardian-details'
 * @property {string} url - Full URL of the page
 * @property {string} title - Display title for back navigation
 */

/**
 * Get the navigation stack from sessionStorage
 * @returns {NavigationEntry[]}
 */
export function getNavigationStack() {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stackJson = sessionStorage.getItem(STACK_KEY);
    return stackJson ? JSON.parse(stackJson) : [];
  } catch (error) {
    console.error('Failed to parse navigation stack:', error);
    return [];
  }
}

/**
 * Save the navigation stack to sessionStorage
 * @param {NavigationEntry[]} stack
 */
function saveNavigationStack(stack) {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Limit stack size to prevent memory issues
    const limitedStack = stack.slice(-MAX_STACK_SIZE);
    sessionStorage.setItem(STACK_KEY, JSON.stringify(limitedStack));
  } catch (error) {
    console.error('Failed to save navigation stack:', error);
  }
}

/**
 * Push a new entry onto the navigation stack
 * @param {NavigationEntry} entry
 */
export function pushNavigationEntry(entry) {
  const stack = getNavigationStack();
  
  // Don't add duplicate consecutive entries
  const lastEntry = stack[stack.length - 1];
  if (lastEntry && lastEntry.url === entry.url) {
    return;
  }
  
  stack.push(entry);
  saveNavigationStack(stack);
}

/**
 * Pop the last entry from the navigation stack
 * @returns {NavigationEntry|null}
 */
export function popNavigationEntry() {
  const stack = getNavigationStack();
  if (stack.length === 0) {
    return null;
  }
  
  const entry = stack.pop();
  saveNavigationStack(stack);
  return entry;
}

/**
 * Peek at the last entry without removing it
 * @returns {NavigationEntry|null}
 */
export function peekNavigationEntry() {
  const stack = getNavigationStack();
  return stack.length > 0 ? stack[stack.length - 1] : null;
}

/**
 * Get the previous entry (second to last) without removing anything
 * @returns {NavigationEntry|null}
 */
export function getPreviousNavigationEntry() {
  const stack = getNavigationStack();
  return stack.length >= 2 ? stack[stack.length - 2] : null;
}

/**
 * Clear the navigation stack
 */
export function clearNavigationStack() {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(STACK_KEY);
}

/**
 * Initialize current page in the navigation stack
 * This should be called when a page loads
 * @param {string} type - Page type
 * @param {string} title - Display title
 */
export function initializeCurrentPage(type, title) {
  if (typeof window === 'undefined') {
    return;
  }
  
  const currentUrl = window.location.pathname + window.location.search;
  const currentEntry = { type, url: currentUrl, title };
  
  const stack = getNavigationStack();
  const lastEntry = stack[stack.length - 1];
  
  // Only add if this is a new page (different URL)
  if (!lastEntry || lastEntry.url !== currentUrl) {
    pushNavigationEntry(currentEntry);
  } else {
    // Update the existing entry
    stack[stack.length - 1] = currentEntry;
    saveNavigationStack(stack);
  }
}

/**
 * Get the back link text for the previous navigation entry
 * Automatically prepends "Back to " if not already present
 * @param {string} fallback - Fallback text if no previous entry (default: "Back to Search")
 * @returns {string} Back link text
 */
export function getBackLinkText(fallback = 'Back to Search') {
  const previousEntry = getPreviousNavigationEntry();
  if (previousEntry?.title) {
    // Ensure "Back to " is prepended if not already present
    return previousEntry.title.startsWith('Back to ') 
      ? previousEntry.title 
      : `Back to ${previousEntry.title}`;
  }
  return fallback;
}

