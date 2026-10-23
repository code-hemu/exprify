import test from 'node:test';
import assert from 'node:assert/strict';

import Exprify from '../dist/exprify.esm.js';

import {
  evaluateExpression,
  formatValue,
  formatNumber,
  functionGroups,
} from '../playground/index.js';

test('evaluateExpression evaluates arithmetic', () => {
  assert.deepEqual(evaluateExpression('2 + 3 * 4'), {
    kind: 'number',
    text: '14',
  });
});

test('evaluateExpression ignores a blank expression', () => {
  assert.deepEqual(evaluateExpression('   '), { kind: 'empty', text: '' });
});

test('evaluateExpression reports errors instead of throwing', () => {
  const outcome = evaluateExpression('sqrt(-1)');

  assert.equal(outcome.kind, 'error');
  assert.match(outcome.text, /^Error: /);
});

test('evaluateExpression keeps variables between runs', () => {
  evaluateExpression('x = 5');

  assert.deepEqual(evaluateExpression('x * 2'), {
    kind: 'number',
    text: '10',
  });
});

test('evaluateExpression supports units', () => {
  const outcome = evaluateExpression('5 km to mi');

  assert.equal(outcome.kind, 'text');
  assert.match(outcome.text, /mi$/);
});

test('formatValue formats numbers', () => {
  assert.deepEqual(formatValue(5), { kind: 'number', text: '5' });
  assert.deepEqual(formatValue(2.5), { kind: 'number', text: '2.5' });
  assert.equal(formatNumber(1 / 3), '0.33333333333333');
});

test('formatValue passes library strings through', () => {
  assert.deepEqual(formatValue('1/3'), { kind: 'text', text: '1/3' });
  assert.deepEqual(formatValue('0.05 m'), { kind: 'text', text: '0.05 m' });
});

test('formatValue renders a dense matrix as a grid', () => {
  const matrix = JSON.stringify({
    exprify: 'DenseMatrix',
    data: [
      [1, 2],
      [3, 4],
    ],
    size: [2, 2],
  });

  assert.deepEqual(formatValue(matrix), {
    kind: 'text',
    text: '1\t2\n3\t4',
  });
});

test('formatValue leaves plain text alone', () => {
  assert.deepEqual(formatValue('hello'), { kind: 'text', text: 'hello' });
});

test('formatValue marks undefined values', () => {
  assert.deepEqual(formatValue(undefined), {
    kind: 'undefined',
    text: 'undefined',
  });
});

test('functionGroups covers every library function exactly once', () => {
  const available = new Set(new Exprify().functions.getAllFunctionsName());
  const listed = functionGroups().flatMap((group) => group.members);

  assert.equal(listed.length, available.size);
  assert.deepEqual(
    listed.filter((name, index) => listed.indexOf(name) !== index),
    [],
  );
  assert.deepEqual(
    listed.filter((name) => !available.has(name)),
    [],
  );
});
