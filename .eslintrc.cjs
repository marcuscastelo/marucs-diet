module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'standard-with-typescript',
    // 'plugin:jsx-a11y/recommended', // TODO: Enable a11y rules as warnings
    'plugin:solid/recommended'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',

    '@typescript-eslint/prefer-readonly-parameter-types': 0, // TODO: Change prefer-readonly-parameter-types to error
    '@typescript-eslint/strict-boolean-expressions': 'warn', // TODO: Change strict-boolean-expressions to error
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn' // TODO: Change no-unnecessary-type-assertion to error

  },
  plugins: ['solid', 'jsx-a11y']
}
