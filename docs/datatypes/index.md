# Data Types

Exprify supports a variety of numeric and structural data types within expressions.

| Type | Example | Description |
|---|---|---|
| Number | `42`, `3.14` | Standard IEEE-754 double precision |
| BigInt | `42n` | Arbitrary-size integers (native) |
| BigNumber | `bignumber("0.1")` | Arbitrary-precision decimal (up to 100 places) |
| Fraction | `fraction(1, 3)` | Exact rational arithmetic |
| Complex | `3 + 2i` | Complex numbers with real and imaginary parts |
| Matrix | `[1, 2; 3, 4]` | Dense matrix (1-based indexing) |
| Unit | `5 cm` | Physical quantity with unit |
| String | `"hello"` | Text value |
| Boolean | `true`, `false` | Logical values |

## Topics

- **[Numbers](numbers.md)** - Number formats and behavior
- **[BigNumbers](bignumbers.md)** - Arbitrary-precision decimals
- **[BigInts](bigints.md)** - Native BigInt support
- **[Fractions](fractions.md)** - Exact rational arithmetic
- **[Complex Numbers](complex_numbers.md)** - Imaginary and complex values
- **[Matrices](matrices.md)** - Matrix construction, indexing, and arithmetic
- **[Units](units.md)** - Physical unit conversion and arithmetic
