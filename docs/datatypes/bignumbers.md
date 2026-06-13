# BigNumbers

The `bignumber()` function creates arbitrary-precision decimal numbers using the internal `ExprDecimal` class. This allows you to perform calculations with numbers that exceed the safe limits of JavaScript's native floating-point representation, and to avoid the rounding errors that are inherent to binary floating-point arithmetic.

## Why BigNumbers?

JavaScript's native `number` type is a 64-bit IEEE 754 double. While fast and convenient, it cannot represent every decimal value exactly. This leads to small but sometimes significant rounding errors, especially in financial, scientific, or cryptographic calculations where precision matters.

`bignumber()` solves this by representing values internally as arbitrary-precision decimals, performing arithmetic digit-by-digit rather than relying on binary floating-point hardware.

## Basic Usage

```js
expr.evaluate('bignumber("0.1") + bignumber("0.2")'); // "0.3"
```

Unlike native floating-point, this avoids rounding errors:

```js
expr.evaluate('0.1 + 0.2');                            // 0.30000000000000004
expr.evaluate('bignumber("0.1") + bignumber("0.2")'); // "0.3"
```

You can pass values to `bignumber()` as strings, numbers, or other big numbers:

```js
expr.evaluate('bignumber("123.456")');   // "123.456"
expr.evaluate('bignumber(123.456)');     // "123.456"
expr.evaluate('bignumber(bignumber(5))'); // "5"
```

> **Tip:** Always prefer passing values as **strings** when precision matters. Passing a native number that already lost precision (e.g. `0.1 + 0.2` evaluated natively) will carry that imprecision into the big number.

## Arithmetic Operations

All standard arithmetic operators work with big numbers:

```js
expr.evaluate('bignumber("10") + bignumber("5")');   // "15"
expr.evaluate('bignumber("10") - bignumber("5")');   // "5"
expr.evaluate('bignumber("10") * bignumber("5")');   // "50"
expr.evaluate('bignumber("10") / bignumber("3")');   // "3.33333333333333333333"
expr.evaluate('bignumber("2") ^ bignumber("10")');   // "1024"
```

Big numbers can also be mixed with regular numbers in many cases, though it's best practice to keep operations consistently in the big number domain to avoid implicit precision loss.

## Precision

Default precision is 20 decimal places, configurable up to 100:

```js
ExprDecimal.DP = 50;
```

Once set, `ExprDecimal.DP` affects all subsequent big number operations within the current context. This is useful when:

- Performing iterative calculations (e.g. financial compounding) that accumulate error over many steps.
- Working with values that require more significant digits than the default allows.
- Matching the precision requirements of an external system (e.g. a database column or API contract).

```js
ExprDecimal.DP = 50;
expr.evaluate('bignumber("1") / bignumber("3")');
// "0.33333333333333333333333333333333333333333333333333"
```

> **Note:** Higher precision means more computation per operation. Set `DP` only as high as your use case actually requires.

## Scientific Notation

Big numbers automatically use scientific notation for very large or very small magnitudes, similar to how native JavaScript numbers behave:

```js
expr.evaluate('bignumber("1.2e500")');  // "1.2e+500"
expr.evaluate('bignumber("1.2e-500")'); // "1.2e-500"
```

This makes it safe to work with astronomically large or microscopically small values - well beyond the `±1.7976931348623157e+308` range of native doubles - without losing precision or overflowing to `Infinity`.

## Type Checking

Use `isBigNumber()` to determine whether a value is a big number instance:

```js
expr.evaluate('isBigNumber(bignumber(1))'); // true
expr.evaluate('isBigNumber(1)');            // false
expr.evaluate('isBigNumber("1")');          // false
```

This is particularly useful when writing functions or expressions that need to branch their logic depending on whether they're operating on a native number or a big number.

## Common Use Cases

- **Financial calculations** - currency totals, interest, tax, and discount calculations where rounding errors are unacceptable.
- **Scientific computing** - physics or chemistry constants requiring many significant digits.
- **Cryptography / hashing** - operations on very large integers.
- **Data validation** - comparing numbers with exact decimal equality instead of approximate floating-point equality.

## Best Practices

1. **Always construct from strings** when the source value has more decimal digits than a `double` can represent exactly.
2. **Set `ExprDecimal.DP` once**, near the start of your expression context, rather than repeatedly.
3. **Convert back to native numbers carefully** - only when precision loss is acceptable for display or further native-number math.
4. **Use `isBigNumber()`** to guard logic when mixing big numbers and native numbers in the same expression.