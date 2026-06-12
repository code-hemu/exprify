import { unwrapDenseMatrix, wrapDenseMatrix } from '../utils/matrix.js';

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
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
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

export const internalFunctions = {
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
};
