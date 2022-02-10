module.exports = {
  env: {
    es2021: true,
    'jest/globals': true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'formatjs',
    'jest',
  ],
  globals: {
    window: true,
    navigator: true,
    fetch: true,
    document: true,
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'max-len': [2, 120, 4, { ignoreUrls: true }],
    'no-unused-vars': [1, {
      vars: 'all', args: 'after-used', argsIgnorePattern: '^_|^next$', varsIgnorePattern: '^React$',
    }],
  },
};
