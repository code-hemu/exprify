import { rmSync } from 'fs';
rmSync('dist', { recursive: true, force: true });
rmSync('.types', { recursive: true, force: true });
