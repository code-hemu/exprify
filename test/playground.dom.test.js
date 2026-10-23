import test, { after } from 'node:test';
import assert from 'node:assert/strict';

import { installDom } from './helpers/dom.js';

const dom = installDom();
const app = await import('../playground/index.js');

app.init();

after(() => dom.restore());

function menuItems() {
  return dom
    .el('functions-list')
    .children.filter((child) => child.classList.contains('menu-item'));
}

test('the playground boots with a sample expression', () => {
  assert.equal(dom.el('expression').value, '2 + 3 * 4');
  assert.equal(dom.el('result').textContent, '14');
});

test('the version label is filled in', () => {
  assert.match(dom.el('version').textContent, /^v(dev|\d+\.\d+\.\d+)$/);
});

test('typing re-evaluates the expression', () => {
  const expression = dom.el('expression');

  expression.value = 'x = 5';
  expression.dispatch('input');
  assert.equal(dom.el('result').textContent, '5');

  expression.value = 'x^2';
  expression.dispatch('input');
  assert.equal(dom.el('result').textContent, '25');
});

test('an invalid expression shows the error message', () => {
  const expression = dom.el('expression');

  expression.value = 'sqrt(-1)';
  expression.dispatch('input');

  assert.match(dom.el('result').textContent, /^Error: /);
  assert.ok(dom.el('result').classList.contains('result--error'));
});

test('an empty expression clears the result', () => {
  const expression = dom.el('expression');

  expression.value = '';
  expression.dispatch('input');

  assert.equal(dom.el('result').textContent, '');
});

test('a matrix result is rendered as a grid', () => {
  const expression = dom.el('expression');

  expression.value = 'matrix([[1, 2], [3, 4]])';
  expression.dispatch('input');

  assert.equal(dom.el('result').textContent, '1\t2\n3\t4');
});

test('the function menu opens with the library functions', () => {
  dom.el('functions-panel').hidden = true;
  dom.el('functions-toggle').dispatch('click');

  assert.equal(dom.el('functions-panel').hidden, false);
  assert.equal(dom.el('functions-toggle').getAttribute('aria-expanded'), 'true');

  const names = menuItems().map((item) => item.textContent);
  assert.ok(names.includes('sqrt'));
  assert.ok(names.includes('derivative'));
});

test('the search box narrows the function list', () => {
  const filter = dom.el('functions-filter');

  filter.value = 'sqrt';
  filter.dispatch('input');

  assert.deepEqual(
    menuItems().map((item) => item.textContent),
    ['sqrt'],
  );

  filter.value = '';
  filter.dispatch('input');
});

test('picking a function inserts it at the caret', () => {
  const expression = dom.el('expression');
  expression.value = '';
  expression.selectionStart = 0;
  expression.selectionEnd = 0;

  app.renderFunctions('');
  const item = menuItems().find((child) => child.textContent === 'sqrt');
  item.dispatch('click');

  assert.equal(expression.value, 'sqrt(16)');
});

test('the menu can be driven from the keyboard', () => {
  const expression = dom.el('expression');
  expression.value = '';
  expression.selectionStart = 0;
  expression.selectionEnd = 0;

  app.renderFunctions('');
  const filter = dom.el('functions-filter');

  filter.dispatch('keydown', { key: 'ArrowDown' });
  filter.dispatch('keydown', { key: 'Enter' });

  assert.equal(expression.value, 'abs(-5)');
});

test('every function has a runnable example', () => {
  const names = app.functionGroups().flatMap((group) => group.members);

  for (const name of names) {
    const example = app.FUNCTION_EXAMPLES[name];
    assert.ok(example, `missing example for ${name}`);

    const outcome = app.evaluateExpression(example);
    assert.notEqual(
      outcome.kind,
      'error',
      `${name}: ${example} -> ${outcome.text}`,
    );
  }
});
