[![Exprify Social Banner](https://raw.githubusercontent.com/code-hemu/Exprify/refs/heads/main/docs/assets/capture.jpg)](https://github.com/code-hemu/Exprify)

Exprify is a JavaScript expression parser and evaluator. It is made for math applications, scientific computing, and complex workflows in the browser and Node.js. It supports basic arithmetic, variables, and defined functions. Exprify also covers advanced mathematical areas like unit conversion, matrix operations, complex number arithmetic, and symbolic manipulation.

[![Version](https://img.shields.io/npm/v/exprify)](https://www.npmjs.com/package/exprify)
[![Downloads](https://img.shields.io/npm/dt/exprify)](https://www.npmjs.com/package/exprify)
[![License](https://img.shields.io/github/license/code-hemu/exprify)](https://github.com/code-hemu/exprify/blob/master/LICENSE)
[![](https://data.jsdelivr.com/v1/package/npm/exprify/badge?style=rounded)](https://www.jsdelivr.com/package/npm/exprify)
[![unpkg](https://img.shields.io/badge/CDN-unpkg-blue)](https://unpkg.com/exprify)
[![esm.sh](https://img.shields.io/badge/CDN-esm.sh-black)](https://esm.sh/exprify)
[![GitHub Issues](https://img.shields.io/github/issues/code-hemu/exprify)](https://github.com/code-hemu/exprify/issues)
[![Last Commit](https://img.shields.io/github/last-commit/code-hemu/exprify)](https://github.com/code-hemu/exprify/commits/master)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/code-hemu/exprify)
[![Contributors](https://img.shields.io/github/contributors/code-hemu/exprify)](https://github.com/code-hemu/exprify/graphs/contributors)
[![Top Language](https://img.shields.io/github/languages/top/code-hemu/exprify)](https://github.com/code-hemu/exprify)
[![Github Sponsor](https://img.shields.io/github/sponsors/code-hemu)](https://github.com/sponsors/code-hemu)


## Capabilities:

- Math expression parsing and evaluation
- Variables, functions, and lambdas
- Unit conversion support
- Matrix and linear algebra operations
- Complex numbers
- Symbolic math utilities
- Calculus and statistics tools
- Arbitrary-precision arithmetic (BigNumber)
- Exact fractions
- Degree-mode trig functions
- Expression chaining (fluent API)
- State serialization / deserialization


## Installation

```bash
npm install exprify
```

## Quick Start

**ESM** (Node.js, bundlers):

```js
import Exprify from "exprify";

const expr = new Exprify();

console.log(expr.evaluate("5 + 7 * 2"));
// 19

expr.setVariable("x", 10);
console.log(expr.evaluate("x + 5"));
// 15
```

**CommonJS** (`require`):

```js
const Exprify = require("exprify");

const expr = new Exprify();
console.log(expr.evaluate("5 + 7 * 2"));
// 19
```

## Browser Usage

```html
<script src="https://unpkg.com/exprify"></script>
<script>
  const expr = new Exprify();
  console.log(expr.evaluate("(10 + 5) * 2"));
</script>
```

`unpkg` resolves to the browser bundle from `dist/exprify.min.js`.

**Explore online**: Try the [interactive playground](docs/playground.html) or browse the [API docs](docs/index.html) and [function reference](docs/functions.html).

## Module Formats

The package ships a separate build for each consumer, and `package.json`'s `exports` field routes each import style to the right file:

| Consumer | Resolved file | Notes |
| --- | --- | --- |
| `import Exprify from "exprify"` (ESM) | `dist/exprify.esm.js` | Default export is the `Exprify` class. |
| `const Exprify = require("exprify")` (CJS) | `dist/exprify.cjs.cjs` | `module.exports` is the `Exprify` class. |
| `<script src="https://unpkg.com/exprify">` | `dist/exprify.min.js` | UMD build; exposes `Exprify` as a global. |
| `import "exprify/dist/exprify.js"` (UMD) | `dist/exprify.js` | Unminified UMD for bundlers that prefer it. |

The `.cjs` extension on the CommonJS bundle keeps it loadable as CJS even though the package is `"type": "module"`, so `require()` and `import` both work without configuration.

## API

### `new Exprify()`

Creates a new evaluator instance with isolated state for:

- variables
- functions
- units
- compiled-expression cache

### `expr.evaluate(expression)`

Parses and evaluates an expression string.

```js
expr.evaluate("10 + 5 * 2");
// 20
```

### `expr.parse(expression)`

Returns `{ tokens, ast }`.

```js
const parsed = expr.parse("2 inch to cm");
console.log(parsed.tokens);
console.log(parsed.ast);
```

### `expr.compile(expression)`

Compiles an expression once and returns a reusable function.

```js
const area = expr.compile("width * height");

console.log(area({ width: 6, height: 4 }));
// 24
```

### `expr.setVariable(name, value)` / `expr.getVariable(name)`

Stores and reuses values across evaluations.

```js
expr.setVariable("x", 10);
expr.setVariable("y", 5);

console.log(expr.evaluate("x + y * 2"));
// 20
```

### `expr.addFunction(name, fn)`

Registers a custom JavaScript function.

```js
expr.addFunction("double", (n) => n * 2);

console.log(expr.evaluate("double(5) + 3"));
// 13
```

### `expr.evaluate(expression, scope?)`

Accepts an optional scope object to override variables for a single evaluation.

```js
expr.setVariable("x", 100);
expr.evaluate("x + 1", { x: 5 });
// 6 — scope overrides x for this call only
```

### `expr.exportState()` / `expr.importState(state)`

Serializes and restores the full engine state (variables, functions, units).

```js
const state = expr.exportState();
// state → { variables: {...}, functions: [...], units: {...} }

const expr2 = new Exprify();
expr2.importState(state);
```

### `expr.chain()`

Returns a fluent Chain object for sequential evaluations. Each step stores its result as `ans` for the next expression.

```js
const c = expr.chain();
c.evaluate("2 + 2");           // ans = 4
c.evaluate("ans * 10");        // ans = 40
c.evaluate("ans / 2");         // ans = 20
c.done();                      // 20
```

### Inline Function Definitions

You can define functions inside expressions.

```js
expr.evaluate("hyp(a, b) = sqrt(a ^ 2 + b ^ 2)");

console.log(expr.evaluate("hyp(3, 4)"));
// 5
```

## Features

### Arithmetic

```js
expr.evaluate("2 + 3 * 4");
// 14

expr.evaluate("(2 + 3) * 4");
// 20

expr.evaluate("11n ^ 2n");
// 121n
```

### Strings, Booleans, Complex Numbers

```js
expr.evaluate('"Hello " + "World"');
// "Hello World"

expr.evaluate("true && false");
// false

expr.evaluate("9 / 3 + 2i");
// "3 + 2i"
```

### Unit Conversion

```js
expr.evaluate("2 inch to cm");
// "5.08 cm"

expr.evaluate("5 cm + 2 inch");
// "10.08 cm"

expr.evaluate("5cm + 0.2 m in inch");
// "9.84251968503937 inch"

expr.evaluate("a = 5.08 cm + 2 inch");
expr.evaluate("a to inch");
// "4 inch"
```

### Constants

```js
expr.evaluate("PHI");
// 1.6180...

expr.evaluate("TAU");
// 6.2832...

expr.evaluate("INFINITY > 1e308");
// true

expr.evaluate("isNaN(NaN)");
// true
```

### Range Operator

```js
expr.evaluate("1:5");
// [1,2,3,4,5]

expr.evaluate("r = 3:7");
// [3,4,5,6,7]

expr.evaluate("sum(1:10)");
// 55
```

### Lambda Expressions

```js
expr.evaluate("sq = x -> x^2");
// function

expr.evaluate('map([1, 2, 3], x -> x^2)');
// [1,4,9]
```

### Compound Assignment

```js
expr.evaluate("a = 10");
expr.evaluate("a += 5");
// 15

expr.evaluate("a *= 2");
// 30
```

### Spread Operator

```js
expr.evaluate("max(...[1, 5, 3])");
// 5

expr.evaluate("max(10, ...[1, 5, 3], 7)");
// 10
```

### Fractions

Exact rational arithmetic using `fraction(n, d)`. Fractions auto-simplify and interoperate with arithmetic operators.

```js
expr.evaluate("fraction(1, 3) + fraction(1, 6)");
// "1/2"

expr.evaluate("fraction(2, 3) * fraction(3, 4)");
// "1/2"

expr.evaluate("numer(fraction(3, 4))");
// 3

expr.evaluate("denom(fraction(3, 4))");
// 4
```

### Arbitrary Precision (BigNumber)

Avoid floating-point rounding errors with `bignumber()`. Supports scientific notation for very large or very small numbers.

```js
expr.evaluate('bignumber("0.1") + bignumber("0.2")');
// "0.3"

expr.evaluate('bignumber("1.2e500")');
// "1.2e+500"

expr.evaluate('bignumber("1e20") + bignumber("1e20")');
// "2e+20"
```

### Degree Trig Functions

Trig functions that accept degrees instead of radians.

```js
expr.evaluate("sind(90)");
// 1

expr.evaluate("cosd(0)");
// 1

expr.evaluate("tand(45)");
// 1

expr.evaluate("asind(1)");
// 90
```

### Expression Chaining

Chain multiple evaluations with `chain()`. Each expression can reference the previous result via `ans`.

```js
const c = expr.chain();
c.setVariable("x", 25);
c.evaluate("sqrt(x) + 3");
c.evaluate("ans * 2");
c.done();
// 16
```

### State Serialization

Save and restore the full engine state.

```js
const state = expr.exportState();
// later:
const expr2 = new Exprify();
expr2.importState(state);
```

### String Utilities

```js
expr.evaluate('split("a,b,c", ",")');
// ["a","b","c"]

expr.evaluate('join(["a", "b", "c"], ", ")');
// "a, b, c"

expr.evaluate('upper("hello")');
// "HELLO"

expr.evaluate('lower("HELLO")');
// "hello"

expr.evaluate('trim("  hi  ")');
// "hi"

expr.evaluate('replace("hello world", "world", "there")');
// "hello there"

expr.evaluate('substring("hello", 1, 4)');
// "ell"
```

### Array Utilities

```js
expr.evaluate('map([1, 4, 9], "sqrt")');
// [1,2,3]

expr.evaluate('filter([1, 2, 3, 4, 5], "isPrime")');
// [2,3,5]
```

### Calculus

```js
expr.evaluate('integral("x^2", 0, 1)');
// 0.333... (Simpson's rule)

expr.evaluate('sigma("n", 1, 10, "n")');
// 55

expr.evaluate('sigma("n", 1, 5, "n^2")');
// 55

expr.evaluate('pi("n", 1, 5, "n")');
// 120

expr.evaluate('substitute("x + 1", "x", 5)');
// 6

expr.evaluate('limit("1/x", "x", 1000000, "right")');
// ~0
```

### Symbolic Helpers

```js
expr.evaluate('expand("(x+1)^2")');
// "x^2 + 2x + 1"

expr.evaluate('factor("x^2 - 5x + 6")');
// "(x - 2)(x - 3)"

expr.evaluate('solve("x^2 - 4 = 0")');
// [-2,2]

expr.evaluate('solve("2x - 8 = 0")');
// [4]
```

### Matrices

Exprify supports matrix literals with `;` as row separators, and matrix arithmetic (addition, subtraction, multiplication, scalar multiplication, integer power).

```js
expr.evaluate("a = [1, 2, 3; 4, 5, 6]");
// {"exprify":"DenseMatrix","data":[[1,2,3],[4,5,6]],"size":[2,3]}

expr.evaluate("a[2, 3]");
// 6

expr.evaluate("a[1:2, 2]");
// "2\n5"

expr.evaluate("a[3, 1:3] = [7, 8, 9]");
// "7\t8\t9"

expr.evaluate("det([-1, 2; 3, 1])");
// -7

expr.evaluate("[[1, 2], [3, 4]] + [[5, 6], [7, 8]]");
// "6\t8\n10\t12"

expr.evaluate("[[1, 2], [3, 4]] * [[5, 6], [7, 8]]");
// "19\t22\n43\t50"

expr.evaluate("3 * [[1, 2], [3, 4]]");
// "3\t6\n9\t12"

expr.evaluate("[[1, 1], [1, 0]] ^ 3");
// "3\t2\n2\t1"
```

### Linear Algebra Helpers

```js
expr.evaluate("lup([[2, 1], [1, 4]])");
// {"L":{"exprify":"DenseMatrix",...},"U":{"exprify":"DenseMatrix",...},"p":[0,1]}

expr.evaluate("lyap([[-2, 0], [1, -4]], [[3, 1], [1, 3]])");
// {"exprify":"DenseMatrix","data":[[0.75,0.2916666666666667],[0.2916666666666667,0.44791666666666663]],"size":[2,2]}

expr.evaluate("qr([[1, -1, 4], [1, 4, -2], [1, 4, 2], [1, -1, 0]])");
// {"Q":{"exprify":"DenseMatrix",...},"R":{"exprify":"DenseMatrix",...}}

expr.evaluate("polynomialRoot(-6, 11, -6, 1)");
// [1,3,2]
```

Available helpers currently include `det`, `lsolve`, `lup`, `lyap`, `qr`, and `polynomialRoot`.

### Algebra Helpers

```js
expr.evaluate('simplify("2x + x")');
// "3 * x"

expr.evaluate('derivative("2x^2 + 3x + 4", "x")');
// "4 * x + 3"

expr.evaluate('rationalize("2x/y - y/(x+1)", true)');
// {"numerator":"2 * x ^ 2 + 2 * x - y ^ 2","denominator":"x * y + y","coefficients":[],"variables":["x","y"],"expression":"(2 * x ^ 2 + 2 * x - y ^ 2) / (x * y + y)"}
```

### Parse and AST Utilities

```js
expr.evaluate('leafCount("e^(i*pi)-1")');
// 4

expr.evaluate('leafCount(parse("{a: 22/7, b: 10^(1/2)}"))');
// 5
```

### Built-in Functions

| Function | Description | Example | Output |
|---|---|---|---|
| `abs` | Absolute value | `abs(-5)` | `5` |
| `round` | Round to nearest integer | `round(3.7)` | `4` |
| `floor` | Round down | `floor(3.7)` | `3` |
| `ceil` | Round up | `ceil(3.2)` | `4` |
| `trunc` | Truncate toward zero | `trunc(3.7)` | `3` |
| `sign` | Sign of number (-1, 0, 1) | `sign(-5)` | `-1` |
| `frac` | Fractional part | `frac(3.14)` | `0.14` |
| `sqrt` | Square root | `sqrt(16)` | `4` |
| `pow` | Raise to power | `pow(2, 3)` | `8` |
| `clamp` | Clamp value to range | `clamp(15, 0, 10)` | `10` |
| `sin` | Sine (radians) | `sin(pi/2)` | `1` |
| `cos` | Cosine (radians) | `cos(pi)` | `-1` |

> **Full reference**: See the [searchable function table](https://code-hemu.github.io/exprify/functions.html) for all ~130 built-in functions.

## Return Types

Depending on the expression, `evaluate()` may return:

- numbers / bigint / booleans
- strings
- formatted unit strings like `"5.08 cm"`
- formatted complex strings like `"3 + 2i"`
- matrix wrapper JSON strings such as `{"exprify":"DenseMatrix",...}`
- JSON strings for structured helper outputs like `lup()` or `rationalize(..., true)`
- native JavaScript functions for lambda expressions (`evaluate("x -> x^2")` returns a `function`)
- arrays for range expressions like `[1,2,3,4,5]`

## Manual Build

```bash
git clone https://github.com/code-hemu/Exprify.git
cd Exprify
npm install
npm run build
```

Build output is written to `dist/`.

## CLI

Exprify ships with a command-line interface for evaluating expressions directly from the terminal.

```bash
exprify
```

```
Exprify v1.0.5 - interactive REPL
Type an expression or .help for commands

» 2 + 2
4
» .help

  Commands:
  .exit       Exit the REPL
  .help       Show this message
  <expr>      Evaluate an expression
  Ctrl+C      Cancel / exit
```

Type `.exit` or Ctrl+C to quit.

## Testing

```bash
npm test
```

Tested in CI across Node 20 and 22 (see `.github/workflows/ci.yml`).

## Publishing

The package is published to the public npm registry via `npm publish`. The `npm-publish.yml` workflow runs on GitHub release events. See `.github/workflows/npm-publish.yml` for details.

`package-lock.json` is committed but is not shipped in the published tarball (see `.npmignore`); consumers generate their own lockfile when installing.

## License

Exprify is licensed under GPL-3.0. Copyright (c) [Nirmal Paul](https://github.com/nirmalpaul383/).

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push your branch and open a pull request.
