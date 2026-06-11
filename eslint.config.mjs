import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.astro/',
      '.wrangler/',
      'dist/',
      'node_modules/',
      'public/assets/icons/simple-icons/',
      'public/style.css',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  ...astro.configs['flat/jsx-a11y-recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,astro}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['public/**/*.js', 'src/**/*.astro'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: [
      '*.config.{js,mjs,ts}',
      'eslint.config.mjs',
      'astro.config.mjs',
      'tailwind.config.js',
      'scripts/**/*.{js,mjs,cjs,ts}',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier
);
