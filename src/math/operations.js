const isValidNumberPair = (/** @type {any} */ a, /** @type {any} */ b) =>
  typeof a === typeof b && (typeof a === 'number' || typeof a === 'bigint');

export const mathOperations = Object.freeze({
  power: function (/** @type {number} */ a, /** @type {number} */ b) {
    if (isValidNumberPair(a, b)) {
      return a ** b;
    }
    throw new Error('Invalid types for ^');
  },

  multiply: function (/** @type {number} */ a, /** @type {number} */ b) {
    if (isValidNumberPair(a, b)) {
      return a * b;
    }
    throw new Error('Invalid types for *');
  },

  divide: function (/** @type {number} */ a, /** @type {number} */ b) {
    if (isValidNumberPair(a, b)) {
      if (b === 0) {
        throw new Error('Division by zero');
      }
      return a / b;
    }
    throw new Error('Invalid types for /');
  },

  add: function (/** @type {string} */ a, /** @type {string} */ b) {
    if (isValidNumberPair(a, b)) {
      return a + b;
    }
    if (typeof a === 'string' && typeof b === 'string') {
      return a + b;
    }
    throw new Error('Invalid types for +');
  },

  subtract: function (/** @type {number} */ a, /** @type {number} */ b) {
    if (isValidNumberPair(a, b)) {
      return a - b;
    }
    throw new Error('Invalid types for -');
  },

  modulus: function (/** @type {number} */ a, /** @type {number} */ b) {
    if (isValidNumberPair(a, b)) {
      return a % b;
    }
    throw new Error('Invalid types for %');
  },
});
