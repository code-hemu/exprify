# Classes

## Exprify

The main class. See [Core API](../core/index.md) for full documentation.

```js
import Exprify from 'exprify';
const expr = new Exprify();
```

## Chain

Returned by `.chain()`. Provides fluent sequential evaluation. See [Chaining](../core/chaining.md) for details.

```js
const c = expr.chain();
c.evaluate('2 + 2').evaluate('ans * 10').done(); // 40
```

## ExprDecimal

Internal class for arbitrary-precision decimal arithmetic. Configurable precision via `ExprDecimal.DP` (default 20, max 100).

```js
ExprDecimal.DP = 50;
```
