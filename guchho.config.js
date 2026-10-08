import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

const short_banner = `/*! ${pkg.name} v${pkg.version} | * (c) ${new Date().getFullYear()} ${pkg.author} and contributors | ${pkg.license} License*/`;

const big_banner = `/*!
* ${pkg.name} v${pkg.version}
* (c) ${new Date().getFullYear()} ${pkg.author} and other contributors
*
* Released under the ${pkg.license} License
* Date: ${new Date().toISOString().split('T')[0]}
*/`;

export default [
    {
        build: {
            entry: 'src/index.js',
            outfile: 'dist/exprify.esm.js',
            outdir: 'dist',
            format: 'esm',
            banner: big_banner,
            platform: 'neutral',
            sourcemap: true,
            target: 'esnext',
            minify: false
        },
    }
];