# Security

Exprify evaluates expressions **without using `eval()` or `new Function()`** - the two most common
vectors for arbitrary code execution in JavaScript-based expression engines. Instead, it relies on a
purpose-built parser that operates in a closed, controlled environment.

## How the Parser Works

The expression parser recognizes only a narrow, explicitly defined set of constructs:

- **Math operators and numeric literals** - standard arithmetic (`+`, `-`, `*`, `/`, `%`, `**`) and
  numeric values
- **Registered built-in functions** - functions that ship with the engine (e.g. `abs()`, `round()`,
  `min()`, `max()`)
- **User-defined functions** - functions you explicitly register via `addFunction()` or define
  inline within an expression

Anything outside this set is rejected at parse time with a descriptive error. There is no fallback
to the host runtime.

## What Is NOT Accessible from Expressions

Expressions are intentionally sandboxed. The following are completely inaccessible, regardless of
how an expression is crafted:

| Blocked Capability | Why It Matters |
|--------------------|----------------|
| File system or network access | Prevents data exfiltration or I/O side-effects |
| Global JS objects (`window`, `process`, `require`, `import`) | Cuts off escape hatches to the host runtime |
| Arbitrary JavaScript execution | Eliminates code injection entirely |
| Property traversal on host objects | Stops prototype chain climbing or object enumeration |

Even if a user passes in a cleverly crafted string, the parser will not resolve identifiers it has
not been explicitly told about. Unknown identifiers produce a parse error, not a runtime lookup.

## Scope Isolation

The optional `scope` parameter in `evaluate()` and `compile()` provides a clean, ephemeral way to
inject values into an expression without touching the engine's persistent internal state.

```js
expr.evaluate('x + y', { x: 5, y: 10 }); // 15
expr.getVariable('x');                    // undefined - not persisted to the engine
```

Scope values exist only for the duration of that single evaluation call. They do not leak between
calls, do not modify registered variables, and are not visible to other expressions running in the
same engine instance. This makes the `scope` parameter the recommended approach whenever
user-supplied values need to be evaluated - it keeps untrusted data clearly separated from trusted
engine configuration.

## Built-in Protections at a Glance

Exprify's security model rests on three structural guarantees:

1. **No runtime eval path.** The parser generates an AST (abstract syntax tree) and walks it
   directly - there is no step where expression text is passed to the JavaScript engine as code.

2. **Allowlist-only execution.** Functions and identifiers must be explicitly registered before
   they can be called. Unrecognized names are hard errors.

3. **Ephemeral scope by default.** Values passed through `scope` never persist, eliminating a
   common class of state-pollution bugs in multi-tenant or multi-user scenarios.

## Best Practices

**Expose only what you need.** Use `addFunction()` to register specific capabilities rather than
giving expressions access to large utility libraries. Each registered function is a deliberate
decision, not an implicit grant.

**Avoid registering sensitive APIs.** Do not wrap functions that touch the file system, make
network requests, or read environment variables - even if you intend them to be read-only.
Registering them creates attack surface that the sandbox cannot protect against, because the
function itself lives outside the sandbox boundary.

**Prefer `scope` over `setVariable()` for user input.** When values originate from user input
(form fields, URL parameters, API payloads), pass them through the `scope` parameter rather than
calling `setVariable()`. This prevents user-supplied values from inadvertently persisting and
affecting subsequent evaluations.

**Validate inputs before evaluation.** Even though the parser rejects unknown constructs, adding
application-level validation (length limits, character allowlists, rate limiting) before expressions
reach `evaluate()` reduces the cost of handling malformed or adversarial input.