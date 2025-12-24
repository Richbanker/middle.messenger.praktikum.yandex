module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }],
    'no-console': 'warn',
    'no-empty': 'warn',
    'no-useless-catch': 'off',
    'no-unreachable': 'warn',
    'no-async-promise-executor': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    indent: 'off',
    quotes: 'off',
    semi: ['warn', 'always'],
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.js'],
      rules: {
        '@typescript-eslint/no-unused-expressions': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    'vite.config.ts',
    'vite.config.js',
  ],
};

