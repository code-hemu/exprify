# Constants

Exprify provides several built-in mathematical constants that can be used directly inside expressions, just like variables. These constants are read-only and always evaluate to their predefined numeric values.

| Name | Value | Description |
|---|---|---|
| `pi` | 3.141592653589793 | The ratio of a circle's circumference to its diameter. Widely used in trigonometry, geometry, and wave calculations. |
| `e` | 2.718281828459045 | Euler's number, the base of the natural logarithm. Appears frequently in growth, decay, and calculus problems. |
| `PHI` | 1.618033988749895 | The golden ratio, often denoted φ. Found in geometry, art, architecture, and certain recursive sequences like Fibonacci numbers. |
| `TAU` | 6.283185307179586 | Equal to `2 * pi`, representing a full turn in radians. Useful for simplifying expressions involving full rotations or periodic functions. |
| `INFINITY` | Infinity | Represents positive infinity. Useful for limits, bounds, and comparisons involving unbounded values. |
| `NaN` | NaN | Stands for "Not-a-Number". Represents an undefined or unrepresentable numeric result, such as `0/0`. |

---

## Usage

Constants can be referenced by name and combined with operators, functions, and variables in any expression.

```js
expr.evaluate('pi');           // 3.141592653589793
expr.evaluate('2 * pi');       // 6.283185307179586
expr.evaluate('sin(pi / 2)');  // 1
expr.evaluate('e ^ 2');        // 7.38905609893065
expr.evaluate('TAU / 2');      // 3.141592653589793 (equivalent to pi)
expr.evaluate('PHI ^ 2');      // 2.618033988749895
expr.evaluate('1 / INFINITY'); // 0
expr.evaluate('0 / 0');        // NaN
```

---

## Notes

- Constant names are case-sensitive (`pi` is valid, `PI` is not, unlike `PHI` and `TAU` which are uppercase by convention).
- Constants can be used in any context where a number is expected, including inside function calls, ranges, lambdas, and unit conversions.
- Since `INFINITY` and `NaN` follow standard floating-point semantics, operations involving them follow normal IEEE 754 rules (e.g., `INFINITY - INFINITY` evaluates to `NaN`).
