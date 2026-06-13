'use strict';

/** @param {string | any[]} expr */
function tokenize(expr, context = {}) {
  const tokens = [];
  let current = '';
  let quote = '';

  const operators = ['+', '-', '*', '/', '%', '^', '=', '>', '<', '!', '&', '|'];
  // Two-char operators checked before single-char to avoid ambiguity (e.g., == vs =)
  const multiOps = [
    '==',
    '>=',
    '<=',
    '&&',
    '||',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
    '?.',
    '??',
    '|>',
    '->',
  ];

  const parentheses = '()';
  const comma = ',';
  const semicolon = ';';
  const keywords = ['to', 'in'];

  const units = context.units?.getAllUnitsFlat?.() || [];
  const isIdentifier = (/** @type {string} */ s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s);

  /**
   * @param {any} str
   * @param {number} charIndex
   */
  function getContext(str, charIndex) {
    const words = str.match(/[a-z0-9]+/gi) || [];

    // 2. Identify the current character and the one immediately before it
    const currentChar = str[charIndex] || null;
    const prevChar = charIndex > 0 ? str[charIndex - 1] : null;

    // 3. Find the word that contains the current charIndex
    let start = charIndex;

    while (start > 0 && /[a-z0-9]/i.test(str[start - 1])) {
      start--;
    }

    let end = charIndex;

    while (end < str.length && /[a-z0-9]/i.test(str[end])) {
      end++;
    }

    const currentWord = str.substring(start, end);

    // 4. Find the word that appears before the currentWord in the sequence
    const currentWordIdx = words.indexOf(currentWord);
    const prevWord = currentWordIdx > 0 ? words[currentWordIdx - 1] : null;

    // 5. Find the word that appears after the currentWord
    const nextWord =
      currentWordIdx !== -1 && currentWordIdx < words.length - 1 ? words[currentWordIdx + 1] : null;

    return {
      prevWord: prevWord,
      prevChar: prevChar,
      currentWord: currentWord,
      currentChar: currentChar,
      nextWord: nextWord,
    };
  }

  const isUnaryContext = (
    /** @type {{ type: string; value: any; pos: number; } | { type: string; value: string; pos?: undefined; } | { type: string; value?: undefined; pos?: undefined; } | { type: string; pos: number; value?: undefined; }} */ prev
  ) =>
    !prev ||
    prev.type === 'Operator' ||
    prev.type === 'UnaryOperator' ||
    (prev.type === 'Parenthesis' && prev.value !== ')') ||
    prev.type === 'ArrayStart' ||
    prev.type === 'Semicolon' ||
    prev.type === 'Comma' ||
    prev.type === 'Ternary';

  const flushCurrent = (/** @type {string | null} */ nextChar, /** @type {number} */ index) => {
    if (!current) {
      return;
    }

    // BOOLEAN
    if (/^(true|false)$/i.test(current)) {
      tokens.push({ type: 'Boolean', value: current.toLowerCase() === 'true' });
      current = '';
      return;
    }

    // KEYWORD
    if (keywords.includes(current)) {
      tokens.push({ type: 'Keyword', value: current, pos: index });
      current = '';
      return;
    }

    // BIGINT
    if (/^\d+n$/.test(current)) {
      tokens.push({ type: 'BigInt', value: BigInt(current.slice(0, -1)), pos: index });
      current = '';
      return;
    }

    // HEX
    if (/^0x[0-9a-fA-F]+$/.test(current)) {
      tokens.push({ type: 'Number', value: parseInt(current, 16), pos: index });
      current = '';
      return;
    }

    // BINARY
    if (/^0b[01]+$/.test(current)) {
      tokens.push({ type: 'Number', value: parseInt(current, 2), pos: index });
      current = '';
      return;
    }

    // NUMBER (including scientific)
    if (/^[+-]?(\d+(\.\d+)?|\.\d+)(e[+-]?\d+)?$/i.test(current)) {
      tokens.push({ type: 'Number', value: parseFloat(current), pos: index });
      current = '';
      return;
    }

    // IMAGINARY NUMBER
    if (/^[+-]?(\d+(\.\d+)?|\.\d+)(e[+-]?\d+)?i$/i.test(current)) {
      tokens.push({
        type: 'ImaginaryLiteral',
        value: parseFloat(current.slice(0, -1)),
        pos: index,
      });
      current = '';
      return;
    }

    // IMAGINARY UNIT
    if (/^[+-]?i$/i.test(current)) {
      const sign = current[0] === '-' ? -1 : 1;
      tokens.push({
        type: 'ImaginaryLiteral',
        value: sign,
        pos: index,
      });
      current = '';
      return;
    }

    // NUMBER + UNIT
    const numUnit = current.match(/^([+-]?\d+(\.\d+)?)([a-zA-Z]+)$/);
    if (numUnit) {
      const value = parseFloat(numUnit[1]);
      const unit = numUnit[3];

      tokens.push({
        type: units.includes(unit) ? 'NumberWithUnit' : 'UnknownUnit',
        value,
        unit,
        pos: index,
      });

      current = '';
      return;
    }

    // UNIT
    if (units.includes(current)) {
      const { prevWord } = getContext(expr, index);
      if (nextChar !== '(') {
        if (prevWord) {
          if (!isNaN(parseFloat(prevWord)) || prevWord === 'to' || prevWord === 'in') {
            // console.log("Context for unit detection:", {current, prevWord, nextChar});

            tokens.push({ type: 'Unit', value: current, pos: index });
            current = '';
            return;
          }
        }
      }
    }

    // IDENTIFIER
    if (isIdentifier(current)) {
      if (nextChar === '(') {
        tokens.push({
          type: 'Function',
          name: current,
          pos: index,
        });
      } else {
        tokens.push({
          type: 'Identifier',
          name: current,
          pos: index,
        });
      }

      current = '';
      return;
    }

    throw new Error(`Invalid token "${current}" at index ${index}`);
  };

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    const next = expr[i + 1];

    // comments
    if (char === '/' && next === '/') {
      while (i < expr.length && expr[i] !== '\n') {
        i++;
      }
      continue;
    }

    if (char === '/' && next === '*') {
      i += 2;
      while (i < expr.length && !(expr[i] === '*' && expr[i + 1] === '/')) {
        i++;
      }
      i++;
      continue;
    }

    // string
    if (`"'`.includes(char)) {
      if (!quote) {
        quote = char;
        current += char;
      } else if (quote === char) {
        current += char;
        tokens.push({
          type: 'String',
          value: current.slice(1, -1),
          pos: i,
        });
        current = '';
        quote = '';
      } else {
        current += char;
      }
      continue;
    }

    if (quote) {
      if (char === '\\') {
        current += char + expr[++i];
      } else {
        current += char;
      }
      continue;
    }

    // multi operators
    const twoChar = char + next;
    if (multiOps.includes(twoChar)) {
      flushCurrent(char, i);
      tokens.push({ type: 'Operator', value: twoChar, pos: i });
      i++;
      continue;
    }

    if (char === '?') {
      tokens.push({ type: 'Ternary', value: '?' });
      continue;
    }

    // Colon after '?' is ternary separator; otherwise standalone (range, object key)
    if (char === ':') {
      flushCurrent(char, i);
      const prev = tokens[tokens.length - 1];

      if (prev && prev.type === 'Ternary') {
        tokens.push({ type: 'Ternary', value: ':' });
      } else {
        tokens.push({ type: 'Colon' });
      }
      continue;
    }

    // Three dots form the spread operator (...)
    if (char === '.' && next === '.' && expr[i + 2] === '.') {
      flushCurrent(char, i);
      tokens.push({ type: 'Spread', pos: i });
      i += 2;
      continue;
    }

    // Dot between digits is a decimal separator, not property access
    if (char === '.' && /\d/.test(current) && /\d/.test(next)) {
      current += char;
      continue;
    }

    if (char === '.') {
      flushCurrent(char, i);
      tokens.push({ type: 'Dot', pos: i });
      continue;
    }

    // operators
    if (operators.includes(char)) {
      flushCurrent(char, i);

      const prev = tokens[tokens.length - 1];
      if ((char === '-' || char === '!') && isUnaryContext(prev)) {
        tokens.push({ type: 'UnaryOperator', value: char, pos: i });
      } else {
        tokens.push({ type: 'Operator', value: char, pos: i });
      }
      continue;
    }

    // parenthesis
    if (parentheses.includes(char)) {
      flushCurrent(char, i);
      tokens.push({ type: 'Parenthesis', value: char, pos: i });
      continue;
    }

    // array
    if (char === '[') {
      flushCurrent(char, i);
      tokens.push({ type: 'ArrayStart', pos: i });
      continue;
    }

    if (char === ']') {
      flushCurrent(char, i);
      tokens.push({ type: 'ArrayEnd', pos: i });
      continue;
    }

    // OBJECT START
    if (char === '{') {
      flushCurrent(char, i);
      tokens.push({ type: 'BlockStart', pos: i });
      continue;
    }

    // OBJECT END
    if (char === '}') {
      flushCurrent(char, i);
      tokens.push({ type: 'BlockEnd', pos: i });
      continue;
    }

    // comma
    if (char === comma) {
      flushCurrent(char, i);
      tokens.push({ type: 'Comma', pos: i });
      continue;
    }

    // semicolon
    if (char === semicolon) {
      flushCurrent(char, i);
      tokens.push({ type: 'Semicolon', pos: i });
      continue;
    }

    // space
    if (char === ' ') {
      flushCurrent(next, i);
      continue;
    }

    // build token
    current += char;

    if (i === expr.length - 1) {
      flushCurrent(null, i);
    }
  }

  if (quote) {
    throw new Error('Unclosed string literal');
  }

  // merge number + unit
  const merged = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];

    if (t?.type === 'Number' && next?.type === 'Unit') {
      merged.push({
        type: 'NumberWithUnit',
        value: t.value,
        unit: next.value,
        pos: t.pos,
      });
      i++;
      continue;
    }

    merged.push(t);
  }

  // Insert implicit * between tokens where multiplication is implied (e.g., "2x" -> "2*x", ")(a)" -> ")*(a)")
  const final = [];
  for (let i = 0; i < merged.length; i++) {
    const a = merged[i];
    const b = merged[i + 1];

    final.push(a);

    if (
      a &&
      b &&
      (['Number', 'Identifier'].includes(a.type) ||
        (a.type === 'Parenthesis' && a.value === ')') ||
        a.type === 'ArrayEnd') &&
      (['Identifier', 'Function'].includes(b.type) || (b.type === 'Parenthesis' && b.value === '('))
    ) {
      final.push({ type: 'Operator', value: '*', implicit: true });
    }
  }

  return final;
}

const isDenseMatrixWrapper = (/** @type {any} */ value) =>
  value &&
  typeof value === 'object' &&
  value.exprify === 'DenseMatrix' &&
  'data' in value &&
  'size' in value;

const cloneMatrixData = (/** @type {any[]} */ value) => {
  if (Array.isArray(value)) {
    return value.map(cloneMatrixData);
  }

  return value;
};

const getMatrixSize = (/** @type {any[]} */ data) => {
  if (Array.isArray(data) && data.every(Array.isArray)) {
    return [data.length, data[0]?.length || 0];
  }

  if (Array.isArray(data)) {
    return [data.length];
  }

  throw new Error('Matrix data must be an array');
};

const wrapDenseMatrix = (/** @type {any[][]} */ data) => ({
  exprify: 'DenseMatrix',
  data: cloneMatrixData(data),
  size: getMatrixSize(data),
});

const unwrapDenseMatrix = (/** @type {any} */ value) =>
  isDenseMatrixWrapper(value) ? cloneMatrixData(value.data) : value;

const serializeExprifyValue = (/** @type {any} */ value) => {
  if (isDenseMatrixWrapper(value)) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return JSON.stringify(value, (_, current) => {
      if (isDenseMatrixWrapper(current)) {
        return current;
      }

      return current;
    });
  }

  return value;
};

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
function fraction(n, d = 1) {
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
function isFraction(v) {
  return v && typeof v === 'object' && 'n' in v && 'd' in v && !('re' in v) && !('unit' in v);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {{ d: number; n: number; }} b
 */
function addFrac(a, b) {
  return fraction(a.n * b.d + b.n * a.d, a.d * b.d);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {{ d: number; n: number; }} b
 */
function subFrac(a, b) {
  return fraction(a.n * b.d - b.n * a.d, a.d * b.d);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {{ n: number; d: number; }} b
 */
function mulFrac(a, b) {
  return fraction(a.n * b.n, a.d * b.d);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {{ d: number; n: number; }} b
 */
function divFrac(a, b) {
  return fraction(a.n * b.d, a.d * b.n);
}

/**
 * @param {{ n: number; d: number; }} a
 * @param {any} exp
 */
function powFrac(a, exp) {
  if (!Number.isInteger(exp) || exp < 0) {
    return null;
  }
  return fraction(a.n ** exp, a.d ** exp);
}

/**
 * @param {{ n: any; }} v
 */
function numer(v) {
  if (!isFraction(v)) {
    throw new Error('numer() expects a fraction');
  }
  return v.n;
}

/**
 * @param {{ d: any; }} v
 */
function denom(v) {
  if (!isFraction(v)) {
    throw new Error('denom() expects a fraction');
  }
  return v.d;
}

/**
 * @param {{ d: number; n: any; }} v
 */
function formatFraction(v) {
  if (!isFraction(v)) {
    return String(v);
  }
  if (v.d === 1) {
    return String(v.n);
  }
  return `${v.n}/${v.d}`;
}

const MAX_SAFE_DP = 100;

class ExprDecimal {
  static DP = 20;

  #sign;
  #int;
  #dp;

  constructor(value) {
    if (value instanceof ExprDecimal) {
      this.#sign = value.#sign;
      this.#int = value.#int;
      this.#dp = value.#dp;
      return;
    }

    if (typeof value === 'bigint') {
      this.#sign = value >= 0n ? 1 : -1;
      this.#int = value >= 0n ? value : -value;
      this.#dp = 0;
      return;
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new Error(`Cannot create ExprDecimal from ${value}`);
      }
      value = String(value);
    }

    if (typeof value !== 'string') {
      throw new Error('ExprDecimal expects a number, string, bigint, or ExprDecimal');
    }

    let s = value.trim();
    if (s === '') {
      throw new Error('Cannot create ExprDecimal from empty string');
    }

    this.#sign = 1;
    if (s[0] === '-') {
      this.#sign = -1;
      s = s.slice(1);
    } else if (s[0] === '+') {
      s = s.slice(1);
    }

    let exp = 0;
    const eIdx = s.search(/[eE]/);
    if (eIdx !== -1) {
      exp = parseInt(s.slice(eIdx + 1), 10);
      s = s.slice(0, eIdx);
    }

    const dotIdx = s.indexOf('.');
    if (dotIdx === -1) {
      this.#int = BigInt(s || '0');
      this.#dp = 0;
    } else {
      const intPart = s.slice(0, dotIdx) || '0';
      const fracPart = s.slice(dotIdx + 1);
      const combined = intPart + fracPart;
      this.#int = BigInt(combined || '0');
      this.#dp = fracPart.length;
    }

    this.#dp -= exp;
    if (this.#dp < 0) {
      this.#int *= 10n ** BigInt(-this.#dp);
      this.#dp = 0;
    }

    this.#normalize();
  }

  #normalize() {
    while (this.#dp > 0 && this.#int % 10n === 0n) {
      this.#int /= 10n;
      this.#dp--;
    }
    if (this.#int === 0n) {
      this.#sign = 1;
      this.#dp = 0;
    }
  }

  #align(other) {
    if (this.#dp === other.#dp) {
      return [this.#int * BigInt(this.#sign), other.#int * BigInt(other.#sign), this.#dp];
    }
    if (this.#dp < other.#dp) {
      const factor = 10n ** BigInt(other.#dp - this.#dp);
      return [this.#int * factor * BigInt(this.#sign), other.#int * BigInt(other.#sign), other.#dp];
    }
    const factor = 10n ** BigInt(this.#dp - other.#dp);
    return [this.#int * BigInt(this.#sign), other.#int * factor * BigInt(other.#sign), this.#dp];
  }

  #fromParts(sign, int, dp) {
    const d = new ExprDecimal(0);
    d.#sign = sign;
    d.#int = int < 0n ? -int : int;
    if (int < 0n) {
      d.#sign = -sign;
    }
    d.#dp = dp;
    d.#normalize();
    return d;
  }

  plus(other) {
    other = other instanceof ExprDecimal ? other : new ExprDecimal(other);
    const [a, b, dp] = this.#align(other);
    return this.#fromParts(1, a + b, dp);
  }

  minus(other) {
    other = other instanceof ExprDecimal ? other : new ExprDecimal(other);
    const [a, b, dp] = this.#align(other);
    return this.#fromParts(1, a - b, dp);
  }

  times(other) {
    other = other instanceof ExprDecimal ? other : new ExprDecimal(other);
    const int = this.#int * other.#int;
    const dp = this.#dp + other.#dp;
    return this.#fromParts(this.#sign * other.#sign, int, dp);
  }

  div(other) {
    other = other instanceof ExprDecimal ? other : new ExprDecimal(other);
    if (other.#int === 0n) {
      throw new Error('Division by zero');
    }
    const targetDp = Math.min(ExprDecimal.DP, MAX_SAFE_DP);
    const scale = 10n ** BigInt(targetDp + other.#dp);
    const dividend = this.#int * scale;
    const quotient = dividend / other.#int;
    const sign = this.#sign * other.#sign;
    if (quotient === 0n) {
      return new ExprDecimal(0);
    }
    return this.#fromParts(sign, quotient, targetDp);
  }

  mod(other) {
    other = other instanceof ExprDecimal ? other : new ExprDecimal(other);
    const quotient = this.div(other);
    const truncated = quotient.#fromParts(
      quotient.#sign,
      quotient.#int - (quotient.#int % 10n ** BigInt(quotient.#dp > 0 ? 1 : 0)),
      0
    );
    return this.minus(truncated.times(other));
  }

  pow(other) {
    other = other instanceof ExprDecimal ? other : new ExprDecimal(other);
    if (other.#dp > 0 || other.#sign !== 1) {
      throw new Error('ExprDecimal pow() supports non-negative integer exponents only');
    }
    const exp = Number(other.#int);
    if (exp > 100) {
      throw new Error('ExprDecimal pow() exponent too large');
    }
    let result = new ExprDecimal(1);
    for (let i = 0; i < exp; i++) {
      result = result.times(this);
    }
    return result;
  }

  negated() {
    const d = new ExprDecimal(this);
    d.#sign = -d.#sign;
    if (d.#int === 0n) {
      d.#sign = 1;
    }
    return d;
  }

  eq(other) {
    other = other instanceof ExprDecimal ? other : new ExprDecimal(other);
    const [a, b] = this.#align(other);
    return a === b;
  }

  gt(other) {
    other = other instanceof ExprDecimal ? other : new ExprDecimal(other);
    const [a, b] = this.#align(other);
    return a > b;
  }

  lt(other) {
    other = other instanceof ExprDecimal ? other : new ExprDecimal(other);
    const [a, b] = this.#align(other);
    return a < b;
  }

  gte(other) {
    return this.gt(other) || this.eq(other);
  }

  lte(other) {
    return this.lt(other) || this.eq(other);
  }

  toString() {
    let s = this.#int.toString();
    const edp = this.#dp;

    const toScientific = (intStr, exponent) => {
      const coeffInt = intStr[0];
      const coeffFrac = intStr.slice(1).replace(/0+$/, '');
      let r = coeffInt;
      if (coeffFrac) {
        r += `.${coeffFrac}`;
      }
      r += 'e';
      r += exponent >= 0 ? '+' : '';
      r += exponent;
      return this.#sign === -1 ? `-${r}` : r;
    };

    if (edp === 0) {
      if (s.length > 15) {
        return toScientific(s, s.length - 1);
      }
      return this.#sign === -1 ? `-${s}` : s;
    }

    while (s.length <= edp) {
      s = `0${s}`;
    }
    const dotPos = s.length - edp;
    const intPartRaw = s.slice(0, dotPos);
    const intTrimmed = intPartRaw.replace(/^0+/, '') || '0';
    const fracRaw = s.slice(dotPos);

    if (intTrimmed.length > 15 || (intTrimmed === '0' && fracRaw.replace(/0+$/, '').length > 15)) {
      const normalized = s.replace(/^0+/, '') || '0';
      const leadZeros = s.length - normalized.length;
      return toScientific(normalized, dotPos - leadZeros - 1);
    }

    const intPart = intPartRaw || '0';
    const fracPart = fracRaw.replace(/0+$/, '');
    if (fracPart === '') {
      return this.#sign === -1 ? `-${intPart}` : intPart;
    }
    return `${this.#sign === -1 ? '-' : ''}${intPart}.${fracPart}`;
  }

  toNumber() {
    return Number(this.toString());
  }

  static isDecimal(value) {
    return value instanceof ExprDecimal;
  }
}

/**
 * @param {any} value
 */
function bigNumber(value) {
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
function isBigNumber(v) {
  return ExprDecimal.isDecimal(v);
}

/**
 * @param {ExprDecimal} v
 */
function formatBigNumber(v) {
  if (!ExprDecimal.isDecimal(v)) {
    return String(v);
  }
  return v.toString();
}

/** @param {any } node*/
function evaluateAST(node, context = {}) {
  const vars = context.variables;
  const fns = context.functions;
  const units = context.units;

  const isUnitObj = (/** @type {any} */ v) =>
    v && typeof v === 'object' && 'value' in v && 'unit' in v;
  const isComplex = (/** @type {any} */ v) => v && typeof v === 'object' && 're' in v && 'im' in v;
  const isSliceNode = (/** @type {any} */ v) =>
    v && typeof v === 'object' && v.type === 'SliceExpression';
  const isMatrix = (/** @type {any[]} */ v) =>
    Array.isArray(v) && v.length > 0 && v.every(Array.isArray);
  const isMatrixLike = (/** @type {any} */ v) => isMatrix(v) || isDenseMatrixWrapper(v);

  const normalizeMatrix = (/** @type {any[]} */ value) => {
    value = unwrapDenseMatrix(value);
    if (isMatrix(value)) {
      return value.map((/** @type {any} */ row) => [...row]);
    }
    if (Array.isArray(value)) {
      return [value];
    }
    throw new Error('Expected matrix-compatible value');
  };

  const nodeError = (/** @type {string} */ msg) => {
    const pos = node && node.pos !== undefined ? ` at position ${node.pos}` : '';
    return new Error(`${msg}${pos}`);
  };

  const toOneBasedIndex = (/** @type {unknown} */ value) => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
      throw new Error('Matrix indices must be positive integers');
    }

    return value - 1;
  };

  const resolveSelector = (
    /** @type {{ start: null | undefined; end: null | undefined; }} */ selector,
    /** @type {number} */ contextLength
  ) => {
    if (isSliceNode(selector)) {
      const startValue =
        selector.start === null || selector.start === undefined
          ? 1
          : evaluateAST(selector.start, context);
      const endValue =
        selector.end === null || selector.end === undefined
          ? contextLength
          : evaluateAST(selector.end, context);
      const start = toOneBasedIndex(startValue);
      const end = toOneBasedIndex(endValue);

      if (end < start) {
        return [];
      }

      const result = [];
      for (let index = start; index <= end; index++) {
        result.push(index);
      }
      return result;
    }

    return [toOneBasedIndex(evaluateAST(selector, context))];
  };

  const indexMatrix = (/** @type {any} */ matrix, /** @type {string | any[]} */ selectors) => {
    const target = normalizeMatrix(matrix);

    if (selectors.length === 1) {
      const rowIndexes = resolveSelector(selectors[0], target.length);
      const rows = rowIndexes.map((/** @type {number} */ rowIndex) => {
        if (rowIndex >= target.length) {
          throw new Error('Row index out of range');
        }
        return [...target[rowIndex]];
      });

      return rows.length === 1 ? rows[0] : rows;
    }

    const rowIndexes = resolveSelector(selectors[0], target.length);
    const colIndexes = resolveSelector(selectors[1], target[0]?.length || 0);

    const values = rowIndexes.map((/** @type {number} */ rowIndex) => {
      if (rowIndex >= target.length) {
        throw new Error('Row index out of range');
      }

      return colIndexes.map((/** @type {number} */ colIndex) => {
        if (colIndex >= target[rowIndex].length) {
          throw new Error('Column index out of range');
        }
        return target[rowIndex][colIndex];
      });
    });

    if (rowIndexes.length === 1 && colIndexes.length === 1) {
      return values[0][0];
    }

    if (rowIndexes.length === 1) {
      return values[0];
    }

    if (colIndexes.length === 1) {
      return values.map((/** @type {any[]} */ row) => [row[0]]);
    }

    return values;
  };

  const assignMatrixIndex = (
    /** @type {any[]} */ matrix,
    /** @type {string | any[]} */ selectors,
    /** @type {any} */ value
  ) => {
    const target = isMatrix(matrix)
      ? matrix.map((/** @type {any} */ row) => [...row])
      : Array.isArray(matrix)
        ? [matrix.slice()]
        : [];

    const rowSelector = selectors[0];
    const colSelector = selectors[1];

    if (!rowSelector) {
      throw new Error('Matrix assignment requires at least one index');
    }

    const rowContextLength = Math.max(target.length, 1);
    const rowIndexes = resolveSelector(rowSelector, rowContextLength);

    if (selectors.length === 1) {
      const rowsValue = isMatrix(value) ? value : normalizeMatrix(value);

      if (rowsValue.length !== rowIndexes.length) {
        throw new Error('Assigned row count does not match slice');
      }

      rowIndexes.forEach(
        (/** @type {string | number} */ rowIndex, /** @type {string | number} */ index) => {
          target[rowIndex] = [...rowsValue[index]];
        }
      );

      return {
        updatedMatrix: target,
        selectionResult:
          rowIndexes.length === 1
            ? [target[rowIndexes[0]]]
            : rowIndexes.map((/** @type {string | number} */ rowIndex) => [target[rowIndex]]),
      };
    }

    const maxCols = Math.max(
      ...target.map((/** @type {string | any[]} */ row) => row.length),
      0,
      1
    );
    const colIndexes = resolveSelector(colSelector, maxCols);
    const normalizedValue = normalizeMatrix(value);

    if (normalizedValue.length !== rowIndexes.length) {
      throw new Error('Assigned row count does not match matrix slice');
    }

    normalizedValue.forEach((/** @type {string | any[]} */ row, /** @type {any} */ _rowOffset) => {
      if (row.length !== colIndexes.length) {
        throw new Error('Assigned column count does not match matrix slice');
      }
    });

    rowIndexes.forEach(
      (/** @type {string | number} */ rowIndex, /** @type {string | number} */ rowOffset) => {
        if (!target[rowIndex]) {
          target[rowIndex] = [];
        }

        colIndexes.forEach(
          (/** @type {string | number} */ colIndex, /** @type {string | number} */ colOffset) => {
            target[rowIndex][colIndex] = normalizedValue[rowOffset][colOffset];
          }
        );
      }
    );

    return {
      updatedMatrix: target,
      selectionResult:
        rowIndexes.length === 1
          ? [
              colIndexes.map(
                (/** @type {string | number} */ colIndex) => target[rowIndexes[0]][colIndex]
              ),
            ]
          : rowIndexes.map((/** @type {string | number} */ rowIndex) =>
              colIndexes.map(
                (/** @type {string | number} */ colIndex) => target[rowIndex][colIndex]
              )
            ),
    };
  };

  const isScalar = (/** @type {any} */ v) => typeof v === 'number' || typeof v === 'bigint';

  const multiplyMatrices = (/** @type {any} */ left, /** @type {any} */ right) => {
    if (isScalar(left)) {
      const b = normalizeMatrix(right);
      return b.map((/** @type {any[]} */ row) =>
        row.map((/** @type {number} */ v) => Number(left) * v)
      );
    }
    if (isScalar(right)) {
      const a = normalizeMatrix(left);
      return a.map((/** @type {any[]} */ row) =>
        row.map((/** @type {number} */ v) => v * Number(right))
      );
    }
    const a = normalizeMatrix(left);
    const b = normalizeMatrix(right);

    if (a[0].length !== b.length) {
      throw new Error('Matrix dimensions do not allow multiplication');
    }

    return a.map((/** @type {any[]} */ row) =>
      b[0].map((/** @type {any} */ _, /** @type {string | number} */ colIndex) =>
        row.reduce(
          (
            /** @type {number} */ sum,
            /** @type {number} */ value,
            /** @type {string | number} */ rowIndex
          ) => sum + value * b[rowIndex][colIndex],
          0
        )
      )
    );
  };

  const addMatrices = (/** @type {any} */ left, /** @type {any} */ right) => {
    const a = normalizeMatrix(left);
    const b = normalizeMatrix(right);
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error('Matrix dimensions must match for addition');
    }
    return a.map((/** @type {any[]} */ row, /** @type {string | number} */ i) =>
      row.map((/** @type {any} */ v, /** @type {string | number} */ j) => v + b[i][j])
    );
  };

  const subtractMatrices = (/** @type {any} */ left, /** @type {any} */ right) => {
    const a = normalizeMatrix(left);
    const b = normalizeMatrix(right);
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error('Matrix dimensions must match for subtraction');
    }
    return a.map((/** @type {any[]} */ row, /** @type {string | number} */ i) =>
      row.map((/** @type {number} */ v, /** @type {string | number} */ j) => v - b[i][j])
    );
  };

  const identityMatrix = (/** @type {any} */ n) =>
    Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

  const powerMatrix = (/** @type {any} */ left, /** @type {any} */ right) => {
    const a = normalizeMatrix(left);
    if (a.length !== a[0].length) {
      throw new Error('Matrix power requires a square matrix');
    }
    if (!Number.isInteger(right) || right < 0) {
      throw new Error('Matrix power requires a non-negative integer exponent');
    }
    if (right === 0) {
      return identityMatrix(a.length);
    }
    let result = a;
    for (let i = 1; i < right; i++) {
      result = multiplyMatrices(result, a);
    }
    return result;
  };

  const toComplex = (/** @type {any} */ value) => {
    if (isComplex(value)) {
      return value;
    }
    if (typeof value === 'number') {
      return { re: value, im: 0 };
    }
    throw new Error('Complex arithmetic only supports numbers');
  };

  const fromImaginary = (/** @type {any} */ value) => ({ re: 0, im: value });

  const simplifyComplex = (/** @type {{ re: any; im: any; }} */ value) =>
    value.im === 0 ? value.re : value;

  const createFunctionScope = (/** @type {any[]} */ params, /** @type {any[]} */ args) => {
    const scopedValues = {};

    params.forEach((/** @type {string | number} */ param, /** @type {string | number} */ index) => {
      scopedValues[param] = args[index];
    });

    return scopedValues;
  };

  const evalComplexBinary = (
    /** @type {any} */ operator,
    /** @type {any} */ left,
    /** @type {any} */ right
  ) => {
    const a = toComplex(left);
    const b = toComplex(right);

    switch (operator) {
      case '+':
        return simplifyComplex({ re: a.re + b.re, im: a.im + b.im });
      case '-':
        return simplifyComplex({ re: a.re - b.re, im: a.im - b.im });
      case '*':
        return simplifyComplex({
          re: a.re * b.re - a.im * b.im,
          im: a.re * b.im + a.im * b.re,
        });
      case '/': {
        const denominator = b.re ** 2 + b.im ** 2;

        if (denominator === 0) {
          throw new Error('Division by zero');
        }

        return simplifyComplex({
          re: (a.re * b.re + a.im * b.im) / denominator,
          im: (a.im * b.re - a.re * b.im) / denominator,
        });
      }
      default:
        throw new Error(`Operator ${operator} is not supported for complex numbers`);
    }
  };

  // EVALUATOR
  switch (node.type) {
    case 'Literal':
      return node.value;

    case 'ImaginaryLiteral':
      return fromImaginary(node.value);

    case 'UnitLiteral':
      return { value: node.value, unit: node.unit };

    // VARIABLE
    case 'Identifier':
      return vars.get(node.name);

    // Assignment with optional compound operator (+=, -=, *=, /=): read current, apply, write
    case 'AssignmentExpression': {
      let value;
      if (node.operator !== '=') {
        const current = vars.get(node.left.name);
        const right = evaluateAST(node.right, context);
        const op = node.operator.slice(0, -1);
        switch (op) {
          case '+':
            value = current + right;
            break;
          case '-':
            value = current - right;
            break;
          case '*':
            value = current * right;
            break;
          case '/':
            value = current / right;
            break;
          case '%':
            value = current % right;
            break;
          default:
            throw nodeError(`Unknown compound operator ${node.operator}`);
        }
      } else {
        value = evaluateAST(node.right, context);
      }

      if (node.left.type === 'Identifier') {
        vars.set(node.left.name, value);
        if (node.right.type === 'ArrayExpression') {
          return wrapDenseMatrix(unwrapDenseMatrix(value));
        }
        return value;
      }

      if (node.left.type === 'IndexExpression' && node.left.object.type === 'Identifier') {
        const currentValue = vars.get(node.left.object.name);
        const assigned = assignMatrixIndex(currentValue, node.left.selectors, value);
        vars.set(node.left.object.name, assigned.updatedMatrix);
        return assigned.selectionResult;
      }

      throw nodeError('Invalid assignment target');
    }

    // User-defined function via f(a,b)=expr: closure evaluates body in a new scope with params bound
    case 'FunctionAssignmentExpression': {
      if (node.operator !== '=') {
        throw nodeError(`Operator ${node.operator} is not supported for function definitions`);
      }

      const fn = (/** @type {any} */ ...args) => {
        const scopedContext = context.withScope(createFunctionScope(node.params, args));
        return evaluateAST(node.right, scopedContext);
      };

      fns.register(node.left.name, fn);
      return fn;
    }

    // UNARY
    case 'UnaryExpression': {
      const val = evaluateAST(node.argument, context);

      switch (node.operator) {
        case '-':
          if (isBigNumber(val)) {
            return val.negated();
          }
          if (isComplex(val)) {
            return simplifyComplex({ re: -val.re, im: -val.im });
          }
          return -val;
        case '!':
          return !val;
      }

      throw nodeError(`Unknown unary operator ${node.operator}`);
    }

    // Dispatch order: unit arithmetic -> matrix arithmetic -> complex arithmetic -> scalar arithmetic
    case 'BinaryExpression': {
      const left = evaluateAST(node.left, context);
      const right = evaluateAST(node.right, context);

      // UNIT handling
      if (isUnitObj(left) || isUnitObj(right)) {
        if (!units) {
          throw new Error('Unit system not available');
        }

        return units.compute(node.operator, left, right);
      }

      if (
        isMatrixLike(left) ||
        isMatrixLike(right) ||
        (node.operator === '*' && (Array.isArray(left) || Array.isArray(right)))
      ) {
        switch (node.operator) {
          case '+':
            return addMatrices(left, right);
          case '-':
            return subtractMatrices(left, right);
          case '*':
            return multiplyMatrices(left, right);
          case '^':
            return powerMatrix(left, right);
          default:
            throw nodeError(`Operator ${node.operator} not supported for matrices`);
        }
      }

      if (isFraction(left) || isFraction(right)) {
        const a = isFraction(left) ? left : fraction(left, 1);
        const b = isFraction(right) ? right : fraction(right, 1);
        switch (node.operator) {
          case '+':
            return addFrac(a, b);
          case '-':
            return subFrac(a, b);
          case '*':
            return mulFrac(a, b);
          case '/':
            return divFrac(a, b);
          case '^': {
            const p = powFrac(a, right);
            if (p) {
              return p;
            }
            throw nodeError('Fraction power requires non-negative integer exponent');
          }
          default:
            throw nodeError(`Operator ${node.operator} not supported for fractions`);
        }
      }

      if (isBigNumber(left) || isBigNumber(right)) {
        const a = isBigNumber(left) ? left : bigNumber(left);
        const b = isBigNumber(right) ? right : bigNumber(right);
        switch (node.operator) {
          case '+':
            return a.plus(b);
          case '-':
            return a.minus(b);
          case '*':
            return a.times(b);
          case '/':
            return a.div(b);
          case '%':
            return a.mod(b);
          case '^':
            return a.pow(b);
          case '>':
            return a.gt(b);
          case '<':
            return a.lt(b);
          case '>=':
            return a.gte(b);
          case '<=':
            return a.lte(b);
          case '==':
            return a.eq(b);
          default:
            throw nodeError(`Operator ${node.operator} not supported for BigNumber`);
        }
      }

      if (isComplex(left) || isComplex(right)) {
        return evalComplexBinary(node.operator, left, right);
      }

      switch (node.operator) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          return left / right;
        case '%':
          return left % right;
        case '^':
          return left ** right;

        case '>':
          return left > right;
        case '<':
          return left < right;
        case '>=':
          return left >= right;
        case '<=':
          return left <= right;
        case '==':
          return left === right;
      }

      throw nodeError(`Unknown operator ${node.operator}`);
    }

    // Short-circuit: && returns first falsy, || returns first truthy, ?? returns first non-nullish
    case 'LogicalExpression': {
      const left = evaluateAST(node.left, context);

      if (node.operator === '&&') {
        return left && evaluateAST(node.right, context);
      }

      if (node.operator === '||') {
        return left || evaluateAST(node.right, context);
      }

      if (node.operator === '??') {
        return left ?? evaluateAST(node.right, context);
      }

      throw nodeError(`Unknown logical operator ${node.operator}`);
    }

    // Range [start..end] inclusive: returns array of integers from floor(start) to floor(end)
    case 'RangeExpression': {
      const start = evaluateAST(node.start, context);
      const end = evaluateAST(node.end, context);
      if (typeof start !== 'number' || typeof end !== 'number') {
        throw nodeError('Range requires numeric bounds');
      }
      const result = [];
      for (let i = Math.floor(start); i <= Math.floor(end); i++) {
        result.push(i);
      }
      return result;
    }

    // Lambda: return a callable function evaluating the body with params bound in a new scope
    case 'ArrowFunctionExpression': {
      const fn = (/** @type {any[]} */ ...args) => {
        const scopedContext = context.withScope(createFunctionScope(node.params, args));
        return evaluateAST(node.body, scopedContext);
      };
      return fn;
    }

    // Function call: flatten spread (...array) arguments, then invoke
    case 'CallExpression': {
      const fnName = node.callee.name;
      const fn = fns.get(fnName);

      const rawArgs = node.arguments.map((/** @type {{ type: string; argument: any; }} */ arg) => {
        if (arg.type === 'SpreadElement') {
          const val = evaluateAST(arg.argument, context);
          if (!Array.isArray(val)) {
            throw new Error('Spread operator requires an array');
          }
          return { spread: true, values: val };
        }
        return { spread: false, value: evaluateAST(arg, context) };
      });
      const args = [];
      for (const arg of rawArgs) {
        if (arg.spread) {
          args.push(...arg.values);
        } else {
          args.push(arg.value);
        }
      }

      return fn(...args);
    }

    // Pipeline: left value is passed as first argument to the right function/expression
    case 'PipelineExpression': {
      const leftVal = evaluateAST(node.left, context);

      // right must be function
      if (node.right.type === 'CallExpression') {
        const fnName = node.right.callee.name;
        const fn = fns.get(fnName);

        const args = [
          leftVal,
          ...node.right.arguments.map((/** @type {any} */ arg) => evaluateAST(arg, context)),
        ];

        return fn(...args);
      }

      if (node.right.type === 'Identifier') {
        const fn = fns.get(node.right.name);
        return fn(leftVal);
      }

      throw nodeError('Invalid pipeline target');
    }

    // Unit conversion: value fromUnit -> toUnit
    case 'UnitConversion': {
      const from = evaluateAST(node.from, context);

      if (!isUnitObj(from)) {
        throw nodeError('Left side must be a unit value');
      }

      if (!units) {
        throw nodeError('Unit system not available');
      }

      return units.convert(from.value, from.unit, node.to);
    }

    // ARRAY
    case 'ArrayExpression':
      return node.elements.map((/** @type {any} */ el) => evaluateAST(el, context));

    // Matrix/array indexing: target[selector1, selector2] with 1-based and slice support
    case 'IndexExpression': {
      const target = evaluateAST(node.object, context);
      return indexMatrix(target, node.selectors);
    }

    // OBJECT
    case 'ObjectExpression': {
      const obj = {};
      for (const p of node.properties) {
        obj[p.key] = evaluateAST(p.value, context);
      }
      return obj;
    }

    // Property access: obj.prop; optional chaining (?.) returns undefined if obj is null/undefined
    case 'MemberExpression': {
      const obj = evaluateAST(node.object, context);

      if (node.optional && (obj === null || obj === undefined)) {
        return undefined;
      }

      return obj[node.property.name];
    }

    default:
      throw nodeError(`Unknown AST node type: ${node.type}`);
  }
}

function createContext({ variables, functions, units, evaluate }) {
  if (!variables) {
    throw new Error('Variable store missing');
  }
  if (!functions) {
    throw new Error('Function registry missing');
  }
  if (!units) {
    throw new Error('Units list missing');
  }
  if (!evaluate) {
    throw new Error('evaluate function missing');
  }

  return {
    variables: variables,
    functions: functions,
    units: units,
    evaluate,

    withScope(scope = {}) {
      const tempVars = {
        ...variables.all?.(),
        ...scope,
      };
      return createContext({
        functions: functions,
        evaluate,
        units,
        variables: {
          get: (/** @type {string | number} */ k) => tempVars[k],
          set: (/** @type {string | number} */ k, /** @type {any} */ v) => (tempVars[k] = v),
          all: () => tempVars,
        },
      });
    },
  };
}

const isValidNumberPair = (/** @type {any} */ a, /** @type {any} */ b) =>
  typeof a === typeof b && (typeof a === 'number' || typeof a === 'bigint');

const mathOperations = Object.freeze({
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

function createUnitsStore(initial = {}) {
  let units = { ...initial };

  // Helpers
  function getAllUnitsFlat() {
    const result = new Set();

    for (const type in units) {
      for (const key in units[type]) {
        const u = units[type][key];

        const keyLower = key.toLowerCase();
        result.add(keyLower);

        // Unit name
        if (u.unit) {
          const unitLower = u.unit.toLowerCase();

          // Avoid duplicate like "m" vs "meter"
          if (unitLower !== keyLower) {
            if (unitLower.split(/\s+/).length === 1) {
              result.add(unitLower);
            }
          }
        }

        // Symbol
        if (u.symbol) {
          const symbolLower = u.symbol.toLowerCase();

          // Avoid duplicate with unit name
          if (!u.unit || symbolLower !== u.unit.toLowerCase()) {
            result.add(symbolLower);
          }
        }
      }
    }

    return Array.from(result);
  }

  /**
   * @param {string} input
   */
  function findUnit(input) {
    input = input.toLowerCase();

    for (const type in units) {
      for (const key in units[type]) {
        const u = units[type][key];

        if (
          key.toLowerCase() === input ||
          u.unit?.toLowerCase() === input ||
          u.symbol?.toLowerCase() === input
        ) {
          return { type, key, data: u };
        }
      }
    }

    return null;
  }

  /**
   * @param {number} value
   * @param {any} fromUnit
   * @param {any} toUnit
   */
  function convert(value, fromUnit, toUnit) {
    const from = findUnit(fromUnit);
    const to = findUnit(toUnit);

    if (!from) {
      throw new Error(`Unknown unit: ${fromUnit}`);
    }
    if (!to) {
      throw new Error(`Unknown unit: ${toUnit}`);
    }

    if (from.type !== to.type) {
      throw new Error(
        `Cannot convert ${fromUnit} to ${toUnit} (${to.data.unit || to.key}). ${from.data.unit || from.key} conversion units like ${Object.keys(units[from.type]).join(', ')}`
      );
    }

    const result = value * (from.data.value / to.data.value);

    return { value: result, unit: to.key };
  }

  // Public API
  return {
    // Get all units
    getUnits: () => units,

    setUnits: (/** @type {{}} */ newUnits) => {
      units = { ...newUnits };
    },

    updateType: (/** @type {string | number} */ type, /** @type {any} */ data) => {
      units[type] = { ...units[type], ...data };
    },

    addUnit: (
      /** @type {string | number} */ type,
      /** @type {string | number} */ key,
      /** @type {any} */ unitObj
    ) => {
      if (!units[type]) {
        units[type] = {};
      }
      units[type][key] = unitObj;
    },
    // Unit-aware arithmetic: unify operands to same unit type, then apply operator
    /**
     * @param {string} op
     * @param {{ unit: any; value: any; }} left
     * @param {{ unit: any; value: number; }} right
     */
    compute(op, left, right) {
      const isUnit = (/** @type {any} */ v) =>
        v && typeof v === 'object' && 'value' in v && 'unit' in v;

      const apply = (/** @type {any} */ a, /** @type {any} */ b) => {
        switch (op) {
          case '+':
            return a + b;
          case '-':
            return a - b;
          case '*':
            return a * b;
          case '/':
            return a / b;
          case '%':
            return a % b;
          case '^':
            return Math.pow(a, b);
        }
      };

      // BOTH UNIT
      if (isUnit(left) && isUnit(right)) {
        const from = this.findUnit(right.unit);
        const to = this.findUnit(left.unit);

        if (!from || !to || from.type !== to.type) {
          throw new Error(`Cannot operate on different unit types`);
        }

        // convert right → left unit
        const r = right.value * (from.data.value / to.data.value);

        const result = apply(left.value, r);

        // multiplication/division produce compound units
        if (op === '*') {
          return { value: result, unit: left.unit };
        }

        if (op === '/') {
          return { value: result, unit: left.unit };
        }

        if (op === '^') {
          return { value: result, unit: left.unit };
        }

        return { value: result, unit: left.unit };
      }

      // LEFT UNIT
      if (isUnit(left) && !isUnit(right)) {
        const result = apply(left.value, right);

        return { value: result, unit: left.unit };
      }

      // RIGHT UNIT
      if (!isUnit(left) && isUnit(right)) {
        const result = apply(left, right.value);

        if (op === '/') {
          return { value: result, unit: right.unit };
        }

        return { value: result, unit: right.unit };
      }

      // NORMAL
      return apply(left, right);
    },

    convert,

    // Search helpers
    getAllUnitsFlat,
    findUnit,
  };
}

// @ts-check
const globalUnits = {
  length: {
    m: { value: 1, unit: 'meter', symbol: 'm' },
    cm: { value: 0.01, unit: 'centimeter', symbol: 'cm' },
    mm: { value: 0.001, unit: 'millimeter', symbol: 'mm' },
    km: { value: 1000, unit: 'kilometer', symbol: 'km' },
    um: { value: 0.000001, unit: 'micrometer', symbol: 'um', note: 'also called micron' },
    nm: { value: 0.000000001, unit: 'nanometer', symbol: 'nm' },
    px: { value: 0.000264583, unit: 'pixel', symbol: 'px', note: '96dpi standard' },
    em: { value: 0.000264583 * 16, unit: 'em', symbol: 'em', note: '1em = 16px by default' },
    rem: { value: 0.000264583 * 16, unit: 'rem', symbol: 'rem', note: 'root em = 16px by default' },
    pt: { value: 0.000352778, unit: 'point', symbol: 'pt', note: '1pt = 1/72 inch' },
    pica: { value: 0.00423333, unit: 'pica', symbol: 'pc', note: '1pc = 12pt' },
    inch: { value: 0.0254, unit: 'inch', symbol: 'in' },
    ft: { value: 0.3048, unit: 'foot', symbol: 'ft' },
    yd: { value: 0.9144, unit: 'yard', symbol: 'yd' },
    mi: { value: 1609.344, unit: 'mile', symbol: 'mi' },
    thou: { value: 0.0000254, unit: 'mil', symbol: 'thou', note: 'thousandth of an inch' },
    furlong: { value: 201.168, unit: 'furlong', symbol: 'fur', note: '220 yards' },
    nmi: { value: 1852, unit: 'nautical mile', symbol: 'nmi' },
    fathom: { value: 1.8288, unit: 'fathom', symbol: 'fathom' },
    au: { value: 1.496e11, unit: 'astronomical unit', symbol: 'AU' },
    ly: { value: 9.4607e15, unit: 'light year', symbol: 'ly' },
    pc: { value: 3.0857e16, unit: 'parsec', symbol: 'pc' },
  },

  // Weight / Mass
  weight: {
    mg: { value: 1e-6, unit: 'milligram', symbol: 'mg' },
    g: { value: 0.001, unit: 'gram', symbol: 'g' },
    kg: { value: 1, unit: 'kilogram', symbol: 'kg' },
    t: { value: 1000, unit: 'tonne', symbol: 't', note: 'metric ton' },
    lb: { value: 0.453592, unit: 'pound', symbol: 'lb' },
    oz: { value: 0.0283495, unit: 'ounce', symbol: 'oz' },
    stone: { value: 6.35029, unit: 'stone', symbol: 'st', note: '1 stone = 14 lb' },
  },

  // Time
  time: {
    s: { value: 1, unit: 'second', symbol: 's' },
    min: { value: 60, unit: 'minute', symbol: 'min' },
    h: { value: 3600, unit: 'hour', symbol: 'h' },
    day: { value: 86400, unit: 'day', symbol: 'd' },
    week: { value: 604800, unit: 'week', symbol: 'wk' },
    month: { value: 2629800, unit: 'month', symbol: 'mo', note: 'average month = 30.44 days' },
    year: { value: 31557600, unit: 'year', symbol: 'yr', note: 'average year = 365.25 days' },
  },

  // Voltage
  voltage: {
    V: { value: 1, unit: 'volt', symbol: 'V' },
    mV: { value: 0.001, unit: 'millivolt', symbol: 'mV' },
    kV: { value: 1000, unit: 'kilovolt', symbol: 'kV' },
    MV: { value: 1e6, unit: 'megavolt', symbol: 'MV' },
    GV: { value: 1e9, unit: 'gigavolt', symbol: 'GV' },
    statV: { value: 299.792458, unit: 'statvolt', symbol: 'statV', note: 'CGS unit' },
    abV: { value: 1e-8, unit: 'abvolt', symbol: 'abV', note: 'CGS electromagnetic unit' },
  },

  // Frequency
  frequency: {
    Hz: { value: 1, unit: 'hertz', symbol: 'Hz', note: '1 cycle per second' },
    kHz: { value: 1e3, unit: 'kilohertz', symbol: 'kHz' },
    MHz: { value: 1e6, unit: 'megahertz', symbol: 'MHz' },
    GHz: { value: 1e9, unit: 'gigahertz', symbol: 'GHz' },
    THz: { value: 1e12, unit: 'terahertz', symbol: 'THz' },
  },

  // Power
  power: {
    W: { value: 1, unit: 'watt', symbol: 'W', note: '1 joule per second' },
    mW: { value: 0.001, unit: 'milliwatt', symbol: 'mW' },
    kW: { value: 1000, unit: 'kilowatt', symbol: 'kW' },
    MW: { value: 1e6, unit: 'megawatt', symbol: 'MW' },
    GW: { value: 1e9, unit: 'gigawatt', symbol: 'GW' },
    HP: { value: 745.7, unit: 'horsepower', symbol: 'HP', note: 'mechanical HP = 745.7 W' },
    'kcal/h': { value: 1.163, unit: 'kilocalorie per hour', symbol: 'kcal/h', note: '= 1.163 W' },
    'BTU/h': { value: 0.29307107, unit: 'BTU per hour', symbol: 'BTU/h', note: '= 0.293 W' },
  },

  // Sound
  sound: {
    dB: { value: 1, unit: 'decibel', symbol: 'dB', note: 'logarithmic unit of sound intensity' },
    dBA: {
      value: 1,
      unit: 'A-weighted decibel',
      symbol: 'dBA',
      note: 'Adjusted for human hearing',
    },
    dBC: {
      value: 1,
      unit: 'C-weighted decibel',
      symbol: 'dBC',
      note: 'Flat weighting for high-level sounds',
    },
  },

  // Temperature
  temperature: {
    K: { value: 1, unit: 'kelvin', symbol: 'K' },
    C: { value: 1, unit: 'Celsius', symbol: '°C', note: '°C → K: add 273.15' },
    F: { value: 1, unit: 'Fahrenheit', symbol: '°F', note: '°F → K: (°F - 32) * 5/9 + 273.15' },
  },

  // Pressure
  pressure: {
    Pa: { value: 1, unit: 'pascal', symbol: 'Pa' },
    kPa: { value: 1000, unit: 'kilopascal', symbol: 'kPa' },
    MPa: { value: 1e6, unit: 'megapascal', symbol: 'MPa' },
    bar: { value: 1e5, unit: 'bar', symbol: 'bar' },
    atm: { value: 101325, unit: 'atmosphere', symbol: 'atm' },
    psi: { value: 6894.757, unit: 'pound per square inch', symbol: 'psi' },
    mmHg: { value: 133.322, unit: 'millimeter of mercury', symbol: 'mmHg' },
  },

  // Energy
  energy: {
    J: { value: 1, unit: 'joule', symbol: 'J' },
    kJ: { value: 1000, unit: 'kilojoule', symbol: 'kJ' },
    cal: { value: 4.184, unit: 'calorie', symbol: 'cal' },
    kcal: { value: 4184, unit: 'kilocalorie', symbol: 'kcal' },
    eV: { value: 1.60218e-19, unit: 'electronvolt', symbol: 'eV' },
    BTU: { value: 1055.06, unit: 'BTU', symbol: 'BTU' },
  },

  // Force
  force: {
    N: { value: 1, unit: 'newton', symbol: 'N' },
    kN: { value: 1000, unit: 'kilonewton', symbol: 'kN' },
    lbf: { value: 4.44822, unit: 'pound-force', symbol: 'lbf' },
    kgf: { value: 9.80665, unit: 'kilogram-force', symbol: 'kgf' },
    dyne: { value: 1e-5, unit: 'dyne', symbol: 'dyn' },
  },

  // Area
  area: {
    m2: { value: 1, unit: 'square meter', symbol: 'm²' },
    cm2: { value: 0.0001, unit: 'square centimeter', symbol: 'cm²' },
    km2: { value: 1e6, unit: 'square kilometer', symbol: 'km²' },
    acre: { value: 4046.856, unit: 'acre', symbol: 'acre' },
    hectare: { value: 10000, unit: 'hectare', symbol: 'ha' },
    ft2: { value: 0.092903, unit: 'square foot', symbol: 'ft²' },
    yd2: { value: 0.836127, unit: 'square yard', symbol: 'yd²' },
  },

  // Volume
  volume: {
    m3: { value: 1, unit: 'cubic meter', symbol: 'm³' },
    L: { value: 0.001, unit: 'liter', symbol: 'L' },
    mL: { value: 1e-6, unit: 'milliliter', symbol: 'mL' },
    gallon: { value: 0.00378541, unit: 'US gallon', symbol: 'gal' },
    pint: { value: 0.000473176, unit: 'US pint', symbol: 'pt' },
    floz: { value: 2.9574e-5, unit: 'US fluid ounce', symbol: 'fl oz' },
  },

  // Electrical Current
  current: {
    A: { value: 1, unit: 'ampere', symbol: 'A' },
    mA: { value: 0.001, unit: 'milliampere', symbol: 'mA' },
    uA: { value: 0.000001, unit: 'microampere', symbol: 'uA' },
    kA: { value: 1000, unit: 'kiloampere', symbol: 'kA' },
  },

  // Resistance / Conductance
  resistance: {
    ohm: { value: 1, unit: 'ohm' },
    kohm: { value: 1000, unit: 'kiloohm' },
    megaohm: { value: 1e6, unit: 'megaohm' },
    S: { value: 1, unit: 'siemens', symbol: 'S', note: 'conductance' },
  },

  // Capacitance / Inductance
  capacitance: {
    F: { value: 1, unit: 'farad', symbol: 'F' },
    mF: { value: 0.001, unit: 'millifarad' },
    uF: { value: 0.000001, unit: 'microfarad' },
  },
  inductance: {
    H: { value: 1, unit: 'henry', symbol: 'H' },
    mH: { value: 0.001, unit: 'millihenry', symbol: 'mH' },
    uH: { value: 0.000001, unit: 'microhenry', symbol: 'uH' },
  },

  // Luminous Intensity / Illuminance
  light: {
    cd: { value: 1, unit: 'candela', symbol: 'cd' },
    lm: { value: 1, unit: 'lumen', symbol: 'lm' },
    lx: { value: 1, unit: 'lux', symbol: 'lx' },
  },

  // Data / Digital Storage
  data: {
    bit: { value: 1, unit: 'bit', symbol: 'bit' },
    B: { value: 8, unit: 'byte', symbol: 'B' },
    KB: { value: 8e3, unit: 'kilobyte', symbol: 'KB' },
    MB: { value: 8e6, unit: 'megabyte', symbol: 'MB' },
    GB: { value: 8e9, unit: 'gigabyte', symbol: 'GB' },
    TB: { value: 8e12, unit: 'terabyte', symbol: 'TB' },
  },

  // Angle
  angle: {
    deg: { value: 1, unit: 'degree', symbol: '°' },
    rad: { value: 57.2958, unit: 'radian', symbol: 'rad', note: '1 rad = 57.2958°' },
    grad: { value: 0.9, unit: 'grad', symbol: 'grad', note: '1 grad = 0.9°' },
  },
  radiation: {
    Gy: { value: 1, unit: 'gray', symbol: 'Gy', note: 'Absorbed dose: 1 Gy = 1 J/kg' },
    mGy: { value: 0.001, unit: 'milligray', symbol: 'mGy' },
    rad: { value: 0.01, unit: 'rad', symbol: 'rad', note: '1 rad = 0.01 Gy' },

    // Dose Equivalent
    Sv: { value: 1, unit: 'sievert', symbol: 'Sv', note: 'Biological effect dose equivalent' },
    mSv: { value: 0.001, unit: 'millisievert', symbol: 'mSv' },
    rem: { value: 0.01, unit: 'rem', symbol: 'rem', note: '1 rem = 0.01 Sv' },

    // Radioactivity
    Bq: { value: 1, unit: 'becquerel', symbol: 'Bq', note: '1 decay per second' },
    kBq: { value: 1e3, unit: 'kilobecquerel', symbol: 'kBq' },
    MBq: { value: 1e6, unit: 'megabecquerel', symbol: 'MBq' },
    GBq: { value: 1e9, unit: 'gigabecquerel', symbol: 'GBq' },
    Ci: { value: 3.7e10, unit: 'curie', symbol: 'Ci', note: '1 Ci = 3.7 x 10¹⁰ decays per second' },
    mCi: { value: 3.7e7, unit: 'millicurie', symbol: 'mCi' },
  },
};

const validVarName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

function createVarStore(initial = {}) {
  let store = Object.create(null);

  for (const key in initial) {
    store[key] = initial[key];
  }

  return {
    /**
     * @param {string} name
     * @param {number | undefined} value
     */
    set(name, value, { override = true } = {}) {
      if (typeof name !== 'string' || !name) {
        throw new Error('Variable name must be a non-empty string');
      }

      if (!validVarName.test(name)) {
        throw new Error(`Variable Name Error: '${name}' is not a valid variable name`);
      }

      // Value validation
      if (value === undefined) {
        throw new Error(`Variable Value Error: '${name}' cannot be undefined`);
      }

      // Prevent overwrite (optional)
      if (!override && name in store) {
        throw new Error(`Variable '${name}' already exists`);
      }

      store[name] = value;
    },

    /**
     * @param {string | number} name
     */
    get(name) {
      return store[name];
    },

    /**
     * @param {any} name
     */
    has(name) {
      return Object.prototype.hasOwnProperty.call(store, name);
    },

    /**
     * @param {string | number} name
     */
    remove(name) {
      delete store[name];
    },

    all() {
      return { ...store };
    },

    clear() {
      store = Object.create(null);
    },

    merge(obj = {}) {
      for (const key in obj) {
        store[key] = obj[key];
      }
    },

    clone() {
      return createVarStore(store);
    },
  };
}

function createFunctionRegistry(initial = {}) {
  // Object.create(null) avoids prototype pollution (no inherited properties)
  const store = Object.create(null);

  for (const key in initial) {
    if (typeof initial[key] === 'function') {
      store[key] = initial[key];
    }
  }

  return {
    getAllFunctionsName() {
      return Object.keys(store);
    },

    /**
     * @param {string} name
     * @param {any} fn
     */
    register(name, fn) {
      if (typeof name !== 'string' || !name) {
        throw new Error('Formula name must be a non-empty string');
      }

      if (typeof fn !== 'function') {
        throw new Error(`Formula "${name}" must be callable`);
      }

      store[name] = fn;
    },

    /**
     * @param {string} name
     */
    get(name) {
      return store[name];
    },

    /**
     * @param {any} name
     */
    has(name) {
      return Object.prototype.hasOwnProperty.call(store, name);
    },

    /**
     * @param {string | number} name
     */
    remove(name) {
      delete store[name];
    },

    all() {
      return { ...store };
    },

    clear() {
      for (const key in store) {
        delete store[key];
      }
    },

    extend(formulas = {}) {
      for (const name in formulas) {
        if (typeof formulas[name] === 'function') {
          store[name] = formulas[name];
        }
      }
    },

    clone() {
      return createFunctionRegistry(store);
    },
  };
}

/** @param {any[]} matrix */
function validateSquareMatrix(matrix) {
  matrix = unwrapDenseMatrix(matrix);
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error('det() expects a non-empty matrix');
  }

  if (!matrix.every(Array.isArray)) {
    throw new Error('det() expects a 2D matrix');
  }

  const size = matrix.length;
  if (!matrix.every((row) => row.length === size)) {
    throw new Error('det() expects a square matrix');
  }

  for (const row of matrix) {
    for (const value of row) {
      if (typeof value !== 'number' && typeof value !== 'bigint') {
        throw new Error('det() matrix values must be numeric');
      }
    }
  }
}

/** @param {any[]} matrix */
function determinant(matrix) {
  matrix = unwrapDenseMatrix(matrix);
  validateSquareMatrix(matrix);

  if (matrix.length === 1) {
    return matrix[0][0];
  }

  if (matrix.length === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  // Laplace expansion: sum of (-1)^col * M[0][col] * det(minor)
  return matrix[0].reduce(
    (/** @type {number} */ sum, /** @type {number} */ value, /** @type {number} */ columnIndex) => {
      const minor = matrix
        .slice(1)
        .map((row) =>
          row.filter((/** @type {any} */ _, /** @type {number} */ index) => index !== columnIndex)
        );
      const cofactor = columnIndex % 2 === 0 ? value : -value;
      return sum + cofactor * determinant(minor);
    },
    0
  );
}

/** @param {any} value */
function asMatrixData(value) {
  const data = unwrapDenseMatrix(value);
  if (!Array.isArray(data)) {
    throw new Error('Expected matrix data');
  }
  return data;
}

/**
 * @param {any[]} coefficients
 * @param {number[]} constants
 */
function solveLinearSystem(coefficients, constants) {
  const n = coefficients.length;
  const augmented = coefficients.map((row, rowIndex) => [...row, constants[rowIndex]]);

  for (let pivot = 0; pivot < n; pivot++) {
    let maxRow = pivot;
    let maxValue = Math.abs(augmented[pivot][pivot]);

    for (let row = pivot + 1; row < n; row++) {
      const current = Math.abs(augmented[row][pivot]);
      if (current > maxValue) {
        maxValue = current;
        maxRow = row;
      }
    }

    if (maxValue === 0) {
      throw new Error('Linear system is singular');
    }

    if (maxRow !== pivot) {
      [augmented[pivot], augmented[maxRow]] = [augmented[maxRow], augmented[pivot]];
    }

    const pivotValue = augmented[pivot][pivot];
    for (let col = pivot; col <= n; col++) {
      augmented[pivot][col] /= pivotValue;
    }

    for (let row = 0; row < n; row++) {
      if (row === pivot) {
        continue;
      }
      const factor = augmented[row][pivot];
      for (let col = pivot; col <= n; col++) {
        augmented[row][col] -= factor * augmented[pivot][col];
      }
    }
  }

  return augmented.map((row) => row[n]);
}

/** @param {any} input */
function lupDecomposition(input) {
  const matrix = asMatrixData(input).map((row) => [...row]);
  validateSquareMatrix(matrix);

  const n = matrix.length;
  const permutation = Array.from({ length: n }, (_, index) => index);

  for (let pivot = 0; pivot < n; pivot++) {
    let maxRow = pivot;
    let maxValue = Math.abs(matrix[pivot][pivot]);

    for (let row = pivot + 1; row < n; row++) {
      const current = Math.abs(matrix[row][pivot]);
      if (current > maxValue) {
        maxValue = current;
        maxRow = row;
      }
    }

    if (maxValue === 0) {
      throw new Error('Matrix is singular');
    }

    if (maxRow !== pivot) {
      [matrix[pivot], matrix[maxRow]] = [matrix[maxRow], matrix[pivot]];
      [permutation[pivot], permutation[maxRow]] = [permutation[maxRow], permutation[pivot]];
    }

    for (let row = pivot + 1; row < n; row++) {
      matrix[row][pivot] /= matrix[pivot][pivot];
      for (let col = pivot + 1; col < n; col++) {
        matrix[row][col] -= matrix[row][pivot] * matrix[pivot][col];
      }
    }
  }

  const L = matrix.map((row, rowIndex) =>
    row.map((value, colIndex) => {
      if (rowIndex === colIndex) {
        return 1;
      }
      if (rowIndex > colIndex) {
        return value;
      }
      return 0;
    })
  );

  const U = matrix.map((row, rowIndex) =>
    row.map((value, colIndex) => (rowIndex <= colIndex ? value : 0))
  );

  return {
    L: wrapDenseMatrix(L),
    U: wrapDenseMatrix(U),
    p: permutation,
  };
}

/**
 * @param {any} aInput
 * @param {{ exprify: string; data: any; size: number[]; }} bInput
 */
function linearSolve(aInput, bInput) {
  const { L, U, p } = lupDecomposition(aInput);
  const a = asMatrixData(aInput);
  const bData = asMatrixData(bInput);
  const bVector = Array.isArray(bData[0]) ? bData.map((row) => row[0]) : bData;

  if (a.length !== bVector.length) {
    throw new Error('Right-hand side dimension mismatch');
  }

  const permutedB = p.map((index) => bVector[index]);
  const y = new Array(a.length).fill(0);

  for (let row = 0; row < a.length; row++) {
    y[row] = permutedB[row];
    for (let col = 0; col < row; col++) {
      y[row] -= L.data[row][col] * y[col];
    }
  }

  const x = new Array(a.length).fill(0);
  for (let row = a.length - 1; row >= 0; row--) {
    x[row] = y[row];
    for (let col = row + 1; col < a.length; col++) {
      x[row] -= U.data[row][col] * x[col];
    }
    x[row] /= U.data[row][row];
  }

  return wrapDenseMatrix(x.map((value) => [value]));
}

/**
 * @param {any} aInput
 * @param {any} qInput
 */
function solveLyapunov(aInput, qInput) {
  const A = asMatrixData(aInput).map((row) => [...row]);
  const Q = asMatrixData(qInput).map((row) => [...row]);
  validateSquareMatrix(A);
  validateSquareMatrix(Q);

  const n = A.length;
  if (Q.length !== n) {
    throw new Error('A and Q must have the same dimensions');
  }

  const coefficients = [];
  const constants = [];

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const equation = new Array(n * n).fill(0);

      for (let k = 0; k < n; k++) {
        equation[k * n + col] += A[row][k];
        equation[row * n + k] += A[col][k];
      }

      coefficients.push(equation);
      constants.push(-Q[row][col]);
    }
  }

  const solution = solveLinearSystem(coefficients, constants);
  const X = [];

  for (let row = 0; row < n; row++) {
    X.push(solution.slice(row * n, (row + 1) * n));
  }

  return wrapDenseMatrix(X);
}

/**
 * @param {any[]} coefficients
 * @param {number} x
 */
function evaluatePolynomial(coefficients, x) {
  return coefficients.reduce((sum, coefficient, index) => sum + coefficient * x ** index, 0);
}

/**
 * @param {any[]} coefficients
 * @param {number} root
 */
function syntheticDivide(coefficients, root) {
  const descending = [...coefficients].reverse();
  const quotient = [descending[0]];

  for (let index = 1; index < descending.length - 1; index++) {
    quotient.push(descending[index] + quotient[index - 1] * root);
  }

  const remainder = descending[descending.length - 1] + quotient[quotient.length - 1] * root;
  return {
    quotient: quotient.reverse(),
    remainder,
  };
}

/**
 * @param {any[]} coefficients
 */
function solveQuadratic(coefficients) {
  const [c, b, a] = coefficients;
  const discriminant = b ** 2 - 4 * a * c;
  if (discriminant < 0) {
    throw new Error('Only real roots are supported');
  }

  const sqrtDisc = Math.sqrt(discriminant);
  return [(-b + sqrtDisc) / (2 * a), (-b - sqrtDisc) / (2 * a)];
}

/**
 * @param {any[]} coefficients
 */
function polynomialRoots(...coefficients) {
  while (coefficients.length > 1 && coefficients[coefficients.length - 1] === 0) {
    coefficients.pop();
  }

  const degree = coefficients.length - 1;
  if (degree < 1) {
    throw new Error('polynomialRoot() expects at least a linear polynomial');
  }

  if (degree === 1) {
    const [b, a] = coefficients;
    return [-b / a];
  }

  if (degree === 2) {
    return solveQuadratic(coefficients);
  }

  // Rational root theorem: possible roots are divisors of the constant term
  if (degree === 3) {
    const constant = coefficients[0];
    const candidates = [];
    const limit = Math.abs(constant);

    for (let divisor = 1; divisor <= Math.max(1, limit); divisor++) {
      if (limit % divisor === 0) {
        candidates.push(divisor, -divisor);
      }
    }

    for (const candidate of candidates) {
      if (evaluatePolynomial(coefficients, candidate) === 0) {
        const reduced = syntheticDivide(coefficients, candidate);
        const remainingRoots = solveQuadratic(reduced.quotient);
        return [candidate, ...remainingRoots];
      }
    }
  }

  throw new Error('polynomialRoot() currently supports degree up to 3');
}

/**
 * @param {any[]} a
 * @param {any[]} b
 */
function dotProduct(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

/**
 * @param {any[]} vector
 */
function vectorNorm(vector) {
  return Math.sqrt(dotProduct(vector, vector));
}

/**
 * @param {any[]} vector
 * @param {number} scalar
 */
function scaleVector(vector, scalar) {
  return vector.map((value) => value * scalar);
}

/**
 * @param {any} a
 * @param {any} b
 */
function subtractVectors(a, b) {
  return a.map(
    (/** @type {number} */ value, /** @type {string | number} */ index) => value - b[index]
  );
}

/**
 * @param {any[]} matrix
 */
function transpose(matrix) {
  return matrix[0].map((/** @type {any} */ _, /** @type {string | number} */ colIndex) =>
    matrix.map((row) => row[colIndex])
  );
}

/**
 * @param {any} input
 */
function qrDecomposition(input) {
  const A = asMatrixData(input).map((row) => [...row]);
  if (!A.length || !A.every((row) => row.length === A[0].length)) {
    throw new Error('qr() expects a rectangular matrix');
  }

  const rowCount = A.length;
  const colCount = A[0].length;
  const columns = transpose(A);
  const qColumns = [];

  for (let col = 0; col < colCount; col++) {
    let vector = [...columns[col]];

    for (let existing = 0; existing < qColumns.length; existing++) {
      const projection = dotProduct(qColumns[existing], columns[col]);
      vector = subtractVectors(vector, scaleVector(qColumns[existing], projection));
    }

    const norm = vectorNorm(vector);
    if (norm === 0) {
      throw new Error('qr() requires linearly independent columns');
    }

    qColumns.push(scaleVector(vector, 1 / norm));
  }

  for (let basisIndex = 0; qColumns.length < rowCount && basisIndex < rowCount; basisIndex++) {
    let candidate = Array.from({ length: rowCount }, (_, index) => (index === basisIndex ? 1 : 0));

    for (const column of qColumns) {
      const projection = dotProduct(column, candidate);
      candidate = subtractVectors(candidate, scaleVector(column, projection));
    }

    const norm = vectorNorm(candidate);
    if (norm > 1e-10) {
      qColumns.push(scaleVector(candidate, 1 / norm));
    }
  }

  const Q = Array.from({ length: rowCount }, (_, rowIndex) =>
    qColumns.map((column) => column[rowIndex])
  );

  const fullR = Array.from({ length: rowCount }, () => Array(colCount).fill(0));
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      fullR[row][col] = dotProduct(qColumns[row], columns[col]);
    }
  }

  return {
    Q: wrapDenseMatrix(Q),
    R: wrapDenseMatrix(fullR),
  };
}

/**
 * @param {string} expression
 */
function splitTerms(expression) {
  const normalized = expression.replace(/\s+/g, '');
  if (!normalized) {
    return [];
  }

  return normalized.replace(/-/g, '+-').split('+').filter(Boolean);
}

/**
 * @param {string} expression
 * @param {string} variable
 */
function parsePolynomial(expression, variable) {
  const terms = splitTerms(expression);
  const coefficients = new Map();

  for (const term of terms) {
    if (term.includes(variable)) {
      const [rawCoeff, rawPower] = term.split(variable);
      let coefficient;

      if (rawCoeff === '' || rawCoeff === '+') {
        coefficient = 1;
      } else if (rawCoeff === '-') {
        coefficient = -1;
      } else {
        const cleaned = rawCoeff.endsWith('*') ? rawCoeff.slice(0, -1) : rawCoeff;
        coefficient = Number(cleaned);
      }

      if (!Number.isFinite(coefficient)) {
        throw new Error('Unsupported algebra term');
      }

      let power = 1;
      if (rawPower) {
        if (!rawPower.startsWith('^')) {
          throw new Error('Unsupported algebra term');
        }

        power = Number(rawPower.slice(1));
      }

      if (!Number.isInteger(power) || power < 0) {
        throw new Error('Only non-negative integer powers are supported');
      }

      coefficients.set(power, (coefficients.get(power) || 0) + coefficient);
    } else {
      const constant = Number(term);
      if (!Number.isFinite(constant)) {
        throw new Error('Unsupported algebra term');
      }
      coefficients.set(0, (coefficients.get(0) || 0) + constant);
    }
  }

  return coefficients;
}

/**
 * @param {any[] | Map<any, any>} coefficients
 * @param {string} variable
 */
function formatPolynomial(coefficients, variable) {
  const ordered = [...coefficients.entries()]
    .filter(([, coefficient]) => coefficient !== 0)
    .sort((a, b) => b[0] - a[0]);

  if (!ordered.length) {
    return '0';
  }

  return ordered
    .map(([power, coefficient], index) => {
      const negative = coefficient < 0;
      const absCoeff = Math.abs(coefficient);
      let body;

      if (power === 0) {
        body = `${absCoeff}`;
      } else if (power === 1) {
        body = absCoeff === 1 ? variable : `${absCoeff} * ${variable}`;
      } else {
        body = absCoeff === 1 ? `${variable}^${power}` : `${absCoeff} * ${variable}^${power}`;
      }

      if (index === 0) {
        return negative ? `-${body}` : body;
      }

      return negative ? `- ${body}` : `+ ${body}`;
    })
    .join(' ');
}

/**
 * @param {string} expression
 */
function simplifyExpression(expression) {
  const compact = expression.replace(/\s+/g, '');
  const variableMatch = compact.match(/[a-zA-Z]+/);
  const variable = variableMatch?.[0] || 'x';
  const coefficients = parsePolynomial(expression, variable);
  return formatPolynomial(coefficients, variable);
}

/**
 * @param {string} expression
 * @param {string} variable
 */
function derivativeExpression(expression, variable) {
  const coefficients = parsePolynomial(expression, variable);
  const derived = new Map();

  for (const [power, coefficient] of coefficients.entries()) {
    if (power === 0) {
      continue;
    }
    derived.set(power - 1, (derived.get(power - 1) || 0) + coefficient * power);
  }

  return formatPolynomial(derived, variable);
}

/**
 * @param {number} a
 * @param {number} b
 */
function _gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * @param {any} n
 */
function _gamma(n) {
  if (n === 0) {
    throw new Error('gamma(0) is undefined');
  }
  if (Number.isInteger(n) && n < 0) {
    throw new Error('gamma() undefined for negative integers');
  }
  if (Number.isInteger(n) && n > 0) {
    let r = 1;
    for (let i = 2; i < n; i++) {
      r *= i;
    }
    return r;
  }
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.6150291621406, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  // Euler's reflection formula: Gamma(z) = pi / (sin(pi*z) * Gamma(1-z))
  if (n < 0.5) {
    return Math.PI / (Math.sin(Math.PI * n) * _gamma(1 - n));
  }
  n -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (n + i);
  }
  const t = n + g + 0.5;
  return Math.sqrt(2 * Math.PI) * t ** (n + 0.5) * Math.exp(-t) * x;
}

/**
 * @param {any} n
 */
function _identity(n) {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}

/**
 * @param {any[]} matrix
 */
function _inverse(matrix) {
  const data = unwrapDenseMatrix(matrix);
  validateSquareMatrix(matrix);
  const n = data.length;

  if (n === 2) {
    const det = data[0][0] * data[1][1] - data[0][1] * data[1][0];
    if (det === 0) {
      throw new Error('Matrix is singular');
    }
    return wrapDenseMatrix([
      [data[1][1] / det, -data[0][1] / det],
      [-data[1][0] / det, data[0][0] / det],
    ]);
  }

  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let col = 0; col < n; col++) {
    const b = Array.from({ length: n }, (_, i) => (i === col ? 1 : 0));
    const x = linearSolve(data, wrapDenseMatrix(b.map((v) => [v])));
    const xData = unwrapDenseMatrix(x);
    for (let row = 0; row < n; row++) {
      result[row][col] = xData[row][0];
    }
  }
  return wrapDenseMatrix(result);
}

/**
 * @param {any} matrix
 */
function _rref(matrix) {
  const data = unwrapDenseMatrix(matrix).map((/** @type {any} */ row) => [...row]);
  let lead = 0;
  const rowCount = data.length;
  const colCount = data[0].length;

  for (let r = 0; r < rowCount; r++) {
    if (lead >= colCount) {
      break;
    }
    let i = r;
    while (Math.abs(data[i][lead]) < 1e-12) {
      i++;
      if (i === rowCount) {
        i = r;
        lead++;
        if (lead >= colCount) {
          break;
        }
      }
    }
    if (lead >= colCount) {
      break;
    }
    [data[r], data[i]] = [data[i], data[r]];
    const pivot = data[r][lead];
    for (let j = 0; j < colCount; j++) {
      data[r][j] /= pivot;
    }
    for (let i = 0; i < rowCount; i++) {
      if (i !== r) {
        const factor = data[i][lead];
        for (let j = 0; j < colCount; j++) {
          data[i][j] -= factor * data[r][j];
        }
      }
    }
    lead++;
  }
  return wrapDenseMatrix(data);
}

/**
 * @param {any[]} a
 * @param {any[]} b
 */
function _cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/**
 * @param {any} matrix
 */
function _eig2x2(matrix) {
  const data = unwrapDenseMatrix(matrix);
  validateSquareMatrix(matrix);
  const [[a, b], [c, d]] = data;
  const trace = a + d;
  const det = a * d - b * c;
  const disc = trace * trace - 4 * det;
  if (disc < 0) {
    throw new Error('Complex eigenvalues not supported');
  }
  const sqrtDisc = Math.sqrt(disc);
  const lambda1 = (trace + sqrtDisc) / 2;
  const lambda2 = (trace - sqrtDisc) / 2;

  // Solve (A - lambda*I)v = 0: pick non-zero row to solve for v1:v2 ratio
  const eigenvec = (/** @type {number} */ lambda) => {
    if (Math.abs(b) > 1e-12) {
      return [1, (lambda - a) / b];
    }
    if (Math.abs(c) > 1e-12) {
      return [(lambda - d) / c, 1];
    }
    return [1, 0];
  };

  const v1 = eigenvec(lambda1);
  const norm1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const v2 = eigenvec(lambda2);
  const norm2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

  return {
    values: [lambda1, lambda2],
    vectors: wrapDenseMatrix([
      [v1[0] / norm1, v2[0] / norm2],
      [v1[1] / norm1, v2[1] / norm2],
    ]),
  };
}

/**
 * @param {any[]} matrix
 */
function _cholesky(matrix) {
  const data = unwrapDenseMatrix(matrix);
  validateSquareMatrix(matrix);
  const n = data.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let k = 0; k < j; k++) {
      sum += L[j][k] * L[j][k];
    }
    const val = data[j][j] - sum;
    if (val <= 0) {
      throw new Error('Matrix is not positive definite');
    }
    L[j][j] = Math.sqrt(val);
    for (let i = j + 1; i < n; i++) {
      sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }
      L[i][j] = (data[i][j] - sum) / L[j][j];
    }
  }
  return wrapDenseMatrix(L);
}

/**
 * @param {any} matrix
 */
function _svd(matrix) {
  const data = unwrapDenseMatrix(matrix);
  const m = data.length;
  const n = data[0].length;

  if (m !== 2 || n !== 2) {
    throw new Error('svd() currently supports 2x2 matrices only');
  }

  const ata = [
    [
      data[0][0] * data[0][0] + data[1][0] * data[1][0],
      data[0][0] * data[0][1] + data[1][0] * data[1][1],
    ],
    [
      data[0][1] * data[0][0] + data[1][1] * data[1][0],
      data[0][1] * data[0][1] + data[1][1] * data[1][1],
    ],
  ];

  const eigResult = _eig2x2(wrapDenseMatrix(ata));
  const S = [
    Math.sqrt(Math.max(0, eigResult.values[0])),
    Math.sqrt(Math.max(0, eigResult.values[1])),
  ];
  const vecData = unwrapDenseMatrix(eigResult.vectors);
  const V = vecData;

  const U = [
    [
      (data[0][0] * V[0][0] + data[0][1] * V[1][0]) / (S[0] || 1),
      (data[0][0] * V[0][1] + data[0][1] * V[1][1]) / (S[1] || 1),
    ],
    [
      (data[1][0] * V[0][0] + data[1][1] * V[1][0]) / (S[0] || 1),
      (data[1][0] * V[0][1] + data[1][1] * V[1][1]) / (S[1] || 1),
    ],
  ];

  return {
    U: wrapDenseMatrix(U),
    S: wrapDenseMatrix([
      [S[0], 0],
      [0, S[1]],
    ]),
    V: wrapDenseMatrix(V),
  };
}

const internalFunctions = {
  fraction: (/** @type {number} */ n, /** @type {number} */ d) => fraction(n, d),

  numer: (/** @type {any} */ v) => numer(v),

  denom: (/** @type {any} */ v) => denom(v),

  isFraction: (/** @type {any} */ v) => isFraction(v),

  bignumber: (/** @type {any} */ n) => bigNumber(n),

  isBigNumber: (/** @type {any} */ v) => isBigNumber(v),

  max: (/** @type {any[]} */ ...args) => {
    if (!args.length) {
      throw new Error('max() requires arguments');
    }
    return Math.max(...args);
  },

  min: (/** @type {any[]} */ ...args) => {
    if (!args.length) {
      throw new Error('min() requires arguments');
    }
    return Math.min(...args);
  },

  abs: (/** @type {number} */ x) => Math.abs(x),

  round: (/** @type {number} */ x) => Math.round(x),

  floor: (/** @type {number} */ x) => Math.floor(x),

  ceil: (/** @type {number} */ x) => Math.ceil(x),

  sqrt: (/** @type {number} */ x) => {
    if (x < 0) {
      throw new Error('sqrt() domain error');
    }
    return Math.sqrt(x);
  },

  pow: (/** @type {number} */ a, /** @type {number} */ b) => a ** b,

  det: (/** @type {any[]} */ matrix) => determinant(matrix),

  polynomialRoot: (/** @type {any} */ ...coefficients) => polynomialRoots(...coefficients),

  lsolve: (
    /** @type {any} */ a,
    /** @type {{ exprify: string; data: any; size: number[]; }} */ b
  ) => linearSolve(a, b),

  lup: (/** @type {any} */ matrix) => lupDecomposition(matrix),

  lyap: (/** @type {any} */ a, /** @type {any} */ q) => solveLyapunov(a, q),

  qr: (/** @type {any} */ matrix) => qrDecomposition(matrix),

  transpose: (/** @type {any} */ matrix) => wrapDenseMatrix(transpose(unwrapDenseMatrix(matrix))),

  inverse: (/** @type {any[]} */ matrix) => _inverse(matrix),

  trace: (/** @type {any[]} */ matrix) => {
    const data = unwrapDenseMatrix(matrix);
    validateSquareMatrix(matrix);
    return data.reduce(
      (
        /** @type {any} */ sum,
        /** @type {{ [x: string]: any; }} */ row,
        /** @type {string | number} */ i
      ) => sum + row[i],
      0
    );
  },

  rank: (/** @type {any} */ matrix) => {
    const rrefData = unwrapDenseMatrix(_rref(matrix));
    return rrefData.filter((/** @type {any[]} */ row) => row.some((v) => Math.abs(v) > 1e-10))
      .length;
  },

  rref: (/** @type {any} */ matrix) => _rref(matrix),

  minor: (/** @type {any[]} */ matrix, /** @type {any} */ i, /** @type {any} */ j) => {
    const data = unwrapDenseMatrix(matrix);
    validateSquareMatrix(matrix);
    const sub = data
      .filter((/** @type {any} */ _, /** @type {any} */ ri) => ri !== i)
      .map((/** @type {any[]} */ row) => row.filter((_, cj) => cj !== j));
    return determinant(sub);
  },

  cofactor: (/** @type {any} */ matrix, /** @type {any} */ i, /** @type {any} */ j) => {
    const data = unwrapDenseMatrix(matrix);
    const sub = data
      .filter((/** @type {any} */ _, /** @type {any} */ ri) => ri !== i)
      .map((/** @type {any[]} */ row) =>
        row.filter((/** @type {any} */ _, /** @type {any} */ cj) => cj !== j)
      );
    return ((i + j) % 2 === 0 ? 1 : -1) * determinant(sub);
  },

  cross: (/** @type {any} */ a, /** @type {any} */ b) => {
    const v1 = unwrapDenseMatrix(a);
    const v2 = unwrapDenseMatrix(b);
    if (!Array.isArray(v1) || !Array.isArray(v2) || v1.length !== 3 || v2.length !== 3) {
      throw new Error('cross() requires two 3D vectors');
    }
    return _cross(v1, v2);
  },

  normalize: (/** @type {any} */ v) => {
    const data = unwrapDenseMatrix(v);
    if (!Array.isArray(data)) {
      throw new Error('normalize() expects a vector');
    }
    const norm = vectorNorm(data);
    if (norm === 0) {
      throw new Error('Cannot normalize zero vector');
    }
    return scaleVector(data, 1 / norm);
  },

  angle: (/** @type {any} */ a, /** @type {any} */ b) => {
    const v1 = unwrapDenseMatrix(a);
    const v2 = unwrapDenseMatrix(b);
    if (!Array.isArray(v1) || !Array.isArray(v2)) {
      throw new Error('angle() expects vectors');
    }
    const dot = dotProduct(v1, v2);
    const norms = vectorNorm(v1) * vectorNorm(v2);
    if (norms === 0) {
      throw new Error('Zero vector angle is undefined');
    }
    return Math.acos(Math.max(-1, Math.min(1, dot / norms)));
  },

  projection: (/** @type {any} */ a, /** @type {any} */ b) => {
    const v1 = unwrapDenseMatrix(a);
    const v2 = unwrapDenseMatrix(b);
    if (!Array.isArray(v1) || !Array.isArray(v2)) {
      throw new Error('projection() expects vectors');
    }
    const dot = dotProduct(v1, v2);
    const normB = vectorNorm(v2);
    if (normB === 0) {
      throw new Error('Zero vector projection undefined');
    }
    return dot / normB;
  },

  identity: (/** @type {any} */ n) => wrapDenseMatrix(_identity(n)),

  eye: (/** @type {any} */ n) => wrapDenseMatrix(_identity(n)),

  zeros: (/** @type {any} */ n, /** @type {undefined} */ m) => {
    if (m === undefined) {
      m = n;
    }
    return wrapDenseMatrix(Array.from({ length: n }, () => Array(m).fill(0)));
  },

  ones: (/** @type {any} */ n, /** @type {undefined} */ m) => {
    if (m === undefined) {
      m = n;
    }
    return wrapDenseMatrix(Array.from({ length: n }, () => Array(m).fill(1)));
  },

  diag: (/** @type {any} */ x) => {
    const arr = unwrapDenseMatrix(x);
    if (!Array.isArray(arr)) {
      throw new Error('diag() expects an array');
    }
    return wrapDenseMatrix(
      Array.from({ length: arr.length }, (_, i) =>
        Array.from({ length: arr.length }, (_, j) => (i === j ? arr[i] : 0))
      )
    );
  },

  cholesky: (/** @type {any[]} */ matrix) => _cholesky(matrix),

  eig: (/** @type {any[]} */ matrix) => _eig2x2(matrix),

  svd: (/** @type {any} */ matrix) => _svd(matrix),

  simplify: (/** @type {string} */ expression) => {
    if (typeof expression !== 'string') {
      throw new Error('simplify() expects an expression string');
    }
    return simplifyExpression(expression);
  },

  derivative: (/** @type {string} */ expression, variable = 'x') => {
    if (typeof expression !== 'string' || typeof variable !== 'string') {
      throw new Error('derivative() expects expression and variable strings');
    }
    return derivativeExpression(expression, variable);
  },

  sin: (/** @type {number} */ x) => Math.sin(x),

  cos: (/** @type {number} */ x) => Math.cos(x),

  tan: (/** @type {number} */ x) => Math.tan(x),

  sind: (/** @type {number} */ x) => Math.sin((x * Math.PI) / 180),

  cosd: (/** @type {number} */ x) => Math.cos((x * Math.PI) / 180),

  tand: (/** @type {number} */ x) => Math.tan((x * Math.PI) / 180),

  asind: (/** @type {number} */ x) => (Math.asin(x) * 180) / Math.PI,

  acosd: (/** @type {number} */ x) => (Math.acos(x) * 180) / Math.PI,

  atand: (/** @type {number} */ x) => (Math.atan(x) * 180) / Math.PI,

  atand2: (/** @type {number} */ y, /** @type {number} */ x) => (Math.atan2(y, x) * 180) / Math.PI,

  asin: (/** @type {number} */ x) => Math.asin(x),

  acos: (/** @type {number} */ x) => Math.acos(x),

  atan: (/** @type {number} */ x) => Math.atan(x),

  log: (/** @type {number} */ x) => {
    if (x <= 0) {
      throw new Error('log() domain error');
    }
    return Math.log(x);
  },

  log10: (/** @type {number} */ x) => {
    if (x <= 0) {
      throw new Error('log10() domain error');
    }
    return Math.log10(x);
  },

  exp: (/** @type {number} */ x) => Math.exp(x),

  random: () => Math.random(),

  and: (/** @type {any} */ a, /** @type {any} */ b) => Boolean(a && b),

  or: (/** @type {any} */ a, /** @type {any} */ b) => Boolean(a || b),

  not: (/** @type {any} */ a) => !a,
  '!': (/** @type {any} */ a) => !a,

  eq: (/** @type {any} */ a, /** @type {any} */ b) => a === b,

  neq: (/** @type {any} */ a, /** @type {any} */ b) => a !== b,
  notEqual: (/** @type {any} */ a, /** @type {any} */ b) => a !== b,

  gt: (/** @type {number} */ a, /** @type {number} */ b) => a > b,
  greaterThan: (/** @type {number} */ a, /** @type {number} */ b) => a > b,

  lt: (/** @type {number} */ a, /** @type {number} */ b) => a < b,
  lessThan: (/** @type {number} */ a, /** @type {number} */ b) => a < b,

  gte: (/** @type {number} */ a, /** @type {number} */ b) => a >= b,
  greaterThanOrEqual: (/** @type {number} */ a, /** @type {number} */ b) => a >= b,

  lte: (/** @type {number} */ a, /** @type {number} */ b) => a <= b,
  lessThanOrEqual: (/** @type {number} */ a, /** @type {number} */ b) => a <= b,

  clamp: (/** @type {number} */ x, /** @type {number} */ min, /** @type {number} */ max) => {
    if (min > max) {
      throw new Error('clamp(): min > max');
    }
    return Math.min(Math.max(x, min), max);
  },

  if: (/** @type {any} */ condition, /** @type {any} */ a, /** @type {any} */ b) =>
    condition ? a : b,

  typeof: (/** @type {any} */ x) => typeof x,

  length: (/** @type {string | any[]} */ x) => {
    if (typeof x === 'string' || Array.isArray(x)) {
      return x.length;
    }
    throw new Error('length() expects string or array');
  },

  sum: (/** @type {any[]} */ ...args) => {
    if (!args.length) {
      throw new Error('sum() requires at least one argument');
    }
    return args.reduce((a, b) => a + b, 0);
  },

  prod: (/** @type {any[]} */ ...args) => {
    if (!args.length) {
      throw new Error('prod() requires at least one argument');
    }
    return args.reduce((a, b) => a * b, 1);
  },

  mean: (/** @type {any[]} */ ...args) => {
    if (!args.length) {
      throw new Error('mean() requires at least one argument');
    }
    return args.reduce((a, b) => a + b, 0) / args.length;
  },

  median: (/** @type {any[]} */ ...args) => {
    if (!args.length) {
      throw new Error('median() requires at least one argument');
    }
    const sorted = [...args].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  mode: (/** @type {any[]} */ ...args) => {
    if (!args.length) {
      throw new Error('mode() requires at least one argument');
    }
    const freq = new Map();
    args.forEach((v) => freq.set(v, (freq.get(v) || 0) + 1));
    let maxCount = 0;
    let result = args[0];
    for (const [val, count] of freq) {
      if (count > maxCount) {
        maxCount = count;
        result = val;
      }
    }
    return result;
  },

  std: (/** @type {any[]} */ ...args) => {
    if (args.length < 2) {
      throw new Error('std() requires at least two values');
    }
    const m = args.reduce((a, b) => a + b, 0) / args.length;
    return Math.sqrt(args.reduce((sum, v) => sum + (v - m) ** 2, 0) / (args.length - 1));
  },

  variance: (/** @type {any[]} */ ...args) => {
    if (args.length < 2) {
      throw new Error('variance() requires at least two values');
    }
    const m = args.reduce((a, b) => a + b, 0) / args.length;
    return args.reduce((sum, v) => sum + (v - m) ** 2, 0) / (args.length - 1);
  },

  range: (/** @type {any[]} */ ...args) => {
    if (!args.length) {
      throw new Error('range() requires at least one argument');
    }
    return Math.max(...args) - Math.min(...args);
  },

  gcd: (/** @type {number} */ a, /** @type {number} */ b) => _gcd(a, b),

  lcm: (/** @type {number} */ a, /** @type {number} */ b) => {
    if (a === 0 || b === 0) {
      return 0;
    }
    return Math.abs((a / _gcd(a, b)) * b);
  },

  factorial: (/** @type {any} */ n) => {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error('factorial() requires a non-negative integer');
    }
    if (n === 0 || n === 1) {
      return 1;
    }
    let r = 1;
    for (let i = 2; i <= n; i++) {
      r *= i;
    }
    return r;
  },

  isPrime: (/** @type {any} */ n) => {
    if (!Number.isInteger(n) || n < 2) {
      return false;
    }
    if (n === 2) {
      return true;
    }
    if (n % 2 === 0) {
      return false;
    }
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) {
        return false;
      }
    }
    return true;
  },

  primeFactors: (/** @type {any} */ n) => {
    if (!Number.isInteger(n) || n < 2) {
      throw new Error('primeFactors() requires an integer >= 2');
    }
    const factors = [];
    let m = n;
    for (let i = 2; i * i <= m; i++) {
      while (m % i === 0) {
        factors.push(i);
        m /= i;
      }
    }
    if (m > 1) {
      factors.push(m);
    }
    return factors;
  },

  fibonacci: (/** @type {any} */ n) => {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error('fibonacci() requires a non-negative integer');
    }
    if (n <= 1) {
      return n;
    }
    let a = 0;
    let b = 1;
    for (let i = 2; i <= n; i++) {
      const t = a + b;
      a = b;
      b = t;
    }
    return b;
  },

  nCr: (/** @type {any} */ n, /** @type {any} */ r) => {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
      throw new Error('nCr() requires non-negative integers');
    }
    if (r > n) {
      return 0;
    }
    if (r === 0 || r === n) {
      return 1;
    }
    r = Math.min(r, n - r);
    let result = 1;
    for (let i = 1; i <= r; i++) {
      result = (result * (n - r + i)) / i;
    }
    return result;
  },

  nPr: (/** @type {any} */ n, /** @type {any} */ r) => {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
      throw new Error('nPr() requires non-negative integers');
    }
    if (r > n) {
      return 0;
    }
    let result = 1;
    for (let i = 0; i < r; i++) {
      result *= n - i;
    }
    return result;
  },

  gamma: (/** @type {any} */ n) => _gamma(n),

  sinh: (/** @type {number} */ x) => Math.sinh(x),

  cosh: (/** @type {number} */ x) => Math.cosh(x),

  tanh: (/** @type {number} */ x) => Math.tanh(x),

  asinh: (/** @type {number} */ x) => Math.asinh(x),

  acosh: (/** @type {number} */ x) => Math.acosh(x),

  atanh: (/** @type {number} */ x) => Math.atanh(x),

  sec: (/** @type {number} */ x) => {
    const c = Math.cos(x);
    if (Math.abs(c) < 1e-15) {
      throw new Error('sec() undefined for this input');
    }
    return 1 / c;
  },

  csc: (/** @type {number} */ x) => {
    const s = Math.sin(x);
    if (Math.abs(s) < 1e-15) {
      throw new Error('csc() undefined for this input');
    }
    return 1 / s;
  },

  cot: (/** @type {number} */ x) => {
    const s = Math.sin(x);
    if (Math.abs(s) < 1e-15) {
      throw new Error('cot() undefined for this input');
    }
    return Math.cos(x) / s;
  },

  trunc: (/** @type {number} */ x) => Math.trunc(x),

  sign: (/** @type {number} */ x) => Math.sign(x),

  frac: (/** @type {number} */ x) => x - Math.trunc(x),

  split: (
    /** @type {string} */ str,
    /** @type {{ [Symbol.split](string: string, limit?: number): string[]; }} */ sep
  ) => {
    if (typeof str !== 'string') {
      throw new Error('split() expects a string');
    }
    return str.split(sep);
  },

  join: (/** @type {any[]} */ arr, /** @type {string | undefined} */ sep) => {
    if (!Array.isArray(arr)) {
      throw new Error('join() expects an array');
    }
    return arr.join(sep);
  },

  upper: (/** @type {string} */ str) => {
    if (typeof str !== 'string') {
      throw new Error('upper() expects a string');
    }
    return str.toUpperCase();
  },

  lower: (/** @type {string} */ str) => {
    if (typeof str !== 'string') {
      throw new Error('lower() expects a string');
    }
    return str.toLowerCase();
  },

  trim: (/** @type {string} */ str) => {
    if (typeof str !== 'string') {
      throw new Error('trim() expects a string');
    }
    return str.trim();
  },

  replace: (
    /** @type {string} */ str,
    /** @type {{ [Symbol.replace](string: string, replaceValue: string): string; }} */ pattern,
    /** @type {string} */ replacement
  ) => {
    if (typeof str !== 'string') {
      throw new Error('replace() expects a string');
    }
    return str.replace(pattern, replacement);
  },

  substring: (
    /** @type {string} */ str,
    /** @type {number} */ start,
    /** @type {number | undefined} */ end
  ) => {
    if (typeof str !== 'string') {
      throw new Error('substring() expects a string');
    }
    return str.substring(start, end);
  },

  // ---- Reciprocal trig ----
  acot: (/** @type {number} */ x) => {
    if (x === 0) {
      return Math.PI / 2;
    }
    return Math.atan(1 / x);
  },

  asec: (/** @type {number} */ x) => {
    if (x < 1 && x > -1) {
      throw new Error('asec() domain error');
    }
    return Math.acos(1 / x);
  },

  acsc: (/** @type {number} */ x) => {
    if (x < 1 && x > -1) {
      throw new Error('acsc() domain error');
    }
    return Math.asin(1 / x);
  },

  acoth: (/** @type {number} */ x) => {
    if (Math.abs(x) <= 1) {
      throw new Error('acoth() domain error');
    }
    return Math.atanh(1 / x);
  },

  asech: (/** @type {number} */ x) => {
    if (x <= 0 || x > 1) {
      throw new Error('asech() domain error');
    }
    return Math.acosh(1 / x);
  },

  acsch: (/** @type {number} */ x) => {
    if (x === 0) {
      throw new Error('acsch() domain error');
    }
    return Math.asinh(1 / x);
  },

  // ---- Stats ----
  quantile: (/** @type {any[]} */ arr, /** @type {number} */ p) => {
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error('quantile() expects a non-empty array');
    }
    if (p < 0 || p > 1) {
      throw new Error('quantile() p must be between 0 and 1');
    }
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = p * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return lo === hi ? sorted[lo] : sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
  },

  percentile: (/** @type {any[]} */ arr, /** @type {number} */ p) => {
    if (p < 0 || p > 100) {
      throw new Error('percentile() p must be between 0 and 100');
    }
    return internalFunctions.quantile(arr, p / 100);
  },

  covariance: (/** @type {number[]} */ x, /** @type {number[]} */ y) => {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length < 2 || x.length !== y.length) {
      throw new Error('covariance() expects two arrays of equal length >= 2');
    }
    const mx = x.reduce((s, v) => s + v, 0) / x.length;
    const my = y.reduce((s, v) => s + v, 0) / y.length;
    return x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / (x.length - 1);
  },

  corr: (/** @type {number[]} */ x, /** @type {number[]} */ y) => {
    const cov = internalFunctions.covariance(x, y);
    const sx = Math.sqrt(internalFunctions.covariance(x, x));
    const sy = Math.sqrt(internalFunctions.covariance(y, y));
    if (sx === 0 || sy === 0) {
      throw new Error('corr() zero variance');
    }
    return cov / (sx * sy);
  },

  randomInt: (/** @type {number} */ min, /** @type {number} */ max) => {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error('randomInt() expects integers');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomNormal: (/** @type {number} */ mean, /** @type {number} */ std) => {
    if (std <= 0) {
      throw new Error('randomNormal() std must be > 0');
    }
    let u = 0;
    let v = 0;
    while (u === 0) {
      u = Math.random();
    }
    while (v === 0) {
      v = Math.random();
    }
    return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  },

  // ---- Special functions ----
  erf: (/** @type {number} */ x) => {
    if (x === 0) {
      return 0;
    }
    // Abramowitz & Stegun approximation (max error 1.5e-7)
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
    let p = a[4] * t + a[3];
    p = p * t + a[2];
    p = p * t + a[1];
    p = p * t + a[0];
    p = p * t;
    const result = 1 - p * Math.exp(-x * x);
    return x >= 0 ? result : -result;
  },

  lgamma: (/** @type {number} */ x) => {
    if (x <= 0) {
      throw new Error('lgamma() domain error (x > 0 required)');
    }
    // Stirling's approximation
    if (x < 12) {
      // Use recurrence: lgamma(x) = lgamma(x+1) - ln(x)
      let v = x;
      let r = 0;
      while (v < 12) {
        r -= Math.log(v);
        v += 1;
      }
      return r + internalFunctions.lgamma(v);
    }
    const inv = 1 / x;
    const s = (1 / 12 - (inv * inv) / 360 + (inv * inv * inv * inv) / 1260) * inv;
    return (x - 0.5) * Math.log(x) - x + 0.9189385332046727 + s;
  },

  beta: (/** @type {number} */ a, /** @type {number} */ b) => {
    if (a <= 0 || b <= 0) {
      throw new Error('beta() domain error');
    }
    return Math.exp(
      internalFunctions.lgamma(a) + internalFunctions.lgamma(b) - internalFunctions.lgamma(a + b)
    );
  },

  // ---- Numeric helpers ----
  hypot: (.../** @type {number[]} */ args) => Math.hypot(...args),

  cbrt: (/** @type {number} */ x) => Math.cbrt(x),

  log2: (/** @type {number} */ x) => {
    if (x <= 0) {
      throw new Error('log2() domain error');
    }
    return Math.log2(x);
  },

  log1p: (/** @type {number} */ x) => {
    if (x <= -1) {
      throw new Error('log1p() domain error');
    }
    return Math.log1p(x);
  },

  expm1: (/** @type {number} */ x) => Math.expm1(x),

  // ---- Bitwise ----
  bitAnd: (/** @type {number} */ a, /** @type {number} */ b) => {
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
      throw new Error('bitAnd() expects integers');
    }
    return a & b;
  },

  bitOr: (/** @type {number} */ a, /** @type {number} */ b) => {
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
      throw new Error('bitOr() expects integers');
    }
    return a | b;
  },

  bitXor: (/** @type {number} */ a, /** @type {number} */ b) => {
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
      throw new Error('bitXor() expects integers');
    }
    return a ^ b;
  },

  bitNot: (/** @type {number} */ a) => {
    if (!Number.isInteger(a)) {
      throw new Error('bitNot() expects an integer');
    }
    return ~a;
  },
};

/** @param {string | any[]} tokens */
function buildAST(tokens) {
  let current = 0;

  const peek = () => tokens[current];
  const consume = () => tokens[current++];
  const lastPos = () => {
    const t = current > 0 ? tokens[current - 1] : null;
    return t && t.pos !== undefined ? t.pos : -1;
  };
  const tokenPos = () => {
    const t = peek();
    return t && t.pos !== undefined ? t.pos : -1;
  };

  const nodeAt = (/** @type {any} */ node) => {
    const pos = lastPos();
    if (pos >= 0) {
      node.pos = pos;
    }
    return node;
  };

  const syntaxError = (/** @type {string} */ msg) => {
    const pos = tokenPos() >= 0 ? tokenPos() : lastPos();
    const at = pos >= 0 ? ` at position ${pos}` : '';
    throw new Error(`${msg}${at}`);
  };

  const match = (/** @type {string} */ type, /** @type {string | undefined} */ value) => {
    const t = peek();
    if (!t) {
      return false;
    }

    if (t.type !== type) {
      return false;
    }

    if (value !== undefined && t.value !== value) {
      return false;
    }

    current++;
    return true;
  };

  const parseSliceOrIndex = () => {
    let start = null;

    if (!(peek()?.type === 'Colon' || peek()?.type === 'Comma' || peek()?.type === 'ArrayEnd')) {
      start = parseExpression();
    }

    if (match('Colon', undefined)) {
      let end = null;

      if (!(peek()?.type === 'Comma' || peek()?.type === 'ArrayEnd')) {
        end = parseExpression();
      }

      return {
        type: 'SliceExpression',
        start,
        end,
      };
    }

    return start;
  };

  function parsePrimary() {
    const token = consume();
    if (!token) {
      syntaxError('Unexpected end of input');
    }

    const withPos = (/** @type {any} */ node) => {
      if (token.pos !== undefined) {
        node.pos = token.pos;
      }
      return node;
    };

    switch (token.type) {
      case 'Number':
      case 'BigInt':
      case 'Boolean':
      case 'String':
        return withPos({ type: 'Literal', value: token.value });

      case 'ImaginaryLiteral':
        return withPos({ type: 'ImaginaryLiteral', value: token.value });

      case 'NumberWithUnit':
        return withPos({
          type: 'UnitLiteral',
          value: token.value,
          unit: token.unit,
        });

      case 'Identifier':
        return withPos({ type: 'Identifier', name: token.name });

      case 'Function':
        return withPos({
          type: 'Identifier',
          name: token.name,
        });

      case 'Parenthesis':
        if (token.value === '(') {
          const expr = parseExpression();

          if (!match('Parenthesis', ')')) {
            syntaxError("Expected ')'");
          }

          return expr;
        }

      // falls through

      case 'ArrayStart': {
        const rows = [];
        let currentRow = [];

        if (!match('ArrayEnd', undefined)) {
          while (true) {
            currentRow.push(parseExpression());

            if (match('Comma', undefined)) {
              continue;
            }

            if (match('Semicolon', undefined)) {
              rows.push(currentRow);
              currentRow = [];
              continue;
            }

            if (match('ArrayEnd', undefined)) {
              rows.push(currentRow);
              break;
            }

            syntaxError("Expected ',', ';', or ']'");
          }
        }

        if (!rows.length) {
          return withPos({ type: 'ArrayExpression', elements: [] });
        }

        if (rows.length === 1) {
          return withPos({ type: 'ArrayExpression', elements: rows[0] });
        }

        return withPos({
          type: 'ArrayExpression',
          elements: rows.map((elements) => ({
            type: 'ArrayExpression',
            elements,
          })),
        });
      }

      case 'BlockStart': {
        const properties = [];

        if (!match('BlockEnd', undefined)) {
          do {
            const keyToken = consume();

            if (keyToken.type !== 'Identifier' && keyToken.type !== 'String') {
              syntaxError('Invalid object key');
            }

            if (!match('Colon', undefined)) {
              syntaxError("Expected ':' after key");
            }

            const value = parseExpression();

            properties.push({
              key: keyToken.value,
              value,
            });
          } while (match('Comma', undefined));

          if (!match('BlockEnd', undefined)) {
            syntaxError("Expected '}'");
          }
        }

        return withPos({ type: 'ObjectExpression', properties });
      }
    }

    syntaxError(`Unexpected token: ${JSON.stringify(token.value || token.name || token.type)}`);
  }

  function parseMember() {
    let object = parsePrimary();

    while (true) {
      if (match('ArrayStart', undefined)) {
        const selectors = [];

        if (!match('ArrayEnd', undefined)) {
          do {
            selectors.push(parseSliceOrIndex());
          } while (match('Comma', undefined));

          if (!match('ArrayEnd', undefined)) {
            syntaxError("Expected ']'");
          }
        }

        object = nodeAt({
          type: 'IndexExpression',
          object,
          selectors,
        });
        continue;
      }

      if (match('Dot', undefined)) {
        const property = consume();

        if (property.type !== 'Identifier') {
          syntaxError("Expected property after '.'");
        }

        object = nodeAt({
          type: 'MemberExpression',
          object,
          property: { type: 'Identifier', name: property.value },
          optional: false,
        });
        continue;
      }

      if (match('Operator', '?.')) {
        const property = consume();

        object = nodeAt({
          type: 'MemberExpression',
          object,
          property: { type: 'Identifier', name: property.value },
          optional: true,
        });
        continue;
      }

      break;
    }

    return object;
  }

  function parseCallChain() {
    let expr = parseMember();

    while (peek()?.type === 'Parenthesis' && peek()?.value === '(') {
      consume();

      const args = [];

      if (!(peek()?.type === 'Parenthesis' && peek()?.value === ')')) {
        do {
          if (match('Spread', undefined)) {
            const arg = parseExpression();
            args.push({ type: 'SpreadElement', argument: arg });
          } else {
            args.push(parseExpression());
          }
        } while (match('Comma', undefined));
      }

      if (!match('Parenthesis', ')')) {
        syntaxError("Expected ')'");
      }

      expr = nodeAt({
        type: 'CallExpression',
        callee: expr,
        arguments: args,
      });
    }

    return expr;
  }

  function parseUnary() {
    if (match('UnaryOperator', undefined)) {
      const operator = tokens[current - 1].value;

      return nodeAt({
        type: 'UnaryExpression',
        operator,
        argument: parseUnary(),
      });
    }

    return parseCallChain();
  }

  function parsePower() {
    const left = parseUnary();

    if (match('Operator', '^')) {
      const right = parsePower();
      return nodeAt({
        type: 'BinaryExpression',
        operator: '^',
        left,
        right,
      });
    }

    return left;
  }

  function parseMultiplication() {
    let left = parsePower();

    while (match('Operator', '*') || match('Operator', '/') || match('Operator', '%')) {
      const operator = tokens[current - 1].value;
      const right = parsePower();

      left = nodeAt({
        type: 'BinaryExpression',
        operator,
        left,
        right,
      });
    }

    return left;
  }

  function parseAddition() {
    let left = parseMultiplication();

    while (match('Operator', '+') || match('Operator', '-')) {
      const operator = tokens[current - 1].value;
      const right = parseMultiplication();

      left = nodeAt({
        type: 'BinaryExpression',
        operator,
        left,
        right,
      });
    }

    return left;
  }

  function parseUnitConversion() {
    const left = parseAddition();

    const nextKeyword = peek();
    if (nextKeyword?.type === 'Keyword' && ['to', 'in'].includes(nextKeyword.value)) {
      consume();
      const next = consume();

      if (!next || next.type !== 'Unit') {
        syntaxError(`Expected unit after '${nextKeyword.value}'`);
      }

      return nodeAt({
        type: 'UnitConversion',
        from: left,
        to: next.value,
      });
    }

    return left;
  }

  function parseComparison() {
    let left = parseUnitConversion();

    while (
      match('Operator', '>') ||
      match('Operator', '<') ||
      match('Operator', '>=') ||
      match('Operator', '<=') ||
      match('Operator', '==')
    ) {
      const operator = tokens[current - 1].value;
      const right = parseUnitConversion();

      left = nodeAt({
        type: 'BinaryExpression',
        operator,
        left,
        right,
      });
    }

    return left;
  }

  function parseLogical() {
    let left = parseComparison();

    while (match('Operator', '&&') || match('Operator', '||')) {
      const operator = tokens[current - 1].value;
      const right = parseComparison();

      left = nodeAt({
        type: 'LogicalExpression',
        operator,
        left,
        right,
      });
    }

    return left;
  }

  function parseNullish() {
    let left = parseLogical();

    while (match('Operator', '??')) {
      const right = parseLogical();

      left = nodeAt({
        type: 'LogicalExpression',
        operator: '??',
        left,
        right,
      });
    }

    return left;
  }

  function parseTernary() {
    const test = parseNullish();

    if (match('Ternary', '?')) {
      const consequent = parseExpression();

      if (!match('Ternary', ':')) {
        syntaxError("Expected ':' in ternary");
      }

      const alternate = parseExpression();

      return nodeAt({
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate,
      });
    }

    if (match('Colon', undefined)) {
      const end = parseNullish();

      return nodeAt({
        type: 'RangeExpression',
        start: test,
        end,
      });
    }

    return test;
  }

  function parseLambda() {
    const left = parsePipeline();

    if (match('Operator', '->')) {
      let params;
      if (left.type === 'Identifier') {
        params = [left.name];
      } else if (left.type === 'ArrayExpression') {
        params = left.elements.map((/** @type {{ type: string; name: any; }} */ el) => {
          if (el.type !== 'Identifier') {
            syntaxError('Lambda parameter must be an identifier');
          }
          return el.name;
        });
      } else {
        syntaxError('Invalid lambda parameter');
      }

      const body = parseLambda();

      return nodeAt({
        type: 'ArrowFunctionExpression',
        params,
        body,
      });
    }

    return left;
  }

  function parsePipeline() {
    let left = parseTernary();

    while (match('Operator', '|>')) {
      const right = parseTernary();

      left = nodeAt({
        type: 'PipelineExpression',
        left,
        right,
      });
    }

    return left;
  }

  function parseAssignment() {
    const left = parseLambda();

    if (
      match('Operator', '=') ||
      match('Operator', '+=') ||
      match('Operator', '-=') ||
      match('Operator', '*=') ||
      match('Operator', '/=')
    ) {
      const operator = tokens[current - 1].value;

      // f(a,b) = expr: treat as function definition, not assignment
      if (left.type === 'CallExpression') {
        const isFunctionTarget =
          left.callee?.type === 'Identifier' &&
          left.arguments.every((/** @type {{ type: string; }} */ arg) => arg.type === 'Identifier');

        if (!isFunctionTarget) {
          syntaxError('Invalid function definition');
        }

        const right = parseAssignment();

        return nodeAt({
          type: 'FunctionAssignmentExpression',
          operator,
          left: {
            type: 'Identifier',
            name: left.callee.name,
          },
          params: left.arguments.map((/** @type {{ name: any; }} */ arg) => arg.name),
          right,
        });
      }

      if (
        left.type !== 'Identifier' &&
        left.type !== 'MemberExpression' &&
        left.type !== 'IndexExpression'
      ) {
        syntaxError('Invalid assignment target');
      }

      const right = parseAssignment();

      return nodeAt({
        type: 'AssignmentExpression',
        operator,
        left,
        right,
      });
    }

    return left;
  }

  function parseExpression() {
    return parseAssignment();
  }

  const ast = parseExpression();

  if (current < tokens.length) {
    const t = peek();
    const pos = t && t.pos !== undefined ? ` at position ${t.pos}` : '';
    throw new Error(
      `Unexpected token "${t ? JSON.stringify(t.value || t.name || t.type) : '?'}"${pos}`
    );
  }

  return ast;
}

const isComplex = (/** @type {any} */ value) =>
  value && typeof value === 'object' && 're' in value && 'im' in value;

const isUnitValue = (/** @type {any} */ value) =>
  value && typeof value === 'object' && 'value' in value && 'unit' in value;

const isMatrix = (/** @type {any[]} */ value) =>
  Array.isArray(value) && value.length > 0 && value.every(Array.isArray);

const formatComplex = (/** @type {{ re: any; im: number; }} */ value) => {
  if (!isComplex(value)) {
    return value;
  }

  const real = value.re;
  const imaginary = Math.abs(value.im);
  const sign = value.im < 0 ? '-' : '+';

  if (real === 0) {
    if (value.im === 1) {
      return 'i';
    }
    if (value.im === -1) {
      return '-i';
    }
    return `${value.im}i`;
  }

  const imagPart = imaginary === 1 ? 'i' : `${imaginary}i`;
  return `${real} ${sign} ${imagPart}`;
};

const formatScalar = (/** @type {unknown} */ value) => {
  if (isBigNumber(value)) {
    return formatBigNumber(value);
  }
  if (typeof value !== 'number') {
    return String(value);
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return Number(value.toFixed(14)).toString();
};

const formatResult = (/** @type {any} */ value) => {
  if (isFraction(value)) {
    return formatFraction(value);
  }

  if (isBigNumber(value)) {
    return formatBigNumber(value);
  }

  if (isComplex(value)) {
    return formatComplex(value);
  }

  if (isUnitValue(value)) {
    return `${value.value} ${value.unit}`;
  }

  if (isDenseMatrixWrapper(value)) {
    return serializeExprifyValue(value);
  }

  if (isMatrix(value)) {
    return value.map((/** @type {unknown[]} */ row) => row.map(formatScalar).join('\t')).join('\n');
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (value && typeof value === 'object') {
    return serializeExprifyValue(value);
  }

  return value;
};

class exprify {
  constructor() {
    this.math = mathOperations;
    this.units = createUnitsStore(globalUnits);
    this.functions = createFunctionRegistry(internalFunctions);
    this.variables = createVarStore();
    this._cache = new Map();
    this.variables.set('pi', Math.PI);
    this.variables.set('e', Math.E);
    this.variables.set('PHI', (1 + Math.sqrt(5)) / 2);
    this.variables.set('TAU', 2 * Math.PI);
    this.variables.set('INFINITY', Infinity);
    this.variables.set('NaN', NaN);
    this.addFunction('parse', (/** @type {any} */ expression) => {
      if (typeof expression !== 'string') {
        throw new Error('parse() expects an expression string');
      }
      return expression;
    });
    this.addFunction('leafCount', (/** @type {string} */ value) => {
      const countLeafTokens = (/** @type {string} */ expression) => {
        const strippedKeys = expression.replace(/(^|[{,]\s*)[a-zA-Z_][a-zA-Z0-9_]*\s*:/g, '$1');
        const matches = strippedKeys.match(/\d+(\.\d+)?(e[+-]?\d+)?n?|[a-zA-Z_][a-zA-Z0-9_]*/gi);
        return matches ? matches.length : 0;
      };

      let ast = value;
      if (typeof value === 'string') {
        try {
          ast = this.parse(value).ast;
        } catch {
          return countLeafTokens(value);
        }
      }

      const countLeaves = (/** @type {any} */ node) => {
        if (!node || typeof node !== 'object') {
          return 0;
        }

        switch (node.type) {
          case 'Literal':
          case 'ImaginaryLiteral':
          case 'UnitLiteral':
          case 'Identifier':
            return 1;
          default:
            return Object.values(node).reduce((sum, child) => {
              if (Array.isArray(child)) {
                return sum + child.reduce((inner, item) => inner + countLeaves(item), 0);
              }

              return sum + countLeaves(child);
            }, 0);
        }
      };

      return countLeaves(ast);
    });
    this.addFunction('matrix', (/** @type {any} */ value) => wrapDenseMatrix(value));
    this.addFunction('sparse', (/** @type {any} */ value) => wrapDenseMatrix(value));

    // --- rationalize(): polynomial/rational arithmetic using Map<JSON-power-tuple, coefficient> ---
    this.addFunction('rationalize', (/** @type {string} */ expression, withDetails = false) => {
      if (typeof expression !== 'string') {
        throw new Error('rationalize() expects an expression string');
      }

      const normalizedExpression = expression
        .replace(/\s+/g, '')
        .replace(/(\d)([a-zA-Z(])/g, '$1*$2')
        .replace(/([a-zA-Z)])(\d)/g, '$1*$2');

      const polyKey = (powers) =>
        JSON.stringify(Object.entries(powers).sort(([a], [b]) => a.localeCompare(b)));
      const keyToPowers = (/** @type {string} */ key) => Object.fromEntries(JSON.parse(key));
      const constPoly = (/** @type {number} */ value) => new Map([[polyKey({}), value]]);
      const varPoly = (/** @type {any} */ name) => new Map([[polyKey({ [name]: 1 }), 1]]);
      const cleanPoly = (/** @type {any[] | Map<any, any>} */ poly) =>
        new Map([...poly.entries()].filter(([, coeff]) => coeff !== 0));
      const addPoly = (
        /** @type {Iterable<readonly [any, any]> | null | undefined} */ a,
        /** @type {any[] | Map<any, any>} */ b,
        sign = 1
      ) => {
        const result = new Map(a);
        for (const [key, coeff] of b.entries()) {
          result.set(key, (result.get(key) || 0) + sign * coeff);
        }
        return cleanPoly(result);
      };
      const multiplyPoly = (/** @type {any} */ a, /** @type {any} */ b) => {
        const result = new Map();
        for (const [keyA, coeffA] of a.entries()) {
          const powersA = keyToPowers(keyA);
          for (const [keyB, coeffB] of b.entries()) {
            const powersB = keyToPowers(keyB);
            const merged = { ...powersA };
            for (const [name, power] of Object.entries(powersB)) {
              merged[name] = (merged[name] || 0) + power;
            }
            const key = polyKey(merged);
            result.set(key, (result.get(key) || 0) + coeffA * coeffB);
          }
        }
        return cleanPoly(result);
      };
      const powPoly = (/** @type {any} */ poly, /** @type {number} */ exponent) => {
        let result = constPoly(1);
        for (let index = 0; index < exponent; index++) {
          result = multiplyPoly(result, poly);
        }
        return result;
      };
      const rational = (/** @type {Map<any, any>} */ num, den = constPoly(1)) => ({ num, den });
      const addRat = (
        /** @type {{ num: any; den: any; }} */ a,
        /** @type {{ den: any; num: any; }} */ b,
        sign = 1
      ) =>
        rational(
          addPoly(multiplyPoly(a.num, b.den), multiplyPoly(b.num, a.den), sign),
          multiplyPoly(a.den, b.den)
        );
      const mulRat = (
        /** @type {{ num: any; den: any; }} */ a,
        /** @type {{ num: any; den: any; }} */ b
      ) => rational(multiplyPoly(a.num, b.num), multiplyPoly(a.den, b.den));
      const divRat = (
        /** @type {{ num: any; den: any; }} */ a,
        /** @type {{ den: any; num: any; }} */ b
      ) => rational(multiplyPoly(a.num, b.den), multiplyPoly(a.den, b.num));
      const negRat = (
        /** @type {{ num: any[] | Map<any, any>; den: Map<string, number> | undefined; }} */ value
      ) => rational(addPoly(new Map(), value.num, -1), value.den);
      const astToRat = (/** @type {any} */ node) => {
        switch (node.type) {
          case 'Literal':
            return rational(constPoly(node.value));
          case 'Identifier':
            return rational(varPoly(node.name));
          case 'UnaryExpression':
            if (node.operator === '-') {
              return negRat(astToRat(node.argument));
            }
            throw new Error('Unsupported unary operator');
          case 'BinaryExpression': {
            const left = astToRat(node.left);
            const right = astToRat(node.right);
            switch (node.operator) {
              case '+':
                return addRat(left, right);
              case '-':
                return addRat(left, right, -1);
              case '*':
                return mulRat(left, right);
              case '/':
                return divRat(left, right);
              case '^': {
                if (
                  node.right.type !== 'Literal' ||
                  !Number.isInteger(node.right.value) ||
                  node.right.value < 0
                ) {
                  throw new Error('Unsupported exponent');
                }
                return rational(
                  powPoly(left.num, node.right.value),
                  powPoly(left.den, node.right.value)
                );
              }
              default:
                throw new Error('Unsupported operator in rationalize()');
            }
          }
          default:
            throw new Error('Unsupported expression in rationalize()');
        }
      };
      const formatPoly = (/** @type {any} */ poly) => {
        const entries = [...poly.entries()]
          .filter(([, coeff]) => coeff !== 0)
          .sort(([keyA], [keyB]) => {
            const powersA = keyToPowers(keyA);
            const powersB = keyToPowers(keyB);
            const firstVarA = Object.keys(powersA).sort()[0] || '';
            const firstVarB = Object.keys(powersB).sort()[0] || '';

            if (firstVarA !== firstVarB) {
              return firstVarA.localeCompare(firstVarB);
            }

            const degreeA = Object.values(powersA).reduce((sum, value) => sum + value, 0);
            const degreeB = Object.values(powersB).reduce((sum, value) => sum + value, 0);
            return degreeB - degreeA;
          });

        if (!entries.length) {
          return '0';
        }

        return entries
          .map(([key, coeff], index) => {
            const powers = keyToPowers(key);
            const absCoeff = Math.abs(coeff);
            const variablePart = Object.entries(powers)
              .map(([name, power]) => (power === 1 ? name : `${name} ^ ${power}`))
              .join(' * ');
            let body = variablePart;

            if (!body) {
              body = `${absCoeff}`;
            } else if (absCoeff !== 1) {
              body = `${absCoeff} * ${body}`;
            }

            if (index === 0) {
              return coeff < 0 ? `- ${body}`.replace('- ', '-') : body;
            }

            return coeff < 0 ? `- ${body}` : `+ ${body}`;
          })
          .join(' ');
      };

      const ast = this.parse(normalizedExpression).ast;
      const result = astToRat(ast);
      const numerator = formatPoly(result.num);
      const denominator = formatPoly(result.den);
      const variableSet = new Set();

      for (const poly of [result.num, result.den]) {
        for (const key of poly.keys()) {
          for (const name of Object.keys(keyToPowers(key))) {
            variableSet.add(name);
          }
        }
      }

      if (!withDetails) {
        return `(${numerator}) / (${denominator})`;
      }

      return {
        numerator,
        denominator,
        coefficients: [],
        variables: [...variableSet].sort(),
        expression: `(${numerator}) / (${denominator})`,
      };
    });

    this.addFunction('map', (/** @type {any[]} */ arr, /** @type {any} */ fnOrName) => {
      if (!Array.isArray(arr)) {
        throw new Error('map() expects an array');
      }
      const fn = typeof fnOrName === 'string' ? this.functions.get(fnOrName) : fnOrName;
      if (typeof fn !== 'function') {
        throw new Error('map() requires a function or function name');
      }
      return arr.map((x) => fn(x));
    });

    this.addFunction('filter', (/** @type {any[]} */ arr, /** @type {any} */ fnOrName) => {
      if (!Array.isArray(arr)) {
        throw new Error('filter() expects an array');
      }
      const fn = typeof fnOrName === 'string' ? this.functions.get(fnOrName) : fnOrName;
      if (typeof fn !== 'function') {
        throw new Error('filter() requires a function or function name');
      }
      return arr.filter((x) => fn(x));
    });

    // Numeric integration via Simpson's 1/3 rule with 100 subintervals
    this.addFunction(
      'integral',
      (/** @type {any} */ expr, /** @type {number} */ a, /** @type {number} */ b) => {
        if (typeof expr !== 'string') {
          throw new Error('integral() expects an expression string');
        }
        const compiled = this.compile(expr);
        const n = 100;
        const h = (b - a) / n;
        let sum = compiled({ x: a }) + compiled({ x: b });
        for (let i = 1; i < n; i++) {
          const x = a + i * h;
          const f = compiled({ x });
          sum += i % 2 === 0 ? 2 * f : 4 * f;
        }
        return (h / 3) * sum;
      }
    );

    // Summation: evaluate expr for variable = start..end
    this.addFunction(
      'sigma',
      (
        /** @type {any} */ variable,
        /** @type {any} */ start,
        /** @type {number} */ end,
        /** @type {any} */ expr
      ) => {
        if (typeof expr !== 'string') {
          throw new Error('sigma() expects an expression string');
        }
        const compiled = this.compile(expr);
        let total = 0;
        for (let i = start; i <= end; i++) {
          total += compiled({ [variable]: i });
        }
        return total;
      }
    );

    // Product: multiply expr for variable = start..end
    this.addFunction(
      'pi',
      (
        /** @type {any} */ variable,
        /** @type {any} */ start,
        /** @type {number} */ end,
        /** @type {any} */ expr
      ) => {
        if (typeof expr !== 'string') {
          throw new Error('pi() expects an expression string');
        }
        const compiled = this.compile(expr);
        let total = 1;
        for (let i = start; i <= end; i++) {
          total *= compiled({ [variable]: i });
        }
        return total;
      }
    );

    this.addFunction(
      'substitute',
      (/** @type {any} */ expr, /** @type {any} */ variable, /** @type {any} */ value) => {
        if (typeof expr !== 'string') {
          throw new Error('substitute() expects an expression string');
        }
        const compiled = this.compile(expr);
        return compiled({ [variable]: value });
      }
    );

    // Numeric limit: evaluate at progressively smaller epsilon until convergence
    this.addFunction(
      'limit',
      (
        /** @type {any} */ expr,
        /** @type {any} */ variable,
        /** @type {number} */ approach,
        /** @type {string} */ direction
      ) => {
        if (typeof expr !== 'string') {
          throw new Error('limit() expects an expression string');
        }
        const compiled = this.compile(expr);
        const epsilons = [1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-10];
        let lastVal = NaN;
        for (const eps of epsilons) {
          let x;
          if (direction === 'right') {
            x = approach + eps;
          } else if (direction === 'left') {
            x = approach - eps;
          } else {
            x = approach + eps;
          }
          const val = compiled({ [variable]: x });
          if (isFinite(val)) {
            lastVal = val;
          }
        }
        return lastVal;
      }
    );

    // --- expand(): detect polynomial degree via forward differences, solve Vandermonde system for coefficients ---
    this.addFunction('expand', (/** @type {string} */ expr) => {
      if (typeof expr !== 'string') {
        throw new Error('expand() expects an expression string');
      }
      const variableMatch = expr.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
      if (!variableMatch) {
        throw new Error('expand() could not identify variable');
      }
      const v = variableMatch[0];
      const cleaned = expr.replace(/\s+/g, '').replace(/"/g, '\\"');
      const addStar = (/** @type {string} */ s) => s.replace(/(\d)([a-zA-Z_])/g, '$1*$2');
      const evalAt = (/** @type {number} */ x) =>
        this.evaluate(`substitute("${addStar(cleaned)}", "${v}", ${x})`);

      const maxDegree = 10;
      const vals = [];
      for (let i = 0; i <= maxDegree; i++) {
        vals.push(evalAt(i));
      }

      let degree = 0;
      let diffs = [...vals];
      for (let d = 0; d <= maxDegree; d++) {
        if (Math.abs(diffs[0]) > 1e-10) {
          degree = d;
        }
        const next = [];
        for (let i = 0; i < diffs.length - 1; i++) {
          next.push(diffs[i + 1] - diffs[i]);
        }
        diffs = next;
        if (diffs.every((x) => Math.abs(x) < 1e-10)) {
          break;
        }
      }

      const n = degree + 1;
      const m = Array.from({ length: n }, (_, i) => {
        const row = Array.from({ length: n }, (_, j) => i ** j);
        row.push(vals[i]);
        return row;
      });
      for (let col = 0; col < n; col++) {
        let pivot = col;
        while (pivot < n && Math.abs(m[pivot][col]) < 1e-12) {
          pivot++;
        }
        if (pivot === n) {
          continue;
        }
        [m[col], m[pivot]] = [m[pivot], m[col]];
        const pv = m[col][col];
        for (let j = col; j <= n; j++) {
          m[col][j] /= pv;
        }
        for (let row = 0; row < n; row++) {
          if (row !== col) {
            const f = m[row][col];
            for (let j = col; j <= n; j++) {
              m[row][j] -= f * m[col][j];
            }
          }
        }
      }
      const coeffs = m.map((row) => (Math.abs(row[n]) < 1e-10 ? 0 : row[n]));
      const terms = [];
      for (let i = degree; i >= 0; i--) {
        const c = coeffs[i];
        if (Math.abs(c) < 1e-10) {
          continue;
        }
        const sign = terms.length === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + ';
        const absC = Math.abs(c);
        const cStr = i === 0 ? `${absC}` : absC === 1 ? '' : `${absC}`;
        const pStr = i === 0 ? '' : i === 1 ? v : `${v}^${i}`;
        terms.push(`${sign}${cStr}${pStr}`);
      }
      return terms.join('') || '0';
    });

    // --- factor(): detect degree, solve coefficients, apply rational root theorem + synthetic division ---
    this.addFunction('factor', (/** @type {string} */ poly) => {
      if (typeof poly !== 'string') {
        throw new Error('factor() expects an expression string');
      }
      const cleaned = poly.replace(/\s+/g, '');
      const variableMatch = cleaned.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
      if (!variableMatch) {
        throw new Error('factor() could not identify variable');
      }
      const variable = variableMatch[0];
      const addStar = (/** @type {string} */ s) =>
        s.replace(/"/g, '\\"').replace(/(\d)([a-zA-Z_])/g, '$1*$2');
      const cleanedExpr = addStar(cleaned);
      const maxPower = 6;
      const vals = [];
      for (let power = 0; power <= maxPower; power++) {
        vals.push(this.evaluate(`substitute("${cleanedExpr}", "${variable}", ${power})`));
      }
      let diff = vals.slice();
      let degree = 0;
      for (let d = 0; d <= maxPower; d++) {
        if (diff.every((x) => Math.abs(x) < 1e-10)) {
          degree = Math.max(0, d - 1);
          break;
        }
        if (d < maxPower) {
          const next = [];
          for (let i = 0; i < diff.length - 1; i++) {
            next.push(diff[i + 1] - diff[i]);
          }
          diff = next;
        }
      }
      if (degree === 0) {
        return `(${poly})`;
      }
      const n = degree + 1;
      const m = Array.from({ length: n }, (_, i) => {
        const row = Array.from({ length: n }, (_, j) => i ** j);
        row.push(vals[i]);
        return row;
      });
      for (let col = 0; col < n; col++) {
        let pivot = col;
        while (pivot < n && Math.abs(m[pivot][col]) < 1e-12) {
          pivot++;
        }
        if (pivot === n) {
          continue;
        }
        [m[col], m[pivot]] = [m[pivot], m[col]];
        const pv = m[col][col];
        for (let j = col; j <= n; j++) {
          m[col][j] /= pv;
        }
        for (let row = 0; row < n; row++) {
          if (row !== col) {
            const f = m[row][col];
            for (let j = col; j <= n; j++) {
              m[row][j] -= f * m[col][j];
            }
          }
        }
      }
      const coeffs = m.map((r) => (Math.abs(r[n]) < 1e-10 ? 0 : r[n]));
      if (degree >= 1 && degree <= 3) {
        const polyRootFn = this.functions.get('polynomialRoot');
        const rootArr = polyRootFn(...coeffs);
        const rootArrFlat = Array.isArray(rootArr) ? rootArr : [rootArr];
        const unique = [
          ...new Set(
            rootArrFlat.map((r) => (Number.isInteger(r) ? r : Math.round(r * 1e10) / 1e10))
          ),
        ].sort((a, b) => a - b);
        if (unique.length === degree) {
          const lead = coeffs[degree];
          const leadStr =
            Math.abs(lead - 1) > 1e-10 ? (Math.abs(lead + 1) < 1e-10 ? '-' : `${lead}`) : '';
          const factors = unique.map((r) => {
            if (Math.abs(r) < 1e-10) {
              return variable;
            }
            return r > 0 ? `(${variable} - ${r})` : `(${variable} + ${Math.abs(r)})`;
          });
          return `${leadStr}${factors.join('')}`;
        }
      }
      return `(${poly})`;
    });

    // --- solve(): split on '=', form f(x)=0, detect polynomial degree, find roots ---
    this.addFunction('solve', (/** @type {string} */ eqn, /** @type {string} */ variable) => {
      if (typeof eqn !== 'string') {
        throw new Error('solve() expects an equation string');
      }
      const parts = eqn.split('=');
      if (parts.length !== 2) {
        throw new Error('solve() expects an equation with =');
      }
      const lhs = parts[0].trim();
      const rhs = parts[1].trim();
      const expr = `(${lhs}) - (${rhs})`;
      const cleaned = expr.replace(/\s+/g, '');
      const variableMatch = cleaned.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
      const v = variable || (variableMatch ? variableMatch[0] : 'x');
      const addStar = (/** @type {string} */ s) =>
        s.replace(/"/g, '\\"').replace(/(\d)([a-zA-Z_])/g, '$1*$2');
      const cleanedExpr = addStar(cleaned);
      const maxPower = 6;
      const vals = [];
      for (let power = 0; power <= maxPower; power++) {
        vals.push(this.evaluate(`substitute("${cleanedExpr}", "${v}", ${power})`));
      }
      let diff = vals.slice();
      let degree = 0;
      for (let d = 0; d <= maxPower; d++) {
        if (diff.every((x) => Math.abs(x) < 1e-10)) {
          degree = Math.max(0, d - 1);
          break;
        }
        if (d < maxPower) {
          const next = [];
          for (let i = 0; i < diff.length - 1; i++) {
            next.push(diff[i + 1] - diff[i]);
          }
          diff = next;
        }
      }
      if (degree === 0) {
        throw new Error('No solution found');
      }
      const n = degree + 1;
      const m = Array.from({ length: n }, (_, i) => {
        const row = Array.from({ length: n }, (_, j) => i ** j);
        row.push(vals[i]);
        return row;
      });
      for (let col = 0; col < n; col++) {
        let pivot = col;
        while (pivot < n && Math.abs(m[pivot][col]) < 1e-12) {
          pivot++;
        }
        if (pivot === n) {
          continue;
        }
        [m[col], m[pivot]] = [m[pivot], m[col]];
        const pv = m[col][col];
        for (let j = col; j <= n; j++) {
          m[col][j] /= pv;
        }
        for (let row = 0; row < n; row++) {
          if (row !== col) {
            const f = m[row][col];
            for (let j = col; j <= n; j++) {
              m[row][j] -= f * m[col][j];
            }
          }
        }
      }
      const coeffs = m.map((r) => (Math.abs(r[n]) < 1e-10 ? 0 : r[n]));
      if (degree >= 1 && degree <= 3) {
        const polyRootFn = this.functions.get('polynomialRoot');
        const rootArr = polyRootFn(...coeffs);
        const rootArrFlat = Array.isArray(rootArr) ? rootArr : [rootArr];
        return rootArrFlat.sort((a, b) => a - b);
      }
      throw new Error('solve() currently supports degree up to 3');
    });
  }

  /**
   * @param {any} name
   * @param {any} value
   */
  setVariable(name, value) {
    this.variables.set(name, value);
  }

  /**
   * @param {any} name
   */
  getVariable(name) {
    return this.variables.get(name);
  }

  /**
   * @param {string} name
   * @param {any} fn
   */
  addFunction(name, fn) {
    this.functions.register(name, fn);
  }

  _createContext() {
    return createContext({
      functions: this.functions,
      variables: this.variables,
      units: this.units,
      evaluate: this.evaluate.bind(this),
    });
  }

  /**
   * @param {any} expr
   */
  tokenize(expr) {
    if (typeof expr !== 'string') {
      throw new Error('Expression must be a string');
    }
    return tokenize(expr, this._createContext());
  }

  /**
   * @param {string} expr
   */
  parse(expr) {
    const tokens = this.tokenize(expr);
    const ast = buildAST(tokens);
    return { tokens, ast };
  }

  /**
   * @param {string} expr
   * @param {object} [scope]
   */
  evaluate(expr, scope = {}) {
    return formatResult(this._evaluateRaw(expr, scope));
  }

  /**
   * @param {string} expr
   * @param {object} [scope]
   */
  _evaluateRaw(expr, scope = {}) {
    const { ast } = this.parse(expr);
    const ctx = this._createContext();
    const mergedCtx = Object.keys(scope).length > 0 ? ctx.withScope(scope) : ctx;
    return evaluateAST(ast, mergedCtx);
  }

  /**
   * @param {string} expr
   */
  compile(expr) {
    if (this._cache.has(expr)) {
      return this._cache.get(expr);
    }

    const { ast } = this.parse(expr);

    const compiledFn = (scope = {}) => {
      const baseContext = this._createContext();
      const scopedContext = baseContext.withScope(scope);
      return formatResult(evaluateAST(ast, scopedContext));
    };

    this._cache.set(expr, compiledFn);
    return compiledFn;
  }

  clearCache() {
    this._cache.clear();
  }

  exportState() {
    return {
      variables: this.variables.all(),
      functions: this.functions.getAllFunctionsName(),
      units: this.units.getUnits(),
    };
  }

  importState(state) {
    if (state.variables) {
      this.variables.merge(state.variables);
    }
    if (state.units) {
      this.units.setUnits(state.units);
    }
    if (state.functions) {
      for (const name of state.functions) {
        if (!this.functions.has(name)) ;
      }
    }
    return this;
  }

  chain() {
    return new Chain(this);
  }
}

class Chain {
  /** @param {exprify} exprifyInstance */
  constructor(exprifyInstance) {
    this._expr = exprifyInstance;
    this._rawResult = undefined;
  }

  evaluate(expr, scope = {}) {
    this._rawResult = this._expr._evaluateRaw(expr, { ...scope, ans: this._rawResult });
    return this;
  }

  setVariable(name, value) {
    this._expr.setVariable(name, value);
    return this;
  }

  compile(expr) {
    return this._expr.compile(expr);
  }

  done() {
    return formatResult(this._rawResult);
  }
}

module.exports = exprify;
//# sourceMappingURL=exprify.cjs.cjs.map
