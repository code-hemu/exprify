# Custom Bundling

Exprify ships multiple module formats out of the box so that you can pick whichever build best matches your project's tooling and runtime environment - whether that's a modern bundler, a Node.js backend, or a plain `<script>` tag in the browser. You shouldn't need to build Exprify yourself in most cases; just point your project at the right file.

## Module Formats

| Format | File | Use Case |
|---|---|---|
| ESM | `dist/exprify.esm.js` | Native ES Modules for modern bundlers (webpack, Rollup, Vite, esbuild) and environments that support `import`/`export` syntax directly. |
| CommonJS | `dist/exprify.cjs.cjs` | Node.js `require()` and any tooling that still relies on the CommonJS module system. |
| UMD (dev) | `dist/exprify.js` | Universal Module Definition build for direct browser `<script>` tags. Unminified, with full variable names and no dead-code elimination - useful for debugging. |
| UMD (prod) | `dist/exprify.min.js` | Same UMD build as above, but minified and production-ready (~30 KB). Recommended for browser script tags in live deployments. |

Each of these builds contains the exact same functionality - the only difference is the module system and whether the code has been minified. Pick the one that matches how your project loads dependencies.

## Package Exports

Exprify's `package.json` declares conditional exports so that the correct file is resolved automatically depending on how your code imports the package:

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

Modern bundlers will automatically pick the ESM version when you write `import Exprify from 'exprify'`, while Node.js `require('exprify')` will resolve to the CommonJS version. In most cases, you don't need to think about this at all - your existing import or require statement will simply work, and the right build will be loaded behind the scenes.

If you're using the UMD builds (for example, loading Exprify directly via a `<script>` tag without a bundler), you'll need to reference `dist/exprify.js` or `dist/exprify.min.js` explicitly, since the `exports` field only governs `import`/`require` resolution in Node-style environments.

## Tree Shaking

The ESM bundle supports tree shaking, which allows bundlers to analyze your code and strip out anything you don't actually use, reducing your final bundle size. To take advantage of this, simply import what you need:

```js
import Exprify from 'exprify';
```

It's worth noting an important caveat: Exprify is implemented as a single class with all of its built-in functions bundled together as part of that class's internal registry. Because of this design, tree shaking will remove unused *surrounding* code in your application bundle (helper modules, unused exports from other files, etc.), but it will **not** strip individual built-in functions out of Exprify itself - the full function registry is always included as part of the `Exprify` class. If a smaller footprint for the core library is critical for your use case, keep this in mind when evaluating bundle size impact.