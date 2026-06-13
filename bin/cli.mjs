#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { stdin, stdout, stderr, exit, argv, version } from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let pkg;
try {
  pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));
} catch {
  pkg = { version: 'unknown' };
}

let Exprify;
try {
  const mod = await import('../src/core/exprify.js');
  Exprify = mod.default || mod.Exprify;
} catch {
  stderr.write('Error: Could not load Exprify module\n');
  exit(1);
}

const expr = new Exprify();

const USAGE = `Usage: exprify [options] [expression...]

Options:
  --help           Show this help message
  --version        Show version number
  --parse <expr>   Parse expression and show token/AST structure
  --tokens <expr>  Tokenize expression and show tokens

If no expression is provided and stdin is a TTY, starts interactive REPL.
If stdin is piped, reads expression from stdin.

Examples:
  exprify "2 + 2"
  exprify "sqrt(16)" "5 * 3"
  exprify --parse "x ^ 2 + 2 * x + 1"
  echo "2 + 2" | exprify
`;

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function formatResult(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object' || Array.isArray(value)) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function printError(msg) {
  stderr.write(COLORS.red + 'Error: ' + COLORS.reset + msg + '\n');
}

function evaluateAndPrint(expression, mode) {
  try {
    if (mode === 'parse') {
      const result = expr.parse(expression);
      console.log(JSON.stringify(result, null, 2));
    } else if (mode === 'tokens') {
      const result = expr.tokenize(expression);
      console.log(JSON.stringify(result, null, 2));
    } else {
      const result = expr.evaluate(expression);
      console.log(formatResult(result));
    }
  } catch (err) {
    printError(err.message);
    exit(1);
  }
}

const args = argv.slice(2);

if (args.length === 0) {
  if (stdin.isTTY) {
    startREPL();
  } else {
    let input = '';
    stdin.setEncoding('utf-8');
    stdin.on('data', (chunk) => {
      input += chunk;
    });
    stdin.on('end', () => {
      const exprStr = input.trim();
      if (exprStr) evaluateAndPrint(exprStr);
    });
  }
  exit(0);
}

const flag = args[0];

if (flag === '--help' || flag === '-h') {
  console.log(USAGE);
  exit(0);
}

if (flag === '--version' || flag === '-v') {
  console.log(pkg.version);
  exit(0);
}

if (flag === '--parse' || flag === '--tokens') {
  if (args.length < 2) {
    printError('Missing expression argument');
    console.log(USAGE);
    exit(2);
  }
  const mode = flag.slice(2);
  for (let i = 1; i < args.length; i++) {
    evaluateAndPrint(args[i], mode);
  }
  exit(0);
}

for (const arg of args) {
  evaluateAndPrint(arg);
}

function startREPL() {
  console.log(`Exprify v${pkg.version} - interactive REPL`);
  console.log('Type an expression or .help for commands\n');

  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: COLORS.cyan + '» ' + COLORS.reset,
    completer: (line) => {
      const completions = [
        'help',
        '.help',
        '.exit',
        'pi',
        'e',
        'i',
        'PHI',
        'TAU',
        'INFINITY',
        'NaN',
        'sin',
        'cos',
        'tan',
        'sqrt',
        'abs',
        'log',
        'exp',
        'map',
        'filter',
        'sum',
        'prod',
        'mean',
        'max',
        'min',
        'if',
        'parse',
        'leafCount',
        'random',
        'simplify',
        'expand',
        'factor',
        'solve',
        'derivative',
        'integral',
        'sigma',
        'limit',
        'substitute',
        'det',
        'transpose',
        'inverse',
        'trace',
        'rank',
      ];
      const hits = completions.filter((c) => c.startsWith(line));
      return [hits.length ? hits : completions, line];
    },
  });

  rl.on('line', (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    if (input === '.exit' || input === 'exit' || input === 'quit') {
      rl.close();
      return;
    }

    if (input === '.help' || input === 'help') {
      console.log(`\n  ${COLORS.bold}Commands:${COLORS.reset}`);
      console.log('  .exit       Exit the REPL');
      console.log('  .help       Show this message');
      console.log('  <expr>      Evaluate an expression');
      console.log('  Ctrl+C      Cancel / exit');
      console.log('');
      rl.prompt();
      return;
    }

    try {
      const result = expr.evaluate(input);
      console.log(COLORS.green + formatResult(result) + COLORS.reset);
    } catch (err) {
      console.log(COLORS.red + 'Error: ' + COLORS.reset + err.message);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('');
    exit(0);
  });

  rl.prompt();
}
