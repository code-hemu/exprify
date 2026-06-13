# Numbers

This section describes how numeric values are represented, parsed, displayed, and 
manipulated within the language/expression engine.

## Literal Formats

Numbers can be written in several formats depending on the base and notation 
that best suits the value being represented.

```js
42        // decimal integer
3.14      // decimal float
0xFF      // hexadecimal (evaluates to 255)
0b1010    // binary (evaluates to 10)
1.5e10    // scientific notation (1.5 × 10^10 = 15000000000)
```

### Notes on Literal Formats

- **Decimal integers** are written as a sequence of digits with no prefix 
  (e.g. `0`, `42`, `1000`).
- **Decimal floats** include a decimal point separating the integer and 
  fractional parts (e.g. `3.14`, `0.5`, `100.0`).
- **Hexadecimal literals** are prefixed with `0x` or `0X` and may contain 
  digits `0-9` and letters `a-f`/`A-F`.
- **Binary literals** are prefixed with `0b` or `0B` and may only contain 
  the digits `0` and `1`.
- **Scientific notation** uses `e` or `E` to indicate a power-of-ten 
  multiplier, and may include a sign (`1.5e+10`, `1.5e-10`).
- Hex and binary literals are always interpreted as integers; they cannot 
  contain a decimal point or exponent.

## Display

When a number is converted to a string for output, the following rules apply:

- **Integers** are displayed as plain digits with no trailing `.0` 
  (e.g. `42`, not `42.0`).
- **Floats** are rounded to **14 decimal places** for display purposes, 
  trimming any trailing zeros after rounding.
- A float whose value happens to be a whole number (e.g. `4.0`) is still 
  displayed using its float representation rules unless it was produced 
  as the result of an integer-only operation.
- Very large or very small floats may be displayed using scientific 
  notation, consistent with standard floating-point formatting.

### Display Examples

```js
display(42);          // "42"
display(42.0);         // "42" (if treated as integer-valued)
display(3.14159265358979323846); // "3.14159265358979" (rounded to 14 places)
display(1.5e10);       // "15000000000"
display(0.1 + 0.2);    // "0.3" (rounding hides floating-point error)
```

## Arithmetic

Numbers support standard arithmetic operations with conventional 
**operator precedence** and **left-to-right associativity** for operators 
of equal precedence (except exponentiation, which is typically 
right-associative).

```js
expr.evaluate('2 + 3 * 4');  // 14   (multiplication before addition)
expr.evaluate('10 / 3');     // 3.3333333333333335
expr.evaluate('2^10');       // 1024 (exponentiation)
```

### Supported Operators

| Operator | Description          | Precedence (high → low) |
|----------|-----------------------|--------------------------|
| `^`      | Exponentiation         | 1 (highest)              |
| `*`, `/`, `%` | Multiplication, division, modulo | 2 |
| `+`, `-` | Addition, subtraction  | 3 (lowest)               |

### Additional Behavior

- **Division** (`/`) always returns a float, even when dividing two 
  integers evenly (e.g. `10 / 2` → `5`, but `10 / 3` → `3.3333333333333335`).
- **Modulo** (`%`) returns the remainder of integer or float division, 
  following the sign convention of the dividend.
- **Exponentiation** (`^`) supports integer and fractional exponents, 
  including negative exponents (e.g. `2^-1` → `0.5`).
- **Mixed-type arithmetic** (integer combined with float) promotes the 
  result to a float.
- **Parentheses** `()` can be used to override default precedence:

```js
expr.evaluate('(2 + 3) * 4'); // 20
expr.evaluate('2 * (3 + 4)'); // 14
```