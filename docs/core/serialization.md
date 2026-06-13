# Serialization

Exprify supports full serialization and deserialization of engine state, allowing you to save, restore, clone, or transfer an engine's context (variables, custom functions, and units) as a plain JSON-safe object. This is especially useful for persisting sessions across page reloads, sending engine state between client and server, storing user-defined configurations in a database, or duplicating an engine instance with all its current definitions intact.

## Exporting State

The `exportState()` method captures the current state of the engine - including all defined variables, custom functions, and units - and returns it as a plain object that can be safely converted to JSON (e.g., via `JSON.stringify`).

```js
const state = expr.exportState();
// {
//   variables: { x: 5, y: 10 },
//   functions: [
//     { name: 'double', params: ['n'], body: 'n * 2' }
//   ],
//   units: {
//     km: { base: 'm', factor: 1000 }
//   }
// }
```

### What gets exported

| Key         | Description                                                                 |
|-------------|------------------------------------------------------------------------------|
| `variables` | A key-value map of all currently defined variables and their values.        |
| `functions` | An array of custom function definitions, including their names, parameters, and bodies. |
| `units`     | A map of custom unit definitions, including their base units and conversion factors. |

Because the returned object contains only plain values (numbers, strings, arrays, and nested objects), it can be stored in `localStorage`, written to a file, sent over a network request, or saved to a database without any additional transformation.

```js
// Persist to localStorage
localStorage.setItem('exprifyState', JSON.stringify(expr.exportState()));

// Send to a server
fetch('/api/save-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(expr.exportState())
});
```

## Importing State

The `importState(state)` method takes a previously exported state object and applies it to an engine instance, restoring all variables, functions, and units exactly as they were when exported.

```js
const expr2 = new Exprify();
expr2.importState(state);

expr2.getVariable('x'); // 5
expr2.getVariable('y'); // 10
expr2.evaluate('double(4)'); // 8 (custom function restored)
```

### Loading state from storage

```js
const savedState = JSON.parse(localStorage.getItem('exprifyState'));

const expr3 = new Exprify();
if (savedState) {
  expr3.importState(savedState);
}
```

## Cloning an Engine

Since `exportState()` and `importState()` operate on plain objects, they can be used together to create an independent copy of an engine, including all of its custom definitions:

```js
const original = new Exprify();
original.setVariable('x', 42);

const clone = new Exprify();
clone.importState(original.exportState());

clone.getVariable('x'); // 42
```

Changes made to `clone` after this point will not affect `original`, and vice versa - the two engines are fully decoupled once the state has been imported.

## Notes

- `importState()` typically **merges or overwrites** existing definitions on the target engine rather than requiring a fresh instance - check your version's behavior if you're importing into an engine that already has state.
- The exported object is JSON-safe by design, so avoid manually adding non-serializable values (functions as native JS closures, `Map`/`Set` instances, etc.) if you plan to round-trip it through `JSON.stringify` / `JSON.parse`.
- Custom function bodies are stored as source strings/expressions, not as compiled closures, so they remain portable across environments and survive serialization intact.