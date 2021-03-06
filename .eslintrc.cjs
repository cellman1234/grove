const os = require('os');

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.json', '.js', '.ts', '.css'],
      },
    },
  },
  rules: {
    'no-restricted-syntax': [
      'error',
      'LabeledStatement',
      'WithStatement',
    ],
    'no-console': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-param-reassign': ['error', { props: false }],
    'no-unused-vars': ['error', { args: 'none' }],
    'no-useless-constructor': 'off',
    'no-empty-function': ['error', { allow: ['constructors'] }],
    'max-classes-per-file': 'off',
    'linebreak-style': ['error', (os.EOL === '\r\n' ? 'windows' : 'unix')],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        json: 'always',
        js: 'never',
        ts: 'never',
        css: 'never',
      },
    ],
  },
};
