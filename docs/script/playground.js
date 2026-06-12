import Exprify from '../dist/exprify.esm.js';

const expr = new Exprify();
const output = document.getElementById('output');
const input = document.getElementById('input');
const varsBody = document.getElementById('vars-body');

const examples = [
  ['Basic arithmetic', '2 + 2 * 3'],
  ['Scientific notation', 'bignumber("1.2e500")'],
  ['Cube root', 'cbrt(27)'],
  ['Fractions', 'fraction(1,3) + fraction(1,6)'],
  ['BigNumber precision', 'bignumber("0.1") + bignumber("0.2")'],
  ['Trig sind', 'sind(90)'],
  ['Matrix solving', 'lsolve([[3,2],[1,2]],[7,5])'],
  ['Statistics', 'mean(1,2,3,4,5,6,7,8,9,10)'],
  ['Polynomial roots', 'polynomialRoot(1,0,-4)'],
  ['Calculus', 'integral("x^2", 0, 1)'],
  ['Symbolic derivative', 'derivative("x^3 + 2x", "x")'],
  ['Bitwise AND', 'bitAnd(12, 5)'],
  ['Error function', 'erf(1)'],
  ['Hypotenuse', 'hypot(3, 4)'],
  ['Covariance', 'covariance([1,2,3,4,5],[2,4,6,8,10])'],
];

function renderExamples() {
  const list = document.getElementById('examples');
  examples.forEach(([label, ex]) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.title = ex;
    btn.addEventListener('click', () => {
      input.value = ex;
      run();
    });
    list.appendChild(btn);
  });
}

function run() {
  const text = input.value.trim();
  if (!text) return;
  addEntry(text, null);
  input.value = '';
  try {
    const result = expr.evaluate(text);
    addResult(result);
  } catch (e) {
    addError(e.message);
  }
  updateVars();
}

function addEntry(exprText, result) {
  const div = document.createElement('div');
  div.className = 'entry';
  div.innerHTML = `<span class="prompt">&gt; </span><span class="expr">${esc(exprText)}</span>`;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function addResult(val) {
  const div = document.createElement('div');
  div.className = 'entry';
  div.innerHTML = `<span class="prompt">  </span><span class="result">${esc(String(val))}</span>`;
  output.appendChild(div);
  const sep = document.createElement('div');
  sep.className = 'sep';
  output.appendChild(sep);
  output.scrollTop = output.scrollHeight;
}

function addError(msg) {
  const div = document.createElement('div');
  div.className = 'entry';
  div.innerHTML = `<span class="prompt">  </span><span class="error">${esc(msg)}</span>`;
  output.appendChild(div);
  const sep = document.createElement('div');
  sep.className = 'sep';
  output.appendChild(sep);
  output.scrollTop = output.scrollHeight;
}

function updateVars() {
  const state = expr.exportState();
  varsBody.innerHTML = '';
  const allVars = state.variables || {};
  const keys = Object.keys(allVars).sort();
  keys.forEach(k => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.textContent = k;
    const td2 = document.createElement('td');
    td2.textContent = typeof allVars[k] === 'number' && !Number.isInteger(allVars[k]) ?
      allVars[k].toFixed(6) :
      String(allVars[k]);
    tr.appendChild(td1);
    tr.appendChild(td2);
    varsBody.appendChild(tr);
  });
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

renderExamples();
updateVars();

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') run();
});