# BigInts

Native JavaScript `BigInt` values are fully supported in expressions, allowing exact arithmetic on integers of arbitrary size - far beyond the safe range of regular `number` values (`±2^53 - 1`). This is especially useful for cryptography, financial calculations, large counters, and any scenario where precision loss is unacceptable.

## Literal Syntax

A BigInt literal is written as an integer followed by the lowercase `n` suffix:

```js
expr.evaluate('42n');      // 42n
expr.evaluate('100n');     // 100n
expr.evaluate('0n');       // 0n
expr.evaluate('-7n');      // -7n
expr.evaluate('123456789012345678901234567890n'); // arbitrarily large integers
```

Note: only integer literals can carry the `n` suffix. Decimal points or exponents are not allowed (`1.5n` and `1e10n` are invalid).

## Arithmetic Operators

BigInts support all the standard arithmetic and comparison operators:

```js
expr.evaluate('10n + 20n');   // 30n
expr.evaluate('10n - 3n');    // 7n
expr.evaluate('10n * 5n');    // 50n
expr.evaluate('10n / 3n');    // 3n   (integer division, truncates toward zero)
expr.evaluate('10n % 3n');    // 1n
expr.evaluate('2n ** 10n');   // 1024n
expr.evaluate('-5n');         // -5n  (unary negation)
```

### Comparisons

Comparison operators return regular booleans, not BigInts:

```js
expr.evaluate('10n > 5n');    // true
expr.evaluate('10n === 10n'); // true
expr.evaluate('10n == 10');   // true (loose equality allows cross-type comparison)
```

### Bitwise Operators

Bitwise operations also work on BigInts:

```js
expr.evaluate('5n & 3n');   // 1n
expr.evaluate('5n | 2n');   // 7n
expr.evaluate('1n << 4n');  // 16n
expr.evaluate('16n >> 2n'); // 4n
```

## Mixing With Numbers

JavaScript does not allow mixing `BigInt` and `Number` types in arithmetic, and this restriction is preserved:

```js
expr.evaluate('10n + 20');   // throws TypeError: Cannot mix BigInt and other types
expr.evaluate('10n + 20n');  // 30n
```

To work with mixed values, explicitly convert one side using `BigInt()` or `Number()`:

```js
expr.evaluate('10n + BigInt(20)');     // 30n
expr.evaluate('Number(10n) + 20');     // 30
```

> Converting very large BigInts to `Number` may lose precision, since `Number` cannot represent all integers exactly beyond `2^53 - 1`.

## Type Checking

The `typeof` operator correctly identifies BigInt values:

```js
expr.evaluate('typeof(42n)');  // "bigint"
expr.evaluate('typeof(42)');   // "number"
```

This is useful for writing type-safe expressions that branch based on the value's type:

```js
expr.evaluate('typeof(x) === "bigint" ? x + 1n : x + 1');
```

## Common Use Cases

- **Cryptographic computations** - modular exponentiation, hashing inputs, key generation
- **High-precision counters** - IDs, timestamps in nanoseconds, sequence numbers
- **Financial math** - representing currency in smallest units (e.g., cents, satoshis) without floating-point rounding errors
- **Large factorials / combinatorics** - values that quickly exceed `Number.MAX_SAFE_INTEGER`

```js
expr.evaluate('20n * 19n * 18n * 17n * 16n'); // 1860480n
```

## Limitations

- No decimal or fractional BigInt values exist - division always truncates.
- Cannot be used directly with `Math.*` functions, which expect `Number` arguments.
- JSON serialization of BigInt is not supported natively; convert to `String` or `Number` first if you need to serialize results.