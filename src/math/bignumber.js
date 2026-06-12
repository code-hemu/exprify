import { ExprDecimal } from '../utils/decimal.js';

/**
 * @param {any} value
 */
export function bigNumber(value) {
  if (ExprDecimal.isDecimal(value)) {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'bigint') {
    return new ExprDecimal(value);
  }
  throw new Error('bignumber() expects a number, string, or bigint');
}

/**
 * @param {unknown} v
 */
export function isBigNumber(v) {
  return ExprDecimal.isDecimal(v);
}

/**
 * @param {ExprDecimal} v
 */
export function formatBigNumber(v) {
  if (!ExprDecimal.isDecimal(v)) {
    return String(v);
  }
  return v.toString();
}
