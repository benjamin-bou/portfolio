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
