import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

// Tiles : 24 colonnes × 17 rangées (déjà trimmées au nord)
const TILE_X_START = 8493;
const TILE_Y_START = 5829;
const TILES_X = 24;
const TILES_Y = 17;
const TILE_SIZE = 256;
const ATLAS_W = TILES_X * TILE_SIZE; // 6144
const ATLAS_H = TILES_Y * TILE_SIZE; // 4352

const TERRAIN_DIR = new URL('../public/terrain/', import.meta.url).pathname.replace(
  /^\/(?=[A-Z]:)/,
  '',
);

const all = await readdir(TERRAIN_DIR);
const heightTiles = all
  .filter((f) => /^h_\d+_\d+\.webp$/.test(f))
  .filter((f) => !f.includes('-atlas'));
const satTiles = all
  .filter((f) => /^s_\d+_\d+\.webp$/.test(f))
  .filter((f) => !f.includes('-atlas'));

console.log(`Found ${heightTiles.length} heightmap + ${satTiles.length} satellite tiles.`);

const buildComposite = (prefix) => {
  const ops = [];
  for (let i = 0; i < TILES_X; i++) {
    for (let j = 0; j < TILES_Y; j++) {
      const x = TILE_X_START + i;
      const y = TILE_Y_START + j;
      ops.push({
        input: join(TERRAIN_DIR, `${prefix}_${x}_${y}.webp`),
        left: i * TILE_SIZE,
        top: j * TILE_SIZE,
      });
    }
  }
  return ops;
};

console.log('Baking heightmap atlas (lossless)...');
await sharp({
  create: {
    width: ATLAS_W,
    height: ATLAS_H,
    channels: 3,
    background: { r: 0, g: 0, b: 0 },
  },
})
  .composite(buildComposite('h'))
  .webp({ lossless: true, effort: 6 })
  .toFile(join(TERRAIN_DIR, 'heightmap-atlas.webp'));

console.log('Baking satellite atlas (q82, full resolution)...');
await sharp({
  create: {
    width: ATLAS_W,
    height: ATLAS_H,
    channels: 3,
    background: { r: 0, g: 0, b: 0 },
  },
})
  .composite(buildComposite('s'))
  .webp({ quality: 82, effort: 6 })
  .toFile(join(TERRAIN_DIR, 'satellite-atlas.webp'));

const { stat } = await import('node:fs/promises');
const hSize = (await stat(join(TERRAIN_DIR, 'heightmap-atlas.webp'))).size;
const sSize = (await stat(join(TERRAIN_DIR, 'satellite-atlas.webp'))).size;

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log(`heightmap-atlas.webp : ${mb(hSize)} MB`);
console.log(`satellite-atlas.webp : ${mb(sSize)} MB`);
console.log(`Total : ${mb(hSize + sSize)} MB (vs ~37 MB for 816 tiles)`);
