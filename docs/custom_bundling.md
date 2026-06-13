# Custom Bundling

Exprify ships multiple module formats so you can choose the best option for your project.

## Module Formats

| Format | File | Use Case |
|---|---|---|
| ESM | `dist/exprify.esm.js` | Bundlers (webpack, Rollup, Vite, esbuild) |
| CommonJS | `dist/exprify.cjs.cjs` | Node.js `require()` |
| UMD (dev) | `dist/exprify.js` | Browser script tag (unminified) |
| UMD (prod) | `dist/exprify.min.js` | Browser script tag (minified, ~30 KB) |

## Package Exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/exprify.esm.js",
      "require": "./dist/exprify.cjs.cjs"
    }
  }
}
```

Modern bundlers will automatically pick the ESM version, while Node.js `require()` gets the CommonJS version.

## Tree Shaking

The ESM bundle supports tree shaking. Import only what you need:

```js
import Exprify from 'exprify';
```

Note: exprify is a single class with all built-in functions included — tree shaking removes unused code in your bundle, not the internal function registry.
