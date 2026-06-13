# Parsing and Evaluation

Exprify processes expressions through a three-stage pipeline.

## Tokenization

```js
const tokens = expr.tokenize('2 + 3 * x');
// [{ type: 'number', value: '2' }, { type: '+', value: '+' }, ...]
```

Token types include: `number`, `string`, `identifier`, operators, parentheses, brackets, and more.

## Parsing

```js
const result = expr.parse('2 + 3 * x');
// {
//   tokens: [...],
//   ast: { type: 'BinaryExpression', operator: '+', left: ..., right: ... }
// }
```

The parser uses recursive descent with operator precedence climbing to build an Abstract Syntax Tree.

## Evaluation

```js
expr.evaluate('2 + 2');           // 4
expr.evaluate('x^2 + 1', { x: 5 }); // 26 (scope override)
```

The evaluator walks the AST and dispatches each node type to its handler.

## Compilation

```js
const fn = expr.compile('a * b + c');
fn({ a: 2, b: 3, c: 1 }); // 7
```

Compiled expressions are cached internally. The cache can be cleared with `clearCache()`.
