---
title: "Documentation"
---

**Exprify** (Math **Expr**ession + Simp**lify**) is a fast, lightweight JavaScript expression parser and evaluator. It is designed for math applications, scientific computing, data visualization tools, calculators, and other complex workflows that run in the browser and in Node.js.

At its core, Exprify lets you parse a string into an expression tree, evaluate it with a given set of variables, and chain or compose operations together. It supports basic arithmetic, variables, user-defined functions, and built-in operators for comparison, logic, and string manipulation.

Beyond the basics, Exprify also covers a number of advanced mathematical areas that are often missing from lightweight parsers, including:

- **Unit conversion** - work with physical quantities (length, mass, time, etc.) and convert between units safely.
- **Matrix operations** - create, multiply, transpose, and invert matrices directly within expressions.
- **Complex number arithmetic** - perform addition, multiplication, and other operations on complex numbers natively.
- **Symbolic manipulation** - simplify, expand, and rearrange algebraic expressions without numeric evaluation.

Exprify is modular, so you can include only the pieces you need, and extensible, so you can add your own functions, operators, and data types.

## Getting Started

New to Exprify? Start here to learn how to install the library, write your first expression, and evaluate it.

- [Getting Started](getting_started.md) - installation instructions, a quick first example, and an overview of common usage patterns.

## Documentation

### [Core](core/index.md)

The Core section covers the foundational concepts you'll use across every part of Exprify, including how to configure global behavior and how functions are chained together.

- [Configuration](core/configuration.md) - global settings such as number precision, the default data type for results, matrix storage format, and how to override these defaults.
- [Chaining](core/chaining.md) - how to perform a sequence of operations on a value using a fluent, chainable API.
- [Extension](core/extension.md) - how to add custom functions, operators, and transformations to extend Exprify's built-in capabilities.
- [Serialization](core/serialization.md) - how to convert expressions, results, and configurations to and from JSON or string form for storage and transport.

### [Expressions](expressions/index.md)

This section explains how Exprify parses, represents, and evaluates expressions, along with how to work safely and flexibly with expression trees.

- [Parsing and evaluation](expressions/parsing.md) - how to turn a string into an evaluatable expression, and how to compute its result with a given scope of variables.
- [Syntax](expressions/syntax.md) - the full grammar supported by Exprify, including operators, operator precedence, literals, and special syntax constructs.
- [Expression trees](expressions/expression_trees.md) - the internal tree representation of parsed expressions, and how to traverse, transform, or analyze them programmatically.
- [Algebra](expressions/algebra.md) - symbolic algebra features such as simplification, expansion, derivatives, and equation solving.
- [Customization](expressions/customization.md) - how to customize parsing behavior, register custom syntax, and override default operator implementations.
- [Security](expressions/security.md) - important considerations when evaluating untrusted expressions, including sandboxing and disabling potentially unsafe functions.

### [Data Types](datatypes/index.md)

Exprify supports a rich set of data types beyond plain JavaScript numbers, allowing for precise and domain-appropriate calculations.

- [Numbers](datatypes/numbers.md) - standard floating-point numbers, their behavior, and edge cases like precision and rounding.
- [BigNumbers](datatypes/bignumbers.md) - arbitrary-precision decimal numbers for calculations that require more accuracy than floating-point allows.
- [bigints](datatypes/bigints.md) - native JavaScript BigInt support for arbitrary-precision integer arithmetic.
- [Fractions](datatypes/fractions.md) - exact rational number representation to avoid floating-point rounding errors.
- [Complex Numbers](datatypes/complex_numbers.md) - representation and arithmetic for numbers with real and imaginary components.
- [Matrices](datatypes/matrices.md) - multi-dimensional arrays and matrices, including supported operations and storage formats (dense vs. sparse).
- [Units](datatypes/units.md) - physical units and quantities, unit conversion, and arithmetic involving units.

### [Reference](reference/index.md)

The Reference section is a comprehensive lookup for everything available in the library API.

- [Classes](reference/classes.md) - all classes exposed by Exprify, including constructors, properties, and methods.
- [Functions](reference/functions.md) - the complete list of built-in functions, organized by category, with signatures and examples.
- [Constants](reference/constants.md) - built-in mathematical and physical constants available for use in expressions.

### Other Topics

- [Custom bundling](custom_bundling.md) - how to create a custom build of Exprify containing only the functions and data types you need, to reduce bundle size.
- [Command Line Interface](command_line_interface.md) - using Exprify from the command line to evaluate expressions without writing code.
- [History](../HISTORY.md) - a changelog of releases, new features, bug fixes, and breaking changes across versions.