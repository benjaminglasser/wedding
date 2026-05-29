import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svg = await readFile(resolve(root, 'assets/favicon.svg'));

// 180px matches the modern apple-touch-icon spec
await sharp(svg, { density: 384 })
  .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(resolve(root, 'assets/favicon.png'));

console.log('wrote assets/favicon.png @ 180px');
