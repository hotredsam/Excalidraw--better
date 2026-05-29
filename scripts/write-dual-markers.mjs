// Writes the CJS/ESM "type" marker package.json files into a dual-build dist
// directory. Run from a package root (cwd) after the two tsc passes have
// emitted ./dist/cjs and ./dist/esm. Keeps the renderer (ESM/Vite) and the
// Electron main process (CJS/Node) each resolving the right module format.
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('dist/cjs', { recursive: true });
mkdirSync('dist/esm', { recursive: true });
writeFileSync('dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }) + '\n');
writeFileSync('dist/esm/package.json', JSON.stringify({ type: 'module' }) + '\n');
