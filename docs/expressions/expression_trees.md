# Expression Trees

The parser produces an **Abstract Syntax Tree (AST)** that represents the structure of an expression after it has been tokenized and parsed. Every node in the tree is a plain object with a `type` property that identifies what kind of construct it represents, plus a set of additional properties specific to that type.

This document describes each node type, its properties, and gives example source expressions alongside the AST they produce.

## Node Types

| Type | Description | Properties |
|---|---|---|
| `Literal` | A constant value: number, string, boolean, or bigint | `value` |
| `Identifier` | A variable or function name | `name` |
| `UnaryExpression` | A prefix operator applied to a single operand, e.g. `-x`, `!x` | `operator`, `argument` |
| `BinaryExpression` | A binary arithmetic or comparison operation, e.g. `a + b`, `a * b` | `operator`, `left`, `right` |
| `LogicalExpression` | A short-circuiting logical operation, e.g. `a && b`, `a \|\| b` | `operator`, `left`, `right` |
| `CallExpression` | A function call, e.g. `f(a, b)` | `callee`, `arguments` |
| `ArrayExpression` | An array or matrix literal, e.g. `[1, 2; 3, 4]` | `elements`, `rows` |
| `ObjectExpression` | An object/map literal, e.g. `{k: v}` | `properties` |
| `ConditionalExpression` | A ternary conditional, e.g. `a ? b : c` | `test`, `consequent`, `alternate` |
| `AssignmentExpression` | A variable assignment, e.g. `x = 5`, `x += 3` | `operator`, `left`, `right` |
| `ArrowFunctionExpression` | An anonymous function definition, e.g. `x -> x^2` | `params`, `body` |
| `RangeExpression` | A numeric range, e.g. `1:5` | `start`, `end` |
| `PipelineExpression` | A pipeline operation passing a value into a function, e.g. `a \|> fn` | `left`, `right` |
| `IndexExpression` | An indexing operation, e.g. `a[i]`, `a[i, j]` | `object`, `index` |
| `MemberExpression` | Property access on an object, e.g. `obj.prop` | `object`, `property`, `optional` |
| `UnitLiteral` | A numeric value with an attached unit, e.g. `5cm` | `value`, `unit` |
| `UnitConversion` | A conversion of a unit literal to another unit, e.g. `2 inch to cm` | `value`, `from`, `to` |

---

## Detailed Reference

### `Literal`

Represents a constant value parsed directly from source text: numbers, strings, booleans, or bigints.

- `value` - the literal value itself, with its native JavaScript type preserved (`number`, `string`, `boolean`, or `bigint`).

```js
// Source: 42
{ "type": "Literal", "value": 42 }

// Source: "hello"
{ "type": "Literal", "value": "hello" }

// Source: true
{ "type": "Literal", "value": true }
```

### `Identifier`

Represents a reference to a named variable, constant, or function.

- `name` - the identifier's name as a string.

```js
// Source: x
{ "type": "Identifier", "name": "x" }
```

### `UnaryExpression`

Represents a prefix operator applied to a single operand.

- `operator` - the operator symbol, e.g. `"-"`, `"!"`, `"+"`.
- `argument` - the operand expression the operator is applied to.

```js
// Source: -x
{
  "type": "UnaryExpression",
  "operator": "-",
  "argument": { "type": "Identifier", "name": "x" }
}
```

### `BinaryExpression`

Represents a binary arithmetic, comparison, or bitwise operation between two operands.

- `operator` - the operator symbol, e.g. `"+"`, `"-"`, `"*"`, `"/"`, `"^"`, `"=="`, `"<"`.
- `left` - the left-hand operand.
- `right` - the right-hand operand.

```js
// Source: 2 + 3 * x
{
  "type": "BinaryExpression",
  "operator": "+",
  "left": { "type": "Literal", "value": 2 },
  "right": {
    "type": "BinaryExpression",
    "operator": "*",
    "left": { "type": "Literal", "value": 3 },
    "right": { "type": "Identifier", "name": "x" }
  }
}
```

### `LogicalExpression`

Represents a short-circuiting logical operation. Distinct from `BinaryExpression` because evaluators typically short-circuit `&&` and `||` (the right side may not be evaluated).

- `operator` - `"&&"` or `"||"`.
- `left` - the left-hand operand.
- `right` - the right-hand operand.

```js
// Source: a && b
{
  "type": "LogicalExpression",
  "operator": "&&",
  "left": { "type": "Identifier", "name": "a" },
  "right": { "type": "Identifier", "name": "b" }
}
```

### `CallExpression`

Represents a function call with zero or more arguments.

- `callee` - the expression being called (usually an `Identifier` or `MemberExpression`).
- `arguments` - an array of argument expressions, in order.

```js
// Source: f(a, b)
{
  "type": "CallExpression",
  "callee": { "type": "Identifier", "name": "f" },
  "arguments": [
    { "type": "Identifier", "name": "a" },
    { "type": "Identifier", "name": "b" }
  ]
}
```

### `ArrayExpression`

Represents an array literal, or a matrix literal when multiple rows are present (rows are separated by `;` in source syntax).

- `elements` - a flat array of all element expressions.
- `rows` - the number of rows (1 for a plain array, >1 for a matrix).

```js
// Source: [1, 2; 3, 4]  (a 2x2 matrix)
{
  "type": "ArrayExpression",
  "elements": [
    { "type": "Literal", "value": 1 },
    { "type": "Literal", "value": 2 },
    { "type": "Literal", "value": 3 },
    { "type": "Literal", "value": 4 }
  ],
  "rows": 2
}
```

### `ObjectExpression`

Represents an object or map literal made up of key-value pairs.

- `properties` - an array of `{ key, value }` pairs, where `key` and `value` are themselves expression nodes (or simple identifiers/literals for keys).

```js
// Source: { k: v }
{
  "type": "ObjectExpression",
  "properties": [
    {
      "key": { "type": "Identifier", "name": "k" },
      "value": { "type": "Identifier", "name": "v" }
    }
  ]
}
```

### `ConditionalExpression`

Represents a ternary conditional (`?:`) expression.

- `test` - the condition expression.
- `consequent` - the expression evaluated if `test` is truthy.
- `alternate` - the expression evaluated if `test` is falsy.

```js
// Source: a ? b : c
{
  "type": "ConditionalExpression",
  "test": { "type": "Identifier", "name": "a" },
  "consequent": { "type": "Identifier", "name": "b" },
  "alternate": { "type": "Identifier", "name": "c" }
}
```

### `AssignmentExpression`

Represents assigning a value to a variable, optionally combined with an operation (compound assignment).

- `operator` - `"="`, `"+="`, `"-="`, `"*="`, `"/="`, etc.
- `left` - the assignment target (typically an `Identifier`, `MemberExpression`, or `IndexExpression`).
- `right` - the value expression being assigned.

```js
// Source: x += 3
{
  "type": "AssignmentExpression",
  "operator": "+=",
  "left": { "type": "Identifier", "name": "x" },
  "right": { "type": "Literal", "value": 3 }
}
```

### `ArrowFunctionExpression`

Represents an anonymous function (lambda) definition.

- `params` - an array of parameter names (or parameter nodes, depending on the parser).
- `body` - the function body expression (or block, if the language supports multi-statement bodies).

```js
// Source: x -> x^2
{
  "type": "ArrowFunctionExpression",
  "params": ["x"],
  "body": {
    "type": "BinaryExpression",
    "operator": "^",
    "left": { "type": "Identifier", "name": "x" },
    "right": { "type": "Literal", "value": 2 }
  }
}
```

### `RangeExpression`

Represents a numeric range between two bounds, inclusive of the start and end depending on the language's semantics.

- `start` - the starting value expression.
- `end` - the ending value expression.

```js
// Source: 1:5
{
  "type": "RangeExpression",
  "start": { "type": "Literal", "value": 1 },
  "end": { "type": "Literal", "value": 5 }
}
```

### `PipelineExpression`

Represents passing the result of one expression as input into another, typically a function call. This is useful for chaining transformations in a readable left-to-right order.

- `left` - the expression producing the value being piped.
- `right` - the expression (usually a function reference or call) receiving the piped value.

```js
// Source: a |> fn
{
  "type": "PipelineExpression",
  "left": { "type": "Identifier", "name": "a" },
  "right": { "type": "Identifier", "name": "fn" }
}
```

### `IndexExpression`

Represents accessing an element of an array, matrix, or collection by one or more indices.

- `object` - the expression being indexed.
- `index` - the index expression, or an array of index expressions for multi-dimensional indexing.

```js
// Source: a[i, j]
{
  "type": "IndexExpression",
  "object": { "type": "Identifier", "name": "a" },
  "index": [
    { "type": "Identifier", "name": "i" },
    { "type": "Identifier", "name": "j" }
  ]
}
```

### `MemberExpression`

Represents accessing a named property of an object, optionally using safe-navigation (optional chaining) syntax.

- `object` - the expression whose property is being accessed.
- `property` - the property name being accessed.
- `optional` - `true` if accessed via optional chaining (e.g. `obj?.prop`), otherwise `false`.

```js
// Source: obj.prop
{
  "type": "MemberExpression",
  "object": { "type": "Identifier", "name": "obj" },
  "property": "prop",
  "optional": false
}
```

### `UnitLiteral`

Represents a numeric literal with an attached unit of measurement.

- `value` - the numeric value.
- `unit` - the unit name as a string, e.g. `"cm"`, `"kg"`, `"s"`.

```js
// Source: 5cm
{
  "type": "UnitLiteral",
  "value": 5,
  "unit": "cm"
}
```

### `UnitConversion`

Represents converting a value (typically a `UnitLiteral`) from one unit to another.

- `value` - the expression producing the value to convert.
- `from` - the source unit, as a string.
- `to` - the target unit, as a string.

```js
// Source: 2 inch to cm
{
  "type": "UnitConversion",
  "value": { "type": "Literal", "value": 2 },
  "from": "inch",
  "to": "cm"
}
```

---

## Full Example

The expression `2 + 3 * x` parses to:

```json
{
  "type": "BinaryExpression",
  "operator": "+",
  "left": { "type": "Literal", "value": 2 },
  "right": {
    "type": "BinaryExpression",
    "operator": "*",
    "left": { "type": "Literal", "value": 3 },
    "right": { "type": "Identifier", "name": "x" }
  }
}
```

This reflects standard operator precedence: multiplication binds tighter than addition, so `3 * x` becomes the right-hand operand of the `+` node rather than `2 + 3` being grouped first.