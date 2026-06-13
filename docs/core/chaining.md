# Chaining

The `.chain()` method returns a fluent `Chain` object designed for sequential evaluations where each step builds on the result of the previous one. This is especially useful for multi-step calculations, pipelines, or interactive REPL-style sessions where you don't want to manually track intermediate results.

Each step automatically stores its result in the special variable `ans`, which becomes available to the next expression in the chain. This mirrors the behavior of calculator "ANS" buttons, letting you write expressions like `ans * 10` without explicitly naming the previous result.

## Basic Usage

```js
const c = expr.chain();
c.evaluate('2 + 2');         // ans = 4
c.evaluate('ans * 10');      // ans = 40
c.evaluate('ans / 2');       // ans = 20
c.done();                     // 20
```

In this example, each call to `evaluate()` updates `ans` internally. The chain doesn't return the result of each step directly - instead, results accumulate silently until `done()` is called, which retrieves and formats the final value.

## Method Reference

All methods on the `Chain` object return the `Chain` instance itself (with the exception of `done()`), which enables fluent, method-chained syntax. This means you can compose an entire sequence of operations in a single expression without intermediate variables.

```js
const result = expr
  .chain()
  .setVariable('x', 5)
  .evaluate('x + 2')
  .done(); // 7
```

| Method | Returns | Description |
|---|---|---|
| `evaluate(expr, scope?)` | `Chain` | Evaluates the given expression and stores the result as `ans`. An optional `scope` object can be passed to provide additional variables for this evaluation only. |
| `setVariable(name, value)` | `Chain` | Sets a named variable that persists across subsequent evaluations in the chain. Useful for defining constants or intermediate values to reference later. |
| `compile(expr)` | `Function` | Compiles an expression into a reusable function, delegating to the parent instance. The compiled function is not itself part of the chain's state. |
| `done()` | `any` | Terminates the chain and returns the final formatted result (i.e., the current value of `ans`). After calling `done()`, the chain should be considered complete. |

## Using Scope Overrides

The optional `scope` parameter on `evaluate()` allows you to inject variables for a single step without permanently adding them to the chain's persistent state (unlike `setVariable()`).

```js
const c = expr.chain();
c.evaluate('a + b', { a: 3, b: 4 });  // 7
c.evaluate('ans + 1');                // 8
c.done();                             // 8
```

Here, `a` and `b` are only available during the first `evaluate()` call. The second call only has access to `ans` (and any variables previously set via `setVariable()`), demonstrating that scope overrides are scoped strictly to the call in which they're provided.

## Notes

- Since every method except `done()` returns the chain instance, you can freely interleave `evaluate()` and `setVariable()` calls in any order before finalizing with `done()`.
- The `ans` variable is automatically managed; manually overwriting it via `setVariable('ans', ...)` is possible but generally discouraged, as it may produce confusing results in later steps.