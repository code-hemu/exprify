# Complex Numbers

The expression evaluator has built-in support for complex numbers, allowing you to write, combine, and evaluate expressions that mix real and imaginary parts without any special setup or configuration.

## Imaginary Literals

An imaginary number is written using the `i` suffix directly after a numeric coefficient. If no coefficient is given, a value of `1` is assumed.

```js
expr.evaluate('i');        // i
expr.evaluate('2i');       // 2i
expr.evaluate('-i');       // -i
expr.evaluate('0.5i');     // 0.5i
expr.evaluate('-3.25i');   // -3.25i
```

- `i` on its own represents the imaginary unit (equivalent to `1i`).
- A leading `-` negates the imaginary coefficient as expected.
- Decimal coefficients are fully supported.

## Complex Arithmetic

Complex numbers can be freely combined with real numbers using standard arithmetic operators: addition (`+`), subtraction (`-`), multiplication (`*`), and division (`/`). The evaluator automatically applies the correct rules for complex math (e.g. `i * i = -1`).

### Addition and Subtraction

```js
expr.evaluate('(3 + 2i) + (1 - i)');   // "4 + i"
expr.evaluate('(5 + 3i) - (2 + i)');   // "3 + 2i"
```

Real parts and imaginary parts are combined independently.

### Multiplication

```js
expr.evaluate('(1 + i) * (1 - i)');    // "2"
expr.evaluate('(2 + i) * (3 + 4i)');   // "2 + 11i"
```

Multiplication follows the distributive law, with `i * i` evaluating to `-1`. Note that when the resulting imaginary part is `0`, the result is simplified to a plain real number (as shown in the first example above).

### Division

```js
expr.evaluate('(3 + 2i) / (1 + i)');   // "2.5 - 0.5i"
expr.evaluate('10 / (2i)');            // "-5i"
```

Division is performed by multiplying both the numerator and denominator by the complex conjugate of the denominator, then simplifying.

### Mixing Real and Complex Values

Real numbers and complex numbers can be combined directly in the same expression:

```js
expr.evaluate('5 + 3i');     // "5 + 3i"
expr.evaluate('5 + i - 2');  // "3 + i"
expr.evaluate('2 * (1 + i)'); // "2 + 2i"
```

## Display Formatting

Results are returned as formatted strings rather than raw numeric objects, making them easy to print or log directly.

| Value                  | Display Format |
|-------------------------|----------------|
| Pure imaginary unit      | `"i"`          |
| Negative imaginary unit  | `"-i"`         |
| Imaginary with coefficient | `"3 + 2i"`  |
| Real result (imaginary part is zero) | `"4"` |
| Real and negative imaginary | `"2.5 - 0.5i"` |

### Formatting Rules

- If the imaginary part is `0`, only the real part is shown (e.g. `"2"`, not `"2 + 0i"`).
- If the real part is `0`, only the imaginary part is shown (e.g. `"2i"`, not `"0 + 2i"`).
- A coefficient of `1` or `-1` on the imaginary part is shown as `i` or `-i`, without the numeral.
- Negative imaginary parts are displayed with a `-` sign and no extra `+` (e.g. `"2.5 - 0.5i"`, not `"2.5 + -0.5i"`).
- Positive imaginary parts following a real part are prefixed with `" + "` for readability (e.g. `"4 + i"`).