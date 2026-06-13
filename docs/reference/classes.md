```markdown
# Classes

Exprify exposes a small set of public and internal classes that together provide expression parsing, evaluation, chaining, and high-precision arithmetic support.

---

## Exprify

The main entry point class for the library. An instance of `Exprify` holds its own variable scope, configuration, and evaluation state, allowing multiple independent expression environments to coexist in the same application.

```js
import Exprify from 'exprify';
const expr = new Exprify();
```

### Overview

Once instantiated, an `Exprify` object exposes methods for evaluating expressions, defining variables and functions, parsing expressions into abstract syntax trees, and compiling expressions for repeated execution. Each instance maintains its own isolated context, so variables defined on one instance do not leak into another.

```js
const expr = new Exprify();
expr.evaluate('x = 5');
expr.evaluate('x^2 + 1'); // result is 26
```

For the complete set of available methods, configuration options, and evaluation modes, see the [Core API](../core/index.md) documentation.

---

## Chain

An instance of `Chain` is returned whenever `.chain()` is called on an `Exprify` instance. It provides a fluent, sequential evaluation interface, where each call to `.evaluate()` can reference the result of the previous step using the special `ans` variable.

```js
const c = expr.chain();
c.evaluate('2 + 2').evaluate('ans * 10').done(); // result is 40
```

### Overview

Chaining is useful for multi-step computations where intermediate results feed into subsequent expressions, without requiring the user to manually track variable names. Each `.evaluate()` call updates the internal `ans` value and returns the `Chain` instance itself, enabling method chaining. Calling `.done()` finalizes the chain and returns the final computed result.

```js
const result = expr.chain()
  .evaluate('10 / 2')      // ans becomes 5
  .evaluate('ans + 3')     // ans becomes 8
  .evaluate('ans * 2')     // ans becomes 16
  .done();                 // result is 16
```

This pattern keeps multi-step calculations readable and avoids cluttering the surrounding scope with temporary variable names.

---

## ExprDecimal

`ExprDecimal` is an internal class used by Exprify to perform arbitrary-precision decimal arithmetic, ensuring that operations like `bignumber()` avoid the rounding errors typical of native floating-point numbers.

### Precision Configuration

The precision of all `ExprDecimal` operations is controlled globally via the static property `ExprDecimal.DP`, which represents the number of decimal places used in calculations.

```js
ExprDecimal.DP = 50;
```

- Default precision: `20` decimal places
- Maximum precision: `100` decimal places

### Overview

Increasing `ExprDecimal.DP` allows for more accurate results in high-precision arithmetic, at the cost of additional computation time. This is particularly relevant for financial calculations, scientific computing, or any scenario where floating-point imprecision (such as the classic `0.1 + 0.2` issue) would otherwise produce incorrect results.

```js
ExprDecimal.DP = 50;
const result = expr.evaluate('bignumber("0.1") + bignumber("0.2")');
// result is the string "0.3", accurate to the configured precision
```

Most users will not need to interact with `ExprDecimal` directly, as it operates behind the scenes whenever `bignumber()` values are used in expressions.
```