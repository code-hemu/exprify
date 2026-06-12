import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(__dirname, '../bin/cli.mjs');

function run(args = []) {
  return execFileSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf-8',
  });
}

describe('CLI', () => {
  // EVALUATION
  test('evaluates a simple expression', () => {
    const out = run(['2 + 3']);
    expect(out.trim()).toBe('5');
  });

  test('evaluates multiple expressions', () => {
    const out = run(['1 + 1', '2 + 2', '3 + 3']);
    const lines = out.trim().split('\n');
    expect(lines).toEqual(['2', '4', '6']);
  });

  test('evaluates expressions with functions', () => {
    const out = run(['sqrt(16)']);
    expect(out.trim()).toBe('4');
  });

  // FLAGS
  test('--help prints usage and exits 0', () => {
    expect(() => run(['--help'])).not.toThrow();
    const out = run(['--help']);
    expect(out).toMatch(/Usage:/);
  });

  test('-h prints usage', () => {
    const out = run(['-h']);
    expect(out).toMatch(/Usage:/);
  });

  test('--version prints version', () => {
    const out = run(['--version']);
    expect(out.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('-v prints version', () => {
    const out = run(['-v']);
    expect(out.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('--tokens outputs token JSON', () => {
    const out = run(['--tokens', '2 + 2']);
    const parsed = JSON.parse(out.trim());
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(3);
  });

  test('--parse outputs AST JSON', () => {
    const out = run(['--parse', 'x + 2']);
    const parsed = JSON.parse(out.trim());
    expect(parsed).toHaveProperty('tokens');
    expect(parsed).toHaveProperty('ast');
  });

  // ERROR HANDLING
  test('throws on invalid expression', () => {
    expect(() => run(['2 + +'])).toThrow();
  });

  test('throws on missing arg for --parse', () => {
    expect(() => run(['--parse'])).toThrow();
  });

  test('throws on missing arg for --tokens', () => {
    expect(() => run(['--tokens'])).toThrow();
  });

  // EDGE CASES
  test('handles complex expression with spaces', () => {
    const out = run(['(2 + 3) * 4']);
    expect(out.trim()).toBe('20');
  });

  test('handles expression with unicode', () => {
    const out = run(['"hello" + " " + "world"']);
    expect(out.trim()).toBe('hello world');
  });
});
