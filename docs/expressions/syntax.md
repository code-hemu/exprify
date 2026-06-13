# Syntax

## Literals

| Type | Examples |
|---|---|
| Decimal | `42`, `3.14` |
| Hex | `0xFF`, `0x1A` |
| Binary | `0b1010`, `0b1111` |
| Scientific | `1.5e10`, `3e-5` |
| BigInt | `42n`, `100n` |
| String | `"hello"`, `'world'` |
| Boolean | `true`, `false` |
| Imaginary | `2i`, `-i`, `3 + 2i` |
| Range | `1:5` expands to `[1,2,3,4,5]` |

## Operators (Precedence, Low to High)

Operators are listed from lowest to highest precedence. When two operators share the same precedence level, associativity determines the grouping direction.

| Precedence | Operators | Associativity | Description |
|---|---|---|---|
| Assignment | `=` `+=` `-=` `*=` `/=` | Right | Assigns or updates a variable. Right-associative means `a = b = 1` sets both. |
| Lambda | `->` | Right | Defines an anonymous function. The body is on the right side. |
| Pipeline | `\|>` | Left | Passes the left-hand value as the first argument to the right-hand function. |
| Ternary | `? :` | Right | Inline conditional: `condition ? valueIfTrue : valueIfFalse`. |
| Nullish | `??` | Left | Returns the left operand unless it is `null` or `undefined`, then returns the right. |
| Logical | `&&` `\|\|` | Left | Boolean AND / OR. Short-circuits on the first decisive operand. |
| Comparison | `>` `<` `>=` `<=` `==` | Left | Compares two values and produces a boolean result. |
| Unit | `to` `in` | Left | Converts a value between measurement units, e.g. `5km to miles`. |
| Addition | `+` `-` | Left | Adds or subtracts numbers; `+` also concatenates strings. |
| Multiplication | `*` `/` `%` | Left | Multiplies, divides, or computes the remainder (modulo). |
| Power | `^` | Right | Raises a value to an exponent. Right-associative means `2^3^2` is `2^(3^2)`. |
| Unary | `-` `!` | Right | Negates a number (`-x`) or logically inverts a boolean (`!x`). |
| Call / Member | `()` `[]` `.` `?.` | Left | Highest priority. Handles function calls, indexing, and property access. |

## Implicit Multiplication

Writing a number directly before a variable or parenthesised expression is treated as multiplication. No explicit `*` is needed.

```
2x        // same as 2 * x
(2)(3)    // same as 2 * 3, evaluates to 6
3(x + 1)  // same as 3 * (x + 1)
```

## Comments

Comments are ignored by the evaluator and exist purely for human readers.

```
// This is a single-line comment

/* This is a
   multi-line comment */
```

## Member Access

Several syntaxes are available for reading properties or elements from objects and matrices.

```
obj.prop      // standard property access
obj?.prop     // optional chaining - returns undefined instead of throwing if obj is null
obj[key]      // bracket notation, useful when the key is dynamic or a string
obj[i, j]     // matrix element access using 1-based row and column indices
```

## Lambda / Arrow Functions

Arrow functions define reusable anonymous functions. The left side declares parameters and the right side defines the return expression.

```
x -> x^2              // single parameter, returns x squared
(x, y) -> x + y       // multiple parameters, returns their sum
(a, b) -> a^2 + b^2   // more complex expression
```

Lambdas can be assigned to variables and called like regular functions:

```
square = x -> x^2
square(5)   // evaluates to 25
```

## Pipeline Operator

The pipeline operator `|>` passes the result of the left-hand expression as the first argument to the right-hand function. It makes chains of transformations easier to read by avoiding deeply nested calls.

```
value |> fn          // equivalent to fn(value)
9 |> sqrt            // equivalent to sqrt(9), evaluates to 3
[3,1,2] |> sort      // equivalent to sort([3,1,2])
```

Pipelines can be chained left to right, where each step receives the output of the previous one:

```
data |> filter |> sort |> display
```

## Spread Operator

The spread operator `...` expands an array into individual arguments at a function call site. This is useful when values are stored in an array but a function expects separate arguments.

```
max(...[1, 5, 3])    // same as max(1, 5, 3), evaluates to 5
sum(...values)       // spreads the contents of the values array
```