# Fractions

The `fraction` type provides **exact rational arithmetic**, avoiding the rounding errors that come from representing values like `1/3` as floating-point numbers. Internally, a fraction is stored as a `{ n, d }` pair (numerator and denominator), and the engine automatically keeps it in lowest terms.

This is useful any time you need precise results for ratios, proportions, probabilities, or any calculation where repeated floating-point operations would otherwise accumulate error.

## Creation

Create a fraction with `fraction(numerator, denominator)`. The result is always displayed in its simplest (fully reduced) form.

```js
expr.evaluate('fraction(1, 3)');  // "1/3"
expr.evaluate('fraction(2, 4)');  // "1/2" (auto-reduced)
```

Note that `fraction(2, 4)` and `fraction(1, 2)` represent the same value and will print identically, since the engine reduces the fraction automatically at creation time - you never need to call a separate "simplify" step.

## Arithmetic

Fractions support all the standard arithmetic operators:

- **Addition** (`+`)
- **Subtraction** (`-`)
- **Multiplication** (`*`)
- **Division** (`/`)
- **Integer powers** (`^`)

Each operation returns a new fraction, automatically reduced to lowest terms:

```js
expr.evaluate('fraction(1, 3) + fraction(1, 6)'); // "1/2"
expr.evaluate('fraction(2, 3) * fraction(3, 4)'); // "1/2"
```

### Mixing fractions with plain numbers

Fractions can be freely combined with ordinary numbers in expressions. When a fraction interacts with a number, the number is treated as a fraction with denominator `1`, and the result remains an exact fraction:

```js
expr.evaluate('fraction(1, 2) + 1');  // "3/2"
```

This means you can mix fraction-based and numeric values in the same expression without manually converting types - the exactness of the fraction is preserved throughout the calculation.

## Introspection

If you need to inspect the internal structure of a fraction - for example, to extract its parts for display, validation, or further processing - the following helper functions are available:

- **`numer(fraction)`** - returns the numerator as a plain number
- **`denom(fraction)`** - returns the denominator as a plain number
- **`isFraction(value)`** - returns `true` if the value is a fraction, `false` otherwise (useful for type checks before applying fraction-specific logic)

```js
expr.evaluate('numer(fraction(3, 4))');  // 3
expr.evaluate('denom(fraction(3, 4))');  // 4
expr.evaluate('isFraction(fraction(1,2))'); // true
```

These functions are especially handy when writing generic code that needs to branch depending on whether a value is a fraction or a regular number.