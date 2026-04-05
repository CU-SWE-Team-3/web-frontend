/** @type {import('jest').Config} */
const config = {
  displayName: 'player',
  testEnvironment: 'jest-environment-jsdom',
  // Only run tests inside the player feature folder
  testMatch: ['<rootDir>/src/features/player/tests/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    // Resolve @/ alias to src/
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock CSS/SCSS modules
    '\\.(css|scss|sass)$': '<rootDir>/src/features/player/tests/__mocks__/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/features/player/tests/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

module.exports = config;
