const functions = [
  {
    name: 'sin',
    cat: 'trig',
    desc: 'Sine of x (radians)',
    example: 'sin(0) → 0',
  },
  {
    name: 'cos',
    cat: 'trig',
    desc: 'Cosine of x (radians)',
    example: 'cos(0) → 1',
  },
  {
    name: 'tan',
    cat: 'trig',
    desc: 'Tangent of x (radians)',
    example: 'tan(0) → 0',
  },
  {
    name: 'asin',
    cat: 'trig',
    desc: 'Arc sine (radians)',
    example: 'asin(0) → 0',
  },
  {
    name: 'acos',
    cat: 'trig',
    desc: 'Arc cosine (radians)',
    example: 'acos(1) → 0',
  },
  {
    name: 'atan',
    cat: 'trig',
    desc: 'Arc tangent (radians)',
    example: 'atan(1) → 0.785...',
  },
  {
    name: 'sec',
    cat: 'trig',
    desc: 'Secant of x (radians)',
    example: 'sec(0) → 1',
  },
  {
    name: 'csc',
    cat: 'trig',
    desc: 'Cosecant of x (radians)',
    example: 'csc(pi/2) → 1',
  },
  {
    name: 'cot',
    cat: 'trig',
    desc: 'Cotangent of x (radians)',
    example: 'cot(pi/4) → 1',
  },
  {
    name: 'sind',
    cat: 'trig',
    desc: 'Sine of x (degrees)',
    example: 'sind(90) → 1',
  },
  {
    name: 'cosd',
    cat: 'trig',
    desc: 'Cosine of x (degrees)',
    example: 'cosd(0) → 1',
  },
  {
    name: 'tand',
    cat: 'trig',
    desc: 'Tangent of x (degrees)',
    example: 'tand(45) → 1',
  },
  {
    name: 'asind',
    cat: 'trig',
    desc: 'Arc sine (degrees)',
    example: 'asind(1) → 90',
  },
  {
    name: 'acosd',
    cat: 'trig',
    desc: 'Arc cosine (degrees)',
    example: 'acosd(0) → 90',
  },
  {
    name: 'atand',
    cat: 'trig',
    desc: 'Arc tangent (degrees)',
    example: 'atand(1) → 45',
  },
  {
    name: 'atand2',
    cat: 'trig',
    desc: 'Arc tangent of y/x (degrees)',
    example: 'atand2(1,1) → 45',
  },
  // ---- Reciprocal Trig ----
  {
    name: 'acot',
    cat: 'trig',
    desc: 'Arc cotangent',
    example: 'acot(1) → 0.785...',
  },
  {
    name: 'asec',
    cat: 'trig',
    desc: 'Arc secant',
    example: 'asec(2) → 1.047...',
  },
  {
    name: 'acsc',
    cat: 'trig',
    desc: 'Arc cosecant',
    example: 'acsc(2) → 0.523...',
  },
  {
    name: 'acoth',
    cat: 'trig',
    desc: 'Arc hyperbolic cotangent',
    example: 'acoth(2) → 0.549...',
  },
  {
    name: 'asech',
    cat: 'trig',
    desc: 'Arc hyperbolic secant',
    example: 'asech(0.5) → 1.316...',
  },
  {
    name: 'acsch',
    cat: 'trig',
    desc: 'Arc hyperbolic cosecant',
    example: 'acsch(0.5) → 1.443...',
  },
  // ---- Hyperbolic ----
  {
    name: 'sinh',
    cat: 'trig',
    desc: 'Hyperbolic sine',
    example: 'sinh(0) → 0',
  },
  {
    name: 'cosh',
    cat: 'trig',
    desc: 'Hyperbolic cosine',
    example: 'cosh(0) → 1',
  },
  {
    name: 'tanh',
    cat: 'trig',
    desc: 'Hyperbolic tangent',
    example: 'tanh(0) → 0',
  },
  {
    name: 'asinh',
    cat: 'trig',
    desc: 'Arc hyperbolic sine',
    example: 'asinh(0) → 0',
  },
  {
    name: 'acosh',
    cat: 'trig',
    desc: 'Arc hyperbolic cosine',
    example: 'acosh(1) → 0',
  },
  {
    name: 'atanh',
    cat: 'trig',
    desc: 'Arc hyperbolic tangent',
    example: 'atanh(0) → 0',
  },
  // ---- Numeric ----
  {
    name: 'abs',
    cat: 'numeric',
    desc: 'Absolute value',
    example: 'abs(-5) → 5',
  },
  {
    name: 'round',
    cat: 'numeric',
    desc: 'Round to nearest integer',
    example: 'round(3.7) → 4',
  },
  {
    name: 'floor',
    cat: 'numeric',
    desc: 'Floor (round down)',
    example: 'floor(3.7) → 3',
  },
  {
    name: 'ceil',
    cat: 'numeric',
    desc: 'Ceiling (round up)',
    example: 'ceil(3.2) → 4',
  },
  {
    name: 'trunc',
    cat: 'numeric',
    desc: 'Truncate decimal part',
    example: 'trunc(3.7) → 3',
  },
  {
    name: 'sign',
    cat: 'numeric',
    desc: 'Sign of x (-1, 0, 1)',
    example: 'sign(-5) → -1',
  },
  {
    name: 'sqrt',
    cat: 'numeric',
    desc: 'Square root',
    example: 'sqrt(16) → 4',
  },
  {
    name: 'cbrt',
    cat: 'numeric',
    desc: 'Cube root',
    example: 'cbrt(27) → 3',
  },
  {
    name: 'pow',
    cat: 'numeric',
    desc: 'Power (a^b)',
    example: 'pow(2,3) → 8',
  },
  {
    name: 'exp',
    cat: 'numeric',
    desc: 'e^x',
    example: 'exp(1) → 2.718...',
  },
  {
    name: 'expm1',
    cat: 'numeric',
    desc: 'e^x - 1',
    example: 'expm1(1) → 1.718...',
  },
  {
    name: 'log',
    cat: 'numeric',
    desc: 'Natural logarithm',
    example: 'log(e) → 1',
  },
  {
    name: 'log2',
    cat: 'numeric',
    desc: 'Base-2 logarithm',
    example: 'log2(8) → 3',
  },
  {
    name: 'log10',
    cat: 'numeric',
    desc: 'Base-10 logarithm',
    example: 'log10(100) → 2',
  },
  {
    name: 'log1p',
    cat: 'numeric',
    desc: 'ln(1 + x)',
    example: 'log1p(0) → 0',
  },
  {
    name: 'hypot',
    cat: 'numeric',
    desc: '√(sum of squares)',
    example: 'hypot(3,4) → 5',
  },
  {
    name: 'frac',
    cat: 'numeric',
    desc: 'Fractional part',
    example: 'frac(3.7) → 0.7',
  },
  {
    name: 'clamp',
    cat: 'numeric',
    desc: 'Clamp x between min and max',
    example: 'clamp(5,1,3) → 3',
  },
  {
    name: 'random',
    cat: 'numeric',
    desc: 'Random number [0, 1)',
    example: 'random() → 0.123...',
  },
  {
    name: 'randomInt',
    cat: 'numeric',
    desc: 'Random integer [min, max]',
    example: 'randomInt(1,6) → 4',
  },
  {
    name: 'randomNormal',
    cat: 'numeric',
    desc: 'Normal distribution (mean, std)',
    example: 'randomNormal(0,1)',
  },
  // ---- Bitwise ----
  {
    name: 'bitAnd',
    cat: 'bitwise',
    desc: 'Bitwise AND',
    example: 'bitAnd(5,3) → 1',
  },
  {
    name: 'bitOr',
    cat: 'bitwise',
    desc: 'Bitwise OR',
    example: 'bitOr(5,3) → 7',
  },
  {
    name: 'bitXor',
    cat: 'bitwise',
    desc: 'Bitwise XOR',
    example: 'bitXor(5,3) → 6',
  },
  {
    name: 'bitNot',
    cat: 'bitwise',
    desc: 'Bitwise NOT',
    example: 'bitNot(0) → -1',
  },
  // ---- Stats ----
  {
    name: 'max',
    cat: 'stats',
    desc: 'Maximum of arguments',
    example: 'max(1,5,2) → 5',
  },
  {
    name: 'min',
    cat: 'stats',
    desc: 'Minimum of arguments',
    example: 'min(1,5,2) → 1',
  },
  {
    name: 'sum',
    cat: 'stats',
    desc: 'Sum of arguments',
    example: 'sum(1,2,3) → 6',
  },
  {
    name: 'prod',
    cat: 'stats',
    desc: 'Product of arguments',
    example: 'prod(2,3,4) → 24',
  },
  {
    name: 'mean',
    cat: 'stats',
    desc: 'Arithmetic mean',
    example: 'mean(1,2,3) → 2',
  },
  {
    name: 'median',
    cat: 'stats',
    desc: 'Median',
    example: 'median(1,3,2) → 2',
  },
  {
    name: 'mode',
    cat: 'stats',
    desc: 'Most frequent value',
    example: 'mode(1,2,2,3) → 2',
  },
  {
    name: 'std',
    cat: 'stats',
    desc: 'Sample standard deviation',
    example: 'std(1,2,3) → 1',
  },
  {
    name: 'variance',
    cat: 'stats',
    desc: 'Sample variance',
    example: 'variance(1,2,3) → 1',
  },
  {
    name: 'range',
    cat: 'stats',
    desc: 'Max - min',
    example: 'range(1,5,2) → 4',
  },
  {
    name: 'quantile',
    cat: 'stats',
    desc: 'Quantile (p in [0,1])',
    example: 'quantile([1,2,3,4,5],0.5) → 3',
  },
  {
    name: 'percentile',
    cat: 'stats',
    desc: 'Percentile (p in [0,100])',
    example: 'percentile([1,2,3,4,5],50) → 3',
  },
  {
    name: 'covariance',
    cat: 'stats',
    desc: 'Sample covariance',
    example: 'covariance([1,2],[3,4]) → 2',
  },
  {
    name: 'corr',
    cat: 'stats',
    desc: 'Pearson correlation',
    example: 'corr([1,2],[3,4]) → 1',
  },
  // ---- Number Theory ----
  {
    name: 'gcd',
    cat: 'numeric',
    desc: 'Greatest common divisor',
    example: 'gcd(12,8) → 4',
  },
  {
    name: 'lcm',
    cat: 'numeric',
    desc: 'Least common multiple',
    example: 'lcm(4,6) → 12',
  },
  {
    name: 'factorial',
    cat: 'numeric',
    desc: 'Factorial n!',
    example: 'factorial(5) → 120',
  },
  {
    name: 'nCr',
    cat: 'numeric',
    desc: 'Binomial coefficient',
    example: 'nCr(5,2) → 10',
  },
  {
    name: 'nPr',
    cat: 'numeric',
    desc: 'Permutations',
    example: 'nPr(5,2) → 20',
  },
  {
    name: 'isPrime',
    cat: 'numeric',
    desc: 'Check if n is prime',
    example: 'isPrime(7) → true',
  },
  {
    name: 'primeFactors',
    cat: 'numeric',
    desc: 'Prime factorization',
    example: 'primeFactors(12) → [2,2,3]',
  },
  {
    name: 'fibonacci',
    cat: 'numeric',
    desc: 'nth Fibonacci number',
    example: 'fibonacci(7) → 13',
  },
  {
    name: 'gamma',
    cat: 'numeric',
    desc: 'Gamma function',
    example: 'gamma(5) → 24',
  },
  // ---- Special Functions ----
  {
    name: 'erf',
    cat: 'special',
    desc: 'Error function',
    example: 'erf(1) → 0.8427',
  },
  {
    name: 'lgamma',
    cat: 'special',
    desc: 'Log-gamma function',
    example: 'lgamma(1) → 0',
  },
  {
    name: 'beta',
    cat: 'special',
    desc: 'Beta function',
    example: 'beta(2,3) → 0.0833',
  },
  // ---- Matrix ----
  {
    name: 'matrix',
    cat: 'matrix',
    desc: 'Create a dense matrix',
    example: 'matrix([1,2;3,4])',
  },
  {
    name: 'sparse',
    cat: 'matrix',
    desc: 'Create a sparse matrix',
    example: 'sparse([1,0;0,2])',
  },
  {
    name: 'identity',
    cat: 'matrix',
    desc: 'Identity matrix',
    example: 'identity(3)',
  },
  {
    name: 'eye',
    cat: 'matrix',
    desc: 'Identity matrix (alias)',
    example: 'eye(3)',
  },
  {
    name: 'zeros',
    cat: 'matrix',
    desc: 'Matrix of zeros',
    example: 'zeros(2,3)',
  },
  {
    name: 'ones',
    cat: 'matrix',
    desc: 'Matrix of ones',
    example: 'ones(2,3)',
  },
  {
    name: 'diag',
    cat: 'matrix',
    desc: 'Diagonal matrix',
    example: 'diag([1,2,3])',
  },
  {
    name: 'det',
    cat: 'matrix',
    desc: 'Determinant',
    example: 'det([1,2;3,4]) → -2',
  },
  {
    name: 'transpose',
    cat: 'matrix',
    desc: 'Matrix transpose',
    example: 'transpose([1,2;3,4])',
  },
  {
    name: 'inverse',
    cat: 'matrix',
    desc: 'Matrix inverse',
    example: 'inverse([1,2;3,4])',
  },
  {
    name: 'trace',
    cat: 'matrix',
    desc: 'Matrix trace',
    example: 'trace([1,2;3,4]) → 5',
  },
  {
    name: 'rank',
    cat: 'matrix',
    desc: 'Matrix rank',
    example: 'rank([1,2;3,4]) → 2',
  },
  {
    name: 'rref',
    cat: 'matrix',
    desc: 'Reduced row echelon form',
    example: 'rref([1,2;3,4])',
  },
  {
    name: 'minor',
    cat: 'matrix',
    desc: 'Minor (determinant of submatrix)',
    example: 'minor([1,2;3,4],0,0) → 4',
  },
  {
    name: 'cofactor',
    cat: 'matrix',
    desc: 'Cofactor',
    example: 'cofactor([1,2;3,4],0,0) → 4',
  },
  {
    name: 'cross',
    cat: 'matrix',
    desc: 'Cross product of 3D vectors',
    example: 'cross([1,0,0],[0,1,0])',
  },
  {
    name: 'normalize',
    cat: 'matrix',
    desc: 'Normalize a vector',
    example: 'normalize([3,4]) → [0.6,0.8]',
  },
  {
    name: 'angle',
    cat: 'matrix',
    desc: 'Angle between vectors',
    example: 'angle([1,0],[0,1])',
  },
  {
    name: 'projection',
    cat: 'matrix',
    desc: 'Scalar projection',
    example: 'projection([1,2],[3,4])',
  },
  {
    name: 'lsolve',
    cat: 'matrix',
    desc: 'Solve linear system',
    example: 'lsolve([[3,2],[1,2]],[7,5])',
  },
  {
    name: 'lup',
    cat: 'matrix',
    desc: 'LUP decomposition',
    example: 'lup([1,2;3,4])',
  },
  {
    name: 'qr',
    cat: 'matrix',
    desc: 'QR decomposition',
    example: 'qr([1,2;3,4])',
  },
  {
    name: 'cholesky',
    cat: 'matrix',
    desc: 'Cholesky decomposition',
    example: 'cholesky([[4,2],[2,3]])',
  },
  {
    name: 'eig',
    cat: 'matrix',
    desc: 'Eigenvalues (2x2)',
    example: 'eig([1,2;3,4])',
  },
  {
    name: 'svd',
    cat: 'matrix',
    desc: 'SVD decomposition',
    example: 'svd([1,2;3,4])',
  },
  {
    name: 'lyap',
    cat: 'matrix',
    desc: 'Solve Lyapunov equation',
    example: 'lyap([-1,0;0,-2], eye(2))',
  },
  {
    name: 'polynomialRoot',
    cat: 'matrix',
    desc: 'Polynomial roots',
    example: 'polynomialRoot(1,0,-4) → [-2,2]',
  },
  // ---- Symbolic ----
  {
    name: 'simplify',
    cat: 'symbolic',
    desc: 'Simplify expression string',
    example: 'simplify("x^2+2x+1")',
  },
  {
    name: 'derivative',
    cat: 'symbolic',
    desc: 'Symbolic derivative',
    example: 'derivative("x^3","x")',
  },
  {
    name: 'expand',
    cat: 'symbolic',
    desc: 'Expand expression',
    example: 'expand("(x+1)^2")',
  },
  {
    name: 'factor',
    cat: 'symbolic',
    desc: 'Factor expression',
    example: 'factor("x^2-5x+6")',
  },
  {
    name: 'solve',
    cat: 'symbolic',
    desc: 'Solve equation',
    example: 'solve("x^2-4=0")',
  },
  {
    name: 'rationalize',
    cat: 'symbolic',
    desc: 'Rationalize expression',
    example: 'rationalize("1/(x+1)")',
  },
  // ---- Calculus ----
  {
    name: 'integral',
    cat: 'calc',
    desc: 'Numerical integration (Simpson)',
    example: 'integral("x^2",0,1)',
  },
  {
    name: 'sigma',
    cat: 'calc',
    desc: 'Summation notation',
    example: 'sigma("k",1,10,"k^2")',
  },
  {
    name: 'pi',
    cat: 'calc',
    desc: 'Product notation',
    example: 'pi("k",1,5,"k")',
  },
  {
    name: 'limit',
    cat: 'calc',
    desc: 'Numerical limit',
    example: 'limit("1/x", "x", INFINITY)',
  },
  {
    name: 'substitute',
    cat: 'calc',
    desc: 'Substitute into expression string',
    example: 'substitute("x^2","x",3)',
  },
  // ---- String ----
  {
    name: 'split',
    cat: 'string',
    desc: 'Split string by separator',
    example: 'split("a,b",",")',
  },
  {
    name: 'join',
    cat: 'string',
    desc: 'Join array with separator',
    example: 'join(["a","b"],",")',
  },
  {
    name: 'upper',
    cat: 'string',
    desc: 'Uppercase',
    example: 'upper("hello") → HELLO',
  },
  {
    name: 'lower',
    cat: 'string',
    desc: 'Lowercase',
    example: 'lower("HELLO") → hello',
  },
  {
    name: 'trim',
    cat: 'string',
    desc: 'Trim whitespace',
    example: 'trim(" hi ") → hi',
  },
  {
    name: 'replace',
    cat: 'string',
    desc: 'Replace pattern in string',
    example: 'replace("hello","l","x")',
  },
  {
    name: 'substring',
    cat: 'string',
    desc: 'Extract substring',
    example: 'substring("hello",1,3) → el',
  },
  // ---- Type / Conversion ----
  {
    name: 'fraction',
    cat: 'type',
    desc: 'Create fraction n/d',
    example: 'fraction(1,3) → 1/3',
  },
  {
    name: 'numer',
    cat: 'type',
    desc: 'Fraction numerator',
    example: 'numer(fraction(3,4)) → 3',
  },
  {
    name: 'denom',
    cat: 'type',
    desc: 'Fraction denominator',
    example: 'denom(fraction(3,4)) → 4',
  },
  {
    name: 'isFraction',
    cat: 'type',
    desc: 'Check if value is a fraction',
    example: 'isFraction(5) → false',
  },
  {
    name: 'bignumber',
    cat: 'type',
    desc: 'Create arbitrary-precision number',
    example: 'bignumber("0.1")',
  },
  {
    name: 'isBigNumber',
    cat: 'type',
    desc: 'Check if value is a BigNumber',
    example: 'isBigNumber(5) → false',
  },
  {
    name: 'typeof',
    cat: 'type',
    desc: 'Type of value',
    example: 'typeof(5) → "number"',
  },
  // ---- Logic ----
  {
    name: 'and',
    cat: 'numeric',
    desc: 'Logical AND',
    example: 'and(true, false) → false',
  },
  {
    name: 'or',
    cat: 'numeric',
    desc: 'Logical OR',
    example: 'or(true, false) → true',
  },
  {
    name: 'not / !',
    cat: 'numeric',
    desc: 'Logical NOT',
    example: 'not(true) → false',
  },
  {
    name: 'if',
    cat: 'numeric',
    desc: 'Conditional (cond ? a : b)',
    example: 'if(1<2, "yes", "no")',
  },
  {
    name: 'eq',
    cat: 'numeric',
    desc: 'Equality (==)',
    example: 'eq(5,5) → true',
  },
  {
    name: 'neq / notEqual',
    cat: 'numeric',
    desc: 'Inequality (!=)',
    example: 'neq(5,3) → true',
  },
  // ---- Array / Functional ----
  {
    name: 'map',
    cat: 'numeric',
    desc: 'Map over array',
    example: 'map(x -> x^2, [1,2,3])',
  },
  {
    name: 'filter',
    cat: 'numeric',
    desc: 'Filter array',
    example: 'filter(x -> x>2, [1,2,3,4])',
  },
  {
    name: 'length',
    cat: 'string',
    desc: 'Length of string or array',
    example: 'length("hi") → 2',
  },
  {
    name: 'leafCount',
    cat: 'numeric',
    desc: 'Count tokens in expression',
    example: 'leafCount("2+3*4")',
  },
  {
    name: 'parse',
    cat: 'string',
    desc: 'Parse expression (returns string)',
    example: 'parse("2+2") → "2+2"',
  },
];

// ---- Render ----
const catLabels = {
  trig: 'Trig',
  numeric: 'Numeric',
  stats: 'Stats',
  matrix: 'Matrix',
  symbolic: 'Symbolic',
  calc: 'Calculus',
  string: 'String',
  type: 'Type/Conversion',
  bitwise: 'Bitwise',
  special: 'Special',
};
const catOrder = [
  'trig',
  'numeric',
  'bitwise',
  'stats',
  'matrix',
  'symbolic',
  'calc',
  'string',
  'type',
  'special',
];

const tbody = document.getElementById('tbody');
const search = document.getElementById('search');
const filtersEl = document.getElementById('filters');
const countEl = document.getElementById('count');

let activeCat = '';

function render() {
  const q = search.value.toLowerCase();
  let filtered = functions.filter((f) => {
    if (activeCat && f.cat !== activeCat) return false;
    if (q) {
      return (
        f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q) || f.cat.includes(q)
      );
    }
    return true;
  });
  countEl.textContent = `${filtered.length} / ${functions.length} functions`;
  tbody.innerHTML = '';
  filtered.forEach((f) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="name">${f.name}</td><td class="cat"><span class="tag tag-${f.cat}">${catLabels[f.cat] || f.cat}</span></td><td class="desc">${f.desc}</td><td class="example"><code>${f.example}</code></td>`;
    tbody.appendChild(tr);
  });
}

function buildFilters() {
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All';
  allBtn.className = 'active';
  allBtn.addEventListener('click', () => {
    activeCat = '';
    document.querySelectorAll('#filters button').forEach((b) => b.classList.remove('active'));
    allBtn.classList.add('active');
    render();
  });
  filtersEl.appendChild(allBtn);
  catOrder.forEach((cat) => {
    const btn = document.createElement('button');
    btn.textContent = catLabels[cat] || cat;
    btn.addEventListener('click', () => {
      activeCat = cat;
      document.querySelectorAll('#filters button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
    filtersEl.appendChild(btn);
  });
}

buildFilters();
render();
search.addEventListener('input', render);
