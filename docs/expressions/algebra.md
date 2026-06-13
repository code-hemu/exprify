# Algebra

Exprify provides a suite of symbolic algebra tools for working with single-variable polynomial expressions. Each operation accepts a string representation of an expression (and, where relevant, an equation) and returns either a simplified expression, a factored form, an array of roots, or a derivative - all as easy-to-read strings or arrays.

These tools are designed to mirror how you'd manually manipulate algebraic expressions: combining like terms, multiplying out binomials, finding roots, and taking derivatives - but automated and exact.

---

## simplify

Combines like terms in a polynomial expression, collapsing redundant terms and reducing constants into a single canonical form. Useful for cleaning up expressions before further processing (e.g., before calling `factor` or `solve`).

```js
expr.evaluate('simplify("x^2 + 2x + x")');        // "x^2 + 3x"
expr.evaluate('simplify("3x + 2x - 5")');          // "5x - 5"
```

**Behavior notes:**
- Terms with the same variable and exponent are merged by summing their coefficients.
- Constant terms are combined into a single value.
- Terms with a zero coefficient are dropped entirely.
- The output is ordered by descending exponent, matching standard polynomial notation.

---

## expand

Expands products of polynomial factors into a fully distributed sum-of-terms form. This is the inverse of `factor` - given `(x+1)^2`, it returns the multiplied-out result `x^2 + 2x + 1`.

```js
expr.evaluate('expand("(x+1)^2")');                // "x^2 + 2x + 1"
expr.evaluate('expand("(x+2)(x-3)")');             // "x^2 - x - 6"
```

**Implementation details:**
- Uses **forward-difference degree detection** to determine the resulting polynomial's degree before expansion, by sampling the expression at several input points and analyzing successive differences.
- Once the degree is known, a **Vandermonde system** is constructed and solved to recover the coefficients of each term, ensuring an exact symbolic expansion rather than a numeric approximation.
- Supports nested parentheses, repeated multiplication, and integer exponents on grouped terms (e.g., `(x+1)^2`, `(x-2)^3`).

---

## factor

Factors a polynomial into a product of linear (and where applicable, irreducible) factors, for polynomials up to **degree 3**.

```js
expr.evaluate('factor("x^2 - 5x + 6")');           // "(x-2)(x-3)"
expr.evaluate('factor("x^2 - 4")');                // "(x-2)(x+2)"
```

**Implementation details:**
- Applies the **rational root theorem** to generate candidate roots based on the ratio of the constant term's divisors to the leading coefficient's divisors.
- Tests each candidate using **synthetic division**; a candidate that divides evenly identifies a linear factor `(x - r)`.
- The polynomial is repeatedly reduced by each discovered factor until it is fully factored or no further rational roots exist.
- If a polynomial cannot be fully factored over the rationals (e.g., it has irrational or complex roots), the remaining irreducible factor is returned as-is.

---

## solve

Solves a polynomial equation by moving all terms to one side (rewriting the equation as `f(x) = 0`) and computing the roots of the resulting polynomial.

```js
expr.evaluate('solve("x^2 - 4 = 0")');             // [-2, 2]
expr.evaluate('solve("x^2 - 5x + 6 = 0")');       // [2, 3]
```

**Behavior notes:**
- The equation can have terms on both sides (e.g., `"x^2 + 3 = 2x + 7"`); Exprify normalizes it internally before solving.
- Returns an array of real roots in ascending order.
- Internally reuses the same root-finding logic as `factor` (rational root theorem + synthetic division) for low-degree polynomials.
- For polynomials with no rational roots, results may be empty or approximate depending on the polynomial's degree and structure.

---

## derivative

Computes the symbolic derivative of a polynomial expression with respect to a given variable, using the standard **power rule**.

```js
expr.evaluate('derivative("x^3", "x")');           // "3 * x^2"
expr.evaluate('derivative("2x^2 + 3x + 4", "x")'); // "4 * x + 3"
```

**Behavior notes:**
- Each term `a * x^n` becomes `(a * n) * x^(n-1)`.
- Constant terms differentiate to `0` and are removed from the output.
- Terms with exponent `1` simplify to a plain coefficient (no `x^0`).
- Only polynomial terms are supported - trigonometric, exponential, or rational terms are not differentiated.

---

## rationalize

Converts an expression containing fractions into a single combined rational expression (a single numerator over a single denominator), by finding a common denominator and combining terms.

```js
expr.evaluate('rationalize("1/x + 1/(x+1)")');
// Combines into a single fraction with denominator x(x+1)
```

**Behavior notes:**
- Useful for simplifying sums or differences of rational expressions before further algebraic manipulation.
- The resulting numerator and denominator are polynomials, but are not automatically factored or simplified further - chain with `simplify` or `factor` if needed.

---

## Limitations

- All operations work on **polynomial expressions with a single variable**. Multi-variable expressions (e.g., `x^2 + y^2`) are not supported.
- `factor()` supports polynomials up to **degree 3**. Higher-degree polynomials may return partially factored or unfactored results.
- `solve()` relies on rational root detection for exact results; equations with irrational or complex roots may return incomplete results.
- `derivative()` uses the **power rule only** - it does not support trigonometric, logarithmic, exponential, or other transcendental functions.
- Input expressions must use standard algebraic notation (`^` for exponents, implicit multiplication like `2x`, and standard parentheses grouping).