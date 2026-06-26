[![Exprify Banner](https://raw.githubusercontent.com/code-hemu/Exprify/refs/heads/main/docs/assets/capture.jpg)](https://github.com/code-hemu/Exprify)
<p align="center">
  <a href="https://www.npmjs.com/package/exprify"><img src="https://img.shields.io/npm/v/exprify" alt="Version"></a>
  <a href="https://github.com/code-hemu/exprify/blob/master/LICENSE"><img src="https://img.shields.io/github/license/code-hemu/exprify" alt="License"></a>
  <a href="https://github.com/code-hemu/exprify/issues"><img src="https://img.shields.io/github/issues/code-hemu/exprify" alt="License"></a>
  <a href="https://www.jsdelivr.com/package/npm/exprify"><img src="https://data.jsdelivr.com/v1/package/npm/exprify/badge?style=rounded" alt="jsDelivr"></a>
  <a href="https://github.com/code-hemu/exprify/graphs/contributors"><img src="https://img.shields.io/github/contributors/code-hemu/exprify" alt="jsDelivr"></a>
</p>

**Exprify** (Math **Expr**ession + Simp**lify**) is a JavaScript expression evaluator library. It is designed for math applications, scientific computing, data visualization tools, calculators, and other complex workflows that run in the browser and in Node.js. It supports basic arithmetic, variables, user-defined functions, and built-in operators for comparison, logic, and string manipulation.
- **[Arithmetic & Variables](docs/datatypes/numbers.md)** - Determine the value of arithmetic expressions using addition, subtraction, multiplication, division, exponents, brackets, variables, and determinants.
- **[Unit conversion](docs/datatypes/units.md)** - Convert between various compatible units, including length, mass, time, temperature, area, volume, speed, and more.
- **[Matrix operations](docs/datatypes/matrices.md)** - Create matrices with built-in support for addition, multiplication, transpose, inverse, determinant, eigenvalues, and other common linear algebra operations.
- **[Complex numbers](docs/datatypes/complex_numbers.md)** - Perform calculations using complex numbers in both Cartesian and polar forms. It supports arithmetic operations, powers, roots, adjoints, values, arguments, and complex-valued functions.
- **[Symbolic math](docs/expressions/algebra.md)** - Work with algebraic expressions symbolically instead of numerically. Expand, simplify, factor, replace variables, and solve equations symbolically without losing mathematical accuracy.
- **[Arbitrary precision](docs/datatypes/bignumbers.md)** - Use arbitrary-precision arithmetic for calculations that exceed standard floating-point precision.
- **[Exact fractions](docs/datatypes/fractions.md)** - Use rational numbers as proper fractions instead of decimal equivalents. Perform math operations with accuracy and convert between fractional.
- **[Calculus & statistics](docs/reference/functions.md)** - Use a wide collection of mathematical functions, including derivatives, integrations, limits, sums, probability distributions, descriptive statistics, regression, and other statistical operations.
- **[Lambda expressions](docs/expressions/customization.md)** - Define anonymous functions using the short lambda syntax for functional programming tasks like mapping, filtering, reducing, sorting, and applying custom logic to collections.
- **[Expression chaining](docs/core/chaining.md)** - Chain multiple evaluations together while automatically preserving intermediate results. Reuse previous answers with `ans`, build multi-step workflows, and finish computations with `.done()`.
- **[State serialization](docs/core/serialization.md)** - Save the complete evaluation state, including variables, settings, history, and context, then restore it later using serialization APIs for persistence or sharing.
- **[Degree-mode trig](docs/reference/functions.md)** - Includes dedicated degree-mode functions such as `sind`, `cosd`, `tand`, and their inverse counterparts.

## Installation

```bash
npm install exprify
```

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

## API Reference

### `new Exprify()`

Creates a new evaluator instance with fully isolated state. Each instance maintains its own independent registry of variables, custom functions, unit definitions, and a compiled-expression cache - so multiple instances never interfere with each other.

```js
const expr = new Exprify();
```

### `expr.evaluate(expression, scope?)`

Parses and evaluates an expression string, returning the computed result. An optional `scope` object lets you pass temporary variable values that apply only to that single call - they do not modify the instance's stored state.

```js
expr.evaluate("10 + 5 * 2");               // 20

expr.setVariable("x", 100);
expr.evaluate("x + 1", { x: 5 });          // 6  (x = 100 is unchanged)
```

### `expr.parse(expression)`

Parses an expression without evaluating it. Returns a `{ tokens, ast }` object containing the raw token list and the abstract syntax tree - useful for debugging, introspection, or building custom tooling on top of the parser.

```js
const { tokens, ast } = expr.parse("2 inch to cm");
// tokens: [...], ast: { type: "UnitConversion", ... }
```

### `expr.compile(expression)`

Compiles an expression once and returns a reusable callable function. The compiled form skips parsing on every subsequent invocation, making this the right choice for hot paths or any expression evaluated repeatedly with different inputs.

```js
const area = expr.compile("width * height");
area({ width: 6, height: 4 });             // 24
area({ width: 3, height: 9 });             // 27
```

### `expr.setVariable(name, value)` / `expr.getVariable(name)`

Stores a named value that persists across all future evaluations on this instance. `getVariable` retrieves a previously stored value by name.

```js
expr.setVariable("x", 10);
expr.setVariable("y", 5);
expr.evaluate("x + y * 2");                // 20

expr.getVariable("x");                     // 10
```

### `expr.addFunction(name, fn)`

Registers a plain JavaScript function under a given name, making it available to call inside any expression evaluated on this instance. The function receives its arguments as individual parameters, exactly as written in the expression.

```js
expr.addFunction("double", (n) => n * 2);
expr.evaluate("double(5) + 3");            // 13

expr.addFunction("clamp", (val, lo, hi) => Math.min(Math.max(val, lo), hi));
expr.evaluate("clamp(150, 0, 100)");       // 100
```

### `expr.chain()`

Returns a fluent `Chain` object for building multi-step calculations. Each call to `.evaluate()` on the chain stores its result in the special variable `ans`, which the next expression can reference directly. Call `.done()` at the end to extract the final value.

```js
const c = expr.chain();
c.setVariable("x", 25);
c.evaluate("sqrt(x) + 3");                 // computes 8, stored as ans
c.evaluate("ans * 2");                     // computes 16, stored as ans
c.done();                                  // 16
```

### `expr.exportState()` / `expr.importState(state)`

Serializes the complete engine state - all variables, registered functions, and unit definitions - into a plain object that can be stored, transmitted, or restored later. `importState` loads a previously exported snapshot into a fresh instance, fully reconstructing that environment.

```js
const state = expr.exportState();
// { 
//    variables: { x: 10, y: 5 }, 
//    functions: ["double", "clamp"], 
//     units: {...} 
//  }

const expr2 = new Exprify();
expr2.importState(state);
expr2.evaluate("x + y");                   // 15
```

### Inline Function Definitions

Functions can be defined directly inside an expression using the `name(params) = body` syntax. Once defined, they behave exactly like functions registered via `addFunction` and remain available for the lifetime of the instance.

```js
expr.evaluate("hyp(a, b) = sqrt(a^2 + b^2)");
expr.evaluate("hyp(3, 4)");                // 5
expr.evaluate("hyp(5, 12)");              // 13
```

This is particularly convenient for one-off helpers that do not warrant a full `addFunction` call, or for expressions that define and immediately use a function in a single evaluation step.

> See the [full searchable function reference](docs/reference/functions.md) for all ~130 built-in functions.
> 

## Manual Build

```bash
git clone https://github.com/code-hemu/exprify.git
cd Exprify
npm install
npm run build
```

Output is written to `dist/`.

## Testing

```bash
npm test
```

Tested in CI across Node 20 and 22. See `.github/workflows/ci.yml` for details.

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push and open a pull request.

## License

Exprify is licensed under **GPL-3.0**. Copyright © [Nirmal Paul](https://github.com/nirmalpaul383/).
