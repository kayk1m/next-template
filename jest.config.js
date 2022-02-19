const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @see https://nextjs.org/docs/testing#setting-up-jest-with-the-rust-compiler */
const customJestConfig = {
  testEnvironment: './jest/mongo-environment.js',
  moduleNameMapper: {
    '@/assets/(.*)': '<rootDir>/src/assets/$1',
    '@/backend/(.*)': '<rootDir>/src/backend/$1',
    '@/frontend/(.*)': '<rootDir>/src/frontend/$1',
    '@/pages/(.*)': '<rootDir>/src/pages/$1',
    '@/types': '<rootDir>/src/types',
    '@/utils/(.*)': '<rootDir>/src/utils/$1',
    '@/(.*)': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules'],
  globalSetup: './jest/setup.js',
  globalTeardown: './jest/teardown.js',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/{backend,pages}/**/*.{ts,tsx}',
    '!**/_middleware.ts',
    '!<rootDir>/src/pages/_app.tsx',
    '!<rootDir>/src/pages/_document.tsx',
  ],
};

module.exports = createJestConfig(customJestConfig);
