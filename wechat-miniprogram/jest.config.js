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
  // 适度门槛：随测试补全可逐步抬高
  coverageThreshold: {
    global: { statements: 35, branches: 25, functions: 25, lines: 35 },
  },
}
