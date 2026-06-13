# Configuration

Exprify follows a minimal-configuration philosophy: rather than exposing a large global settings object, almost all behavior is controlled per-instance through the API methods documented below. This keeps configuration explicit, predictable, and easy to reason.

## BigNumber Precision

The `ExprDecimal` class wraps an arbitrary-precision decimal library and is used internally whenever `bignumber()`-mode arithmetic is requested. By default, Exprify uses 20 decimal places of precision, which is sufficient for most financial and scientific calculations. You can raise this (up to a hard cap of 100) when you need finer-grained results, such as for cryptographic computations, high-precision scientific simulations, or chained division operations where rounding error could otherwise accumulate.

```js
const { Exprify } = require('exprify');
const { ExprDecimal } = require('exprify/src/utils/decimal');

// Default precision is 20 decimal places
console.log(ExprDecimal.DP); // 20

// Increase precision to 50 decimal places
ExprDecimal.DP = 50;

const expr = new Exprify();

// Division now returns up to 50 significant decimal digits
const result = expr.evaluate('bignumber(1) / bignumber(3)');
console.log(result.toString());
// "0.33333333333333333333333333333333333333333333333333"

// Reset back to a lower precision if needed
ExprDecimal.DP = 20;
```

**Important considerations:**

- `ExprDecimal.DP` is a **static, global** setting - changing it affects *all* `ExprDecimal` instances and all Exprify instances in the running process, not just the one you're configuring it from. If your application uses Exprify in multiple places with different precision needs, set `DP` immediately before the relevant evaluation and consider resetting it afterward.
- Values above 100 are rejected; attempting to set `ExprDecimal.DP = 150` will either clamp to 100 or throw, depending on your version - always validate against the documented maximum.
- Higher precision comes with a performance cost. Arbitrary-precision arithmetic at DP=100 is meaningfully slower than DP=20, so only raise it when correctness genuinely requires it.
- This setting only affects results produced via `bignumber()` - ordinary numeric expressions (e.g. `1 / 3`) continue to use standard double-precision floating point and are unaffected by `ExprDecimal.DP`.

## Evaluation Scope

A *scope* is a plain JavaScript object mapping variable names to values. It lets you supply or override variables for a single call to `evaluate()` or `compile()` without permanently mutating the engine's internal variable table. This is the recommended way to run the same expression repeatedly with different inputs - for example, evaluating a formula once per row of a dataset.

```js
const expr = new Exprify();

// One-off evaluation with scope
console.log(expr.evaluate('x^2 + y', { x: 3, y: 4 })); // 13

// Scope variables do not persist after evaluation
console.log(expr.evaluate('x')); // throws: x is undefined (unless set globally)

// Compiling once, evaluating many times with different scopes
const compiled = expr.compile('a * b + c');

const rows = [
  { a: 2, b: 3, c: 1 },
  { a: 5, b: 5, c: 0 },
  { a: 10, b: 0.5, c: 2 },
];

const results = rows.map(row => compiled.evaluate(row));
console.log(results); // [7, 25, 7]
```

**Scope precedence:** if a variable exists both in the scope object *and* as a globally-set variable on the engine instance (via `expr.setVariable()` or similar), the scope value takes precedence for that evaluation only. This makes scope ideal for "default value with override" patterns:

```js
expr.setVariable('taxRate', 0.07); // global default

expr.evaluate('price * (1 + taxRate)', { price: 100 }); // 107 (uses global taxRate)
expr.evaluate('price * (1 + taxRate)', { price: 100, taxRate: 0 }); // 100 (override)
```

## Custom Functions

`addFunction()` registers a JavaScript function under a given name so it can be called from within expressions, just like a built-in function such as `sin()` or `sqrt()`. This is the primary extension point for domain-specific logic - unit conversions, lookups, string formatting, business rules, and so on.

```js
const expr = new Exprify();

// Simple single-argument function
expr.addFunction('double', (x) => x * 2);
console.log(expr.evaluate('double(21)')); // 42

// Multi-argument function
expr.addFunction('clamp', (value, min, max) => Math.max(min, Math.min(max, value)));
console.log(expr.evaluate('clamp(150, 0, 100)')); // 100

// Functions can call other built-ins or do arbitrary computation
expr.addFunction('hypotenuse', (a, b) => Math.sqrt(a * a + b * b));
console.log(expr.evaluate('hypotenuse(3, 4)')); // 5

// Functions can be used inside larger expressions, including nested calls
console.log(expr.evaluate('double(clamp(75, 0, 50))')); // 100

// Variadic-style functions using rest parameters
expr.addFunction('sumAll', (...args) => args.reduce((acc, v) => acc + v, 0));
console.log(expr.evaluate('sumAll(1, 2, 3, 4, 5)')); // 15
```

**Notes on custom functions:**

- Function names follow the same identifier rules as variables: they should start with a letter or underscore and contain only letters, digits, and underscores.
- Registering a function with a name that already exists (including built-in function names) overwrites the existing definition for that engine instance - use this carefully, as it can change the meaning of expressions that worked before.
- Custom functions are included when you call `exportState()`, provided they're serializable (see below) - functions defined as closures over external state will not survive serialization and must be re-registered manually after `importState()`.

## State Serialization

`exportState()` and `importState()` allow you to capture the full configuration of an engine instance - its variables, registered functions, and any custom units - and restore it later, either in the same process or after persisting it to disk, a database, or a network transfer.

```js
const expr = new Exprify();

expr.setVariable('x', 10);
expr.setVariable('y', 20);
expr.addFunction('double', (x) => x * 2);
expr.addUnit('smoot', { definition: '1.7018 m' });

// Export the full state
const state = expr.exportState();
console.log(state);
/*
{
  variables: { x: 10, y: 20 },
  functions: { double: '(x) => x * 2' },   // serialized as source where possible
  units: { smoot: { definition: '1.7018 m' } }
}
*/

// Persist to disk (example)
const fs = require('fs');
fs.writeFileSync('exprify-state.json', JSON.stringify(state));

// ... later, in a new process ...
const restoredState = JSON.parse(fs.readFileSync('exprify-state.json', 'utf8'));

const expr2 = new Exprify();
expr2.importState(restoredState);

console.log(expr2.evaluate('double(x) + y')); // 40
console.log(expr2.evaluate('5 smoot to m'));  // ~8.509 m
```

**Caveats:**

- Functions registered via closures over non-serializable values (e.g. database connections, file handles) will not round-trip correctly through `exportState()`/`importState()`. For these, export only the simple state and re-register such functions manually after import.
- `importState()` merges into the target instance by default in most implementations - if you need a completely clean slate, create a fresh `Exprify` instance before importing.
- State serialization does not include `ExprDecimal.DP`, since that setting is global rather than per-instance; you must set it separately on the receiving side.

## Constants

Exprify ships with a set of built-in mathematical constants, available by name in any expression without prior declaration:

| Name | Value | Description |
|---|---|---|
| `pi` | 3.141592653589793 | Ratio of a circle's circumference to its diameter |
| `e` | 2.718281828459045 | Euler's number, base of the natural logarithm |
| `PHI` | 1.618033988749895 | The golden ratio, (1 + √5) / 2 |
| `TAU` | 6.283185307179586 | The full circle constant, 2π |
| `INFINITY` | Infinity | Positive infinity |
| `NaN` | NaN | "Not a Number" - result of undefined numeric operations |

```js
const expr = new Exprify();

console.log(expr.evaluate('2 * pi * 5'));      // ~31.4159265358979 (circumference, r=5)
console.log(expr.evaluate('e^1'));             // 2.718281828459045
console.log(expr.evaluate('PHI - 1'));         // 0.618033988749895 (== 1/PHI)
console.log(expr.evaluate('TAU / 2 == pi'));   // true
console.log(expr.evaluate('1 / 0 == INFINITY')); // true
console.log(expr.evaluate('isNaN(0 / 0)'));    // true
```

**Overriding constants:** because constants are just pre-populated entries in the variable table, they can be shadowed within a given scope or instance if your application has a specific need (for example, using a higher-precision value of `pi`). However, this is discouraged for general use, since it can make expressions confusing to read and debug - prefer introducing a new, clearly-named variable instead (e.g. `piHighPrecision`) rather than redefining a well-known constant.