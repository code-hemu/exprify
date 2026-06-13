# Customization

Expressions can be extended with user-defined functions, anonymous lambdas, and several convenience operators directly inside the expression string - no need to touch JavaScript code or recompile anything. This makes the expression engine suitable for building calculators, formula editors, configuration-driven business rules, and other systems where end users define their own logic.

## Inline Function Definitions

You can define named functions with one or more parameters using standard mathematical function notation. Once defined, a function is stored in the evaluator's scope and can be reused across subsequent calls to `evaluate`, just like a built-in function such as `sqrt` or `sum`.

```js
// Define a function that computes the hypotenuse of a right triangle
expr.evaluate('hyp(a, b) = sqrt(a^2 + b^2)');
expr.evaluate('hyp(3, 4)'); // 5

// Functions can reference other user-defined functions
expr.evaluate('double(x) = x * 2');
expr.evaluate('quad(x) = double(double(x))');
expr.evaluate('quad(5)'); // 20

// Functions can take any number of parameters
expr.evaluate('avg3(a, b, c) = (a + b + c) / 3');
expr.evaluate('avg3(10, 20, 30)'); // 20
```

Definitions persist for the lifetime of the evaluator instance (or until overwritten with a new definition of the same name), so you only need to define a function once and can then call it repeatedly with different arguments.

## Lambda Expressions

Lambdas let you create anonymous, throwaway functions inline using the `->` arrow syntax. They're especially useful when you need a short function as an argument to another function, and don't want to clutter the evaluator's scope with a permanent named definition.

```js
// Single parameter - parentheses are optional
expr.evaluate('x -> x^2');

// Multiple parameters require parentheses around the parameter list
expr.evaluate('(x, y) -> x + y');

// Lambdas can contain arbitrarily complex expressions
expr.evaluate('(a, b, c) -> (a + b + c) / 3');
```

A lambda by itself simply produces a callable function value - it becomes useful once passed to a higher-order function like `map` or `filter`.

### Lambdas with array utilities

Array utility functions accept a lambda (typically passed as a string) and apply it element-by-element or as a predicate:

```js
// map: transform every element of an array
expr.evaluate('map([1, 2, 3], "x -> x^2")');         // [1, 4, 9]

// filter: keep only elements matching a predicate
expr.evaluate('filter([1, 2, 3, 4], "x -> x > 2")'); // [3, 4]

// Lambdas can also take multiple parameters, e.g. for reduce-style operations
expr.evaluate('reduce([1, 2, 3, 4], "(acc, x) -> acc + x", 0)'); // 10
```

## Pipeline Operator

The pipeline operator `|>` takes the value on its left-hand side and feeds it as the (first) argument to the function on its right-hand side. This allows you to chain transformations in a left-to-right, "data flows downstream" style that's often easier to read than deeply nested function calls.

```js
// Equivalent to sqrt(5)
expr.evaluate('5 |> sqrt');         // 2.236...

// Equivalent to upper("hello")
expr.evaluate('"hello" |> upper');  // "HELLO"

// Chain multiple steps together
expr.evaluate('16 |> sqrt |> sqrt'); // 2  (sqrt(sqrt(16)))

// Works with user-defined functions too
expr.evaluate('double(x) = x * 2');
expr.evaluate('5 |> double |> double'); // 20
```

This is purely syntactic sugar: `value |> fn` is rewritten internally as `fn(value)`, so any function - built-in, user-defined, or lambda - can appear on the right-hand side.

## Spread Operator

The spread operator `...` expands the elements of an array into individual arguments when calling a function. This is convenient when your data is already stored in an array but the target function expects separate arguments (or a variable number of them).

```js
// Equivalent to max(1, 5, 3)
expr.evaluate('max(...[1, 5, 3])');  // 5

// Equivalent to sum(1, 2, 3)
expr.evaluate('sum(...[1, 2, 3])');  // 6

// Combine spread with variables holding arrays
expr.evaluate('nums = [4, 9, 2, 7]');
expr.evaluate('max(...nums)');       // 9

// Spread can be combined with additional fixed arguments
expr.evaluate('max(0, ...[1, 5, 3], 10)'); // 10
```

## Compound Assignment

Compound assignment operators let you update a numeric variable based on its current value in a single, concise step, rather than writing out the full `x = x + 5` form.

```js
expr.evaluate('x = 10');
expr.evaluate('x += 5');  // 15  (x = x + 5)
expr.evaluate('x -= 3');  // 12  (x = x - 3)
expr.evaluate('x *= 2');  // 24  (x = x * 2)
expr.evaluate('x /= 4');  // 6   (x = x / 4)
```

Supported operators are `+=`, `-=`, `*=`, and `/=`. They apply only to variables holding numeric values, and the variable must already exist in scope (typically via a prior assignment) before a compound assignment can be applied to it.