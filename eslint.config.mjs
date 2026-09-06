import js from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import importX from 'eslint-plugin-import-x';
import jsxA11yX from 'eslint-plugin-jsx-a11y-x';
import regexp from 'eslint-plugin-regexp';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sourceFiles = ['**/*.{js,mjs,cjs,ts,astro}'];
const typedFiles = ['**/*.ts'];

export default tseslint.config(
  {
    name: 'starrybio/ignores',
    ignores: [
      '.astro/',
      '.mf/',
      '.netlify/',
      '.vercel/',
      '.wrangler/',
      'build/',
      'coverage/',
      'dist/',
      'node_modules/',
      'playwright-report/',
      'public/assets/icons/simple-icons/',
      'test-results/',
    ],
  },
  {
    ...js.configs.recommended,
    name: 'starrybio/javascript',
    files: sourceFiles,
  },
  {
    name: 'starrybio/typescript',
    files: typedFiles,
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ],
    },
  },
  {
    name: 'starrybio/astro-typescript',
    files: ['**/*.astro'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ],
    },
  },
  ...astro.configs['flat/recommended'],
  {
    ...jsxA11yX.configs.recommended,
    name: 'starrybio/astro-accessibility',
    files: ['**/*.astro'],
  },
  {
    ...importX.flatConfigs.recommended,
    name: 'starrybio/imports',
    files: sourceFiles,
    settings: {
      'import-x/core-modules': ['astro:transitions'],
      'import-x/extensions': ['.js', '.mjs', '.cjs', '.ts', '.astro'],
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts'],
        'astro-eslint-parser': ['.astro'],
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: './tsconfig.json',
        }),
      ],
    },
    rules: {
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-cycle': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': 'error',
    },
  },
  {
    ...regexp.configs['flat/recommended'],
    name: 'starrybio/regular-expressions',
    files: sourceFiles,
  },
  {
    name: 'starrybio/modern-javascript',
    files: sourceFiles,
    plugins: {
      unicorn,
    },
    rules: {
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-array-fill-with-reference-type': 'error',
      'unicorn/no-async-promise-finally': 'error',
      'unicorn/no-instanceof-builtins': 'error',
      'unicorn/no-invalid-remove-event-listener': 'error',
      'unicorn/no-multiple-promise-resolver-calls': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-static-only-class': 'error',
      'unicorn/no-thenable': 'error',
      'unicorn/no-unnecessary-await': 'error',
      'unicorn/no-zero-fractions': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/throw-new-error': 'error',
    },
  },
  {
    name: 'starrybio/language-options',
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    name: 'starrybio/browser',
    files: ['public/**/*.js', 'src/scripts/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    name: 'starrybio/node',
    files: ['*.config.{js,mjs,cjs,ts}', 'scripts/**/*.{js,mjs,cjs,ts}', 'tests/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    name: 'starrybio/declarations',
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    name: 'starrybio/astro-type-exceptions',
    files: ['**/*.astro'],
    rules: {
      // Astro's JSX element type intentionally includes `any` for framework compatibility.
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    ...prettier,
    name: 'starrybio/prettier-compatibility',
  }
);
