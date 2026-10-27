# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-23

### Added

- Interactive browser playground (`playground/`) with live evaluation, a searchable
  function menu, and support for units, fractions, big numbers, and matrices.
- GitHub Actions workflow to build and deploy the playground to GitHub Pages.
- TypeScript declaration generation (`npm run build:types`) with dedicated
  `tsconfig.types.json` output to `dist/index.d.ts`.
- Standalone test runner (`tools/test.js`) that discovers and runs every test file,
  plus DOM test helpers and playground unit/DOM test suites.
- `npm run typecheck` script for validating TypeScript declarations.
- GitHub Sponsors funding configuration.

### Changed

- Migrated the build pipeline from Rollup to [Guchho](https://github.com/code-hemu/guchho).
- Updated package entry points for CommonJS, ESM, browser, and type declarations.
- Test command now rebuilds the bundles before running the full test suite.
- Updated README and CONTRIBUTING for the new build and playground workflow.
- Requires Node.js 18 or newer.

### Removed

- Legacy `examples/react` and `examples/vanilla-js` projects, superseded by the playground.
- Rollup configuration and Rollup-based build dependencies.
- Standalone ESLint, Prettier, and EditorConfig configurations in favor of the
  Guchho-based workflow.

### Fixed

- Improved test reliability with dedicated DOM helpers and cross-platform script handling.

## [1.0.9] - 2026-06-26

### Changed

- Version bump and repository housekeeping.
- Restricted example projects from being published with the package.

## [1.0.8] - 2026-06-26

### Added

- **Physical Quantity Arithmetic** — Cross-type multiplication and division now
  produce correct derived units: `length × length → area`, `area × length → volume`,
  `voltage × current → power`, `energy ÷ time → power`, `power × time → energy`,
  `voltage ÷ resistance → current`, `current × resistance → voltage`,
  `force ÷ area → pressure`, and `pressure × area → force`.
- **Temperature conversion** — `°F ↔ °C ↔ K` now uses proper offset formulas via a
  Kelvin intermediary (`98.6 F to C` → `"37 C"`).
- **React example** — New `examples/react/` directory with a Vite-powered unit
  converter app (12 quick-convert presets).
- Derived unit results support `to` conversions
  (`5 m * 3 m to cm2` → `"150000 cm2"`).

### Changed

- Renamed `src/utils/globalUnits.js` to `src/utils/units.js`.

### Fixed

- Unit tokenizer is no longer case-sensitive for uppercase unit keys
  (`V`, `A`, `F`, `C`, `K`, `Hz`, `W`, and others).
- Unit name disambiguation resolves duplicate names (`F`: farad/Fahrenheit,
  `rad`: angle/radiation, `S`/`s`: siemens/second) using the context of the
  paired unit (`1 F to mF` → farad, `98.6 F to C` → Fahrenheit).

## [1.0.7] - 2026-06-13

### Added

- React calculator example and updated documentation.

### Changed

- Expanded class reference documentation and function documentation.

## [1.0.6] - 2026-06-13

### Changed

- Documentation and README updates.

## [1.0.5] - 2026-06-13

### Added

- Arbitrary-precision arithmetic with `BigNumber`.
- Exact fractions with conversion and arithmetic support.
- Lambda expressions with `x -> x^2` syntax.
- Range and spread operators, plus compound assignment.
- Degree-mode trigonometric functions (`sind`, `cosd`, `tand`, and inverses).
- Fluent expression chaining via `expr.chain()` and `ans`.
- State serialization with `exportState()` / `importState()`.
- Command-line interface (`bin/cli.mjs`).
- ESLint (v10 flat config), Prettier formatting, and TypeScript JSDoc type checking.
- Husky pre-commit hook with lint-staged.
- Dependabot configuration and CodeQL security analysis.
- Bundle size monitoring and Jest coverage reporting.
- Node.js 24 in the CI test matrix.
- `.editorconfig` and `// @ts-check` annotations across the source files.
- `engines` field requiring Node.js 18 or newer.

### Changed

- Upgraded Rollup from v2 to v4.
- Replaced rimraf with `fs.rmSync` and nodemon with Node's built-in `--watch`.
- CI now runs lint, typecheck, size checks, and coverage in addition to tests.

### Fixed

- Resolved all ESLint and TypeScript type errors.
- Fixed the lint-staged Windows `ENOENT` error.

### Removed

- Unused Babel, `rollup-plugin-strip-banner`, `glob`, and `rimraf` dependencies.
- Redundant `overrides` and `nodemon` devDependencies.

## [1.0.4] - 2026-06-02

### Added

- Unit conversion support.
- Matrix creation and linear algebra helpers, including determinant, inverse,
  transpose, LUP, QR, and polynomial roots.
- Complex number arithmetic and formatting.
- Symbolic math utilities such as `simplify`, `derivative`, and `rationalize`.
- Calculus and statistics functions.
- Parse and AST utility APIs.

## [1.0.3] - 2026-04-06

### Changed

- Maintenance and documentation updates.

## [1.0.2] - 2026-04-05

### Changed

- Maintenance and documentation updates.

## [1.0.1] - 2026-04-05

### Fixed

- Corrected the import path in `src/index.js` to match the actual filename casing of
  `src/core/Exprify.js`.
- Fixed a cross-platform build issue where Rollup failed on Linux-based CI
  environments due to case-sensitive path resolution.

## [1.0.0] - 2026-04-02

### Added

- Initial release of Exprify.
- Math expression parser and evaluator with arithmetic and parentheses support.
- Persistent variables and user-defined functions.
- Inline function definitions.
- Expression parsing and compilation APIs.
- CommonJS, ESM, browser, and minified bundles.

[1.1.0]: https://github.com/code-hemu/exprify/compare/v1.0.9...HEAD
[1.0.9]: https://github.com/code-hemu/exprify/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/code-hemu/exprify/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/code-hemu/exprify/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/code-hemu/exprify/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/code-hemu/exprify/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/code-hemu/exprify/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/code-hemu/exprify/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/code-hemu/exprify/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/code-hemu/exprify/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/code-hemu/exprify/releases/tag/v1.0.0
