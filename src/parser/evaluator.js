import { unwrapDenseMatrix, wrapDenseMatrix, isDenseMatrixWrapper } from '../utils/matrix.js';
import { isFraction, fraction as createFrac, addFrac, subFrac, mulFrac, divFrac, powFrac } from '../math/fraction.js';
import { isBigNumber, bigNumber as createBN } from '../math/bignumber.js';

/** @param {any } node*/
export function evaluateAST(node, context = {}) {
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
          if (isBigNumber(val)) {return val.negated();}
          if (isComplex(val)) {return simplifyComplex({ re: -val.re, im: -val.im });}
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
        const a = isFraction(left) ? left : createFrac(left, 1);
        const b = isFraction(right) ? right : createFrac(right, 1);
        switch (node.operator) {
          case '+': return addFrac(a, b);
          case '-': return subFrac(a, b);
          case '*': return mulFrac(a, b);
          case '/': return divFrac(a, b);
          case '^': {
            const p = powFrac(a, right);
            if (p) {return p;}
            throw nodeError('Fraction power requires non-negative integer exponent');
          }
          default: throw nodeError(`Operator ${node.operator} not supported for fractions`);
        }
      }

      if (isBigNumber(left) || isBigNumber(right)) {
        const a = isBigNumber(left) ? left : createBN(left);
        const b = isBigNumber(right) ? right : createBN(right);
        switch (node.operator) {
          case '+': return a.plus(b);
          case '-': return a.minus(b);
          case '*': return a.times(b);
          case '/': return a.div(b);
          case '%': return a.mod(b);
          case '^': return a.pow(b);
          case '>': return a.gt(b);
          case '<': return a.lt(b);
          case '>=': return a.gte(b);
          case '<=': return a.lte(b);
          case '==': return a.eq(b);
          default: throw nodeError(`Operator ${node.operator} not supported for BigNumber`);
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
