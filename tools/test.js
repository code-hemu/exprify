import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const jestPath = require.resolve('jest/bin/jest');

const result = spawnSync(
  'node',
  [
    '--experimental-vm-modules',
    '--no-warnings',
    jestPath,
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit', windowsHide: true }
);

process.exit(result.status ?? 1);
