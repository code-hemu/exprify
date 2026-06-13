# Exprify

> A JavaScript expression parser and evaluator - built for math, science, and complex workflows.

[![Version](https://img.shields.io/npm/v/exprify)](https://www.npmjs.com/package/exprify)
[![Downloads](https://img.shields.io/npm/dt/exprify)](https://www.npmjs.com/package/exprify)
[![License](https://img.shields.io/github/license/code-hemu/exprify)](https://github.com/code-hemu/exprify/blob/master/LICENSE)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/exprify/badge?style=rounded)](https://www.jsdelivr.com/package/npm/exprify)
[![unpkg](https://img.shields.io/badge/CDN-unpkg-blue)](https://unpkg.com/exprify)
[![esm.sh](https://img.shields.io/badge/CDN-esm.sh-black)](https://esm.sh/exprify)
[![Issues](https://img.shields.io/github/issues/code-hemu/exprify)](https://github.com/code-hemu/exprify/issues)
[![Last Commit](https://img.shields.io/github/last-commit/code-hemu/exprify)](https://github.com/code-hemu/exprify/commits/master)
[![Contributors](https://img.shields.io/github/contributors/code-hemu/exprify)](https://github.com/code-hemu/exprify/graphs/contributors)
[![Sponsor](https://img.shields.io/github/sponsors/code-hemu)](https://github.com/sponsors/code-hemu)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/code-hemu/exprify)

[![Exprify Banner](https://raw.githubusercontent.com/code-hemu/Exprify/refs/heads/main/docs/assets/capture.jpg)](https://github.com/code-hemu/Exprify)

---

## What is Exprify?

**Exprify** (**Math Expr**ession + Simp**lify**) parses a string into an expression tree, evaluates it with a given set of variables, and lets you chain or compose operations together - in the browser and in Node.js.

---

## Features

| Capability | Example | Docs |
|---|---|---|
| **Arithmetic & Variables** | `expr.evaluate("5 + 7 * 2")` → `19` | [docs/arithmetic.md](docs/arithmetic.md) |
| **Unit conversion** | `expr.evaluate("2 inch to cm")` → `"5.08 cm"` | [docs/units.md](docs/units.md) |
| **Matrix operations** | `expr.evaluate("det([-1,2;3,1])")` → `-7` | [docs/matrices.md](docs/matrices.md) |
| **Complex numbers** | `expr.evaluate("9/3 + 2i")` → `"3 + 2i"` | [docs/complex.md](docs/complex.md) |
| **Symbolic math** | `expr.evaluate('expand("(x+1)^2")')` → `"x^2 + 2x + 1"` | [docs/algebra.md](docs/algebra.md) |
| **Arbitrary precision** | `expr.evaluate('bignumber("0.1") + bignumber("0.2")')` → `"0.3"` | [docs/bignumber.md](docs/bignumber.md) |
| **Exact fractions** | `expr.evaluate("fraction(1,3) + fraction(1,6)")` → `"1/2"` | [docs/fractions.md](docs/fractions.md) |
| **Calculus & statistics** | `expr.evaluate('integral("x^2", 0, 1)')` → `~0.333` | [docs/calculus.md](docs/calculus.md) |
| **Lambda expressions** | `expr.evaluate('map([1,2,3], x -> x^2)')` → `[1,4,9]` | [docs/lambdas.md](docs/lambdas.md) |
| **Expression chaining** | `c.evaluate("sqrt(x)").evaluate("ans * 2").done()` | [docs/chaining.md](docs/chaining.md) |
| **State serialization** | `expr.exportState()` / `expr.importState(state)` | [docs/serialization.md](docs/serialization.md) |
| **Degree-mode trig** | `expr.evaluate("sind(90)")` → `1` | [docs/trig.md](docs/trig.md) |

---

## Installation

```bash
npm install exprify
```

---

## Quick Start

**ESM** (Node.js / bundlers):

```js
import Exprify from "exprify";

const expr = new Exprify();

expr.evaluate("5 + 7 * 2");        // 19

expr.setVariable("x", 10);
expr.evaluate("x + 5");            // 15
```

**CommonJS:**

```js
const Exprify = require("exprify");

const expr = new Exprify();
expr.evaluate("5 + 7 * 2");        // 19
```

**Browser (CDN):**

```html
<script src="https://unpkg.com/exprify"></script>
<script>
  const expr = new Exprify();
  expr.evaluate("(10 + 5) * 2");   // 30
</script>
```

---

## Module Formats

`package.json`'s `exports` field routes each import style to the correct build automatically.

| Consumer | Resolved file | Notes |
|---|---|---|
| `import Exprify from "exprify"` | `dist/exprify.esm.js` | Default export is the `Exprify` class |
| `require("exprify")` | `dist/exprify.cjs.cjs` | `module.exports` is the `Exprify` class |
| `<script src="https://unpkg.com/exprify">` | `dist/exprify.min.js` | UMD build; exposes `Exprify` as a global |
| `import "exprify/dist/exprify.js"` | `dist/exprify.js` | Unminified UMD for bundlers that prefer it |

> The `.cjs` extension keeps the CommonJS bundle loadable via `require()` even though the package uses `"type": "module"`.

---

## API

### `new Exprify()`

Creates a new evaluator instance with isolated state for variables, functions, units, and a compiled-expression cache.

---

### `expr.evaluate(expression, scope?)`

Parses and evaluates an expression string. An optional `scope` object overrides variables for that single call only.

```js
expr.evaluate("10 + 5 * 2");               // 20

expr.setVariable("x", 100);
expr.evaluate("x + 1", { x: 5 });          // 6
```

---

### `expr.parse(expression)`

Returns `{ tokens, ast }` - the raw token list and abstract syntax tree.

```js
const { tokens, ast } = expr.parse("2 inch to cm");
```

---

### `expr.compile(expression)`

Compiles an expression once and returns a reusable function - ideal for hot paths.

```js
const area = expr.compile("width * height");
area({ width: 6, height: 4 });             // 24
area({ width: 3, height: 9 });             // 27
```

---

### `expr.setVariable(name, value)` / `expr.getVariable(name)`

Stores and retrieves named values that persist across evaluations.

```js
expr.setVariable("x", 10);
expr.setVariable("y", 5);
expr.evaluate("x + y * 2");                // 20
```

---

### `expr.addFunction(name, fn)`

Registers a custom JavaScript function, making it callable inside expressions.

```js
expr.addFunction("double", (n) => n * 2);
expr.evaluate("double(5) + 3");            // 13
```

---

### `expr.chain()`

Returns a fluent `Chain` object. Each step stores its result as `ans` for the next expression.

```js
const c = expr.chain();
c.setVariable("x", 25);
c.evaluate("sqrt(x) + 3");                 // ans = 8
c.evaluate("ans * 2");                     // ans = 16
c.done();                                  // 16
```

---

### `expr.exportState()` / `expr.importState(state)`

Serializes and restores the full engine state - variables, functions, and units.

```js
const state = expr.exportState();
// { variables: {...}, functions: [...], units: {...} }

const expr2 = new Exprify();
expr2.importState(state);
```

---

### Inline Function Definitions

Functions can be defined directly inside expressions and reused immediately.

```js
expr.evaluate("hyp(a, b) = sqrt(a^2 + b^2)");
expr.evaluate("hyp(3, 4)");                // 5
```

---

## Built-in Functions (Selected)

| Function | Description | Example | Result |
|---|---|---|---|
| `abs` | Absolute value | `abs(-5)` | `5` |
| `round` | Round to nearest integer | `round(3.7)` | `4` |
| `floor` | Round down | `floor(3.7)` | `3` |
| `ceil` | Round up | `ceil(3.2)` | `4` |

> See the [full searchable function reference](docs/reference/functions.md) for all ~130 built-in functions.

---

## Return Types

| Type | Example expression | Result |
|---|---|---|
| Number / BigInt / Boolean | `2 + 2`, `true && false` | `4`, `false` |
| String | `"hello" + " world"` | `"hello world"` |
| Unit string | `2 inch to cm` | `"5.08 cm"` |
| Complex string | `3 + 2i` | `"3 + 2i"` |
| Matrix JSON | `[1,2;3,4]` | `{"exprify":"DenseMatrix",...}` |
| Structured JSON | `lup(...)`, `rationalize(..., true)` | JSON object string |
| Function | `x -> x^2` | Native JS function |
| Array | `1:5` | `[1,2,3,4,5]` |

---

## Manual Build

```bash
git clone https://github.com/code-hemu/Exprify.git
cd Exprify
npm install
npm run build
```

Output is written to `dist/`.

---

## Testing

```bash
npm test
```

Tested in CI across Node 20 and 22. See `.github/workflows/ci.yml` for details.

---

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push and open a pull request.

---

## License

Exprify is licensed under **GPL-3.0**.  
Copyright © [Nirmal Paul](https://github.com/nirmalpaul383/).