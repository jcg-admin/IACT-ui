/**
 * Jest Configuration
 * Testing framework setup
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module paths
  moduleNameMapper: {
    // Asset mocks PRIMERO (antes de alias)
    '\\.(css|scss|less|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Webpack aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@redux/(.*)$': '<rootDir>/src/redux/$1',
    '^@mocks/(.*)$': '<rootDir>/src/mocks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@router/(.*)$': '<rootDir>/src/router/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^@decorators/(.*)$': '<rootDir>/src/decorators/$1',
    '^@facades/(.*)$': '<rootDir>/src/facades/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
  },

  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
  ],

  // Watch plugins
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname',
  // ],

  // Verbose output
  verbose: true,
}
