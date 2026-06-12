# Contributing to Exprify

First off, thanks for taking the time to contribute!

Contributions are welcome. It's reporting a bug, discussing improvements, or submitting a pull request.

---

## Getting Started

```bash
git clone https://github.com/code-hemu/exprify.git
cd exprify
npm install
npm run build
```

## Development Workflow

| Command | Description |
|---|---|
| `npm test` | Run Jest test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint source with ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format:check` | Check formatting with Prettier |
| `npm run format` | Auto-format all files with Prettier |
| `npm run typecheck` | Type-check with TypeScript (`tsc --noEmit`) |
| `npm run build` | Clean and rebuild all dist bundles |

**Before submitting a PR**, make sure:
- `npm run lint` passes
- `npm run typecheck` passes
- `npm test` passes (all tests green)
- `npm run format:check` passes

## Project Structure

```
exprify/
├── src/          # Source code (ESM)
├── test/         # Jest test files
├── dist/         # Build output (ESM, CJS, UMD, minified)
├── docs/         # Documentation assets
└── .github/      # CI workflows and config
```

## Pull Request Process

1. **Fork** the repository.
2. **Create a branch**: `git checkout -b feature/your-feature` — use prefixes like `feature/`, `fix/`, or `docs/`.
3. **Make your changes** — keep the PR focused on a single concern.
4. **Run all checks** — lint, typecheck, tests, format.
5. **Commit** your changes with a clear message: `git commit -m "Add your feature"`
6. **Push** your branch: `git push origin feature/your-feature`
7. **Open a pull request** against the `master` branch.

Your PR will be reviewed. Please respond to any feedback — it's appreciated, not required.

## Style & Conventions

- Code is formatted with **Prettier** (see `.prettierrc`).
- Linting rules are enforced via **ESLint** (see `eslint.config.js`).
- The project uses **ESM** (`"type": "module"`) — use `import`/`export` syntax.
- Follow the patterns you see in existing source and tests.

## Reporting Issues

Report bugs and request features via [GitHub Issues](https://github.com/code-hemu/exprify/issues).

When reporting a bug, include:
- A clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment (Node version, browser, OS)
- Minimal example code if possible

## License

By contributing, you agree that your contributions will be licensed under the [GPL-3.0 License](LICENSE).
