import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(here, '..', 'package.json'), 'utf8'),
);

export default {
  build: {
    entry: ['index.html'],
    outdir: 'dist',
    target: 'esnext',
    minify: false,
    pretty: true,
    minifyHtml: false,
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
  },
};
