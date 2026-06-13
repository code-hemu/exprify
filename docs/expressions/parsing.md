# Exprify - Parsing & Evaluation Pipeline

Exprify processes mathematical and logical expressions through a clean, four-stage pipeline: **tokenization**, **parsing**, **evaluation**, and **compilation**. Each stage is independently accessible, giving you fine-grained control over how expressions are handled.

---

## 1. Tokenization

Tokenization is the first stage of the pipeline. It breaks a raw expression string into a flat sequence of typed **tokens** - the smallest meaningful units of an expression.

```js
const tokens = expr.tokenize('2 + 3 * x');
// [
//   { type: 'number',     value: '2' },
//   { type: '+',          value: '+' },
//   { type: 'number',     value: '3' },
//   { type: '*',          value: '*' },
//   { type: 'identifier', value: 'x' }
// ]
```

### Supported Token Types

| Category       | Types                                              |
|----------------|----------------------------------------------------|
| Literals       | `number`, `string`                                 |
| Identifiers    | `identifier` (variable and function names)         |
| Operators      | `+`, `-`, `*`, `/`, `^`, `%`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `&&`, `||`, `!` |
| Grouping       | `(`, `)` (parentheses), `[`, `]` (brackets)       |
| Punctuation    | `,` (argument separator), `.` (member access)      |

The tokenizer is whitespace-tolerant and handles multi-character operators (such as `==`, `<=`, `&&`) as single tokens. Unrecognized characters throw a descriptive `TokenizeError` with the position of the offending character.

---

## 2. Parsing

The parser consumes the token stream produced by the tokenizer and builds an **Abstract Syntax Tree (AST)** - a structured, hierarchical representation of the expression that captures operator precedence and associativity.

```js
const result = expr.parse('2 + 3 * x');
// {
//   tokens: [
//     { type: 'number',     value: '2' },
//     { type: '+',          value: '+' },
//     { type: 'number',     value: '3' },
//     { type: '*',          value: '*' },
//     { type: 'identifier', value: 'x' }
//   ],
//   ast: {
//     type: 'BinaryExpression',
//     operator: '+',
//     left: { type: 'Literal', value: 2 },
//     right: {
//       type: 'BinaryExpression',
//       operator: '*',
//       left:  { type: 'Literal', value: 3 },
//       right: { type: 'Identifier', name: 'x' }
//     }
//   }
// }
```

### How the Parser Works

Exprify uses **recursive descent** combined with **operator-precedence climbing** (also known as Pratt parsing). This approach handles:

- Standard binary operators with correct precedence (`*` binds tighter than `+`)
- Right-associative operators such as exponentiation (`^`)
- Unary prefix operators (`-x`, `!flag`)
- Nested grouping via parentheses
- Function calls (`sin(x)`, `max(a, b)`)
- Member access (`obj.prop`)

The `parse()` method returns both the original `tokens` array and the root `ast` node, so you can inspect either layer of the parsed result independently.

### AST Node Types

| Node Type            | Description                                         |
|----------------------|-----------------------------------------------------|
| `Literal`            | A numeric or string constant                        |
| `Identifier`         | A named variable or symbol                          |
| `BinaryExpression`   | An operation with a left operand, operator, and right operand |
| `UnaryExpression`    | A prefix or postfix operation on a single operand   |
| `CallExpression`     | A function invocation with an argument list         |
| `MemberExpression`   | Property access on an object (`a.b`)                |
| `ConditionalExpression` | A ternary expression (`a ? b : c`)              |

---

## 3. Evaluation

The evaluator walks the AST produced by the parser and computes a concrete result. Each node type is dispatched to its own dedicated handler, keeping the evaluation logic modular and easy to extend.

```js
expr.evaluate('2 + 2');
// 4

expr.evaluate('x^2 + 1', { x: 5 });
// 26
```

### Scope and Variable Resolution

You can pass an optional **scope object** as the second argument to supply variable values at evaluation time. The evaluator resolves identifiers against this scope before falling back to any built-in constants or functions.

```js
expr.evaluate('a * b - c', { a: 10, b: 4, c: 6 });
// 34

expr.evaluate('pi * r^2', { r: 3 });
// 28.274333882308138  (pi is a built-in constant)
```

Scope objects are shallow-merged with the built-in environment, so your variables always take precedence over defaults.

### Built-in Constants and Functions

Exprify exposes a standard library of mathematical constants and functions out of the box:

| Name          | Description                          |
|---------------|--------------------------------------|
| `pi`          | 3.141592653589793                    |
| `e`           | 2.718281828459045                    |
| `abs(x)`      | Absolute value                       |
| `sqrt(x)`     | Square root                          |
| `sin(x)` / `cos(x)` / `tan(x)` | Trigonometric functions |
| `log(x)`      | Natural logarithm                    |
| `log2(x)` / `log10(x)` | Base-2 and base-10 logarithms |
| `min(a, b, ...)` / `max(a, b, ...)` | Extrema over argument lists |
| `floor(x)` / `ceil(x)` / `round(x)` | Rounding functions    |
| `pow(base, exp)` | Equivalent to `base^exp`          |

---

## 4. Compilation

Compilation transforms an expression string into a **reusable JavaScript function**. Rather than re-parsing the expression on every call, the compiled function accepts a scope object and evaluates immediately against it - making repeated evaluation significantly faster.

```js
const fn = expr.compile('a * b + c');

fn({ a: 2, b: 3, c: 1 });  // 7
fn({ a: 5, b: 5, c: 0 });  // 25
fn({ a: 1, b: 1, c: 9 });  // 10
```

### Internal Caching

Compiled expressions are stored in an internal **LRU cache** keyed by the raw expression string. Calling `expr.compile()` with the same string a second time returns the cached function without re-parsing or re-compiling.

```js
const fn1 = expr.compile('x + 1');
const fn2 = expr.compile('x + 1');

fn1 === fn2; // true - same cached reference
```

To free memory or force re-compilation (for example, after modifying the built-in environment), call:

```js
expr.clearCache();
```

This discards all cached compiled functions. The next call to `compile()` for any expression will start fresh.

### When to Use Compilation

Prefer `compile()` over `evaluate()` whenever:

- The same expression is evaluated in a loop or called many times
- You are building a reactive system where variables change but the expression is fixed
- You want to pass the expression as a callable to another part of your application

For one-off evaluations or interactive use, `evaluate()` is simpler and equally correct.

---

## Pipeline Summary

```
Raw string
    |
    | expr.tokenize()
    v
Token array
    |
    | expr.parse()
    v
AST
    |
    | expr.evaluate()  -  immediate result
    |
    | expr.compile()   -  reusable function  -  fn(scope)
    v
Result
```

Each stage can be invoked independently. You can tokenize without parsing, parse without evaluating, or compile once and evaluate many times - whatever the shape of your application demands.