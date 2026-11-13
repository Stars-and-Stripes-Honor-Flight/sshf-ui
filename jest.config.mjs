import nextJest from 'next/jest.js';

import nextConfig from './next.config.mjs';

// `next build` inlines next.config env into the client bundle. Jest does not.
// Copy it so tests see the package.json version the browser receives.
for (const [key, value] of Object.entries(nextConfig.env ?? {})) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);
