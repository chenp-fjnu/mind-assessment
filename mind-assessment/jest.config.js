module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/server/setup.js'],
  collectCoverageFrom: [
    'shared/modules/**/*.js',
    'shared/utils/scale-scoring.js',
    'shared/utils/format.js',
    'shared/utils/scoring.js',
    'shared/modules/module-system.js',
    '../server/routes/**/*.js',
    '../server/utils/auth.js',
    '../server/utils/validate.js',
    '../server/utils/store.js',
  ],
  coverageDirectory: '<rootDir>/coverage',
  verbose: true,
  testTimeout: 30000,
};
