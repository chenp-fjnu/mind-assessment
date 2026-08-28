module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    commonjs: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'script',
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-unused-vars': ['warn', { args: 'none' }],
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-var': 'error',
  },
  globals: {
    Page: 'readonly',
    Component: 'readonly',
    App: 'readonly',
    getApp: 'readonly',
    wx: 'readonly',
    getCurrentPages: 'readonly',
    requirePlugin: 'readonly',
    module: 'writable',
    require: 'readonly',
    console: 'readonly',
  },
  ignorePatterns: ['node_modules/', 'utils/questions.js', 'test/'],
}
