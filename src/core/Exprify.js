import { tokenize } from '../parser/tokenizer.js';
import { evaluateAST } from '../parser/evaluator.js';
import { createContext } from './context.js';
import { mathOperations } from '../math/operations.js';
import { createUnitsStore } from '../utils/store.js';
import { globalUnits } from '../utils/globalUnits.js';
import { createVarStore } from '../variables/store.js';
import { createFunctionRegistry } from '../function/registry.js';
import { internalFunctions } from '../function/internal.js';
import { isDenseMatrixWrapper, serializeExprifyValue, wrapDenseMatrix } from '../utils/matrix.js';
import { buildAST } from '../parser/astBuild.js';
import { isFraction, formatFraction } from '../math/fraction.js';
import { isBigNumber, formatBigNumber } from '../math/bignumber.js';

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
    const { ast } = this.parse(expr);
    const ctx = this._createContext();
    const mergedCtx = Object.keys(scope).length > 0 ? ctx.withScope(scope) : ctx;
    return formatResult(evaluateAST(ast, mergedCtx));
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
        if (!this.functions.has(name)) {
          // warn: function could not be restored (built-in only)
        }
      }
    }
    return this;
  }
}

export default exprify;
