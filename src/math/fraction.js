const gcd = (/** @type {number} */ a, /** @type {number} */ b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
};

/**
 * @param {any} n
 */
export function fraction(n, d = 1) {
  if (typeof n !== 'number' || typeof d !== 'number') {
    throw new Error('Fraction requires numeric arguments');
  }
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    throw new Error('Fraction requires integer arguments');
  }
  if (d === 0) {
    throw new Error('Fraction denominator cannot be zero');
  }
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

/**
 * @param {any} v
 */
export function isFraction(v) {
  return v && typeof v === 'object' && 'n' in v && 'd' in v && !('re' in v) && !('unit' in v);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {{ d: number; n: number; }} b
 */
export function addFrac(a, b) {
  return fraction(a.n * b.d + b.n * a.d, a.d * b.d);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {{ d: number; n: number; }} b
 */
export function subFrac(a, b) {
  return fraction(a.n * b.d - b.n * a.d, a.d * b.d);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {{ n: number; d: number; }} b
 */
export function mulFrac(a, b) {
  return fraction(a.n * b.n, a.d * b.d);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {{ d: number; n: number; }} b
 */
export function divFrac(a, b) {
  return fraction(a.n * b.d, a.d * b.n);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {any} exp
 */
export function powFrac(a, exp) {
  if (!Number.isInteger(exp) || exp < 0) {
    return null;
  }
  return fraction(a.n ** exp, a.d ** exp);
}

/**
 * @param {{ n: any; }} v
 */
export function numer(v) {
  if (!isFraction(v)) {throw new Error('numer() expects a fraction');}
  return v.n;
}

/**
 * @param {{ d: any; }} v
 */
export function denom(v) {
  if (!isFraction(v)) {throw new Error('denom() expects a fraction');}
  return v.d;
}

/**
 * @param {{ d: number; n: any; }} v
 */
export function formatFraction(v) {
  if (!isFraction(v)) {return String(v);}
  if (v.d === 1) {return String(v.n);}
  return `${v.n}/${v.d}`;
}
