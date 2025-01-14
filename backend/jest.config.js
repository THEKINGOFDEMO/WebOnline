module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middlewares/**/*.js',
    'utils/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  setupFilesAfterEnv: ['./tests/setup.js']
}; 