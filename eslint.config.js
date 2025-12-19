import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.config.js',
      'vite.config.ts',
      'vite.config.js',
      'server.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        Handlebars: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'warn',
      'no-empty': 'warn',
      'no-useless-catch': 'off',
      'no-unreachable': 'warn',
      'no-async-promise-executor': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      'semi': ['warn', 'always'],
    },
  }
);
