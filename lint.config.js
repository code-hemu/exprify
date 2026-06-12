export default {
  '*.{js,mjs}': [
    'node node_modules/eslint/bin/eslint.js --fix',
    'node node_modules/prettier/bin/prettier.cjs --write',
  ],
  '*.{json,md}': ['node node_modules/prettier/bin/prettier.cjs --write'],
};
