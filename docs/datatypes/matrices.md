# Matrices

Matrices are one of the core data types in the expression engine. Internally, they are represented as **dense arrays** with explicit row and column dimensions, allowing standard linear algebra operations such as multiplication, inversion, and decomposition to be performed directly within expressions.

A matrix can be created, indexed, sliced, and modified using a syntax that closely mirrors common mathematical notation (similar to MATLAB or Octave), making it intuitive for users familiar with numerical computing.

## Construction

Matrices are constructed using square brackets `[ ]`. Within the brackets, **commas** separate elements within a row, and **semicolons** separate one row from the next. Every row must contain the same number of elements, otherwise the matrix is considered malformed and an error will be thrown.

```js
expr.evaluate('[1, 2; 3, 4]');
// DenseMatrix: [[1, 2], [3, 4]]
```

In this example, the expression produces a 2x2 matrix where the first row is `[1, 2]` and the second row is `[3, 4]`.

### Helper Functions

In addition to literal matrix syntax, several built-in helper functions can be used to quickly generate common matrix types without manually typing out every element. These are especially useful for initializing matrices of a given size before filling them in programmatically.

```js
expr.evaluate('identity(3)');     // 3x3 identity matrix
expr.evaluate('zeros(2, 3)');     // 2x3 zero matrix
expr.evaluate('ones(2, 2)');      // 2x2 ones matrix
expr.evaluate('diag([1, 2, 3])'); // diagonal matrix
expr.evaluate('matrix([1, 2; 3, 4])'); // wrap as DenseMatrix
```

- `identity(n)` returns an `n x n` identity matrix, with `1`s along the main diagonal and `0`s everywhere else.
- `zeros(rows, cols)` returns a matrix of the given dimensions filled entirely with `0`.
- `ones(rows, cols)` returns a matrix of the given dimensions filled entirely with `1`.
- `diag(vector)` returns a square matrix with the given vector placed along the main diagonal and zeros elsewhere.
- `matrix(...)` explicitly wraps a literal array or nested array as a `DenseMatrix` object, which can be useful when a function expects a matrix type rather than a plain array.

## Indexing (1-based)

Matrix elements are accessed using square-bracket index notation, in the form `m[row, column]`. Importantly, indexing is **1-based**, meaning the first row and first column are both referred to by the index `1`, not `0`. This differs from many programming languages but matches conventional mathematical notation.

```js
expr.evaluate('m = [1, 2, 3; 4, 5, 6]');
expr.evaluate('m[2, 1]');  // 4
expr.evaluate('m[1, 3]');  // 3
```

Here, `m[2, 1]` refers to the element in the second row, first column (`4`), and `m[1, 3]` refers to the element in the first row, third column (`3`).

## Slice Indexing

Ranges of rows or columns can be selected using **slice notation**, written as `start:end`. A slice returns a sub-matrix containing all elements within the specified inclusive range of indices.

```js
expr.evaluate('m[1:2, 2]'); // [[2], [5]]
```

In this example, `1:2` selects rows 1 through 2 (inclusive), and `2` selects column 2. The result is a column vector containing the second-column elements from both rows, returned as a nested array `[[2], [5]]`.

Slices can be combined in either dimension (rows, columns, or both) to extract arbitrary rectangular sub-blocks of a matrix.

## Assignment via Index

Individual elements of a matrix can be updated in place using the same indexing syntax on the left-hand side of an assignment. This modifies the matrix referenced by the variable directly.

```js
expr.evaluate('m = [1, 2, 3; 4, 5, 6]');
expr.evaluate('m[1, 2] = 99');
// [[1, 99, 3], [4, 5, 6]]
```

After this operation, the element at row 1, column 2 - originally `2` - is replaced with `99`, while all other elements remain unchanged.

## Arithmetic

Matrices support standard arithmetic operators, with behavior that depends on whether the operation involves another matrix or a scalar value.

```js
expr.evaluate('m + m');
expr.evaluate('m * m');
expr.evaluate('m * 2');  // scalar multiplication
expr.evaluate('m ^ 2');  // matrix power (integer)
```

- `m + m` performs **element-wise addition**, adding corresponding entries of two matrices with matching dimensions.
- `m * m` performs **matrix multiplication** (the dot product of rows and columns), following standard linear algebra rules. The number of columns in the first matrix must match the number of rows in the second.
- `m * 2` performs **scalar multiplication**, multiplying every element of the matrix by the scalar value.
- `m ^ 2` computes the **matrix power**, equivalent to repeated matrix multiplication (`m * m`) for integer exponents. The matrix must be square for this operation to be valid.

## See Also

For more advanced linear algebra operations beyond basic construction and arithmetic, the following functions are available:

- `det` - computes the determinant of a square matrix.
- `inverse` - computes the matrix inverse, if it exists.
- `transpose` - flips a matrix over its diagonal, swapping rows and columns.
- `trace` - computes the sum of the elements along the main diagonal.
- `rank` - computes the rank of a matrix.
- `rref` - computes the reduced row echelon form of a matrix.
- `lup` - performs LU decomposition with partial pivoting.
- `qr` - performs QR decomposition.
- `cholesky` - performs Cholesky decomposition for positive-definite matrices.
- `eig` - computes eigenvalues and eigenvectors.
- `svd` - performs singular value decomposition.
- `lsolve` - solves a system of linear equations.

See the [Functions Reference](../reference/functions.md) for full details on each of these functions, including parameter options and return types.