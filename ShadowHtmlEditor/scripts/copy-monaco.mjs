import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'node_modules/monaco-editor/min/vs');
const destination = resolve(root, 'public/monaco/vs');
if (!existsSync(source)) {
  console.error('Monaco Editor is missing. Run npm install first.');
  process.exit(1);
}
mkdirSync(dirname(destination), { recursive: true });
if (existsSync(destination)) rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });
console.log('Prepared local Monaco Editor assets.');
