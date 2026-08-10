module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/server/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/server/setup.js'],
  collectCoverageFrom: [
    '../server/routes/**/*.js',
    '../server/utils/auth.js',
    '../server/utils/validate.js',
    '../server/utils/store.js',
  ],
  coverageDirectory: '<rootDir>/coverage/server',
  verbose: true,
};
