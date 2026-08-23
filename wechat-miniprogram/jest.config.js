module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  // 只收集 test/ 下的 *.test.js，避免把 pages/test/test.js 误当测试跑
  testMatch: ['<rootDir>/test/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  setupFiles: ['<rootDir>/test/setup.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'modules/**/*.js',
    'pages/**/*.js',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  // 随测试补全逐步抬高；当前实际约 74/48/76/77
  coverageThreshold: {
    global: { statements: 60, branches: 45, functions: 65, lines: 65 },
  },
}
