# Getting Started

## Installation

```bash
npm install exprify
```

Or via CDN:

```html
<script src="https://unpkg.com/exprify"></script>
```

## Import

```js
import Exprify from 'exprify';
const expr = new Exprify();
```

## Your First Expression

```js
expr.evaluate('2 + 2'); // 4
```

## Variables

```js
expr.setVariable('x', 5);
expr.evaluate('x * 10'); // 50
```

Or use expressions with assignment:

```js
expr.evaluate('y = 3');
expr.evaluate('y^2 + 1'); // 10
```

## Built-in Functions

```js
expr.evaluate('sqrt(16)');       // 4
expr.evaluate('sin(pi / 2)');    // 1
expr.evaluate('log(e)');         // 1
```

## Numbers & Types

```js
expr.evaluate('fraction(1, 3) + fraction(1, 6)');  // "1/2"
expr.evaluate('bignumber("0.1") + bignumber("0.2")'); // "0.3"
expr.evaluate('(3 + 2i) + (1 - i)');                // "4 + i"
```

## Unit Conversion

```js
expr.evaluate('2 inch to cm');   // 5.08 cm
expr.evaluate('5 cm + 2 inch'); // 10.08 cm
```

## Matrices

```js
expr.evaluate('m = [1, 2; 3, 4]');
expr.evaluate('det(m)');         // -2
expr.evaluate('inverse(m)');
```

## Symbolic Algebra

```js
expr.evaluate('simplify("x^2 + 2x + x")');          // "x^2 + 3x"
expr.evaluate('expand("(x+1)^2")');                 // "x^2 + 2x + 1"
expr.evaluate('factor("x^2 - 5x + 6")');            // "(x-2)(x-3)"
expr.evaluate('derivative("x^3", "x")');            // "3 * x^2"
```

## Lambda Functions

```js
expr.evaluate('x -> x^2');                    // single param
expr.evaluate('map([1, 2, 3], "x -> x^2")'); // [1, 4, 9]
```

## Chaining

```js
const c = expr.chain();
c.evaluate('2 + 2');        // ans = 4
c.evaluate('ans * 10');     // ans = 40
c.evaluate('ans / 2');      // ans = 20
c.done();                   // 20
```

## Command-Line REPL

```bash
exprify                 # interactive REPL
exprify "2 + 2"         # evaluate and print
echo "2+2" | exprify    # piped input
```

## Next Steps

- [Complete Functions Reference](reference/functions.md)
- [Expression Syntax](expressions/syntax.md)
- [GitHub Repository](https://github.com/code-hemu/exprify)
