import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const TERRAIN_DIR = new URL('../public/terrain/', import.meta.url).pathname.replace(/^\/(?=[A-Z]:)/, '');

const files = await readdir(TERRAIN_DIR);
const png = files.filter((f) => f.endsWith('.png'));
const jpg = files.filter((f) => f.endsWith('.jpg'));

let beforeBytes = 0;
let afterBytes = 0;

console.log(`Converting ${png.length} heightmap PNGs (lossless) + ${jpg.length} satellite JPGs (q=80)...`);

const work = [];

for (const f of png) {
  work.push(
    (async () => {
      const src = join(TERRAIN_DIR, f);
      const dst = join(TERRAIN_DIR, f.replace(/\.png$/, '.webp'));
      const before = (await stat(src)).size;
      await sharp(src).webp({ lossless: true, effort: 6 }).toFile(dst);
      const after = (await stat(dst)).size;
      beforeBytes += before;
      afterBytes += after;
    })(),
  );
}

for (const f of jpg) {
  work.push(
    (async () => {
      const src = join(TERRAIN_DIR, f);
      const dst = join(TERRAIN_DIR, f.replace(/\.jpg$/, '.webp'));
      const before = (await stat(src)).size;
      await sharp(src).webp({ quality: 80, effort: 6 }).toFile(dst);
      const after = (await stat(dst)).size;
      beforeBytes += before;
      afterBytes += after;
    })(),
  );
}

await Promise.all(work);

const mb = (n) => (n / 1024 / 1024).toFixed(2);
const ratio = ((1 - afterBytes / beforeBytes) * 100).toFixed(1);
console.log(`Before: ${mb(beforeBytes)} MB`);
console.log(`After : ${mb(afterBytes)} MB`);
console.log(`Saved : ${ratio}%`);
