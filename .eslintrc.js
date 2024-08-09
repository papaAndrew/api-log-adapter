module.exports = {
  extends: '@loopback/eslint-config',
  ignorePatterns: ['src/**/*.test.ts', '**/*.js', 'dist/*'],
  rules: {
    camelcase: 'warn',
    '@typescript-eslint/no-namespace': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
