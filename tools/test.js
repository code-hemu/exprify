import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const testDir = join(repoRoot, 'test');
const bundle = join(repoRoot, 'dist', 'exprify.esm.js');

if (!existsSync(bundle)) {
  console.error('Missing dist/exprify.esm.js - run "npm run build" before "npm test".');
  process.exit(1);
}

// The suite is written against the jest globals; node:test provides the
// runner, so the names are wired up here and nothing in the test files has
// to import anything.
Object.assign(globalThis, { describe, it, test: it, before, beforeEach, after });

function show(value) {
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'function') return value.name || 'function';
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function deepEqual(actual, expected) {
  try {
    assert.deepStrictEqual(actual, expected);
    return true;
  } catch {
    return false;
  }
}

// Every matcher answers one question: does the assertion hold? The caller
// decides what "not" means, so a negated matcher is the inverse of the same
// check rather than a second implementation.
const checks = {
  toBe(actual, expected) {
    return Object.is(actual, expected);
  },
  toEqual(actual, expected) {
    return deepEqual(actual, expected);
  },
  toBeCloseTo(actual, expected, digits = 2) {
    return Math.abs(actual - expected) < Math.pow(10, -digits) / 2;
  },
  toBeGreaterThan(actual, expected) {
    return actual > expected;
  },
  toBeGreaterThanOrEqual(actual, expected) {
    return actual >= expected;
  },
  toBeLessThan(actual, expected) {
    return actual < expected;
  },
  toBeLessThanOrEqual(actual, expected) {
    return actual <= expected;
  },
  toBeDefined(actual) {
    return actual !== undefined;
  },
  toBeUndefined(actual) {
    return actual === undefined;
  },
  toBeNull(actual) {
    return actual === null;
  },
  toBeTruthy(actual) {
    return Boolean(actual);
  },
  toBeFalsy(actual) {
    return !actual;
  },
  toBeNaN(actual) {
    return Number.isNaN(actual);
  },
  toContain(actual, expected) {
    if (typeof actual === 'string') return actual.includes(expected);
    if (Array.isArray(actual)) return actual.includes(expected);
    if (actual instanceof Set || actual instanceof Map) return actual.has(expected);
    return false;
  },
  toHaveLength(actual, expected) {
    return actual?.length === expected;
  },
  toBeInstanceOf(actual, expected) {
    return actual instanceof expected;
  },
  toHaveProperty(actual, path, expected) {
    const value = String(path)
      .split('.')
      .reduce((acc, key) => (acc === null || acc === undefined ? undefined : acc[key]), actual);
    if (expected === undefined) return value !== undefined;
    return deepEqual(value, expected);
  },
  toMatch(actual, expected) {
    const text = String(actual);
    if (expected instanceof RegExp) return expected.test(text);
    return text.includes(String(expected));
  },
  toThrow(actual, expected) {
    let thrown;
    let didThrow = false;
    try {
      actual();
    } catch (error) {
      didThrow = true;
      thrown = error;
    }
    if (!didThrow) return false;
    if (expected === undefined) return true;
    const message = thrown?.message ?? String(thrown);
    if (typeof expected === 'string') return message.includes(expected);
    if (expected instanceof RegExp) return expected.test(message);
    if (typeof expected === 'function') return thrown instanceof expected;
    return false;
  },
};

function createMatchers(actual, negated) {
  const api = {};
  for (const [name, check] of Object.entries(checks)) {
    api[name] = (...args) => {
      const holds = Boolean(check(actual, ...args));
      if (negated ? holds : !holds) {
        const not = negated ? 'not ' : '';
        const message =
          name === 'toThrow'
            ? `expected the function ${not}to throw${args.length ? ` ${show(args[0])}` : ''}`
            : `expected ${show(actual)} ${not}to ${name}(${args.map(show).join(', ')})`;
        throw new Error(message);
      }
    };
  }
  return api;
}

globalThis.expect = (actual) => {
  const api = createMatchers(actual, false);
  api.not = createMatchers(actual, true);
  return api;
};

const files = readdirSync(testDir)
  .filter((file) => file.endsWith('.test.js'))
  .sort();

for (const file of files) {
  await import(pathToFileURL(join(testDir, file)).href);
}
