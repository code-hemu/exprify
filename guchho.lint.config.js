// guchho.lint.config.mjs
export default {
  include: ['src/**/*.{js,jsx,ts,tsx}'],
  platform: 'browser',
  rules: {
    'no-console': 'error',
    'no-unused-vars': 'warn',
  },
  globals: {
    console: 'readonly',
    __DEV__: "readonly",
  },
}