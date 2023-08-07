module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/__tests__/**/*.test.js'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js'
  ],
  coverageReporters: ['text-summary', 'json-summary', 'lcov']
}
