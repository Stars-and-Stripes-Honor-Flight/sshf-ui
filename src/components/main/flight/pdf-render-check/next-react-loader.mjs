const compiledReact = new URL('../../../../../node_modules/next/dist/compiled/react/', import.meta.url);

const aliases = {
  react: new URL('index.js', compiledReact).href,
  'react/jsx-runtime': new URL('jsx-runtime.js', compiledReact).href,
  'react/jsx-dev-runtime': new URL('jsx-dev-runtime.js', compiledReact).href,
};

/**
 * Next's client bundle aliases `react` to next/dist/compiled/react (React 19).
 * Node and Jest otherwise load the app's React 18. This hook makes a render
 * test use the same React the browser gets.
 */
export async function resolve(specifier, context, nextResolve) {
  if (aliases[specifier]) {
    return { url: aliases[specifier], shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
