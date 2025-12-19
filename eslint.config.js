import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
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
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        DocumentFragment: 'readonly',
        Window: 'readonly',
        structuredClone: 'readonly',
        EventTarget: 'readonly',
        EventListener: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        PopStateEvent: 'readonly',
        ProgressEvent: 'readonly',
        Document: 'readonly',
        XMLHttpRequestBodyInit: 'readonly',
        URLSearchParams: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        crypto: 'readonly',
        Handlebars: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      'no-console': 'warn',
      'no-empty': 'warn',
      'no-useless-catch': 'off',
      'no-unreachable': 'warn',
      'no-async-promise-executor': 'off',
      'semi': ['warn', 'always'],
    },
  },
];
