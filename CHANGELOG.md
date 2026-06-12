# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows semantic versioning.

## [1.0.5] - 2026-06-12

### Added

- ESLint (v10 flat config) with strict rules, Prettier formatting, and TypeScript JSDoc type checking
- Husky pre-commit hook with lint-staged for automatic linting and formatting on commit
- Dependabot config for weekly automated dependency pull requests
- CodeQL security analysis workflow on push/PR/schedule
- Bundle size monitoring via size-limit (min.js: 30 KB, esm.js: 60 KB)
- Jest coverage reporting (`npm run test:coverage`) with CI artifact upload
- Node.js 24 to CI test matrix (previously 20 and 22 only)
- `.editorconfig` for cross-editor consistency
- `// @ts-check` annotations to all 14 source files
- `engines` field requiring Node >=18

### Changed

- Upgraded Rollup from v2 to v4 with updated plugin versions
- Replaced rimraf with built-in `fs.rmSync` for the clean script
- Replaced nodemon with Node.js built-in `--watch` flag for the dev script
- CI workflow now runs lint, typecheck, size check, and coverage in addition to tests
- Switched CI workflows to Node 24 for publish and audit jobs
- Added `--no-warnings` flag to test scripts to suppress ExperimentalWarning

### Fixed

- All ESLint errors (no-unused-vars, no-undef, eqeqeq, prefer-const, camelcase, etc.)
- All TypeScript type errors (err unknown type, null checks, variable store reference)
- lint-staged Windows ENOENT error by switching from package.json config to `lint-staged.config.js` with direct `node` invocation

### Removed

- Unused Babel dependencies (@babel/cli, @babel/core, @babel/preset-env)
- Unused rollup-plugin-strip-banner, glob, and rimraf dev dependencies
- `overrides` section (test-exclude, glob pins) — no longer needed with Jest 30
- `nodemon` devDependency (replaced by `node --watch`)

## [1.0.1] - 2026-04-05

### Fixed

- Corrected the import path in `src/index.js` to match the actual filename casing of `src/core/Exprify.js`.
- Resolved a cross-platform build issue where Rollup failed on Linux-based CI environments because of case-sensitive path resolution.
