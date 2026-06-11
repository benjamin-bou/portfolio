# Journey3D « L'ascension immersive » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre la section 3D Mont Blanc immersive et réaliste : caméra cinématique en 3 actes (départ au ras de la vallée), neige/détail/ombres sur le terrain, perspective aérienne, nuages et halo solaire.

**Architecture:** Tout le rendu vit dans `src/components/Journey3D.tsx`. On en extrait deux modules purs (`journey3d/textures.ts`, `journey3d/atmosphere.ts`) et un module d'injection shader (`journey3d/terrainShader.ts`). La caméra passe d'un lerp 2 points à deux splines CatmullRom (position + regard). Le terrain passe d'une grille 4×4 uniforme à une grille 6×6 à résolution variable selon la proximité du corridor caméra/tracé. Les ombres sont rendues une seule fois (scène statique).

**Tech Stack:** React 19, TypeScript strict, Three.js 0.184, Vite 7. Pas de runner de test dans le projet — les gates sont `npm run build` (tsc + vite) et `npm run lint`, plus une vérification visuelle Playwright en Tâche 6.

**Spec:** `docs/superpowers/specs/2026-06-11-journey3d-immersive-ascension-design.md`

**Note budget vertices :** le spec évoque ~160 segments pour les chunks haute résolution ; après calcul (≈14 chunks hauts × 161² ≈ 360k verts), on retient **128** segments (≈14 × 129² ≈ 233k verts) pour rester dans le budget « priorité visuel » sans excès.

---

## Tâche 1 : Modules atmosphère (ciel + halo, nuages, brume) et textures

**Files:**
- Create: `src/components/journey3d/textures.ts`
- Create: `src/components/journey3d/atmosphere.ts`
- Modify: `src/components/Journey3D.tsx` (bloc ciel lignes ~217-254, glow lignes ~263, boucle animate, cleanup, suppression de `createSunGlowTexture` en bas de fichier)

- [ ] **Step 1.1 : Créer `src/components/journey3d/textures.ts`**

```ts
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
```

- [ ] **Step 1.2 : Créer `src/components/journey3d/atmosphere.ts`**

```ts
import * as THREE from 'three';

// Dôme céleste avec halo de diffusion autour de la direction du soleil.
export function buildSky(sunPos: THREE.Vector3): {
  mesh: THREE.Mesh;
  dispose: () => void;
} {
  const geom = new THREE.SphereGeometry(400, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(0x3d7ab0) },
      uHorizon: { value: new THREE.Color(0xd6e4ee) },
      uBottom: { value: new THREE.Color(0xa8b9c5) },
      uSunDir: { value: sunPos.clone().normalize() },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPosition = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform vec3 uBottom;
      uniform vec3 uSunDir;
      void main() {
        vec3 dir = normalize(vWorldPosition);
        float h = dir.y;
        vec3 col;
        if (h > 0.0) {
          col = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
        } else {
          col = mix(uHorizon, uBottom, smoothstep(0.0, 0.45, -h));
        }
        // Halo de diffusion autour du soleil : serré + voile large
        float sunAmt = max(dot(dir, uSunDir), 0.0);
        col += vec3(1.0, 0.92, 0.78) * pow(sunAmt, 180.0) * 0.55;
        col += vec3(0.95, 0.85, 0.70) * pow(sunAmt, 10.0) * 0.14;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geom, mat);
  return {
    mesh,
    dispose: () => {
      geom.dispose();
      mat.dispose();
    },
  };
}

// [x, y, z, échelle, opacité, vitesse de dérive]
const CLOUDS: [number, number, number, number, number, number][] = [
  [-150, 58, 40, 60, 0.34, 0.50],
  [-105, 64, 95, 75, 0.28, 0.40],
  [-60, 52, 20, 48, 0.40, 0.65],
  [-20, 60, 70, 65, 0.32, 0.45],
  [15, 55, 35, 52, 0.38, 0.55],
  [55, 63, 100, 80, 0.26, 0.38],
  [95, 57, 55, 58, 0.35, 0.52],
  [140, 61, 85, 70, 0.30, 0.42],
  [-130, 50, 130, 56, 0.30, 0.48],
  [-75, 66, 140, 85, 0.24, 0.35],
  [-25, 53, 115, 50, 0.36, 0.58],
  [35, 59, 130, 62, 0.30, 0.45],
  [85, 51, 10, 46, 0.38, 0.60],
  [125, 65, 25, 72, 0.26, 0.40],
  [-45, 68, 45, 78, 0.25, 0.36],
  [5, 49, 90, 44, 0.40, 0.62],
];

// Brume de fond de vallée (Chamonix ≈ y 16.5) : sprites très diffus, dérive lente.
const MIST: [number, number, number, number, number, number][] = [
  [-30, 20, -10, 70, 0.18, 0.10],
  [-5, 19, -20, 85, 0.15, 0.08],
  [20, 20, -5, 60, 0.20, 0.12],
  [-15, 21, 5, 75, 0.16, 0.09],
  [10, 19, -30, 90, 0.13, 0.07],
  [-40, 20, -25, 65, 0.17, 0.11],
];

function buildSpriteBand(
  tex: THREE.Texture,
  entries: [number, number, number, number, number, number][],
  color: number,
): THREE.Group {
  const group = new THREE.Group();
  for (const [x, y, z, scale, opacity, speed] of entries) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex,
        color,
        transparent: true,
        depthWrite: false,
        opacity,
      }),
    );
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale * 0.45, 1);
    sprite.userData.speed = speed;
    group.add(sprite);
  }
  return group;
}

export function buildClouds(tex: THREE.Texture): {
  group: THREE.Group;
  dispose: () => void;
} {
  const group = buildSpriteBand(tex, CLOUDS, 0xffffff);
  return { group, dispose: () => disposeGroup(group) };
}

export function buildMist(tex: THREE.Texture): {
  group: THREE.Group;
  dispose: () => void;
} {
  const group = buildSpriteBand(tex, MIST, 0xdfe8f0);
  return { group, dispose: () => disposeGroup(group) };
}

// Dérive lente en X avec bouclage aux bords du terrain.
export function driftSprites(group: THREE.Group, dt: number) {
  for (const c of group.children) {
    c.position.x += (c.userData.speed as number) * dt;
    if (c.position.x > 175) c.position.x = -175;
  }
}

function disposeGroup(group: THREE.Group) {
  for (const c of group.children) {
    const sprite = c as THREE.Sprite;
    sprite.material.dispose();
  }
}
```

- [ ] **Step 1.3 : Brancher dans `Journey3D.tsx`**

En tête de fichier, ajouter les imports :

```ts
import { createSunGlowTexture, createCloudTexture } from './journey3d/textures';
import { buildSky, buildClouds, buildMist, driftSprites } from './journey3d/atmosphere';
```

Remplacer tout le bloc « Sky dome » (de `// Sky dome — clear blue daylight gradient` jusqu'à `scene.add(sky);` inclus, lignes ~217-254) par :

```ts
    // Position du soleil (disque visuel, lumière et halo du ciel alignés)
    const SUN_POS = new THREE.Vector3(120, 180, -160);
    const skyObj = buildSky(SUN_POS);
    scene.add(skyObj.mesh);
```

Remplacer `sunMesh.position.set(120, 180, -160);` par `sunMesh.position.copy(SUN_POS);`.

Après le bloc des lumières (`scene.add(new THREE.AmbientLight(...));`), ajouter :

```ts
    // Nuages d'altitude + brume de vallée
    const cloudTex = createCloudTexture();
    const clouds = buildClouds(cloudTex);
    const mist = buildMist(cloudTex);
    scene.add(clouds.group);
    scene.add(mist.group);
```

Dans `animate()` (juste avant `updateCamera(p, p2);`), ajouter la dérive — il faut un delta temps. Au-dessus de `const animate = () => {`, déclarer :

```ts
      let lastTime = performance.now();
```

et dans `animate()` après le calcul de `seg2P` :

```ts
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;
        driftSprites(clouds.group, dt);
        driftSprites(mist.group, dt * 0.5);
```

Dans le cleanup (avant `glowMat.dispose();`), ajouter :

```ts
      clouds.dispose();
      mist.dispose();
      cloudTex.dispose();
      skyObj.dispose();
```

Supprimer du cleanup les lignes `skyMat.dispose();` et `skyGeom.dispose();` (remplacées par `skyObj.dispose()`), et supprimer la fonction `createSunGlowTexture` en bas de `Journey3D.tsx` (elle vit désormais dans `textures.ts`).

- [ ] **Step 1.4 : Vérifier**

Run: `npm run build` — Expected: succès sans erreur TS.
Run: `npm run lint` — Expected: 0 erreur.

- [ ] **Step 1.5 : Commit**

```bash
git add src/components/journey3d/textures.ts src/components/journey3d/atmosphere.ts src/components/Journey3D.tsx
git commit -m "feat(journey): sky halo + clouds + valley mist (atmosphere modules)"
```

---

## Tâche 2 : Terrain 6×6 à résolution variable (corridor caméra/tracé)

**Files:**
- Modify: `src/components/Journey3D.tsx` (constantes lignes ~24-26, boucle chunks lignes ~356-398)

- [ ] **Step 2.1 : Remplacer les constantes**

Remplacer :

```ts
const ELEVATION_SCALE = 0.016;
const TERRAIN_SEGMENTS = 320;
const TERRAIN_CHUNKS = 4; // 4x4 = 16 chunks for frustum culling
```

par :

```ts
const ELEVATION_SCALE = 0.016;
const TERRAIN_CHUNKS = 6; // grille 6×6 de chunks frustum-cullés
const HI_SEGMENTS = 128; // chunks proches du corridor caméra/tracé
const LO_SEGMENTS = 48; // chunks lointains
const CORRIDOR_RADIUS = 55;
// Points 2D (x,z) du corridor : waypoints du tracé + trajectoire caméra en vallée.
const CORRIDOR_2D: [number, number][] = [
  [-5, -3], [-4, 2], [-3, 6], [-9, 11], [-15, 15], [-22, 20], [-26, 30], [-30, 42],
  [1, 11], [4, 14], [0, 22], [-5, 32], [-11, 42],
  [-5, -18], [-4, -10], [-3, -2],
];
```

- [ ] **Step 2.2 : Boucle chunks à résolution variable**

Dans `init()`, remplacer la ligne `const chunkSegments = Math.floor(TERRAIN_SEGMENTS / TERRAIN_CHUNKS);` (avant la boucle) — elle disparaît — et remplacer le début de la double boucle :

```ts
      for (let cx = 0; cx < TERRAIN_CHUNKS; cx++) {
        for (let cz = 0; cz < TERRAIN_CHUNKS; cz++) {
          const cgeo = new THREE.PlaneGeometry(chunkSizeX, chunkSizeZ, chunkSegments, chunkSegments);
```

par :

```ts
      for (let cx = 0; cx < TERRAIN_CHUNKS; cx++) {
        for (let cz = 0; cz < TERRAIN_CHUNKS; cz++) {
          // Résolution selon la distance du centre du chunk au corridor
          const centerX = -TERRAIN_X_HALF + chunkSizeX * (cx + 0.5);
          const centerZ = TERRAIN_Z_START + chunkSizeZ * (cz + 0.5);
          let minD = Infinity;
          for (const [px, pz] of CORRIDOR_2D) {
            const d = Math.hypot(centerX - px, centerZ - pz);
            if (d < minD) minD = d;
          }
          const chunkSegments = minD < CORRIDOR_RADIUS ? HI_SEGMENTS : LO_SEGMENTS;
          const cgeo = new THREE.PlaneGeometry(chunkSizeX, chunkSizeZ, chunkSegments, chunkSegments);
```

Le reste de la boucle utilise déjà `chunkSegments` (variable locale `cN`, `localU`, `localV`) et `cmesh.position` utilise `chunkSizeX * (cx + 0.5)` — remplacer ces deux lignes de positionnement par les valeurs déjà calculées :

```ts
          cmesh.position.x = centerX;
          cmesh.position.z = centerZ;
```

- [ ] **Step 2.3 : Vérifier**

Run: `npm run build` puis `npm run lint` — Expected: succès. Lancer `npm run dev` et vérifier visuellement que le terrain s'affiche sans trous ni seams grossiers entre chunks.

- [ ] **Step 2.4 : Commit**

```bash
git add src/components/Journey3D.tsx
git commit -m "feat(journey): variable-resolution 6x6 terrain chunks along camera corridor"
```

---

## Tâche 3 : Shader terrain — neige, détail rapproché, perspective aérienne

**Files:**
- Create: `src/components/journey3d/terrainShader.ts`
- Modify: `src/components/Journey3D.tsx` (matériau terrain ligne ~361, `scene.fog` ligne ~213, shader des tubes lignes ~484-519)

- [ ] **Step 3.1 : Créer `src/components/journey3d/terrainShader.ts`**

```ts
import * as THREE from 'three';

// Injecte dans le MeshStandardMaterial du terrain :
//  - un détail procédural en vue rapprochée (le satellite devient flou de près),
//  - de la neige selon altitude (ligne ~2400 m ≈ y 38.4) et pente,
//  - une perspective aérienne (brume distance + altitude, dense en vallée).
// Les chunks ne sont que translatés : la normale objet == la normale monde.
export function applyTerrainShader(mat: THREE.MeshStandardMaterial) {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vTerrWorldPos;
        varying vec3 vTerrNormal;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vTerrWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vTerrNormal = normal;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vTerrWorldPos;
        varying vec3 vTerrNormal;
        float terrHash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }
        float terrNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = terrHash(i);
          float b = terrHash(i + vec2(1.0, 0.0));
          float c = terrHash(i + vec2(0.0, 1.0));
          float d = terrHash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        float terrFbm(vec2 p) {
          return terrNoise(p) * 0.5 + terrNoise(p * 2.13) * 0.25 + terrNoise(p * 4.31) * 0.125;
        }`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float camDist = length(vTerrWorldPos - cameraPosition);
        // Détail procédural en vue rapprochée
        float detailAmt = 1.0 - smoothstep(15.0, 90.0, camDist);
        if (detailAmt > 0.001) {
          float dNoise = terrFbm(vTerrWorldPos.xz * 3.0);
          diffuseColor.rgb *= mix(1.0, 0.80 + 0.40 * dNoise, detailAmt);
        }
        // Neige : altitude bruitée × pente (les faces raides restent rocheuses)
        vec3 terrWN = normalize(vTerrNormal);
        float snowAlt = smoothstep(35.0, 43.0, vTerrWorldPos.y + (terrFbm(vTerrWorldPos.xz * 0.35) - 0.5) * 7.0);
        float snowSlope = smoothstep(0.5, 0.78, terrWN.y);
        float snow = snowAlt * snowSlope;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.955, 1.0), snow * 0.85);
        // Scintillement de la neige, visible seulement de près
        float sparkle = step(0.985, terrNoise(vTerrWorldPos.xz * 60.0)) * snow * detailAmt;
        diffuseColor.rgb += sparkle * 0.35;`,
      )
      .replace(
        '#include <fog_fragment>',
        `// Perspective aérienne : brume distance + altitude
        float fogDist = length(vTerrWorldPos - cameraPosition);
        float valleyMix = 1.0 - smoothstep(18.0, 60.0, vTerrWorldPos.y);
        float fogDensity = mix(0.0026, 0.0055, valleyMix);
        float fogF = 1.0 - exp(-fogDist * fogDensity);
        vec3 fogCol = mix(vec3(0.76, 0.83, 0.90), vec3(0.60, 0.71, 0.85), smoothstep(40.0, 240.0, fogDist));
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogCol, fogF * 0.92);`,
      );
  };
}
```

- [ ] **Step 3.2 : Appliquer au terrain et retirer le FogExp2 global**

Dans `Journey3D.tsx` :

Importer : `import { applyTerrainShader } from './journey3d/terrainShader';`

Supprimer la ligne `scene.fog = new THREE.FogExp2(0xc6d6e3, 0.0042);` (la perspective aérienne du shader terrain la remplace).

Après la création de `sharedTerrainMat`, ajouter :

```ts
      applyTerrainShader(sharedTerrainMat);
```

- [ ] **Step 3.3 : Brume de distance sur le tracé**

Sans le FogExp2 global, les tubes lointains trancheraient sur le terrain brumeux. Dans `buildPathMesh`, remplacer le `vertexShader` du tube par :

```glsl
            varying float vT;
            varying vec3 vNormal;
            varying float vDist;
            void main() {
              vT = uv.x;
              vNormal = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vDist = -mv.z;
              gl_Position = projectionMatrix * mv;
            }
```

et dans le `fragmentShader` du tube, remplacer les deux dernières lignes du `main` :

```glsl
              col += uColorHot * lead * 0.8;
              gl_FragColor = vec4(col, 1.0);
```

par :

```glsl
              col += uColorHot * lead * 0.8;
              float fogF = 1.0 - exp(-vDist * 0.0035);
              col = mix(col, vec3(0.70, 0.78, 0.88), fogF * 0.6);
              gl_FragColor = vec4(col, 1.0);
```

- [ ] **Step 3.4 : Vérifier**

Run: `npm run build` puis `npm run lint` — Expected: succès.
`npm run dev` : sommets enneigés au-dessus de ~2400 m, crêtes lointaines bleutées, pas d'artefacts noirs (signe d'erreur de compilation shader — vérifier la console navigateur).

- [ ] **Step 3.5 : Commit**

```bash
git add src/components/journey3d/terrainShader.ts src/components/Journey3D.tsx
git commit -m "feat(journey): terrain shader — procedural snow, close-range detail, aerial perspective"
```

---

## Tâche 4 : Ombres du soleil (statiques, rendues une fois)

**Files:**
- Modify: `src/components/Journey3D.tsx` (setup renderer lignes ~200-209, lumières lignes ~278-284, boucle chunks, fin de `init()`)

- [ ] **Step 4.1 : Activer la shadow map statique**

Après `renderer.outputColorSpace = THREE.SRGBColorSpace;`, ajouter :

```ts
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false; // scène statique : rendu une seule fois
```

- [ ] **Step 4.2 : Configurer la lumière directionnelle**

Remplacer :

```ts
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.8);
    sunLight.position.set(80, 120, -60);
    scene.add(sunLight);
```

par :

```ts
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.8);
    sunLight.position.copy(SUN_POS); // aligné avec le disque solaire visible
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(4096, 4096);
    sunLight.shadow.camera.left = -210;
    sunLight.shadow.camera.right = 210;
    sunLight.shadow.camera.top = 230;
    sunLight.shadow.camera.bottom = -230;
    sunLight.shadow.camera.near = 20;
    sunLight.shadow.camera.far = 800;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 1.5;
    sunLight.target.position.set(0, 20, 50);
    scene.add(sunLight);
    scene.add(sunLight.target);
```

(`SUN_POS` est déclaré en Tâche 1 avant le ciel — la lumière doit être créée après lui.)

- [ ] **Step 4.3 : Chunks cast/receive + rendu unique**

Dans la boucle chunks, après `cmesh.frustumCulled = true;`, ajouter :

```ts
          cmesh.castShadow = true;
          cmesh.receiveShadow = true;
```

À la fin de `init()`, juste avant `renderer.render(scene, camera);` (le rendu forcé), ajouter :

```ts
      renderer.shadowMap.needsUpdate = true; // un seul rendu de la shadow map
```

- [ ] **Step 4.4 : Compenser l'assombrissement**

Avec les ombres, les vallées deviennent plus sombres. Remplacer :

```ts
    const hemi = new THREE.HemisphereLight(0xc0d4e6, 0x6b6359, 0.7);
```

par :

```ts
    const hemi = new THREE.HemisphereLight(0xc0d4e6, 0x6b6359, 0.85);
```

- [ ] **Step 4.5 : Vérifier**

Run: `npm run build` puis `npm run lint` — Expected: succès.
`npm run dev` : ombres portées visibles sur les faces opposées au soleil, pas d'acné d'ombre (stries), pas de peter-panning grossier. FPS inchangé après le premier rendu.

- [ ] **Step 4.6 : Commit**

```bash
git add src/components/Journey3D.tsx
git commit -m "feat(journey): static sun shadows (single shadow map render)"
```

---

## Tâche 5 : Caméra cinématique en 3 actes (splines position + regard)

**Files:**
- Modify: `src/components/Journey3D.tsx` (bloc caméra lignes ~609-661 : constantes `CAM_*`, `camPos0/1`, `camLook0/1`, `updateCamera`)

- [ ] **Step 5.1 : Remplacer le rig caméra**

Dans `init()`, remplacer tout le bloc depuis `// "Face-the-mountain" camera: ...` et les déclarations `CAM_CLEARANCE`, `CAM_MIN_Y_MAIN`, `camPos0`, `camPos1`, `camLook0`, `camLook1` (garder `camPosPost`, `camLookPost`, `targetPos`, `targetLook`, `smoothPos`, `smoothLook`, `smoothInit`) par :

```ts
      // Rig caméra cinématique — 3 actes pilotés par p :
      //   Acte 1 (p 0→~0.3)   : au ras de la vallée, derrière le départ, le massif domine
      //   Acte 2 (p ~0.3→0.65): crane shot — élévation + recul au moment du fork
      //   Acte 3 (p 0.65→1)   : vue d'ensemble face au massif (labels lisibles)
      const groundAt = (x: number, z: number) => sampleHeight(x, z);
      const camKeys = [
        new THREE.Vector3(-5, groundAt(-5, -18) + 5, -18),
        new THREE.Vector3(-4.2, groundAt(-4.2, -9) + 6, -9),
        new THREE.Vector3(-3.5, groundAt(-3.5, -2) + 9, -2),
        new THREE.Vector3(-1, 50, -20),
        new THREE.Vector3(-2, 74, -42),
        new THREE.Vector3(-2, 88, -55),
      ];
      const lookKeys = [
        new THREE.Vector3(-4, groundAt(-4, 4) + 7, 4),
        new THREE.Vector3(-3.5, groundAt(-3.5, 8) + 9, 8),
        new THREE.Vector3(-4, groundAt(-4, 18) + 14, 18),
        new THREE.Vector3(-9, 32, 24),
        new THREE.Vector3(-15, 26, 29),
        new THREE.Vector3(-18, 22, 32),
      ];
      const camCurve = new THREE.CatmullRomCurve3(camKeys, false, 'catmullrom', 0.5);
      const lookCurve = new THREE.CatmullRomCurve3(lookKeys, false, 'catmullrom', 0.5);
      // Post-completion ("there's still more to climb") — conservé
      const camPosPost = new THREE.Vector3(-3.5, 82, -41);
      const camLookPost = new THREE.Vector3(-12, 50, 55);
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3();
      const smoothPos = new THREE.Vector3();
      const smoothLook = new THREE.Vector3();
      let smoothInit = false;

      function updateCamera(p: number, p2: number) {
        const t = smoothstep(0, 1, p);
        camCurve.getPoint(t, targetPos);
        lookCurve.getPoint(t, targetLook);
        // Sway désactivé au ras du sol (acte 1), présent en hauteur
        const sway = Math.sin(p * Math.PI * 1.4) * 6 * smoothstep(0.35, 0.7, p);
        targetPos.x += sway;

        if (p2 > 0) {
          const t2 = smoothstep(0, 1, p2);
          targetPos.lerp(camPosPost, t2);
          targetLook.lerp(camLookPost, t2);
        }

        // Anti-clipping : clearance faible au sol, large en vue haute
        const clearance = 3 + 22 * smoothstep(0.25, 0.6, p);
        const groundY = sampleHeight(targetPos.x, targetPos.z);
        const minY = groundY + clearance;
        if (targetPos.y < minY) targetPos.y = minY;

        // FOV large dans la vallée (immersion), resserré en vue d'ensemble
        const fov = 62 - 14 * smoothstep(0.15, 0.6, p);
        if (Math.abs(camera.fov - fov) > 0.01) {
          camera.fov = fov;
          camera.updateProjectionMatrix();
        }

        if (!smoothInit) {
          smoothPos.copy(targetPos);
          smoothLook.copy(targetLook);
          smoothInit = true;
        } else {
          smoothPos.lerp(targetPos, 0.06);
          smoothLook.lerp(targetLook, 0.06);
        }
        camera.position.copy(smoothPos);
        camera.lookAt(smoothLook);
      }
```

- [ ] **Step 5.2 : Vérifier**

Run: `npm run build` puis `npm run lint` — Expected: succès (attention aux variables `CAM_CLEARANCE`/`CAM_MIN_Y_MAIN` devenues inutilisées — elles doivent être supprimées, `noUnusedLocals` est actif).
`npm run dev` : scroller toute la section — la caméra part au ras de la vallée, s'élève au fork, finit en vue d'ensemble, ne traverse jamais le terrain.

- [ ] **Step 5.3 : Commit**

```bash
git add src/components/Journey3D.tsx
git commit -m "feat(journey): cinematic 3-act camera rig (valley flythrough, crane reveal, overview)"
```

---

## Tâche 6 : Vérification visuelle complète + tuning

**Files:**
- Modify (tuning éventuel): `src/components/Journey3D.tsx`, `src/components/journey3d/*.ts`

- [ ] **Step 6.1 : Lancer le dev server et capturer les paliers**

Run: `npm run dev` (background). Avec les outils Playwright MCP : naviguer sur `http://localhost:5173`, puis pour chaque fraction F de `[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9]` exécuter :

```js
const s = document.getElementById('journey');
const total = s.offsetHeight - window.innerHeight;
window.scrollTo(0, s.offsetTop + total * F);
```

attendre ~1.5 s (lissage caméra), prendre un screenshot, et vérifier la console (0 erreur WebGL/shader).

- [ ] **Step 6.2 : Checklist visuelle (critères du spec)**

- [ ] La caméra ne traverse jamais le terrain (aucun frame avec géométrie coupée).
- [ ] Acte 1 : terrain proche ni flou ni anguleux ; tracé lisible devant la caméra.
- [ ] Acte 2 : les deux branches visibles pendant l'élévation.
- [ ] Acte 3 : les 5 labels lisibles, non superposés.
- [ ] Neige sur les sommets, crêtes lointaines bleutées, nuages visibles, halo solaire.
- [ ] Ombres portées cohérentes avec la position du soleil.
- [ ] Intro/outro overlays et sidebar narrative fonctionnels (inchangés).

- [ ] **Step 6.3 : Mesurer le framerate**

Via Playwright `browser_evaluate`, au milieu de la section (F = 0.45) :

```js
await new Promise((resolve) => {
  let frames = 0;
  const t0 = performance.now();
  function tick() {
    frames++;
    if (performance.now() - t0 < 2000) requestAnimationFrame(tick);
    else resolve(frames / 2);
  }
  requestAnimationFrame(tick);
});
```

Expected: ≥ 30 fps (machine de dev). Si < 30 : réduire `HI_SEGMENTS` à 96 et/ou shadow map à 2048, re-mesurer.

- [ ] **Step 6.4 : Tuning final**

Ajuster si nécessaire (valeurs concernées et bornes raisonnables) :
- Hauteur caméra acte 1 : `+5` → entre `+4` et `+8` si le sol clippe ou si le tracé est masqué.
- Ligne de neige : `smoothstep(35.0, 43.0, …)` → ±3 si la neige mange la vallée ou disparaît.
- Densité brume : `0.0026/0.0055` → ±30 % selon lisibilité des crêtes.
- Opacité nuages : ±0.1.

- [ ] **Step 6.5 : Build + lint finals**

Run: `npm run build` puis `npm run lint` — Expected: succès.

- [ ] **Step 6.6 : Commit final**

```bash
git add -A src/components docs/superpowers
git commit -m "feat(journey): immersive ascension — visual tuning pass"
```

---

## Auto-revue (faite à l'écriture du plan)

- **Couverture spec** : caméra 3 actes (T5), neige/détail/perspective aérienne (T3), résolution variable (T2), ombres statiques (T4), ciel/halo/nuages/brume (T1), critères de succès (T6). Tracé : fog ajouté (T3.3), reste inchangé. Hors périmètre respecté.
- **Écart au spec assumé** : HI_SEGMENTS 128 au lieu de ~160 (budget vertices, noté en tête), grille 6×6 conforme.
- **Cohérence types** : `SUN_POS` créé en T1, utilisé en T4 ; `driftSprites` défini en T1, appelé en T1.3 ; `applyTerrainShader` défini en T3.1, appelé en T3.2 ; `chunkSegments` devient local par chunk en T2 et `cN` en dépend déjà.
