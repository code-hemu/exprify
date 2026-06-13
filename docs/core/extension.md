# Extension

Exprify is designed to be extended. You can register your own JavaScript functions, define inline math functions, create reusable lambda expressions, manage persistent variables, and even add brand-new units to the built-in unit system. This makes Exprify suitable not just as a calculator, but as an embeddable expression engine for domain-specific applications.

## Custom Functions

Use `addFunction()` to register a native JavaScript function so it can be called by name from within any expression. This is the recommended way to expose application-specific logic (e.g. business calculations, data lookups, formatting helpers) to your users without them needing to write JavaScript themselves.

```js
expr.addFunction('double', (x) => x * 2);
expr.evaluate('double(21)'); // 42
```

Registered functions behave just like built-in functions - they can be nested, combined with operators, and used inside larger expressions.

Functions can accept multiple arguments, and the underlying JavaScript function can contain arbitrarily complex logic:

```js
expr.addFunction('add', (a, b) => a + b);
expr.evaluate('add(3, 4)'); // 7
```

You can also register functions that return non-numeric values (strings, arrays, objects), as long as the rest of your expression knows how to handle the returned type.

## Inline Function Definitions

In addition to registering functions from JavaScript, you can define named functions directly inside an expression string. This is useful for quick, throwaway helpers or for letting end users define their own formulas at runtime.

```js
expr.evaluate('f(x) = x^2 + 1');
expr.evaluate('f(5)'); // 26
```

Once defined, an inline function persists for the lifetime of the `expr` instance (similar to a variable), so it can be reused across multiple `evaluate()` calls.

Inline functions support any number of parameters, separated by commas:

```js
expr.evaluate('hyp(a, b) = sqrt(a^2 + b^2)');
expr.evaluate('hyp(3, 4)'); // 5
```

This makes it easy to build up small libraries of reusable formulas (e.g. geometry, finance, physics) entirely within expression strings.

## Lambda Expressions

Lambda expressions let you define anonymous, unnamed functions on the fly using the `->` arrow syntax. They're especially useful when a function is only needed once, or when passing behavior as an argument to another function.

A single-parameter lambda omits parentheses around the parameter:

```js
expr.evaluate('x -> x^2');           // single param
```

Multiple parameters are wrapped in parentheses and separated by commas:

```js
expr.evaluate('(x, y) -> x + y');   // multiple params
```

On their own, lambdas evaluate to a callable function value rather than a number. Their real power comes from passing them into higher-order functions such as `map` and `filter`, which apply the lambda to each element of an array:

```js
expr.evaluate('map([1, 2, 3], "x -> x^2")');  // [1, 4, 9]
expr.evaluate('filter([1, 2, 3, 4], "x -> x > 2")'); // [3, 4]
```

Note that when passing a lambda as an argument to another function, it's typically written as a string so it can be parsed and evaluated independently for each element.

## Variables

Exprify supports persistent variables that retain their value across multiple `evaluate()` calls, similar to variables in a scripting language or spreadsheet.

Use `setVariable()` and `getVariable()` to manage variables programmatically from JavaScript:

```js
expr.setVariable('x', 42);
expr.getVariable('x'); // 42
```

Variables can also be created or updated directly from within an expression using the assignment operator (`=`). The result of the assignment is the assigned value, and the variable becomes available to subsequent expressions:

```js
expr.evaluate('x = 10');
expr.evaluate('y = x * 2'); // 20
```

For convenience, Exprify also supports compound assignment operators, which read the current value of a variable, apply an operation, and store the result back - much like in JavaScript:

```js
expr.evaluate('x = 5');
expr.evaluate('x += 3'); // 8
expr.evaluate('x *= 2'); // 16
```

Other compound operators (such as `-=`, `/=`, and `^=`) follow the same pattern.

## Units

Exprify ships with a comprehensive set of over 100 built-in units spanning many real-world measurement domains, allowing expressions to mix numbers and physical quantities while automatically handling conversions.

Built-in unit categories include:

- length
- weight
- time
- voltage
- frequency
- power
- sound
- temperature
- pressure
- energy
- force
- area
- volume
- current
- resistance
- capacitance
- inductance
- light
- data
- angle
- radiation

If a unit you need isn't included by default, you can add it to the units store. Each custom unit is registered under an existing category and requires a conversion `value` (relative to the category's base unit), a human-readable `name`, and a `symbol` for use in expressions:

```js
expr.units.addUnit('length', 'lightyear', {
  value: 9.461e15,
  name: 'light year',
  symbol: 'ly',
});
```

Once added, the custom unit can be used in expressions exactly like any built-in unit - including in conversions and arithmetic alongside other units in the same category.