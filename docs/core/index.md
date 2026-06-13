# Core

The `Exprify` class is the main entry point. It manages variables, functions, units, and provides parsing and evaluation of expressions.

## Topics

- **[Configuration](configuration.md)** - BigNumber precision, constants, custom functions, scope, state serialization
- **[Chaining](chaining.md)** - Fluent API with `.chain()` for sequential expression evaluation and `ans` tracking
- **[Extension](extension.md)** - Adding custom functions and variables, registering new units
- **[Serialization](serialization.md)** - Exporting and importing the full engine state with `exportState()` / `importState()`

## Quick Reference

| Method | Description |
|---|---|
| `evaluate(expr, scope?)` | Parse and evaluate an expression |
| `compile(expr)` | Compile to a reusable function (cached) |
| `parse(expr)` | Return `{ tokens, ast }` |
| `tokenize(expr)` | Return token array |
| `setVariable(name, value)` | Store a variable |
| `getVariable(name)` | Retrieve a variable |
| `addFunction(name, fn)` | Register a custom function |
| `clearCache()` | Clear compiled expression cache |
| `exportState()` | Serialize engine state |
| `importState(state)` | Restore engine state |
| `chain()` | Create a Chain instance |
