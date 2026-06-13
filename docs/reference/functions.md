# Functions Reference

For the complete catalog of all ~130 built-in functions organized by category, see:

## Basic Math

| Function | Description | Example |
|---|---|---|
| `abs(x)` | Absolute value | `abs(-5)` → `5` |
| `round(x)` | Round to nearest integer | `round(3.7)` → `4` |
| `floor(x)` | Round down | `floor(3.7)` → `3` |
| `ceil(x)` | Round up | `ceil(3.2)` → `4` |
| `trunc(x)` | Truncate fractional part | `trunc(3.7)` → `3` |
| `sign(x)` | Sign of number (-1, 0, 1) | `sign(-5)` → `-1` |
| `frac(x)` | Fractional part | `frac(3.7)` → `0.7` |
| `sqrt(x)` | Square root | `sqrt(16)` → `4` |
| `cbrt(x)` | Cube root | `cbrt(27)` → `3` |
| `pow(a, b)` | Power (a^b) | `pow(2, 3)` → `8` |
| `hypot(a, b, ...)` | Hypotenuse (sqrt of sum of squares) | `hypot(3, 4)` → `5` |
| `clamp(x, min, max)` | Clamp value between min and max | `clamp(10, 0, 5)` → `5` |

## Trigonometry (radians)

| Function | Description | Example |
|---|---|---|
| `sin(x)` | Sine | `sin(0)` → `0` |
| `cos(x)` | Cosine | `cos(0)` → `1` |
| `tan(x)` | Tangent | `tan(0)` → `0` |
| `asin(x)` | Arcsine | `asin(0)` → `0` |
| `acos(x)` | Arccosine | `acos(1)` → `0` |
| `atan(x)` | Arctangent | `atan(0)` → `0` |
| `sec(x)` | Secant | `sec(0)` → `1` |
| `csc(x)` | Cosecant | `csc(pi/2)` → `1` |
| `cot(x)` | Cotangent | `cot(pi/4)` → `1` |

## Trigonometry (degrees)

| Function | Description | Example |
|---|---|---|
| `sind(x)` | Sine (degrees) | `sind(90)` → `1` |
| `cosd(x)` | Cosine (degrees) | `cosd(0)` → `1` |
| `tand(x)` | Tangent (degrees) | `tand(45)` → `1` |
| `asind(x)` | Arcsine (degrees) | `asind(1)` → `90` |
| `acosd(x)` | Arccosine (degrees) | `acosd(0)` → `90` |
| `atand(x)` | Arctangent (degrees) | `atand(1)` → `45` |
| `atand2(y, x)` | Arctangent of y/x (degrees) | `atand2(1, 0)` → `90` |

## Hyperbolic

| Function | Description | Example |
|---|---|---|
| `sinh(x)` | Hyperbolic sine | `sinh(0)` → `0` |
| `cosh(x)` | Hyperbolic cosine | `cosh(0)` → `1` |
| `tanh(x)` | Hyperbolic tangent | `tanh(0)` → `0` |
| `asinh(x)` | Hyperbolic arcsine | `asinh(0)` → `0` |
| `acosh(x)` | Hyperbolic arccosine | `acosh(1)` → `0` |
| `atanh(x)` | Hyperbolic arctangent | `atanh(0)` → `0` |

## Reciprocal Trig

| Function | Description | Example |
|---|---|---|
| `acot(x)` | Arccotangent | `acot(1)` → `~0.7854` |
| `asec(x)` | Arcsecant | `asec(2)` → `~1.0472` |
| `acsc(x)` | Arccosecant | `acsc(2)` → `~0.5236` |
| `acoth(x)` | Hyperbolic arccotangent | `acoth(2)` → `~0.5493` |
| `asech(x)` | Hyperbolic arcsecant | `asech(0.5)` → `~1.317` |
| `acsch(x)` | Hyperbolic arccosecant | `acsch(1)` → `~0.8814` |

## Logarithms & Exponentials

| Function | Description | Example |
|---|---|---|
| `log(x)` | Natural logarithm | `log(e)` → `1` |
| `log10(x)` | Base-10 logarithm | `log10(100)` → `2` |
| `log2(x)` | Base-2 logarithm | `log2(8)` → `3` |
| `log1p(x)` | Natural log of (1 + x) | `log1p(1)` → `~0.6931` |
| `exp(x)` | Exponential (e^x) | `exp(1)` → `~2.7183` |
| `expm1(x)` | e^x - 1 | `expm1(0)` → `0` |

## Number Theory

| Function | Description | Example |
|---|---|---|
| `gcd(a, b)` | Greatest common divisor | `gcd(12, 8)` → `4` |
| `lcm(a, b)` | Least common multiple | `lcm(4, 6)` → `12` |
| `factorial(n)` | Factorial (n!) | `factorial(5)` → `120` |
| `isPrime(n)` | Check if prime | `isPrime(7)` → `true` |
| `primeFactors(n)` | Prime factors | `primeFactors(12)` → `[2, 2, 3]` |
| `fibonacci(n)` | nth Fibonacci number | `fibonacci(10)` → `55` |
| `nCr(n, r)` | Combinations | `nCr(5, 2)` → `10` |
| `nPr(n, r)` | Permutations | `nPr(5, 2)` → `20` |

## Statistics

| Function | Description | Example |
|---|---|---|
| `sum(...args)` | Sum of values | `sum(1, 2, 3, 4, 5)` → `15` |
| `prod(...args)` | Product of values | `prod(1, 2, 3, 4, 5)` → `120` |
| `mean(...args)` | Arithmetic mean | `mean(1, 2, 3, 4, 5)` → `3` |
| `median(...args)` | Median | `median(1, 3, 5, 7)` → `4` |
| `mode(...args)` | Mode (most frequent) | `mode(1, 2, 2, 3)` → `2` |
| `std(...args)` | Sample standard deviation | `std(1, 2, 3, 4, 5)` → `~1.5811` |
| `variance(...args)` | Sample variance | `variance(1, 2, 3, 4, 5)` → `2.5` |
| `range(...args)` | Max - Min | `range(3, 7, 1, 9)` → `8` |
| `quantile(arr, p)` | Quantile (p in [0, 1]) | `quantile([1, 2, 3, 4], 0.5)` → `2.5` |
| `percentile(arr, p)` | Percentile (p in [0, 100]) | `percentile([1, 2, 3, 4], 50)` → `2.5` |
| `covariance(x, y)` | Sample covariance | `covariance([1, 2, 3], [2, 4, 6])` → `2` |
| `corr(x, y)` | Pearson correlation | `corr([1, 2, 3], [2, 4, 6])` → `1` |

## Special Functions

| Function | Description | Example |
|---|---|---|
| `gamma(n)` | Gamma function | `gamma(5)` → `24` |
| `lgamma(x)` | Log-gamma function | `lgamma(1)` → `0` |
| `beta(a, b)` | Beta function | `beta(1, 1)` → `1` |
| `erf(x)` | Error function | `erf(0)` → `0` |

## Random Numbers

| Function | Description | Example |
|---|---|---|
| `random()` | Random number in [0, 1) | `random()` → `0.3745...` |
| `randomInt(min, max)` | Random integer in [min, max] | `randomInt(1, 6)` → `4` |
| `randomNormal(mean, std)` | Normally distributed random number | `randomNormal(0, 1)` → `-0.125...` |

## Fractions

| Function | Description | Example |
|---|---|---|
| `fraction(n, d)` | Create a fraction | `fraction(1, 3)` → `"1/3"` |
| `numer(f)` | Numerator of fraction | `numer(fraction(3, 4))` → `3` |
| `denom(f)` | Denominator of fraction | `denom(fraction(3, 4))` → `4` |
| `isFraction(v)` | Check if value is a fraction | `isFraction(fraction(1, 2))` → `true` |

## BigNumber (Arbitrary Precision)

| Function | Description | Example |
|---|---|---|
| `bignumber(x)` | Create arbitrary-precision decimal | `bignumber("0.1") + bignumber("0.2")` → `"0.3"` |
| `isBigNumber(v)` | Check if value is a BigNumber | `isBigNumber(bignumber(1))` → `true` |

## Boolean & Comparison

| Function | Description | Example |
|---|---|---|
| `and(a, b)` | Logical AND | `and(true, false)` → `false` |
| `or(a, b)` | Logical OR | `or(true, false)` → `true` |
| `not(a)` | Logical NOT | `not(true)` → `false` |
| `eq(a, b)` | Equal (===) | `eq(5, 5)` → `true` |
| `neq(a, b)` / `notEqual(a, b)` | Not equal | `neq(5, 3)` → `true` |
| `gt(a, b)` / `greaterThan(a, b)` | Greater than | `gt(5, 3)` → `true` |
| `lt(a, b)` / `lessThan(a, b)` | Less than | `lt(3, 5)` → `true` |
| `gte(a, b)` / `greaterThanOrEqual(a, b)` | Greater than or equal | `gte(5, 5)` → `true` |
| `lte(a, b)` / `lessThanOrEqual(a, b)` | Less than or equal | `lte(3, 5)` → `true` |
| `if(cond, a, b)` | Ternary conditional | `if(5 > 3, "yes", "no")` → `"yes"` |

## Type Checking

| Function | Description | Example |
|---|---|---|
| `typeof(v)` | Type of value (string) | `typeof(42)` → `"number"` |
| `isFraction(v)` | Check if fraction | `isFraction(fraction(1,2))` → `true` |
| `isBigNumber(v)` | Check if BigNumber | `isBigNumber(bignumber(1))` → `true` |
| `isPrime(n)` | Check if prime | `isPrime(7)` → `true` |

## Bitwise Operations

| Function | Description | Example |
|---|---|---|
| `bitAnd(a, b)` | Bitwise AND | `bitAnd(5, 3)` → `1` |
| `bitOr(a, b)` | Bitwise OR | `bitOr(5, 3)` → `7` |
| `bitXor(a, b)` | Bitwise XOR | `bitXor(5, 3)` → `6` |
| `bitNot(a)` | Bitwise NOT | `bitNot(5)` → `-6` |

## String Utilities

| Function | Description | Example |
|---|---|---|
| `split(str, sep)` | Split string by separator | `split("a,b,c", ",")` → `["a","b","c"]` |
| `join(arr, sep)` | Join array with separator | `join(["a","b","c"], ",")` → `"a,b,c"` |
| `upper(str)` | Uppercase | `upper("hello")` → `"HELLO"` |
| `lower(str)` | Lowercase | `lower("HELLO")` → `"hello"` |
| `trim(str)` | Trim whitespace | `trim(" hello ")` → `"hello"` |
| `replace(str, pattern, replacement)` | Replace pattern in string | `replace("hello world", "world", "there")` → `"hello there"` |
| `substring(str, start, end)` | Substring | `substring("hello", 1, 4)` → `"ell"` |
| `length(x)` | Length of string or array | `length("hello")` → `5` |

## Matrix & Linear Algebra

| Function | Description | Example |
|---|---|---|
| `det(matrix)` | Determinant | `det([1, 2; 3, 4])` → `-2` |
| `inverse(matrix)` | Matrix inverse | `inverse([1, 2; 3, 4])` |
| `transpose(matrix)` | Matrix transpose | `transpose([1, 2; 3, 4])` |
| `trace(matrix)` | Trace (sum of diagonal) | `trace([1, 2; 3, 4])` → `5` |
| `rank(matrix)` | Matrix rank | `rank([1, 2; 3, 4])` → `2` |
| `rref(matrix)` | Reduced row echelon form | `rref([1, 2; 3, 4])` |
| `minor(matrix, i, j)` | Minor (determinant of submatrix) | `minor([1, 2, 3; 4, 5, 6; 7, 8, 9], 0, 0)` → `-12` |
| `cofactor(matrix, i, j)` | Cofactor | `cofactor([1, 2; 3, 4], 0, 0)` → `4` |
| `lup(matrix)` | LU decomposition with partial pivoting | `lup([1, 2; 3, 4])` |
| `qr(matrix)` | QR decomposition (Gram-Schmidt) | `qr([1, 2; 3, 4])` |
| `cholesky(matrix)` | Cholesky decomposition | `cholesky([4, 2; 2, 3])` |
| `eig(matrix)` | Eigenvalues/vectors (2x2 only) | `eig([1, 2; 2, 1])` |
| `svd(matrix)` | Singular value decomposition (2x2 only) | `svd([1, 2; 3, 4])` |
| `lsolve(A, B)` | Solve linear system Ax = B | `lsolve([3, 2; 1, 2], [7; 5])` |
| `lyap(A, Q)` | Solve Lyapunov equation AX + XA^T + Q = 0 | `lyap([-1, 0; 0, -2], [1, 0; 0, 1])` |
| `polynomialRoot(...coeffs)` | Polynomial roots (degree up to 3) | `polynomialRoot(2, -3, 1)` → `[1, 2]` |
| `identity(n)` / `eye(n)` | Identity matrix | `identity(3)` |
| `zeros(n, m)` | Zero matrix | `zeros(2, 3)` |
| `ones(n, m)` | Ones matrix | `ones(2, 2)` |
| `diag(arr)` | Diagonal matrix from array | `diag([1, 2, 3])` |
| `matrix(x)` | Wrap array as DenseMatrix | — |
| `sparse(x)` | Alias for matrix (currently dense) | — |

## Vector Operations

| Function | Description | Example |
|---|---|---|
| `cross(a, b)` | 3D cross product | `cross([1, 0, 0], [0, 1, 0])` → `[0, 0, 1]` |
| `normalize(v)` | Normalize vector to unit length | `normalize([3, 4])` → `[0.6, 0.8]` |
| `angle(a, b)` | Angle between vectors (radians) | `angle([1, 0], [0, 1])` → `1.5708` |
| `projection(a, b)` | Scalar projection of a onto b | `projection([1, 2], [3, 4])` → `2.2` |

## Symbolic Algebra

| Function | Description | Example |
|---|---|---|
| `simplify(expr)` | Combine like terms | `simplify("x^2 + 2x + x")` → `"x^2 + 3x"` |
| `expand(expr)` | Expand polynomial | `expand("(x+1)^2")` → `"x^2 + 2x + 1"` |
| `factor(poly)` | Factor polynomial (degree 1-3) | `factor("x^2 - 5x + 6")` → `"(x-2)(x-3)"` |
| `solve(eqn)` | Solve equation | `solve("x^2 - 4 = 0")` → `[-2, 2]` |
| `derivative(expr, var)` | Symbolic derivative | `derivative("x^3", "x")` → `"3x^2"` |
| `rationalize(expr)` | Rationalize expression | `rationalize("1/x + 1/(x+1)")` |

## Calculus

| Function | Description | Example |
|---|---|---|
| `integral(expr, a, b)` | Numeric integration (Simpson's rule) | `integral("x^2", 0, 1)` → `~0.3333` |
| `sigma(var, start, end, expr)` | Summation | `sigma("n", 1, 10, "n")` → `55` |
| `pi(var, start, end, expr)` | Product | `pi("n", 1, 5, "n")` → `120` |
| `substitute(expr, var, value)` | Substitute value into expression | `substitute("x+1", "x", 5)` → `6` |
| `limit(expr, var, approach)` | Numeric limit | `limit("1/x", "x", 1000000)` → `0` |

## Array Utilities

| Function | Description | Example |
|---|---|---|
| `map(arr, fn)` | Map function over array | `map([1, 2, 3], "x -> x^2")` |
| `filter(arr, fn)` | Filter array with predicate | `filter([1, 2, 3, 4], "x -> x > 2")` |

## Expression Utilities

| Function | Description | Example |
|---|---|---|
| `parse(expr)` | Parse expression returning token/AST JSON | `parse("x+1")` |
| `leafCount(expr)` | Count leaf nodes in AST | `leafCount("x + 1")` → `3` |
| `compile(expr)` | Compile expression to reusable function | — |

## Operators (built-in syntax)

In addition to function calls, Exprify supports these operators directly in expressions:

| Operator | Description | Example |
|---|---|---|
| `+ - * / % ^` | Standard arithmetic | `2 + 3 * 4` |
| Implicit multiplication | `2x` = `2*x`, `)(` = `)*(` | `2pi` |
| `>` `<` `>=` `<=` `==` | Comparison | `5 > 3` |
| `&&` `||` `!` | Logical | `true && false` |
| `??` | Nullish coalescing | `a ?? b` |
| `=` `+=` `-=` `*=` `/=` | Assignment & compound | `x = 5` |
| `? :` | Ternary conditional | `x > 0 ? "pos" : "neg"` |
| `1:5` | Range | `1:5` → `[1, 2, 3, 4, 5]` |
| `x -> expr` / `(x, y) -> expr` | Lambda / arrow function | `x -> x^2` |
| `value \|> fn` | Pipeline | `5 \|> sqrt` |
| `...arr` | Spread in function calls | `max(...[1,5,3])` |
| `.` `?.` | Member access / optional chaining | `obj.prop` |
| `to` / `in` | Unit conversion | `2 inch to cm` |
