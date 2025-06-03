module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'standard-with-typescript',
    // 'plugin:jsx-a11y/recommended', // TODO:   Enable a11y rules as warnings.
    'plugin:solid/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',

    '@typescript-eslint/prefer-readonly-parameter-types': 0, // TODO:   Change prefer-readonly-parameter-types to error
    '@typescript-eslint/strict-boolean-expressions': 'warn', // TODO:   Change strict-boolean-expressions to error
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // TODO:   Change no-unnecessary-type-assertion to error

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
  },
  plugins: ['solid', 'jsx-a11y', '@typescript-eslint'],
  settings: {
    'import/parsers': {
      [require.resolve('@typescript-eslint/parser')]: ['.ts', '.tsx', '.d.ts'],
    },
  },
  ignorePatterns: ['node_modules', 'src/sections/datepicker'],
}
