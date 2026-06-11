import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Journey2D from './Journey';
import { createSunGlowTexture, createCloudTexture } from './journey3d/textures';
import { buildSky, buildClouds, buildMist, driftSprites } from './journey3d/atmosphere';
import { applyTerrainShader } from './journey3d/terrainShader';

// Tuiles bakées en 2 atlas (heightmap-atlas.webp + satellite-atlas.webp).
// Source : 24 colonnes (E/W) × 17 rangées (N/S) à 256 px/tuile, z=14, x ∈ [8493..8516],
// y ∈ [5829..5845]. Les 7 rangées les plus au nord (y ∈ [5822..5828]) ont été supprimées
// car jamais visibles depuis la trajectoire caméra. Régénération via scripts/bake-terrain-atlases.mjs.
const TILES_X = 24;
const TILES_Y = 17;
const TILE_SIZE = 256;
const HEIGHTMAP_W = TILE_SIZE * TILES_X; // 6144 px
const HEIGHTMAP_H = TILE_SIZE * TILES_Y; // 4352 px

// Original world span (avant trim) : x ∈ [-160, 160], z ∈ [-160, 160], 24 tuiles par axe.
// Maintenant le terrain ne couvre plus que x ∈ [-160, 160], z ∈ [Z_NORTH, 160].
// Z_NORTH = -160 + 7 * (320/24) ≈ -66.67 (offset des 7 rangées supprimées)
const TERRAIN_X_HALF = 160;
const TERRAIN_Z_END = 160;
const TERRAIN_Z_START = -160 + 7 * (320 / 24); // ≈ -66.67
const TERRAIN_X = TERRAIN_X_HALF * 2; // 320
const TERRAIN_Z = TERRAIN_Z_END - TERRAIN_Z_START; // ≈ 226.67

const ELEVATION_SCALE = 0.016;
const TERRAIN_CHUNKS = 6; // grille 6×6 de chunks frustum-cullés
const HI_SEGMENTS = 128; // chunks proches du corridor caméra/tracé
const LO_SEGMENTS = 48; // chunks lointains
const CORRIDOR_RADIUS = 55;
// Points 2D (x,z) du corridor : waypoints du tracé + trajectoire caméra en vallée.
const CORRIDOR_2D: [number, number][] = [
  [-5, -3], [-4, 2], [-3, 6], [-9, 11], [-15, 15], [-22, 20], [-26, 30], [-30, 42],
  [1, 11], [4, 14], [0, 22], [-5, 32], [-11, 42],
  [10, -24], [4, -14], [-1, -5],
];

type StopId = 'licence' | 'bachelor' | 'cap' | 'epitech' | 'spayr';

type Stop = {
  id: StopId;
  pos: [number, number];
  year: string;
  title: string;
  org: string;
  type: 'edu' | 'work';
  typeLabel: string;
  desc: string;
  ongoing?: boolean;
  side: 'left' | 'right';
};

// World coords via Mercator inverse. Layout: Y-fork going SOUTH from Chamonix.
// LEFT école: Tramway du Mont Blanc (Bellevue → Nid d'Aigle, sud-ouest)
// RIGHT alternance: Téléphérique du Midi (Plan de l'Aiguille → Grands Mulets, sud-est)
// Tous les endpoints sont entre 1800-3050m (37-63% du summit Mont Blanc à 4810m).
const STOPS: Stop[] = [
  {
    id: 'licence',
    pos: [-3, 6], // déjà partway up — la licence est une vraie étape d'ascension
    year: '2021 — 2024',
    title: 'Université',
    org: 'Licence Informatique',
    type: 'edu',
    typeLabel: 'Formation · fondations',
    desc: "Algorithmique, structures de données, systèmes. Les fondations sur lesquelles je m'appuie encore.",
    side: 'left',
  },
  {
    id: 'bachelor',
    pos: [-22, 20], // Les Houches – Prarion (~1850m), à mi-chemin Chamonix → Tramway
    year: '2024 — 2025',
    title: 'My-digital-school',
    org: 'Bachelor Développeur Web',
    type: 'edu',
    typeLabel: 'Formation',
    desc: "Spécialisation full-stack. L'année où j'ai commencé à me sentir développeur.",
    side: 'right',
  },
  {
    id: 'cap',
    pos: [4, 14], // Plan de l'Aiguille (Téléphérique du Midi mid, 2317m, 48% summit)
    year: '2024 — 2025',
    title: 'Cap Achat',
    org: 'Alternant développeur web',
    type: 'work',
    typeLabel: 'Expérience',
    desc: 'Première alternance. Le vrai rythme du métier — lire, faire évoluer, livrer.',
    side: 'right',
  },
  {
    id: 'epitech',
    pos: [-30, 42], // Crête / Nid d'Aigle (~2372m), au-dessus de Prarion
    year: '2025 — 2027',
    title: 'Epitech',
    org: 'Master MSc Pro',
    type: 'edu',
    typeLabel: 'Formation',
    desc: 'Master en cours. Systèmes, architecture, projets à plusieurs.',
    ongoing: true,
    side: 'right',
  },
  {
    id: 'spayr',
    pos: [-11, 42], // Refuge des Grands Mulets (3051m, 63% summit) — sur la voie du Goûter
    year: '2025 — 2027',
    title: 'Spayr',
    org: 'Alternant full-stack',
    type: 'work',
    typeLabel: 'Expérience',
    desc: "Développement produit en startup. Plus d'autonomie, plus d'impact direct.",
    ongoing: true,
    side: 'right',
  },
];


function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadTerrainAssets(
  onProgress?: (loaded: number, total: number) => void,
): Promise<{
  heights: Float32Array;
  satTex: THREE.Texture;
}> {
  // Atlas pré-bakés : 2 fetches au lieu de 816.
  // Heightmap : 6144×4352 lossless (Terrarium decoding intact).
  // Satellite : 3072×2176 lossy q80 (résolution moitié — invisible aux distances caméra).
  const total = 2;
  let done = 0;
  const tick = () => {
    done++;
    onProgress?.(done, total);
  };

  const [heightImg, satImg] = await Promise.all([
    loadImage('/terrain/heightmap-atlas.webp').then((img) => {
      tick();
      return img;
    }),
    loadImage('/terrain/satellite-atlas.webp').then((img) => {
      tick();
      return img;
    }),
  ]);

  // Décodage heightmap : canvas full-res → ImageData → Float32Array de hauteurs
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = HEIGHTMAP_W;
  heightCanvas.height = HEIGHTMAP_H;
  const hctx = heightCanvas.getContext('2d', { willReadFrequently: true })!;
  hctx.drawImage(heightImg, 0, 0, HEIGHTMAP_W, HEIGHTMAP_H);
  const data = hctx.getImageData(0, 0, HEIGHTMAP_W, HEIGHTMAP_H).data;
  const heights = new Float32Array(HEIGHTMAP_W * HEIGHTMAP_H);
  for (let i = 0; i < heights.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    heights[i] = r * 256 + g + b / 256 - 32768;
  }

  // Texture satellite directement depuis l'image (pas de canvas intermédiaire)
  const satTex = new THREE.Texture(satImg);
  satTex.needsUpdate = true;
  satTex.colorSpace = THREE.SRGBColorSpace;
  satTex.anisotropy = 16;
  satTex.minFilter = THREE.LinearMipmapLinearFilter;
  satTex.magFilter = THREE.LinearFilter;
  satTex.generateMipmaps = true;
  return { heights, satTex };
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function Journey3DScene() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const introOverlayRef = useRef<HTMLDivElement | null>(null);
  const outroOverlayRef = useRef<HTMLDivElement | null>(null);
  const narrationContainerRef = useRef<HTMLDivElement | null>(null);
  const labelsRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [expandedStop, setExpandedStop] = useState<StopId | null>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const canvasEl = canvasRef.current;
    const labelsEl = labelsRef.current;
    if (!sectionEl || !canvasEl || !labelsEl) return;
    const section: HTMLElement = sectionEl;
    const canvas: HTMLCanvasElement = canvasEl;

    let disposed = false;
    let raf = 0;
    let sectionVisible = true;
    let animateFn: (() => void) | null = null;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false; // scène statique : rendu une seule fois

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc8dbe8);
    // Pas de FogExp2 global : la perspective aérienne vit dans le shader terrain.

    const camera = new THREE.PerspectiveCamera(48, 1, 0.5, 800);

    // Position du soleil (disque visuel, lumière et halo du ciel alignés)
    const SUN_POS = new THREE.Vector3(120, 180, -160);
    const skyObj = buildSky(SUN_POS);
    scene.add(skyObj.mesh);

    // Sun visual disk — bright white-ish high in sky
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff8e8, fog: false });
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), sunMat);
    sunMesh.position.copy(SUN_POS);
    scene.add(sunMesh);

    // Subtle bloom around the sun
    const glowTex = createSunGlowTexture();
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xfff4d8,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      opacity: 0.5,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.position.copy(sunMesh.position);
    glow.scale.set(80, 80, 1);
    scene.add(glow);

    // Realistic daylight: bright white-ish sun + sky-blue ambient
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
    const hemi = new THREE.HemisphereLight(0xc0d4e6, 0x6b6359, 0.85);
    scene.add(hemi);
    scene.add(new THREE.AmbientLight(0xffffff, 0.18));

    // Nuages d'altitude + brume de vallée
    const cloudTex = createCloudTexture();
    const clouds = buildClouds(cloudTex);
    const mist = buildMist(cloudTex);
    scene.add(clouds.group);
    scene.add(mist.group);

    // Loading state — keep these alive for cleanup
    let terrain: THREE.Group | THREE.Mesh | null = null;
    let sharedTerrainMatRef: THREE.Material | null = null;
    const pathMeshes: THREE.Mesh[] = [];
    const pathShaderMats: THREE.ShaderMaterial[] = [];
    const stopGroups = new Map<StopId, THREE.Group>();
    const labelEls = new Map<StopId, HTMLElement>();
    STOPS.forEach((s) => {
      const el = labelsEl.querySelector<HTMLElement>(`[data-stop="${s.id}"]`);
      if (el) labelEls.set(s.id, el);
    });

    const tmpVec = new THREE.Vector3();
    let scrollProgressTarget = 0;
    let scrollProgress = 0;

    function setRendererSize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function updateScrollProgress() {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      scrollProgressTarget = Math.max(0, Math.min(1, scrolled / total));

      // Cinematic intro/outro overlays — driven directly by section progress
      const sp = scrollProgressTarget;
      // Intro: pleine opacité 0 → 0.10, fade out 0.10 → 0.22
      const introOpacity = 1 - smoothstep(0.10, 0.22, sp);
      // Outro: invisible jusqu'à 0.82, fade in 0.82 → 0.92
      const outroOpacity = smoothstep(0.82, 0.92, sp);
      if (introOverlayRef.current) {
        introOverlayRef.current.style.opacity = String(introOpacity);
        introOverlayRef.current.style.pointerEvents = introOpacity > 0.05 ? 'auto' : 'none';
      }
      if (outroOverlayRef.current) {
        outroOverlayRef.current.style.opacity = String(outroOpacity);
        outroOverlayRef.current.style.pointerEvents = outroOpacity > 0.05 ? 'auto' : 'none';
      }

      // Sidebar narrative (3 paliers persistants à droite)
      // - container fade in 0.16 → 0.24, fade out 0.78 → 0.86
      // - phase active déterminée par seuils 0.45 / 0.65
      if (narrationContainerRef.current) {
        const narrOp = Math.min(
          smoothstep(0.16, 0.24, sp),
          1 - smoothstep(0.78, 0.86, sp),
        );
        narrationContainerRef.current.style.opacity = String(narrOp);
        const active = sp < 0.45 ? '1' : sp < 0.65 ? '2' : '3';
        narrationContainerRef.current.dataset.active = active;
      }
    }

    function init(heights: Float32Array, satTex: THREE.Texture) {
      // Helper: sample height at world (x, z). Le terrain ne couvre que x∈[-160,160], z∈[Z_NORTH, 160].
      const sampleHeight = (x: number, z: number) => {
        const u = (x + TERRAIN_X_HALF) / TERRAIN_X;
        const v = (z - TERRAIN_Z_START) / TERRAIN_Z;
        const cu = Math.max(0, Math.min(1, u));
        const cv = Math.max(0, Math.min(1, v));
        const hx = Math.min(HEIGHTMAP_W - 1, Math.floor(cu * (HEIGHTMAP_W - 1)));
        const hy = Math.min(HEIGHTMAP_H - 1, Math.floor(cv * (HEIGHTMAP_H - 1)));
        return Math.max(0, heights[hy * HEIGHTMAP_W + hx]) * ELEVATION_SCALE;
      };

      // Chunked terrain — each chunk is its own mesh so Three.js can frustum-cull them.
      // Shared material/texture; only geometry is per-chunk. Grille X×Z = TERRAIN_CHUNKS².
      const chunkSizeX = TERRAIN_X / TERRAIN_CHUNKS;
      const chunkSizeZ = TERRAIN_Z / TERRAIN_CHUNKS;
      const sharedTerrainMat = new THREE.MeshStandardMaterial({
        map: satTex,
        roughness: 0.96,
        metalness: 0,
      });
      applyTerrainShader(sharedTerrainMat);
      const terrainGroup = new THREE.Group();
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
          cgeo.rotateX(-Math.PI / 2);
          const cN = chunkSegments + 1;
          const cPos = cgeo.attributes.position as THREE.BufferAttribute;
          const cUV = cgeo.attributes.uv as THREE.BufferAttribute;
          for (let i = 0; i < cN; i++) {
            for (let j = 0; j < cN; j++) {
              const idx = i * cN + j;
              const localU = j / chunkSegments;
              const localV = i / chunkSegments;
              const globalU = (cx + localU) / TERRAIN_CHUNKS;
              const globalV = (cz + localV) / TERRAIN_CHUNKS;
              const hx = Math.min(HEIGHTMAP_W - 1, Math.floor(globalU * (HEIGHTMAP_W - 1)));
              const hy = Math.min(HEIGHTMAP_H - 1, Math.floor(globalV * (HEIGHTMAP_H - 1)));
              const elev = Math.max(0, heights[hy * HEIGHTMAP_W + hx]);
              cPos.setY(idx, elev * ELEVATION_SCALE);
              cUV.setXY(idx, globalU, 1 - globalV);
            }
          }
          cgeo.computeVertexNormals();
          const cmesh = new THREE.Mesh(cgeo, sharedTerrainMat);
          cmesh.position.x = centerX;
          cmesh.position.z = centerZ;
          cmesh.frustumCulled = true;
          cmesh.castShadow = true;
          cmesh.receiveShadow = true;
          terrainGroup.add(cmesh);
        }
      }
      scene.add(terrainGroup);
      terrain = terrainGroup;
      sharedTerrainMatRef = sharedTerrainMat;

      // Build paths — glued to terrain but Y locally smoothed (follows valleys, not bumps)
      const PATH_OFFSET = 0.3;
      const SMOOTH_WINDOW = 9; // ±9 samples = 19-wide window
      const buildPath = (points2D: [number, number][]) => {
        const pts2D = points2D.map(([x, z]) => new THREE.Vector3(x, 0, z));
        const xzCurve = new THREE.CatmullRomCurve3(pts2D, false, 'catmullrom', 0.5);
        const samples = 600;
        const raw: THREE.Vector3[] = [];
        for (let i = 0; i <= samples; i++) {
          const p = xzCurve.getPoint(i / samples);
          raw.push(new THREE.Vector3(p.x, sampleHeight(p.x, p.z), p.z));
        }
        // Sliding-window mean of Y to flatten high-frequency bumps.
        // Endpoints (and a small fade in/out) are anchored to actual terrain so
        // the path visibly starts/ends touching the ground at stops.
        const ANCHOR_FADE = 12;
        const smoothed: THREE.Vector3[] = [];
        for (let i = 0; i < raw.length; i++) {
          let sum = 0;
          let n = 0;
          for (let k = -SMOOTH_WINDOW; k <= SMOOTH_WINDOW; k++) {
            const idx = i + k;
            if (idx >= 0 && idx < raw.length) {
              sum += raw[idx].y;
              n++;
            }
          }
          const avg = sum / n;
          const local = raw[i].y;
          // Endpoint blend factor: 0 at extremes, 1 in the middle
          const distFromStart = i;
          const distFromEnd = raw.length - 1 - i;
          const closeness = Math.min(distFromStart, distFromEnd);
          const blend = Math.min(1, closeness / ANCHOR_FADE);
          // Blend smoothed avg → local terrain near endpoints
          const baseY = blend * Math.max(avg, local) + (1 - blend) * local;
          const y = baseY + PATH_OFFSET;
          smoothed.push(new THREE.Vector3(raw[i].x, y, raw[i].z));
        }
        return new THREE.CatmullRomCurve3(smoothed, false, 'catmullrom', 0.0);
      };

      // PRE-STEM — Gare de Chamonix → LICENCE (le fork démarre direct à la licence)
      const preCurve = buildPath([
        [-5, -3], // Gare de Chamonix-Mont-Blanc (départ)
        [-4.5, -1],
        [-4, 2],
        [-3, 6], // LICENCE = FORK
      ]);
      const FORK: [number, number] = [-3, 6];

      // LEFT segment 1 — LICENCE → BACHELOR (Les Bossons → Les Houches/Prarion)
      const left1Curve = buildPath([
        FORK,
        [-9, 11], // Les Bossons
        [-15, 15], // Les Pèlerins
        [-22, 20], // Prarion (BACHELOR, ~1850m)
      ]);

      // LEFT segment 2 — BACHELOR → EPITECH (montée vers crête)
      const left2Curve = buildPath([
        [-22, 20], // Prarion
        [-26, 30], // montée crête
        [-30, 42], // Nid d'Aigle (EPITECH, 2372m)
      ]);

      // RIGHT segment 1 — fork → CAP (Téléphérique du Midi vers Plan de l'Aiguille)
      const right1Curve = buildPath([
        FORK,
        [1, 11], // base téléphérique
        [3, 12], // ascension
        [4, 14], // Plan de l'Aiguille (CAP, 2317m)
      ]);

      // RIGHT segment 2 — CAP → SPAYR (sentier glacier des Bossons → Grands Mulets)
      const right2Curve = buildPath([
        [4, 14], // Plan de l'Aiguille
        [0, 22], // descente vers glacier
        [-5, 32], // glacier des Bossons
        [-11, 42], // Refuge des Grands Mulets (SPAYR, 3051m)
      ]);

      // Tracé en deux passes : cœur fin incandescent + halo additif doux.
      // Le shimmer (uTime) donne une impulsion lumineuse qui remonte la ligne.
      const buildPathMesh = (curve: THREE.CatmullRomCurve3, color: THREE.Color) => {
        const makeUniforms = () => ({
          uProgress: { value: 0 },
          uColorHot: { value: new THREE.Color(0xffe7c2) },
          uColorBase: { value: color },
          uTime: { value: 0 },
        });
        const vertexShader = `
          varying float vT;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          varying float vDist;
          void main() {
            vT = uv.x;
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mv.xyz);
            vDist = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `;
        const coreGeom = new THREE.TubeGeometry(curve, 160, 0.17, 8, false);
        const coreMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: makeUniforms(),
          vertexShader,
          fragmentShader: `
            varying float vT;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying float vDist;
            uniform float uProgress;
            uniform vec3 uColorHot;
            uniform vec3 uColorBase;
            void main() {
              if (vT > uProgress) discard;
              float lead = smoothstep(uProgress - 0.06, uProgress, vT);
              float ndv = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
              vec3 col = mix(uColorBase, uColorHot, lead * 0.9);
              col += vec3(1.0, 0.95, 0.85) * pow(ndv, 3.0) * 0.55; // axe incandescent
              float fogF = 1.0 - exp(-vDist * 0.0035);
              col = mix(col, vec3(0.70, 0.78, 0.88), fogF * 0.45);
              // Fondus doux en pointe et au départ (pas de cap cylindrique dur)
              float alpha = 1.0 - smoothstep(uProgress - 0.012, uProgress, vT);
              alpha *= smoothstep(0.0, 0.012, vT);
              gl_FragColor = vec4(col, alpha);
            }
          `,
        });
        const glowGeom = new THREE.TubeGeometry(curve, 160, 0.55, 8, false);
        const glowMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: makeUniforms(),
          vertexShader,
          fragmentShader: `
            varying float vT;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying float vDist;
            uniform float uProgress;
            uniform vec3 uColorHot;
            uniform vec3 uColorBase;
            uniform float uTime;
            void main() {
              if (vT > uProgress) discard;
              float lead = smoothstep(uProgress - 0.06, uProgress, vT);
              float ndv = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
              float glow = pow(ndv, 2.0);
              // Impulsion lumineuse subtile qui remonte le tracé
              float shimmer = 0.85 + 0.15 * sin(vT * 60.0 - uTime * 2.5);
              float fogF = 1.0 - exp(-vDist * 0.0035);
              float alpha = glow * (0.28 + lead * 0.5) * shimmer * (1.0 - fogF * 0.7);
              alpha *= 1.0 - smoothstep(uProgress - 0.01, uProgress, vT);
              alpha *= smoothstep(0.0, 0.012, vT);
              vec3 col = mix(uColorBase, uColorHot, lead);
              gl_FragColor = vec4(col, alpha);
            }
          `,
        });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.renderOrder = 5;
        const glowMesh = new THREE.Mesh(glowGeom, glowMat);
        glowMesh.renderOrder = 6;
        scene.add(coreMesh);
        scene.add(glowMesh);
        pathMeshes.push(coreMesh, glowMesh);
        pathShaderMats.push(coreMat, glowMat);
        const setProgress = (v: number) => {
          coreMat.uniforms.uProgress.value = v;
          glowMat.uniforms.uProgress.value = v;
        };
        return { setProgress, curve };
      };

      const pre = buildPathMesh(preCurve, new THREE.Color(0xff6a1f));
      const left1 = buildPathMesh(left1Curve, new THREE.Color(0xff8a40));
      const left2 = buildPathMesh(left2Curve, new THREE.Color(0xff8a40));
      const right1 = buildPathMesh(right1Curve, new THREE.Color(0xff8a40));
      const right2 = buildPathMesh(right2Curve, new THREE.Color(0xff8a40));
      // Aliases for camera tracking (the FIRST segments are what camera follows during early branch phase)
      const left = left1;
      const right = right1;

      // Stop markers
      STOPS.forEach((s) => {
        const group = new THREE.Group();
        const wx = s.pos[0];
        const wz = s.pos[1];
        const wy = sampleHeight(wx, wz);
        group.position.set(wx, wy, wz);

        // Vertical light beam
        const beamGeom = new THREE.CylinderGeometry(0.3, 0.06, 30, 12, 1, true);
        beamGeom.translate(0, 15, 0);
        const beamMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: false,
          uniforms: {
            uColor: {
              value: new THREE.Color(s.type === 'edu' ? 0xffd28a : 0xff7a40),
            },
            uOpacity: { value: 0 },
          },
          vertexShader: `
            varying float vY;
            void main() {
              vY = position.y;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying float vY;
            uniform vec3 uColor;
            uniform float uOpacity;
            void main() {
              float a = (1.0 - smoothstep(0.0, 30.0, vY)) * uOpacity;
              gl_FragColor = vec4(uColor, a * 0.65);
            }
          `,
        });
        const beam = new THREE.Mesh(beamGeom, beamMat);
        group.add(beam);

        // Core sphere
        const coreGeom = new THREE.SphereGeometry(0.7, 24, 24);
        const coreMat = new THREE.MeshBasicMaterial({
          color: s.type === 'edu' ? 0xffe0a0 : 0xff8a40,
          fog: false,
        });
        const core = new THREE.Mesh(coreGeom, coreMat);
        core.position.y = 0.7;
        group.add(core);

        // Sprite glow
        const glowSprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTex,
            color: s.type === 'edu' ? 0xffd28a : 0xff7a40,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: false,
            opacity: 0,
          }),
        );
        glowSprite.position.y = 0.7;
        glowSprite.scale.set(8, 8, 1);
        group.add(glowSprite);

        scene.add(group);
        stopGroups.set(s.id, group);
        group.userData = { beamMat, glowSprite, coreMat, baseY: 0.7 };
      });

      // Rig caméra cinématique — 3 actes pilotés par p :
      //   Acte 1 (p 0→~0.3)   : au ras de la vallée, derrière le départ, le massif domine
      //   Acte 2 (p ~0.3→0.65): crane shot — élévation + recul au moment du fork
      //   Acte 3 (p 0.65→1)   : vue d'ensemble face au massif (labels lisibles)
      const groundAt = (x: number, z: number) => sampleHeight(x, z);
      // L'acte 1 suit l'axe réel de la vallée de Chamonix (diagonale NE→SW :
      // fond à y≈17 de (15,-30) vers (-8,+5)) en s'approchant de la gare.
      const camKeys = [
        new THREE.Vector3(10, groundAt(10, -24) + 6, -24),
        new THREE.Vector3(4, groundAt(4, -14) + 7, -14),
        new THREE.Vector3(-1, groundAt(-1, -5) + 10, -5),
        new THREE.Vector3(0, 56, -30),
        new THREE.Vector3(-1, 76, -46),
        new THREE.Vector3(-2, 88, -55),
      ];
      // L'acte 1 regarde VERS LE HAUT (massif + ciel dans le cadre, tracé en bas) ;
      // les actes 2-3 redescendent progressivement vers le fork.
      const lookKeys = [
        new THREE.Vector3(-4, 24, 6),
        new THREE.Vector3(-4, 24, 8),
        new THREE.Vector3(-5, 23, 10),
        new THREE.Vector3(-9, 28, 24),
        new THREE.Vector3(-15, 25, 29),
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
      // Use left/right vars to keep TS happy if not referenced elsewhere
      void left; void right;

      // Initial frame so the canvas isn't black before scroll
      setRendererSize();
      updateScrollProgress();
      scrollProgress = scrollProgressTarget;

      const stopProgressMap: Record<StopId, number> = {
        licence: 0.3, // LICENCE = point de fork, atteinte à ~30%
        bachelor: 0.65, // BACHELOR & CAP atteints simultanément
        cap: 0.65,
        epitech: 0.95, // EPITECH & SPAYR atteints simultanément
        spayr: 0.95,
      };

      let lastTime = performance.now();
      const animate = () => {
        if (disposed || !sectionVisible) {
          raf = 0;
          return;
        }
        raf = requestAnimationFrame(animate);

        const now = performance.now();
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;
        driftSprites(clouds.group, dt);
        driftSprites(mist.group, dt * 0.5);

        // Smooth scroll progress (lower = smoother but more lag)
        scrollProgress += (scrollProgressTarget - scrollProgress) * 0.04;
        // Cinematic timeline:
        //   0    → 0.22  : intro overlay visible (chapitre title + contexte)
        //   0.22 → 0.70  : trace drawing (p)
        //   0.70 → 0.82  : post-completion camera move toward summit (p2)
        //   0.82 → 1.0   : outro overlay visible (texte poétique sur fond cinématique)
        const p = Math.max(0, Math.min(1, (scrollProgress - 0.22) / 0.48));
        const p2 = Math.max(0, Math.min(1, (scrollProgress - 0.70) / 0.12));

        // 3 phases (le fork est à LICENCE, pas de stem séparé) :
        //   pre   : 0    → 0.3   (vallée → LICENCE/fork)
        //   seg1  : 0.3  → 0.65  (LICENCE → BACHELOR & LICENCE → CAP en parallèle)
        //   seg2  : 0.65 → 0.95  (BACHELOR → EPITECH & CAP → SPAYR en parallèle)
        const preP = smoothstep(0, 0.3, p);
        const seg1P = smoothstep(0.3, 0.65, p);
        const seg2P = smoothstep(0.65, 0.95, p);
        pre.setProgress(preP);
        left1.setProgress(seg1P);
        right1.setProgress(seg1P);
        left2.setProgress(seg2P);
        right2.setProgress(seg2P);
        const shimmerT = now * 0.001;
        for (const m of pathShaderMats) m.uniforms.uTime.value = shimmerT;

        // Animate stops based on path progress reaching them
        STOPS.forEach((s) => {
          const grp = stopGroups.get(s.id)!;
          const target = stopProgressMap[s.id];
          const reveal = smoothstep(target - 0.04, target + 0.04, p);
          const ud = grp.userData as {
            beamMat: THREE.ShaderMaterial;
            glowSprite: THREE.Sprite;
            coreMat: THREE.MeshBasicMaterial;
          };
          // Fade des beams quand la caméra s'approche (sinon ils remplissent l'écran)
          const camD = camera.position.distanceTo(grp.position);
          const proxFade = smoothstep(14, 30, camD);
          ud.beamMat.uniforms.uOpacity.value = reveal * proxFade;
          ud.glowSprite.material.opacity = reveal * 0.9 * Math.max(proxFade, 0.35);
          const pulse = 0.92 + Math.sin(performance.now() * 0.002 + (s.id.charCodeAt(0))) * 0.08;
          grp.scale.setScalar(reveal * pulse);
        });

        updateCamera(p, p2);

        renderer.render(scene, camera);

        // Project labels each frame
        labelEls.forEach((el, id) => {
          const grp = stopGroups.get(id);
          if (!grp) return;
          tmpVec.copy(grp.position).add(new THREE.Vector3(0, 1.6, 0));
          tmpVec.project(camera);
          const visible =
            tmpVec.z > -1 && tmpVec.z < 1 && tmpVec.x > -1.2 && tmpVec.x < 1.2;
          if (!visible) {
            el.style.opacity = '0';
            return;
          }
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          const x = (tmpVec.x * 0.5 + 0.5) * w;
          const y = (-tmpVec.y * 0.5 + 0.5) * h;
          const stop = STOPS.find((s) => s.id === id)!;
          // 4-quadrant placement based on type+side so pills never overlap:
          // edu+left → upper-left, edu+right → upper-right
          // work+left → lower-left, work+right → lower-right
          const sideX = stop.side === 'left' ? -1 : 1;
          const verticalUp = stop.type === 'edu';
          const offsetX = sideX * 12;
          const offsetY = verticalUp ? -10 : 10;
          const xAlign = stop.side === 'left' ? '-100%' : '0%';
          const yAlign = verticalUp ? '-100%' : '0%';
          el.style.transform = `translate(${xAlign}, ${yAlign}) translate(${x + offsetX}px, ${y + offsetY}px)`;
          const target = stopProgressMap[id];
          const reveal = smoothstep(target - 0.06, target + 0.04, p);
          el.style.opacity = String(reveal * (visible ? 1 : 0));
          el.dataset.side = stop.side;
        });
      };
      animateFn = animate;
      raf = requestAnimationFrame(animate);

      // Force one render even if user hasn't scrolled
      renderer.shadowMap.needsUpdate = true; // un seul rendu de la shadow map
      renderer.render(scene, camera);
    }

    loadTerrainAssets((loadedCount, totalCount) => {
      if (disposed) return;
      setLoadProgress(loadedCount / totalCount);
    })
      .then(({ heights, satTex }) => {
        if (disposed) return;
        init(heights, satTex);
        setLoaded(true);
      })
      .catch((err) => {
        console.error('terrain load failed', err);
      });

    const onResize = () => setRendererSize();
    const onScroll = () => updateScrollProgress();

    // Pause rAF lorsque la section est offscreen (économie CPU/GPU)
    const visibilityObs = new IntersectionObserver(
      (entries) => {
        sectionVisible = entries[0]?.isIntersecting ?? true;
        if (sectionVisible && raf === 0 && animateFn && !disposed) {
          raf = requestAnimationFrame(animateFn);
        }
      },
      { rootMargin: '200px 0px' },
    );
    visibilityObs.observe(section);

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      visibilityObs.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      pathMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      if (terrain) {
        terrain.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
        });
      }
      if (sharedTerrainMatRef) sharedTerrainMatRef.dispose();
      stopGroups.forEach((g) => {
        g.traverse((c) => {
          const obj = c as THREE.Mesh;
          if (obj.geometry) obj.geometry.dispose();
          if ((obj as THREE.Mesh).material) {
            const m = (obj as THREE.Mesh).material;
            if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
            else (m as THREE.Material).dispose();
          }
        });
      });
      clouds.dispose();
      mist.dispose();
      cloudTex.dispose();
      skyObj.dispose();
      glowMat.dispose();
      glowTex.dispose();
      sunMat.dispose();
      sunMesh.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="journey-3d relative"
      style={{ height: '650vh' }}
    >
      <div className="sticky top-0 w-full h-[100vh] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{ background: '#180a06' }}
        />

        {/* Sidebar narrative — 3 paliers persistants, l'actif est mis en avant */}
        <div
          ref={narrationContainerRef}
          data-active="1"
          className="narration-sidebar absolute z-[5] pointer-events-none"
          style={{
            opacity: 0,
            top: '50%',
            right: 'clamp(24px, 6vw, 110px)',
            transform: 'translateY(-50%)',
            width: 'clamp(280px, 26vw, 360px)',
            transition: 'opacity 0.2s linear',
            willChange: 'opacity',
          }}
        >
          <div className="flex flex-col gap-6">
            {[
              {
                idx: '1',
                num: '01',
                tag: 'Le départ',
                body: (
                  <>
                    La vallée est le point de départ — les bases, la curiosité.
                    Très vite, la{' '}
                    <em className="italic text-orange-hot">licence</em> me place
                    déjà sur le flanc de la montagne : un premier vrai palier.
                  </>
                ),
              },
              {
                idx: '2',
                num: '02',
                tag: 'Deux voies',
                body: (
                  <>
                    Le chemin se sépare. À gauche, l'
                    <em className="italic text-orange-hot">alternance</em> :
                    appliquer mes connaissances, travailler en équipe, déployer
                    en production. À droite, l'
                    <em className="italic text-orange-hot">école</em> :
                    structurer, approfondir. Deux voies parallèles, qui
                    montent ensemble.
                  </>
                ),
              },
              {
                idx: '3',
                num: '03',
                tag: 'Pas encore au sommet',
                body: (
                  <>
                    Master en cours, alternance en cours. La fin de mon
                    parcours scolaire, le{' '}
                    <em className="italic text-orange-hot">début</em> de mon
                    parcours pro.
                  </>
                ),
              },
            ].map((item) => (
              <div
                key={item.idx}
                data-step={item.idx}
                className="narration-step flex gap-3 items-start"
                style={{ transition: 'opacity 0.4s ease, filter 0.4s ease' }}
              >
                <div className="flex flex-col items-center pt-1 shrink-0">
                  <span
                    className="step-bullet rounded-full"
                    style={{
                      width: '8px',
                      height: '8px',
                      transition:
                        'background 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease',
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className="step-tag font-mono uppercase tracking-[0.3em] mb-1.5"
                    style={{
                      fontSize: '10px',
                      transition: 'color 0.4s ease',
                    }}
                  >
                    {item.num} · {item.tag}
                  </div>
                  <p
                    className="step-body font-serif"
                    style={{
                      fontSize: '15.5px',
                      lineHeight: 1.5,
                      transition: 'color 0.4s ease, font-size 0.4s ease',
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Persistent halo — vignette cinématique permanente (transparent au centre, sombre sur les bords) */}
        <div
          className="absolute inset-0 z-[4] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(8,3,2,0) 0%, rgba(8,3,2,0.25) 55%, rgba(8,3,2,0.78) 90%, rgba(8,3,2,0.95) 100%)',
          }}
        />

        {/* Intro text — left-aligned, fades out, sur fond sombre supplémentaire */}
        <div
          ref={introOverlayRef}
          className="absolute inset-0 z-[6] flex items-center"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,3,2,0.92) 0%, rgba(12,5,3,0.78) 55%, rgba(20,10,6,0.40) 100%)',
            opacity: 1,
            transition: 'opacity 0.15s linear',
            willChange: 'opacity',
          }}
        >
          <div
            className="w-full px-[clamp(24px,6vw,120px)]"
            style={{ maxWidth: '1400px', margin: '0 auto' }}
          >
            <div className="max-w-[640px]">
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange mb-10 inline-flex items-center gap-3.5">
                <span className="w-[30px] h-px bg-orange" />
                Chapitre IV · Le parcours
              </div>
              <h2
                className="font-serif font-normal text-white mb-7"
                style={{
                  fontSize: 'clamp(38px, 5.4vw, 84px)',
                  lineHeight: 1.02,
                  letterSpacing: '-0.02em',
                  maxWidth: '22ch',
                }}
              >
                Plusieurs chemins <em className="italic text-orange-hot">vers un même sommet.</em>
              </h2>
              <p
                className="font-serif text-cream/80"
                style={{
                  fontSize: 'clamp(17px, 1.45vw, 22px)',
                  lineHeight: 1.55,
                  maxWidth: '54ch',
                }}
              >
                Cinq ans à construire mon profil — la théorie d'un côté, la pratique
                de l'autre. Mon parcours comme une ascension : un départ dans la vallée,
                des paliers, un sommet encore à atteindre.
              </p>
              <div className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/45 inline-flex items-center gap-3 animate-pulse">
                <span className="w-8 h-px bg-cream/35" />
                Continuez à scroller — le massif s'ouvre
              </div>
            </div>
          </div>
        </div>

        {/* Outro text — fades in, sur fond sombre supplémentaire */}
        <div
          ref={outroOverlayRef}
          className="absolute inset-0 z-[6] flex items-center justify-center pointer-events-none"
          style={{
            background:
              'linear-gradient(0deg, rgba(8,3,2,0.92) 0%, rgba(12,5,3,0.78) 55%, rgba(20,10,6,0.35) 100%)',
            opacity: 0,
            transition: 'opacity 0.15s linear',
            willChange: 'opacity',
          }}
        >
          <div className="max-w-[820px] mx-auto px-[clamp(24px,5vw,80px)] text-center">
            {/* Status indicator with pulsing dot */}
            <div className="inline-flex items-center gap-3 mb-12">
              <span className="relative flex w-2.5 h-2.5">
                <span
                  className="absolute inline-flex w-full h-full rounded-full opacity-70 animate-ping"
                  style={{ background: '#ff6a1f' }}
                />
                <span
                  className="relative inline-flex rounded-full w-2.5 h-2.5"
                  style={{
                    background: '#ff6a1f',
                    boxShadow: '0 0 12px rgba(255,176,87,0.8)',
                  }}
                />
              </span>
              <span className="font-mono uppercase tracking-[0.32em] text-orange-hot" style={{ fontSize: '12px' }}>
                Ascension en cours
              </span>
            </div>

            {/* Three stat columns: départ / position / sommet */}
            <div className="grid grid-cols-3 gap-8 max-w-[680px] mx-auto mb-10 items-end">
              <div className="text-left">
                <div className="font-mono uppercase tracking-[0.28em] text-cream/55 mb-2" style={{ fontSize: '10px' }}>
                  Départ
                </div>
                <div className="font-serif text-cream/85" style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', lineHeight: 1 }}>
                  1 035 m
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono uppercase tracking-[0.28em] text-orange-hot mb-2" style={{ fontSize: '10px' }}>
                  Position
                </div>
                <div
                  className="font-serif text-white"
                  style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1, letterSpacing: '-0.015em' }}
                >
                  ~ 3 050 m
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono uppercase tracking-[0.28em] text-cream/55 mb-2" style={{ fontSize: '10px' }}>
                  Sommet
                </div>
                <div className="font-serif text-cream/85" style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', lineHeight: 1 }}>
                  4 810 m
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="relative h-[2px] rounded-full max-w-[680px] mx-auto"
              style={{ background: 'rgba(243,232,216,0.18)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: '63%',
                  background: 'linear-gradient(90deg, #ff6a1f, #ffd28a)',
                  boxShadow: '0 0 14px rgba(255,176,87,.65)',
                }}
              />
            </div>

            {/* Footer line */}
            <div className="mt-4 flex items-center justify-center gap-6 font-mono uppercase tracking-[0.3em] text-cream/55" style={{ fontSize: '10px' }}>
              <span className="text-orange-hot">63 %</span>
              <span className="w-px h-3 bg-cream/25" />
              <span>▲ 1 760 m restants</span>
            </div>
          </div>
        </div>

          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-hot opacity-70">
                Chargement du Mont Blanc
              </div>
              <div
                className="w-[260px] h-[2px] rounded-full overflow-hidden"
                style={{ background: 'rgba(255,176,87,.15)' }}
              >
                <div
                  className="h-full transition-[width] duration-150 ease-out"
                  style={{
                    width: `${Math.round(loadProgress * 100)}%`,
                    background: 'linear-gradient(90deg, #ff6a1f, #ffd28a)',
                    boxShadow: '0 0 10px rgba(255,176,87,.6)',
                  }}
                />
              </div>
              <div className="font-mono text-[10px] tracking-[0.25em] text-cream/50">
                {Math.round(loadProgress * 100)}%
              </div>
            </div>
          )}

        <div ref={labelsRef} className="absolute inset-0 pointer-events-none z-[3]">
          {STOPS.map((s) => (
            <div
              key={s.id}
              data-stop={s.id}
              className="absolute top-0 left-0 will-change-transform pointer-events-auto transition-opacity duration-200"
              style={{ opacity: 0 }}
              onMouseEnter={() => setExpandedStop(s.id)}
              onMouseLeave={() => setExpandedStop((prev) => (prev === s.id ? null : prev))}
              onClick={() => setExpandedStop((prev) => (prev === s.id ? null : s.id))}
            >
              {/* Compact pill — always visible */}
              <div
                className="rounded-full px-3 py-1.5 whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                style={{
                  background: 'rgba(20,10,6,.78)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,176,87,.3)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: s.type === 'edu' ? '#ffd28a' : '#ff7a40',
                    boxShadow: `0 0 6px ${s.type === 'edu' ? '#ffd28a' : '#ff7a40'}`,
                  }}
                />
                <span className="font-mono text-[10px] tracking-[0.18em] text-orange-hot">
                  {s.year.split(' — ')[0]}
                </span>
                <span className="font-serif text-[13px] text-white leading-tight">
                  {s.org}
                </span>
              </div>
              {/* Expanded card — hover/click toggle */}
              {expandedStop === s.id && (
                <div
                  className="absolute left-0 top-full mt-2 rounded-lg p-3.5 w-[260px] z-10 animate-in fade-in slide-in-from-top-1"
                  style={{
                    background: 'rgba(20,10,6,.92)',
                    backdropFilter: 'blur(14px)',
                    border: '1px solid rgba(255,176,87,.32)',
                    boxShadow: '0 14px 44px rgba(0,0,0,0.6)',
                  }}
                >
                  <div className="font-mono text-[10px] tracking-[0.2em] text-orange-hot mb-1.5">
                    {s.year}
                  </div>
                  <div
                    className="font-serif font-normal text-white mb-1"
                    style={{ fontSize: '17px', lineHeight: 1.2 }}
                  >
                    {s.title}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream/65 mb-2">
                    {s.org}
                  </div>
                  <span
                    className={`inline-block text-[9px] uppercase tracking-[0.2em] py-[2px] px-2 rounded-full mb-2 ${
                      s.type === 'edu'
                        ? 'text-orange-hot border border-orange-hot/30'
                        : 'text-orange border border-orange/40'
                    }`}
                    style={{
                      background:
                        s.type === 'edu'
                          ? 'rgba(255,176,87,.15)'
                          : 'rgba(255,106,31,.2)',
                    }}
                  >
                    {s.typeLabel}
                  </span>
                  <p className="font-serif text-[12.5px] leading-[1.45] text-cream/80">
                    {s.desc}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40 pointer-events-none">
          Massif du Mont Blanc · 45.83°N 6.86°E
        </div>
      </div>
    </section>
  );
}

export default function Journey3D() {
  const [mode, setMode] = useState<'pending' | 'mobile' | 'desktop'>('pending');
  useEffect(() => {
    const update = () =>
      setMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  if (mode === 'pending') return null;
  return mode === 'mobile' ? <Journey2D /> : <Journey3DScene />;
}
