# Security

Exprify evaluates expressions **without using `eval()` or `new Function()`**. The expression parser only recognizes:

- Math operators and literals
- Registered built-in functions
- User-defined functions (added via `addFunction()` or inline definitions)

## What is NOT accessible from expressions

- File system or network access
- Global JavaScript objects (`window`, `process`, `require`, `import`)
- Arbitrary JavaScript execution
- Property access on host objects beyond simple identifiers

## Scope Isolation

The optional `scope` parameter in `evaluate()` and `compile()` provides a safe way to inject values without modifying the engine's persistent state:

```js
expr.evaluate('x + y', { x: 5, y: 10 }); // 15
expr.getVariable('x'); // undefined (not persisted)
```

## Best Practices

- Use `addFunction()` to expose only the specific capabilities you need
- Avoid registering functions that access sensitive APIs
- Use the scope parameter for user-provided values instead of setting variables directly
