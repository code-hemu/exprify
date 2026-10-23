import Exprify from '../src/index.js';

const VERSION = typeof __VERSION__ === 'undefined' ? 'dev' : __VERSION__;

const engine = new Exprify();

/**
 * Rounds away floating point noise.
 */
export function formatNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(14)));
}

/**
 * Matrices come back as a serialised DenseMatrix payload, render them as a grid.
 */
function matrixText(value) {
  if (!value.startsWith('{')) return null;

  try {
    const payload = JSON.parse(value);
    if (payload?.exprify !== 'DenseMatrix' || !Array.isArray(payload.data)) {
      return null;
    }

    return payload.data
      .map((row) => (Array.isArray(row) ? row.join('\t') : String(row)))
      .join('\n');
  } catch {
    return null;
  }
}

export function formatValue(value) {
  if (value === undefined) return { kind: 'undefined', text: 'undefined' };
  if (value === null) return { kind: 'text', text: 'null' };

  if (typeof value === 'number') {
    return { kind: 'number', text: formatNumber(value) };
  }

  if (typeof value === 'boolean') {
    return { kind: 'text', text: String(value) };
  }

  if (typeof value === 'string') {
    const grid = matrixText(value);
    return { kind: 'text', text: grid ?? value };
  }

  return { kind: 'text', text: JSON.stringify(value) };
}

/**
 * Evaluates a single expression and never throws.
 */
export function evaluateExpression(source) {
  const text = String(source ?? '').trim();

  if (!text) return { kind: 'empty', text: '' };

  try {
    return formatValue(engine.evaluate(text));
  } catch (error) {
    const message = (error && error.message) || String(error);
    return { kind: 'error', text: `Error: ${message}` };
  }
}

/* ------------------------------------------------------------------ *
 * function menu
 * ------------------------------------------------------------------ */

const FUNCTION_GROUPS = [
  [
    'Math',
    'abs round floor ceil trunc sign frac sqrt cbrt pow hypot exp expm1 log log2 log10 log1p clamp gamma lgamma erf max min',
  ],
  [
    'Trigonometry',
    'sin cos tan sec csc cot asin acos atan atand2 acot asec acsc sind cosd tand asind acosd atand sinh cosh tanh asinh acosh atanh acoth asech acsch angle',
  ],
  [
    'Statistics',
    'sum prod mean median mode std variance range quantile percentile covariance corr random randomInt randomNormal',
  ],
  [
    'Number theory',
    'gcd lcm factorial isPrime primeFactors fibonacci nCr nPr bitAnd bitOr bitXor bitNot beta',
  ],
  [
    'Linear algebra',
    'matrix sparse eye zeros ones identity diag det transpose inverse trace rank rref minor cofactor cross normalize projection cholesky eig svd qr lsolve lup lyap polynomialRoot',
  ],
  [
    'Algebra & calculus',
    'simplify expand factor solve derivative integral sigma pi limit substitute rationalize',
  ],
  [
    'Logic & comparison',
    'if and or not ! eq neq gt gte lt lte notEqual greaterThan greaterThanOrEqual lessThan lessThanOrEqual',
  ],
  ['Numbers', 'fraction numer denom bignumber isBigNumber isFraction'],
  [
    'Text & collections',
    'map filter split join upper lower trim replace substring length typeof parse leafCount',
  ],
];

/**
 * Ready-to-run sample expressions used when a function is picked from the menu.
 */
export const FUNCTION_EXAMPLES = Object.freeze({
  '!': '!false',
  abs: 'abs(-5)',
  acos: 'acos(1)',
  acosd: 'acosd(0)',
  acosh: 'acosh(1)',
  acot: 'acot(1)',
  acoth: 'acoth(2)',
  acsc: 'acsc(2)',
  acsch: 'acsch(1)',
  and: 'and(true, false)',
  angle: 'angle([1, 0], [0, 1])',
  asec: 'asec(2)',
  asech: 'asech(0.5)',
  asin: 'asin(0)',
  asind: 'asind(1)',
  asinh: 'asinh(0)',
  atan: 'atan(0)',
  atand: 'atand(1)',
  atand2: 'atand2(1, 0)',
  atanh: 'atanh(0)',
  beta: 'beta(1, 1)',
  bignumber: 'bignumber("0.1") + bignumber("0.2")',
  bitAnd: 'bitAnd(5, 3)',
  bitNot: 'bitNot(5)',
  bitOr: 'bitOr(5, 3)',
  bitXor: 'bitXor(5, 3)',
  cbrt: 'cbrt(27)',
  ceil: 'ceil(3.2)',
  cholesky: 'cholesky([4, 2; 2, 3])',
  clamp: 'clamp(10, 0, 5)',
  cofactor: 'cofactor([1, 2; 3, 4], 0, 0)',
  corr: 'corr([1, 2, 3], [2, 4, 6])',
  cos: 'cos(0)',
  cosd: 'cosd(0)',
  cosh: 'cosh(0)',
  cot: 'cot(pi / 4)',
  covariance: 'covariance([1, 2, 3], [2, 4, 6])',
  cross: 'cross([1, 0, 0], [0, 1, 0])',
  csc: 'csc(pi / 2)',
  denom: 'denom(fraction(3, 4))',
  derivative: 'derivative("x^3", "x")',
  det: 'det([1, 2; 3, 4])',
  diag: 'diag([1, 2, 3])',
  eig: 'eig([1, 2; 2, 1])',
  eq: 'eq(5, 5)',
  erf: 'erf(0)',
  exp: 'exp(1)',
  expand: 'expand("(x+1)^2")',
  expm1: 'expm1(0)',
  eye: 'eye(3)',
  factor: 'factor("x^2 - 5x + 6")',
  factorial: 'factorial(5)',
  fibonacci: 'fibonacci(10)',
  filter: 'filter([1, 2, 3, 4], "isPrime")',
  floor: 'floor(3.7)',
  frac: 'frac(3.7)',
  fraction: 'fraction(1, 3)',
  gamma: 'gamma(5)',
  gcd: 'gcd(12, 8)',
  greaterThan: 'greaterThan(5, 3)',
  greaterThanOrEqual: 'greaterThanOrEqual(5, 5)',
  gt: 'gt(5, 3)',
  gte: 'gte(5, 5)',
  hypot: 'hypot(3, 4)',
  identity: 'identity(3)',
  if: 'if(5 > 3, "yes", "no")',
  integral: 'integral("x^2", 0, 1)',
  inverse: 'inverse([1, 2; 3, 4])',
  isBigNumber: 'isBigNumber(bignumber(1))',
  isFraction: 'isFraction(fraction(1, 2))',
  isPrime: 'isPrime(7)',
  join: 'join(["a", "b", "c"], ",")',
  lcm: 'lcm(4, 6)',
  leafCount: 'leafCount("x + 1")',
  length: 'length("hello")',
  lessThan: 'lessThan(3, 5)',
  lessThanOrEqual: 'lessThanOrEqual(3, 5)',
  lgamma: 'lgamma(1)',
  limit: 'limit("1/x", "x", 1000000)',
  log: 'log(e)',
  log10: 'log10(100)',
  log1p: 'log1p(1)',
  log2: 'log2(8)',
  lower: 'lower("HELLO")',
  lsolve: 'lsolve([3, 2; 1, 2], [7; 5])',
  lt: 'lt(3, 5)',
  lte: 'lte(3, 5)',
  lup: 'lup([1, 2; 3, 4])',
  lyap: 'lyap([-1, 0; 0, -2], [1, 0; 0, 1])',
  map: 'map([1, 4, 9], "sqrt")',
  matrix: 'matrix([1, 2; 3, 4])',
  max: 'max(1, 5, 3)',
  mean: 'mean(1, 2, 3, 4, 5)',
  median: 'median(1, 3, 5, 7)',
  min: 'min(1, 5, 3)',
  minor: 'minor([1, 2, 3; 4, 5, 6; 7, 8, 9], 0, 0)',
  mode: 'mode(1, 2, 2, 3)',
  nCr: 'nCr(5, 2)',
  nPr: 'nPr(5, 2)',
  neq: 'neq(5, 3)',
  normalize: 'normalize([3, 4])',
  not: 'not(true)',
  notEqual: 'notEqual(5, 3)',
  numer: 'numer(fraction(3, 4))',
  ones: 'ones(2, 2)',
  or: 'or(true, false)',
  parse: 'parse("x+1")',
  percentile: 'percentile([1, 2, 3, 4], 50)',
  pi: 'pi("n", 1, 5, "n")',
  polynomialRoot: 'polynomialRoot(2, -3, 1)',
  pow: 'pow(2, 3)',
  primeFactors: 'primeFactors(12)',
  prod: 'prod(1, 2, 3, 4, 5)',
  projection: 'projection([1, 2], [3, 4])',
  qr: 'qr([1, 2; 3, 4])',
  quantile: 'quantile([1, 2, 3, 4], 0.5)',
  random: 'random()',
  randomInt: 'randomInt(1, 6)',
  randomNormal: 'randomNormal(0, 1)',
  range: 'range(3, 7, 1, 9)',
  rank: 'rank([1, 2; 3, 4])',
  rationalize: 'rationalize("1/x + 1/(x+1)")',
  replace: 'replace("hello world", "world", "there")',
  round: 'round(3.7)',
  rref: 'rref([1, 2; 3, 4])',
  sec: 'sec(0)',
  sigma: 'sigma("n", 1, 10, "n")',
  sign: 'sign(-5)',
  simplify: 'simplify("x^2 + 2x + x")',
  sin: 'sin(0)',
  sind: 'sind(90)',
  sinh: 'sinh(0)',
  solve: 'solve("x^2 - 4 = 0")',
  sparse: 'sparse([1, 2; 3, 4])',
  split: 'split("a,b,c", ",")',
  sqrt: 'sqrt(16)',
  std: 'std(1, 2, 3, 4, 5)',
  substitute: 'substitute("x+1", "x", 5)',
  substring: 'substring("hello", 1, 4)',
  sum: 'sum(1, 2, 3, 4, 5)',
  svd: 'svd([1, 2; 3, 4])',
  tan: 'tan(0)',
  tand: 'tand(45)',
  tanh: 'tanh(0)',
  trace: 'trace([1, 2; 3, 4])',
  transpose: 'transpose([1, 2; 3, 4])',
  trim: 'trim(" hello ")',
  trunc: 'trunc(3.7)',
  typeof: 'typeof(42)',
  upper: 'upper("hello")',
  variance: 'variance(1, 2, 3, 4, 5)',
  zeros: 'zeros(2, 3)',
});

/**
 * Groups the library functions, falling back to "Other" for anything new.
 */
export function functionGroups() {
  const available = new Set(engine.functions.getAllFunctionsName());
  const seen = new Set();
  const groups = [];

  for (const [name, members] of FUNCTION_GROUPS) {
    const list = members
      .split(' ')
      .filter((fn) => available.has(fn) && !seen.has(fn));

    if (!list.length) continue;

    for (const fn of list) seen.add(fn);
    groups.push({ name, members: list });
  }

  const rest = [...available].filter((fn) => !seen.has(fn)).sort();
  if (rest.length) groups.push({ name: 'Other', members: rest });

  return groups;
}

let menuItems = [];
let activeItem = null;

function setActive(item) {
  if (activeItem) activeItem.classList.remove('is-active');
  activeItem = item;

  if (!activeItem) return;

  activeItem.classList.add('is-active');
  activeItem.scrollIntoView?.({ block: 'nearest' });
}

function moveActive(delta) {
  if (!menuItems.length) return;

  const index = menuItems.indexOf(activeItem);
  const next = menuItems[(index + delta + menuItems.length) % menuItems.length];
  setActive(next);
}

/**
 * Renders the grouped function list, filtered by the search box.
 */
export function renderFunctions(query = '') {
  const needle = query.trim().toLowerCase();

  el.functionsList.replaceChildren();
  menuItems = [];
  setActive(null);

  let shown = 0;

  for (const group of functionGroups()) {
    const members = group.members.filter((fn) => fn.includes(needle));
    if (!members.length) continue;

    shown += members.length;

    const label = document.createElement('div');
    label.className = 'menu-group';
    label.textContent = group.name;
    el.functionsList.append(label);

    for (const name of members) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'menu-item';
      item.textContent = name;
      item.addEventListener('click', () => insertFunction(name));
      el.functionsList.append(item);
      menuItems.push(item);
    }
  }

  if (!shown) {
    const empty = document.createElement('div');
    empty.className = 'menu-empty';
    empty.textContent = 'No matching function.';
    el.functionsList.append(empty);
  }

  return shown;
}

/**
 * Inserts a call at the caret and re-evaluates.
 */
export function insertFunction(name) {
  const input = el.expression;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  const text = FUNCTION_EXAMPLES[name] ?? `${name}(`;

  input.value = input.value.slice(0, start) + text + input.value.slice(end);
  input.focus();
  input.setSelectionRange(start + text.length, start + text.length);

  render(evaluateExpression(input.value));
}

function setMenuOpen(open) {
  el.functionsPanel.hidden = !open;
  el.functionsToggle.setAttribute('aria-expanded', String(open));

  if (!open) {
    setActive(null);
    return;
  }

  renderFunctions(el.functionsFilter.value);
  el.functionsFilter.focus();
}

/* ------------------------------------------------------------------ *
 * wiring
 * ------------------------------------------------------------------ */

let el = null;
let initialized = false;

function render(outcome) {
  el.result.textContent = outcome.text;
  el.result.className = `result result--${outcome.kind}`;
}

function initMenu() {
  el.functionsToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenuOpen(el.functionsPanel.hidden);
  });

  el.functionsFilter.addEventListener('input', () => {
    renderFunctions(el.functionsFilter.value);
  });

  el.functionsFilter.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeItem) insertFunction(activeItem.textContent);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setMenuOpen(false);
      el.expression.focus();
    }
  });

  el.functionsPanel.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('click', () => {
    setMenuOpen(false);
  });
}

export function init() {
  if (initialized) return;
  initialized = true;

  el = {
    expression: document.getElementById('expression'),
    result: document.getElementById('result'),
    version: document.getElementById('version'),
    functionsToggle: document.getElementById('functions-toggle'),
    functionsPanel: document.getElementById('functions-panel'),
    functionsFilter: document.getElementById('functions-filter'),
    functionsList: document.getElementById('functions-list'),
  };

  el.version.textContent = `v${VERSION}`;
  el.expression.value = '2 + 3 * 4';
  el.expression.addEventListener('input', () =>
    render(evaluateExpression(el.expression.value)),
  );

  initMenu();
  render(evaluateExpression(el.expression.value));
}

if (typeof document !== 'undefined') {
  init();
}
