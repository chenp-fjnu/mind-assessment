module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/frontend/**/*.test.js'],
  collectCoverageFrom: [
    'shared/modules/**/*.js',
    'shared/utils/scale-scoring.js',
    'shared/utils/format.js',
    'shared/utils/scoring.js',
  ],
  coverageDirectory: '<rootDir>/coverage/frontend',
  verbose: true,
};
