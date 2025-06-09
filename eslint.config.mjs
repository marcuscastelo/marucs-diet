/* global process, NodeJS, ApexCharts */
import js from '@eslint/js'
import pluginTs from '@typescript-eslint/eslint-plugin'
import parserTs from '@typescript-eslint/parser'
import pluginA11y from 'eslint-plugin-jsx-a11y'
import pluginPrettier from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginSolid from 'eslint-plugin-solid'
import globals from 'globals'
import eslintPluginImport from 'eslint-plugin-import'
import love from 'eslint-config-love'

/** @type {import('eslint').Linter.Config} */
export default [
  {
    ...love,
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        process: 'readonly',
        NodeJS: 'readonly',
        ApexCharts: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTs,
      solid: pluginSolid,
      prettier: pluginPrettier,
      'jsx-a11y': pluginA11y,
      simpleImportSort,
      import: eslintPluginImport,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginTs.configs['recommended-type-checked'].rules,

      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../*', './*'],
        },
      ],
      'import/no-unresolved': ['error'],

      eqeqeq: ["error", "always"],

      'prettier/prettier': [
        'error',
        {
          printWidth: 80,
          tabWidth: 2,
          singleQuote: true,
          trailingComma: 'all',
          arrowParens: 'always',
          semi: false,
          endOfLine: 'auto',
        },
      ],

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-throw-literal': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'error',

      "require-await": "off",
      "@typescript-eslint/require-await": "off",

      'no-unused-vars': 'off',
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],

      'jsx-a11y/alt-text': [
        'warn',
        {
          elements: ['img'],
          img: ['Image'],
        },
      ],
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',

      ...pluginSolid.configs.recommended.rules,
    },
    settings: {
      'import/parsers': {
        [parserTs]: ['.ts', '.tsx', '.d.ts'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
      },
    },
  },
  {
    files: ['.eslintrc.js', '.eslintrc.cjs', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'script',
      globals: globals.node,
    },
  },
  {
    ignores: [
      'node_modules',
      'src/sections/datepicker',
      '.vercel',
      '.vinxi',
      'dist',
      'build',
      'coverage',
      'public',
      'out',
      '.output',
    ],
  },
]
