# Constants

Built-in mathematical constants available in expressions.

| Name | Value | Description |
|---|---|---|
| `pi` | 3.141592653589793 | Ratio of circumference to diameter |
| `e` | 2.718281828459045 | Euler's number |
| `PHI` | 1.618033988749895 | Golden ratio |
| `TAU` | 6.283185307179586 | 2 * pi |
| `INFINITY` | Infinity | Positive infinity |
| `NaN` | NaN | Not-a-number |

## Usage

```js
expr.evaluate('pi');           // 3.141592653589793
expr.evaluate('2 * pi');       // 6.283185307179586
expr.evaluate('sin(pi / 2)');  // 1
expr.evaluate('e ^ 2');        // 7.38905609893065
```
