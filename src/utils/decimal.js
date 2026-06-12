const MAX_SAFE_DP = 100;

export class ExprDecimal {
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
        throw new Error(`Cannot create ExprDecimal from ${  value}`);
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
    if (int < 0n) {d.#sign = -sign;}
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
    const truncated = quotient.#fromParts(quotient.#sign, quotient.#int - (quotient.#int % 10n ** BigInt(quotient.#dp > 0 ? 1 : 0)), 0);
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
    if (d.#int === 0n) {d.#sign = 1;}
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
      if (coeffFrac) {r += `.${  coeffFrac}`;}
      r += 'e';
      r += exponent >= 0 ? '+' : '';
      r += exponent;
      return this.#sign === -1 ? `-${  r}` : r;
    };

    if (edp === 0) {
      if (s.length > 15) {return toScientific(s, s.length - 1);}
      return this.#sign === -1 ? `-${  s}` : s;
    }

    while (s.length <= edp) {s = `0${  s}`;}
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
      return this.#sign === -1 ? `-${  intPart}` : intPart;
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

export default ExprDecimal;
