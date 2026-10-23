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
  const text = `${name}(`;

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
    setMenuOpen(!el.functionsPanel.hidden);
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
