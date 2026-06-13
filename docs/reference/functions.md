# Exprify Functions Reference

A complete catalog of the ~130 built-in functions available in Exprify, an expression evaluation engine that supports arithmetic, algebra, trigonometry, calculus, linear algebra, statistics, symbolic math, and more. Functions are grouped by category below, with a description of what each one does and a worked example showing the expected result.

---

## Basic Math

Fundamental arithmetic, rounding, and root operations used in nearly every calculation.

| Function | Description | Example |
|---|---|---|
| `abs(x)` | Returns the absolute value of `x`, stripping any negative sign so the result is always zero or positive. | `abs(-5)` gives `5` |
| `round(x)` | Rounds `x` to the nearest whole number, rounding halves away from zero. | `round(3.7)` gives `4` |
| `floor(x)` | Rounds `x` down to the nearest whole number, toward negative infinity. | `floor(3.7)` gives `3` |
| `ceil(x)` | Rounds `x` up to the nearest whole number, toward positive infinity. | `ceil(3.2)` gives `4` |
| `trunc(x)` | Removes the decimal portion of `x`, cutting toward zero regardless of sign. | `trunc(3.7)` gives `3` |
| `sign(x)` | Reports the sign of `x` as `-1` for negative, `0` for zero, or `1` for positive. | `sign(-5)` gives `-1` |
| `frac(x)` | Returns only the part of `x` after the decimal point, discarding the integer portion. | `frac(3.7)` gives `0.7` |
| `sqrt(x)` | Calculates the square root of `x` (the value which, multiplied by itself, equals `x`). | `sqrt(16)` gives `4` |
| `cbrt(x)` | Calculates the cube root of `x` (the value which, cubed, equals `x`). | `cbrt(27)` gives `3` |
| `pow(a, b)` | Raises `a` to the power of `b`, i.e. multiplies `a` by itself `b` times. | `pow(2, 3)` gives `8` |
| `hypot(a, b, ...)` | Computes the length of the hypotenuse / Euclidean norm: the square root of the sum of the squares of all arguments. | `hypot(3, 4)` gives `5` |
| `clamp(x, min, max)` | Forces `x` to stay within the range `[min, max]`, returning `min` if `x` is too low or `max` if `x` is too high. | `clamp(10, 0, 5)` gives `5` |

---

## Trigonometry (Radians)

Standard trigonometric functions and their inverses, working in radians (the default angular unit for most math).

| Function | Description | Example |
|---|---|---|
| `sin(x)` | Sine of angle `x`, given in radians. | `sin(0)` gives `0` |
| `cos(x)` | Cosine of angle `x`, given in radians. | `cos(0)` gives `1` |
| `tan(x)` | Tangent of angle `x`, given in radians (sine divided by cosine). | `tan(0)` gives `0` |
| `asin(x)` | Arcsine: the angle (in radians) whose sine is `x`. | `asin(0)` gives `0` |
| `acos(x)` | Arccosine: the angle (in radians) whose cosine is `x`. | `acos(1)` gives `0` |
| `atan(x)` | Arctangent: the angle (in radians) whose tangent is `x`. | `atan(0)` gives `0` |
| `sec(x)` | Secant of `x`, the reciprocal of cosine (`1 / cos(x)`). | `sec(0)` gives `1` |
| `csc(x)` | Cosecant of `x`, the reciprocal of sine (`1 / sin(x)`). | `csc(pi/2)` gives `1` |
| `cot(x)` | Cotangent of `x`, the reciprocal of tangent (`1 / tan(x)`). | `cot(pi/4)` gives `1` |

---

## Trigonometry (Degrees)

The same trigonometric operations as above, but operating directly on degree values, so no conversion to radians is needed.

| Function | Description | Example |
|---|---|---|
| `sind(x)` | Sine of angle `x`, given in degrees. | `sind(90)` gives `1` |
| `cosd(x)` | Cosine of angle `x`, given in degrees. | `cosd(0)` gives `1` |
| `tand(x)` | Tangent of angle `x`, given in degrees. | `tand(45)` gives `1` |
| `asind(x)` | Arcsine of `x`, with the result returned in degrees. | `asind(1)` gives `90` |
| `acosd(x)` | Arccosine of `x`, with the result returned in degrees. | `acosd(0)` gives `90` |
| `atand(x)` | Arctangent of `x`, with the result returned in degrees. | `atand(1)` gives `45` |
| `atand2(y, x)` | Two-argument arctangent of `y / x`, returned in degrees, correctly handling all four quadrants. | `atand2(1, 0)` gives `90` |

---

## Hyperbolic Functions

Hyperbolic analogs of the standard trigonometric functions, used in areas such as relativity, electrical engineering, and certain integrals.

| Function | Description | Example |
|---|---|---|
| `sinh(x)` | Hyperbolic sine of `x`. | `sinh(0)` gives `0` |
| `cosh(x)` | Hyperbolic cosine of `x`. | `cosh(0)` gives `1` |
| `tanh(x)` | Hyperbolic tangent of `x`. | `tanh(0)` gives `0` |
| `asinh(x)` | Inverse hyperbolic sine of `x`. | `asinh(0)` gives `0` |
| `acosh(x)` | Inverse hyperbolic cosine of `x`. | `acosh(1)` gives `0` |
| `atanh(x)` | Inverse hyperbolic tangent of `x`. | `atanh(0)` gives `0` |

---

## Reciprocal & Reciprocal-Hyperbolic Trig

Inverse functions for the reciprocal trigonometric ratios (cotangent, secant, cosecant) and their hyperbolic counterparts.

| Function | Description | Example |
|---|---|---|
| `acot(x)` | Arccotangent: the angle (in radians) whose cotangent is `x`. | `acot(1)` gives approximately `0.7854` |
| `asec(x)` | Arcsecant: the angle (in radians) whose secant is `x`. | `asec(2)` gives approximately `1.0472` |
| `acsc(x)` | Arccosecant: the angle (in radians) whose cosecant is `x`. | `acsc(2)` gives approximately `0.5236` |
| `acoth(x)` | Inverse hyperbolic cotangent of `x`. | `acoth(2)` gives approximately `0.5493` |
| `asech(x)` | Inverse hyperbolic secant of `x`. | `asech(0.5)` gives approximately `1.317` |
| `acsch(x)` | Inverse hyperbolic cosecant of `x`. | `acsch(1)` gives approximately `0.8814` |

---

## Logarithms & Exponentials

Functions for converting between exponential and logarithmic forms, useful in growth/decay models, information theory, and more.

| Function | Description | Example |
|---|---|---|
| `log(x)` | Natural logarithm of `x` (base *e*) - the exponent to which *e* must be raised to produce `x`. | `log(e)` gives `1` |
| `log10(x)` | Base-10 logarithm of `x` - the exponent to which 10 must be raised to produce `x`. | `log10(100)` gives `2` |
| `log2(x)` | Base-2 logarithm of `x` - the exponent to which 2 must be raised to produce `x`. | `log2(8)` gives `3` |
| `log1p(x)` | Natural logarithm of `(1 + x)`, computed in a way that stays accurate for very small `x`. | `log1p(1)` gives approximately `0.6931` |
| `exp(x)` | The exponential function, *e* raised to the power `x`. | `exp(1)` gives approximately `2.7183` |
| `expm1(x)` | Computes `e^x - 1`, more accurately than subtracting `1` from `exp(x)` for small `x`. | `expm1(0)` gives `0` |

---

## Number Theory

Functions dealing with integers, divisibility, primality, factorization, and classic integer sequences.

| Function | Description | Example |
|---|---|---|
| `gcd(a, b)` | Returns the greatest common divisor - the largest integer that divides both `a` and `b` evenly. | `gcd(12, 8)` gives `4` |
| `lcm(a, b)` | Returns the least common multiple - the smallest positive integer divisible by both `a` and `b`. | `lcm(4, 6)` gives `12` |
| `factorial(n)` | Computes `n!`, the product of all positive integers up to `n`. | `factorial(5)` gives `120` |
| `isPrime(n)` | Tests whether `n` is a prime number, returning `true` or `false`. | `isPrime(7)` gives `true` |
| `primeFactors(n)` | Returns an array containing the prime factorization of `n`, with repeated factors listed multiple times. | `primeFactors(12)` gives `[2, 2, 3]` |
| `fibonacci(n)` | Returns the `n`th number in the Fibonacci sequence (starting from `0, 1, 1, 2, ...`). | `fibonacci(10)` gives `55` |
| `nCr(n, r)` | Number of combinations of `r` items chosen from `n`, where order does not matter. | `nCr(5, 2)` gives `10` |
| `nPr(n, r)` | Number of permutations of `r` items chosen from `n`, where order matters. | `nPr(5, 2)` gives `20` |

---

## Statistics

Functions for summarizing collections of numbers - central tendency, spread, relationships between data sets, and percentile-based measures.

| Function | Description | Example |
|---|---|---|
| `sum(...args)` | Adds together all the supplied values. | `sum(1, 2, 3, 4, 5)` gives `15` |
| `prod(...args)` | Multiplies all the supplied values together. | `prod(1, 2, 3, 4, 5)` gives `120` |
| `mean(...args)` | Computes the arithmetic average of the supplied values. | `mean(1, 2, 3, 4, 5)` gives `3` |
| `median(...args)` | Finds the middle value of the supplied values once sorted (or the average of the two middle values for an even count). | `median(1, 3, 5, 7)` gives `4` |
| `mode(...args)` | Returns the value that appears most frequently among the arguments. | `mode(1, 2, 2, 3)` gives `2` |
| `std(...args)` | Computes the sample standard deviation, a measure of how spread out the values are from their mean. | `std(1, 2, 3, 4, 5)` gives approximately `1.5811` |
| `variance(...args)` | Computes the sample variance - the average of the squared differences from the mean. | `variance(1, 2, 3, 4, 5)` gives `2.5` |
| `range(...args)` | Returns the difference between the maximum and minimum values supplied. | `range(3, 7, 1, 9)` gives `8` |
| `quantile(arr, p)` | Returns the value at proportion `p` (between `0` and `1`) through the sorted array. | `quantile([1, 2, 3, 4], 0.5)` gives `2.5` |
| `percentile(arr, p)` | Returns the value at the `p`th percentile (between `0` and `100`) of the sorted array. | `percentile([1, 2, 3, 4], 50)` gives `2.5` |
| `covariance(x, y)` | Measures how two data sets vary together - positive when they tend to increase together. | `covariance([1, 2, 3], [2, 4, 6])` gives `2` |
| `corr(x, y)` | Computes the Pearson correlation coefficient between two data sets, ranging from `-1` to `1`. | `corr([1, 2, 3], [2, 4, 6])` gives `1` |

---

## Special Functions

Advanced mathematical functions that frequently appear in probability, statistics, and analysis.

| Function | Description | Example |
|---|---|---|
| `gamma(n)` | The gamma function, a continuous extension of the factorial (`gamma(n) = (n-1)!` for positive integers). | `gamma(5)` gives `24` |
| `lgamma(x)` | The natural logarithm of the gamma function, useful for avoiding overflow with large inputs. | `lgamma(1)` gives `0` |
| `beta(a, b)` | The beta function, closely related to the gamma function and used in probability distributions. | `beta(1, 1)` gives `1` |
| `erf(x)` | The error function, related to the cumulative distribution of the normal distribution. | `erf(0)` gives `0` |

---

## Random Numbers

Functions for generating random values, useful for simulations, sampling, and games.

| Function | Description | Example |
|---|---|---|
| `random()` | Returns a random floating-point number greater than or equal to `0` and less than `1`. | `random()` might give `0.3745...` |
| `randomInt(min, max)` | Returns a random integer between `min` and `max`, inclusive of both endpoints. | `randomInt(1, 6)` might give `4` |
| `randomNormal(mean, std)` | Returns a random number drawn from a normal (Gaussian) distribution with the given mean and standard deviation. | `randomNormal(0, 1)` might give `-0.125...` |

---

## Fractions

Functions for working with exact rational numbers instead of floating-point approximations.

| Function | Description | Example |
|---|---|---|
| `fraction(n, d)` | Creates a fraction with numerator `n` and denominator `d`, kept in exact rational form. | `fraction(1, 3)` gives `"1/3"` |
| `numer(f)` | Extracts the numerator from a fraction. | `numer(fraction(3, 4))` gives `3` |
| `denom(f)` | Extracts the denominator from a fraction. | `denom(fraction(3, 4))` gives `4` |
| `isFraction(v)` | Checks whether a value is a fraction object, returning `true` or `false`. | `isFraction(fraction(1, 2))` gives `true` |

---

## BigNumber (Arbitrary Precision)

Functions for performing decimal arithmetic with precision beyond standard floating-point numbers, avoiding common rounding errors.

| Function | Description | Example |
|---|---|---|
| `bignumber(x)` | Converts `x` into an arbitrary-precision decimal number, enabling exact decimal arithmetic. | `bignumber("0.1") + bignumber("0.2")` gives `"0.3"` |
| `isBigNumber(v)` | Checks whether a value is a BigNumber, returning `true` or `false`. | `isBigNumber(bignumber(1))` gives `true` |

---

## Boolean & Comparison

Logical and comparison operations available as callable functions, useful inside expressions, lambdas, and conditionals.

| Function | Description | Example |
|---|---|---|
| `and(a, b)` | Logical AND - true only if both `a` and `b` are true. | `and(true, false)` gives `false` |
| `or(a, b)` | Logical OR - true if either `a` or `b` (or both) are true. | `or(true, false)` gives `true` |
| `not(a)` | Logical NOT - inverts a boolean value. | `not(true)` gives `false` |
| `eq(a, b)` | Strict equality check between `a` and `b`. | `eq(5, 5)` gives `true` |
| `neq(a, b)` / `notEqual(a, b)` | Checks that `a` and `b` are not equal. | `neq(5, 3)` gives `true` |
| `gt(a, b)` / `greaterThan(a, b)` | Checks whether `a` is strictly greater than `b`. | `gt(5, 3)` gives `true` |
| `lt(a, b)` / `lessThan(a, b)` | Checks whether `a` is strictly less than `b`. | `lt(3, 5)` gives `true` |
| `gte(a, b)` / `greaterThanOrEqual(a, b)` | Checks whether `a` is greater than or equal to `b`. | `gte(5, 5)` gives `true` |
| `lte(a, b)` / `lessThanOrEqual(a, b)` | Checks whether `a` is less than or equal to `b`. | `lte(3, 5)` gives `true` |
| `if(cond, a, b)` | Ternary conditional - returns `a` if `cond` is true, otherwise returns `b`. | `if(5 > 3, "yes", "no")` gives `"yes"` |

---

## Type Checking

Functions for inspecting the underlying type or category of a value at runtime.

| Function | Description | Example |
|---|---|---|
| `typeof(v)` | Returns a string naming the data type of `v` (e.g. `"number"`, `"string"`, `"boolean"`). | `typeof(42)` gives `"number"` |
| `isFraction(v)` | Checks whether `v` is a fraction object. | `isFraction(fraction(1,2))` gives `true` |
| `isBigNumber(v)` | Checks whether `v` is a BigNumber object. | `isBigNumber(bignumber(1))` gives `true` |
| `isPrime(n)` | Checks whether the integer `n` is prime. | `isPrime(7)` gives `true` |

---

## Bitwise Operations

Low-level operations that act on the binary representation of integers, bit by bit.

| Function | Description | Example |
|---|---|---|
| `bitAnd(a, b)` | Performs a bitwise AND between `a` and `b`, keeping only bits set in both numbers. | `bitAnd(5, 3)` gives `1` |
| `bitOr(a, b)` | Performs a bitwise OR between `a` and `b`, setting bits that appear in either number. | `bitOr(5, 3)` gives `7` |
| `bitXor(a, b)` | Performs a bitwise exclusive-OR, setting bits that differ between `a` and `b`. | `bitXor(5, 3)` gives `6` |
| `bitNot(a)` | Performs a bitwise NOT, flipping every bit of `a` (equivalent to `-(a + 1)`). | `bitNot(5)` gives `-6` |

---

## String Utilities

Functions for manipulating, inspecting, and transforming text values.

| Function | Description | Example |
|---|---|---|
| `split(str, sep)` | Splits `str` into an array of substrings wherever `sep` occurs. | `split("a,b,c", ",")` gives `["a","b","c"]` |
| `join(arr, sep)` | Joins the elements of `arr` into a single string, placing `sep` between each element. | `join(["a","b","c"], ",")` gives `"a,b,c"` |
| `upper(str)` | Converts every character in `str` to uppercase. | `upper("hello")` gives `"HELLO"` |
| `lower(str)` | Converts every character in `str` to lowercase. | `lower("HELLO")` gives `"hello"` |
| `trim(str)` | Removes leading and trailing whitespace from `str`. | `trim(" hello ")` gives `"hello"` |
| `replace(str, pattern, replacement)` | Replaces occurrences of `pattern` within `str` with `replacement`. | `replace("hello world", "world", "there")` gives `"hello there"` |
| `substring(str, start, end)` | Extracts the portion of `str` from index `start` up to (but not including) index `end`. | `substring("hello", 1, 4)` gives `"ell"` |
| `length(x)` | Returns the number of characters in a string, or the number of elements in an array. | `length("hello")` gives `5` |

---

## Matrix & Linear Algebra

A broad set of tools for matrix construction, decomposition, and solving systems of linear equations.

| Function | Description | Example |
|---|---|---|
| `det(matrix)` | Computes the determinant of a square matrix, a scalar value describing its scaling factor and invertibility. | `det([1, 2; 3, 4])` gives `-2` |
| `inverse(matrix)` | Computes the inverse of a square matrix, such that multiplying the matrix by its inverse gives the identity matrix. | `inverse([1, 2; 3, 4])` returns the inverse matrix |
| `transpose(matrix)` | Flips a matrix over its diagonal, swapping rows and columns. | `transpose([1, 2; 3, 4])` returns the transposed matrix |
| `trace(matrix)` | Sums the elements on the main diagonal of a square matrix. | `trace([1, 2; 3, 4])` gives `5` |
| `rank(matrix)` | Determines the rank of a matrix - the number of linearly independent rows or columns. | `rank([1, 2; 3, 4])` gives `2` |
| `rref(matrix)` | Converts a matrix to reduced row echelon form via Gaussian elimination. | `rref([1, 2; 3, 4])` returns the reduced matrix |
| `minor(matrix, i, j)` | Computes the minor of a matrix: the determinant of the submatrix formed by removing row `i` and column `j`. | `minor([1, 2, 3; 4, 5, 6; 7, 8, 9], 0, 0)` gives `-12` |
| `cofactor(matrix, i, j)` | Computes the cofactor at position `(i, j)` - the signed minor used in determinant and inverse calculations. | `cofactor([1, 2; 3, 4], 0, 0)` gives `4` |
| `lup(matrix)` | Performs LU decomposition with partial pivoting, factoring the matrix into lower- and upper-triangular components. | `lup([1, 2; 3, 4])` returns the L, U, and permutation matrices |
| `qr(matrix)` | Performs QR decomposition using the Gram-Schmidt process, splitting the matrix into an orthogonal matrix `Q` and an upper-triangular matrix `R`. | `qr([1, 2; 3, 4])` returns the Q and R matrices |
| `cholesky(matrix)` | Performs Cholesky decomposition on a symmetric positive-definite matrix, expressing it as the product of a lower-triangular matrix and its transpose. | `cholesky([4, 2; 2, 3])` returns the lower-triangular factor |
| `eig(matrix)` | Computes the eigenvalues and eigenvectors of a 2x2 matrix. | `eig([1, 2; 2, 1])` returns the eigenvalues and eigenvectors |
| `svd(matrix)` | Computes the singular value decomposition of a 2x2 matrix, factoring it into `U`, `S`, and `V` components. | `svd([1, 2; 3, 4])` returns the U, S, and V matrices |
| `lsolve(A, B)` | Solves the linear system `Ax = B` for the unknown vector `x`. | `lsolve([3, 2; 1, 2], [7; 5])` returns the solution vector |
| `lyap(A, Q)` | Solves the continuous-time Lyapunov equation `AX + XA^T + Q = 0` for `X`, used in control theory and stability analysis. | `lyap([-1, 0; 0, -2], [1, 0; 0, 1])` returns the solution matrix |
| `polynomialRoot(...coeffs)` | Finds the real roots of a polynomial (up to degree 3) given its coefficients in descending order. | `polynomialRoot(2, -3, 1)` gives `[1, 2]` |
| `identity(n)` / `eye(n)` | Creates an `n x n` identity matrix, with `1`s on the diagonal and `0`s elsewhere. | `identity(3)` returns a 3x3 identity matrix |
| `zeros(n, m)` | Creates an `n x m` matrix filled entirely with zeros. | `zeros(2, 3)` returns a 2x3 matrix of zeros |
| `ones(n, m)` | Creates an `n x m` matrix filled entirely with ones. | `ones(2, 2)` returns a 2x2 matrix of ones |
| `diag(arr)` | Creates a diagonal matrix using the elements of `arr` along the main diagonal, with zeros elsewhere. | `diag([1, 2, 3])` returns a 3x3 diagonal matrix |
| `matrix(x)` | Wraps a plain array or nested array as a dense matrix object for use in linear algebra functions. | `matrix([1, 2; 3, 4])` returns a matrix object |
| `sparse(x)` | An alias for `matrix(x)`; currently always returns a dense matrix representation. | `sparse([1, 2; 3, 4])` returns a matrix object |

---

## Vector Operations

Functions for working with vectors in two or three dimensions - direction, length, angles, and projections.

| Function | Description | Example |
|---|---|---|
| `cross(a, b)` | Computes the 3D cross product of vectors `a` and `b`, producing a vector perpendicular to both. | `cross([1, 0, 0], [0, 1, 0])` gives `[0, 0, 1]` |
| `normalize(v)` | Scales vector `v` so that its length becomes `1`, preserving its direction. | `normalize([3, 4])` gives `[0.6, 0.8]` |
| `angle(a, b)` | Computes the angle between vectors `a` and `b`, in radians. | `angle([1, 0], [0, 1])` gives `1.5708` |
| `projection(a, b)` | Computes the scalar projection of vector `a` onto vector `b` - how far `a` extends in the direction of `b`. | `projection([1, 2], [3, 4])` gives `2.2` |

---

## Symbolic Algebra

Tools for manipulating algebraic expressions symbolically, rather than evaluating them numerically.

| Function | Description | Example |
|---|---|---|
| `simplify(expr)` | Simplifies an expression by combining like terms and reducing it to a simpler equivalent form. | `simplify("x^2 + 2x + x")` gives `"x^2 + 3x"` |
| `expand(expr)` | Expands a polynomial expression by multiplying out parentheses and powers. | `expand("(x+1)^2")` gives `"x^2 + 2x + 1"` |
| `factor(poly)` | Factors a polynomial (degree 1 through 3) into a product of simpler expressions. | `factor("x^2 - 5x + 6")` gives `"(x-2)(x-3)"` |
| `solve(eqn)` | Solves an equation for its unknown variable(s), returning the resulting solution set. | `solve("x^2 - 4 = 0")` gives `[-2, 2]` |
| `derivative(expr, var)` | Computes the symbolic derivative of `expr` with respect to `var`. | `derivative("x^3", "x")` gives `"3x^2"` |
| `rationalize(expr)` | Rewrites an expression as a single rational expression (combined fraction). | `rationalize("1/x + 1/(x+1)")` returns the combined fraction |

---

## Calculus

Numeric and symbolic tools for integration, differentiation, summation, products, substitution, and limits.

| Function | Description | Example |
|---|---|---|
| `integral(expr, a, b)` | Numerically integrates `expr` from `a` to `b` using Simpson's rule, approximating the area under the curve. | `integral("x^2", 0, 1)` gives approximately `0.3333` |
| `sigma(var, start, end, expr)` | Computes a summation, evaluating `expr` for each value of `var` from `start` to `end` and adding the results together. | `sigma("n", 1, 10, "n")` gives `55` |
| `pi(var, start, end, expr)` | Computes a product, evaluating `expr` for each value of `var` from `start` to `end` and multiplying the results together. | `pi("n", 1, 5, "n")` gives `120` |
| `substitute(expr, var, value)` | Replaces every occurrence of `var` in `expr` with `value`, then simplifies. | `substitute("x+1", "x", 5)` gives `6` |
| `limit(expr, var, approach)` | Numerically estimates the limit of `expr` as `var` approaches a given value (or infinity). | `limit("1/x", "x", 1000000)` gives `0` |

---

## Array Utilities

Higher-order functions for transforming and filtering arrays using lambda expressions.

| Function | Description | Example |
|---|---|---|
| `map(arr, fn)` | Applies function `fn` to every element of `arr`, returning a new array of the results. | `map([1, 2, 3], "x -> x^2")` gives `[1, 4, 9]` |
| `filter(arr, fn)` | Returns a new array containing only the elements of `arr` for which `fn` evaluates to true. | `filter([1, 2, 3, 4], "x -> x > 2")` gives `[3, 4]` |

---

## Expression Utilities

Meta-level functions for inspecting, analyzing, and compiling expressions themselves rather than just evaluating them.

| Function | Description | Example |
|---|---|---|
| `parse(expr)` | Parses an expression string and returns its token stream or abstract syntax tree (AST) as JSON. | `parse("x+1")` returns the parsed AST |
| `leafCount(expr)` | Counts the number of leaf nodes (terminal values/variables) in the parsed expression's syntax tree. | `leafCount("x + 1")` gives `3` |
| `compile(expr)` | Compiles an expression into a reusable function for fast repeated evaluation. | `compile("x^2 + 1")` returns a callable function |

---

## Operators (Built-in Syntax)

Beyond function calls, Exprify recognizes the following operators directly within expressions, supporting arithmetic, logic, ranges, lambdas, pipelines, and unit conversions.

| Operator | Description | Example |
|---|---|---|
| `+ - * / % ^` | Standard arithmetic operators for addition, subtraction, multiplication, division, modulo, and exponentiation. | `2 + 3 * 4` |
| Implicit multiplication | Allows numbers and parentheses to be multiplied without an explicit `*`, e.g. `2x` is treated as `2*x`, and `)(` is treated as `)*(`. | `2pi` |
| `>` `<` `>=` `<=` `==` | Standard comparison operators for greater-than, less-than, greater-or-equal, less-or-equal, and equality. | `5 > 3` |
| `&&` or `!` | Logical AND, OR, and NOT operators for combining or negating boolean expressions. | `true && false` |
| `??` | Nullish coalescing - returns the left-hand value unless it is null/undefined, in which case it returns the right-hand value. | `a ?? b` |
| `=` `+=` `-=` `*=` `/=` | Assignment and compound assignment operators for setting and updating variable values. | `x = 5` |
| `? :` | Ternary conditional - evaluates one of two expressions depending on whether a condition is true or false. | `x > 0 ? "pos" : "neg"` |
| `1:5` | Range operator - generates an array of consecutive integers from the start value to the end value, inclusive. | `1:5` gives `[1, 2, 3, 4, 5]` |
| `x -> expr` / `(x, y) -> expr` | Lambda (arrow function) syntax for defining inline, reusable functions with one or more parameters. | `x -> x^2` |
| `value \|> fn` | Pipeline operator - passes the value on the left as the input to the function on the right. | `5 \|> sqrt` |
| `...arr` | Spread operator - expands the elements of an array into individual arguments within a function call. | `max(...[1,5,3])` |
| `.` `?.` | Member access and optional chaining - accesses a property of an object, with `?.` safely returning undefined if the object is null/undefined. | `obj.prop` |
| `to` / `in` | Unit conversion operators - convert a value from one unit to another. | `2 inch to cm` |
