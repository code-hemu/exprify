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
| Range | `1:5` → `[1,2,3,4,5]` |

## Operators (precedence, low to high)

| Precedence | Operators | Associativity |
|---|---|---|
| Assignment | `=` `+=` `-=` `*=` `/=` | Right |
| Lambda | `->` | Right |
| Pipeline | `\|>` | Left |
| Ternary | `? :` | Right |
| Nullish | `??` | Left |
| Logical | `&&` `\|\|` | Left |
| Comparison | `>` `<` `>=` `<=` `==` | Left |
| Unit | `to` `in` | Left |
| Addition | `+` `-` | Left |
| Multiplication | `*` `/` `%` | Left |
| Power | `^` | Right |
| Unary | `-` `!` | Right |
| Call/Member | `()` `[]` `.` `?.` | Left |

## Implicit Multiplication

`2x` is interpreted as `2 * x`. Adjacent parentheses also imply multiplication: `(2)(3)` → `6`.

## Comments

```
// single-line comment
/* multi-line
   comment */
```

## Member Access

```
obj.prop      // property access
obj?.prop     // optional chaining
obj[key]      // index access
obj[i, j]     // matrix element (1-based)
```

## Lambda / Arrow Functions

```
x -> x^2           // single parameter
(x, y) -> x + y    // multiple parameters
```

## Pipeline

```
value |> fn        // passes value as first argument to fn
```

## Spread

```
max(...[1, 5, 3])  // spreads array elements
```
