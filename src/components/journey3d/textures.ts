import * as THREE from 'three';

// Texture radiale douce pour le halo du soleil et les glows des stops.
export function createSunGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  grad.addColorStop(0, 'rgba(255,235,180,1)');
  grad.addColorStop(0.18, 'rgba(255,180,90,0.85)');
  grad.addColorStop(0.45, 'rgba(255,120,60,0.35)');
  grad.addColorStop(1, 'rgba(255,90,40,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Texture de nuage : superposition de blobs radiaux flous.
export function createCloudTexture(): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const blobs: [number, number, number][] = [
    [128, 140, 90],
    [80, 150, 60],
    [180, 150, 64],
    [120, 120, 70],
    [160, 120, 50],
  ];
  for (const [x, y, r] of blobs) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.65, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
