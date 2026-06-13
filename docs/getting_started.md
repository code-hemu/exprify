# Getting Started

Welcome to **Exprify** - a lightweight, powerful expression evaluation engine for JavaScript. Whether you need basic arithmetic, advanced symbolic algebra, unit conversions, or matrix operations, Exprify provides a simple and consistent API to handle it all. This guide walks you through installation, core concepts, and the most commonly used features so you can start building right away.

## Installation

Exprify can be installed via npm for use in Node.js or bundler-based projects:

```bash
npm install exprify
```

If you prefer not to use a build step, you can load Exprify directly in the browser via a CDN. This exposes a global `Exprify` constructor you can use immediately:

```html
<script src="https://unpkg.com/exprify"></script>
```

## Import

Once installed, import the `Exprify` class and create a new instance. Each instance maintains its own independent state, including variables, custom functions, and configuration - so you can safely run multiple evaluators side by side without them interfering with each other:

```js
import Exprify from 'exprify';
const expr = new Exprify();
```

## Your First Expression

At its core, Exprify evaluates string expressions and returns the result. The simplest use case is basic arithmetic, which works exactly as you'd expect from standard math notation:

```js
expr.evaluate('2 + 2'); // 4
```

## Variables

Exprify supports persistent variables that live for the lifetime of the instance. You can define a variable explicitly using `setVariable`, then reference it in any later expression:

```js
expr.setVariable('x', 5);
expr.evaluate('x * 10'); // 50
```

Alternatively, you can assign variables directly within an expression using the `=` operator. This is convenient when you want to define and use a value in a single evaluation pipeline, and the variable remains available for all subsequent calls:

```js
expr.evaluate('y = 3');
expr.evaluate('y^2 + 1'); // 10
```

## Built-in Functions

Exprify ships with a comprehensive library of built-in mathematical functions, covering everything from basic operations like square roots to trigonometry and logarithms. These functions can be called just like in standard math notation, and constants such as `pi` and `e` are available out of the box:

```js
expr.evaluate('sqrt(16)');       // 4
expr.evaluate('sin(pi / 2)');    // 1
expr.evaluate('log(e)');         // 1
```

## Numbers & Types

Beyond standard floating-point numbers, Exprify natively understands several specialized numeric types, allowing you to work with exact fractions, arbitrary-precision decimals, and complex numbers without any extra setup:

- **Fractions** - perform exact rational arithmetic without floating-point rounding errors:

```js
expr.evaluate('fraction(1, 3) + fraction(1, 6)');  // "1/2"
```

- **Big numbers** - handle arbitrary-precision decimal arithmetic, useful for financial or scientific calculations where floating-point imprecision matters:

```js
expr.evaluate('bignumber("0.1") + bignumber("0.2")'); // "0.3"
```

- **Complex numbers** - perform arithmetic on complex numbers using the imaginary unit `i`:

```js
expr.evaluate('(3 + 2i) + (1 - i)');                // "4 + i"
```

## Unit Conversion

Exprify includes a built-in unit system that lets you convert between units and even perform arithmetic across mixed units. The `to` keyword converts a value to a target unit, and Exprify automatically normalizes units when combining values in an expression:

```js
expr.evaluate('2 inch to cm');   // 5.08 cm
expr.evaluate('5 cm + 2 inch'); // 10.08 cm
```

This works across many unit categories, including length, mass, time, temperature, and more - making Exprify well suited for engineering and scientific calculations.

## Matrices

For linear algebra workflows, Exprify supports matrix literals and a wide range of matrix operations. Matrices are defined using square brackets, with semicolons separating rows. Once defined, you can compute determinants, inverses, and other standard linear algebra operations directly:

```js
expr.evaluate('m = [1, 2; 3, 4]');
expr.evaluate('det(m)');         // -2
expr.evaluate('inverse(m)');
```

## Symbolic Algebra

Exprify can manipulate algebraic expressions symbolically - without assigning numeric values to variables. This makes it useful for simplifying expressions, expanding polynomials, factoring, and computing derivatives, all returned as readable expression strings:

```js
expr.evaluate('simplify("x^2 + 2x + x")');          // "x^2 + 3x"
expr.evaluate('expand("(x+1)^2")');                 // "x^2 + 2x + 1"
expr.evaluate('factor("x^2 - 5x + 6")');            // "(x-2)(x-3)"
expr.evaluate('derivative("x^3", "x")');            // "3 * x^2"
```

These symbolic tools are especially handy for building calculators, educational tools, or any application that needs to manipulate formulas dynamically.

## Lambda Functions

Exprify supports anonymous (lambda) functions using arrow syntax, similar to JavaScript. A lambda can take one or more parameters and be evaluated directly, or passed as a string into higher-order functions like `map` to apply the function across a collection:

```js
expr.evaluate('x -> x^2');                    // single param
expr.evaluate('map([1, 2, 3], "x -> x^2")'); // [1, 4, 9]
```

This enables functional-programming style transformations directly within expression strings.

## Chaining

For multi-step calculations where each result feeds into the next, Exprify provides a chainable API via `chain()`. Each call automatically stores its result in the special `ans` variable, which can be referenced in the next step. Calling `done()` finalizes the chain and returns the final computed value:

```js
const c = expr.chain();
c.evaluate('2 + 2');        // ans = 4
c.evaluate('ans * 10');     // ans = 40
c.evaluate('ans / 2');      // ans = 20
c.done();                   // 20
```

Chaining is particularly useful for interactive calculators, REPLs, or any scenario where users build up a calculation step by step.

## Command-Line REPL

Exprify also installs a command-line interface, giving you three flexible ways to evaluate expressions directly from the terminal:

- **Interactive REPL** - launch a read-evaluate-print loop for exploratory calculations:

```bash
exprify
```

- **One-off evaluation** - pass an expression as an argument to evaluate it once and print the result:

```bash
exprify "2 + 2"
```

- **Piped input** - pipe an expression into Exprify from another command or script, ideal for automation and shell pipelines:

```bash
echo "2+2" | exprify
```

## Next Steps

Now that you've covered the basics, here's where to go next:

- **[Complete Functions Reference](reference/functions.md)** - browse the full list of available built-in functions, organized by category.
- **[Expression Syntax](expressions/syntax.md)** - dive deeper into operator precedence, supported syntax, and edge cases.
- **[GitHub Repository](https://github.com/code-hemu/exprify)** - view the source code, report issues, or contribute to the project.