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
