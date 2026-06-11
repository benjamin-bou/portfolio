# Journey3D « L'ascension immersive » — Design

**Date** : 2026-06-11
**Statut** : validé par Benjamin (caméra hybride cinématique, 4 axes de réalisme, priorité au visuel)
**Fichier cible principal** : `src/components/Journey3D.tsx` (fallback mobile `Journey.tsx` inchangé)

## Objectif

Rendre la section 3D Mont Blanc (scrollytelling du parcours) nettement plus réaliste et
immersive — effet « wow » — tout en gardant des performances correctes
(60 fps GPU dédié, ~35-45 fps iGPU accepté).

## 1. Caméra cinématique en 3 actes

Remplacer l'interpolation actuelle `camPos0 → camPos1` par une **trajectoire spline**
(CatmullRomCurve3) pour la position et une seconde courbe pour le point de regard,
échantillonnées par la progression `p` (déjà définie : trace drawing entre scroll 0.22 et 0.70).

- **Acte 1 — Dans la vallée (p 0 → 0.30)** : caméra basse (~4-6 unités au-dessus du
  terrain), derrière le départ à Chamonix `[-5, -3]`, avançant le long du pre-stem.
  Regard vers l'avant du tracé et légèrement vers le haut : le massif domine le cadre.
- **Acte 2 — Révélation du fork (p 0.30 → 0.65)** : crane shot continu — la caméra
  s'élève et recule depuis la position basse vers une vue intermédiaire, révélant les
  deux branches qui se dessinent en parallèle.
- **Acte 3 — Face au massif (p 0.65 → 1.0)** : vue d'ensemble haute proche de
  l'actuelle (`camPos1` ≈ `(-2, 88, -55)`), labels lisibles.
- **Post-completion (p2)** : mouvement existant vers le sommet conservé tel quel.

Contraintes conservées : anti-clipping (`sampleHeight + clearance`, clearance réduite
en acte 1 à ~3-4 unités au lieu de 25), lissage frame-à-frame (`lerp 0.06`), sway léger
uniquement en actes 2-3.

Le `CAM_MIN_Y_MAIN = 65` actuel saute : il est remplacé par la spline + clearance
dynamique (le minimum dur empêcherait la caméra de descendre dans la vallée).

## 2. Terrain réaliste

### Shader custom (onBeforeCompile sur MeshStandardMaterial)

- **Neige procédurale** : facteur = smoothstep(altitude) × smoothstep(pente via normal.y),
  ligne de neige ~2400 m (≈ y 38 en unités monde), blanc légèrement bleuté, scintillement
  subtil (bruit haute fréquence × spéculaire) sur les surfaces enneigées.
- **Détail rapproché** : bruit fbm 2-3 octaves modulant l'albédo, intensité décroissante
  avec la distance caméra (fade complet à ~80 unités) pour compenser le flou du satellite
  en vue basse (acte 1).
- **Perspective aérienne** : suppression du `FogExp2` global au profit d'un fog
  custom distance + altitude dans le shader terrain — teinte bleutée des crêtes
  lointaines, brume plus dense en fond de vallée. Les éléments non-terrain (ciel,
  soleil, tracé, beams) restent `fog: false`.

### Géométrie à résolution variable

Grille de chunks portée à 6×6. Les chunks dont le centre est proche du corridor
(tracé + trajectoire caméra, seuil ~60 unités) reçoivent ~160 segments ; les chunks
lointains restent à ~48. Heightmap 6144×4352 : résolution source suffisante.

### Ombres

`renderer.shadowMap` activé (PCFSoft), `sunLight.castShadow`, shadow camera
orthographique cadrée sur le terrain, map 4096. Scène statique →
`shadowMap.autoUpdate = false` + `needsUpdate = true` une fois après init :
le relief gagne des ombres portées pour un coût par frame quasi nul.
Le tracé et les markers ne castent pas d'ombre.

## 3. Atmosphère

- **Ciel** : dégradé amélioré + halo de diffusion autour de la direction du soleil
  (terme `pow(dot(viewDir, sunDir), k)` dans le shader du dôme).
- **Nuages** : ~16 sprites billboards (texture canvas douce générée au chargement),
  bande d'altitude ~y 45-65 (sous les sommets), dérive lente en X dans la boucle
  d'animation, `depthWrite: false`, opacité 0.3-0.5.
- **Brume de vallée** : ~6 grands sprites très diffus posés bas dans la vallée de
  Chamonix, opacité ≤ 0.25.

## 4. Tracé et markers

Inchangés (tubes shaders avec fresnel + progression, beams + glows). Seul ajustement
éventuel : intensité du fresnel en vue rapprochée si l'acte 1 le rend criard.

## 5. Performance

- pixelRatio plafonné à 2 (inchangé), frustum culling par chunk (inchangé),
  pause rAF offscreen (inchangée).
- Shadow map rendue une seule fois.
- Pas de post-processing plein écran.
- Bruit procédural limité (2-3 octaves, fbm value noise).
- Budget vertices : ~6-8 chunks haute résolution (160² ≈ 26k verts chacun)
  + ~28 chunks légers (48² ≈ 2.4k) ≈ 250k verts au total — acceptable pour la
  cible « priorité visuel ».

## 6. Hors périmètre

- Fallback mobile 2D (`Journey.tsx`), sidebar narrative, labels/cards des stops,
  overlays intro/outro, dashboard d'ascension : inchangés.
- Pas de nouveau format d'assets (les 2 atlas WebP existants restent la source).

## Critères de succès

1. `npm run build` et `npm run lint` passent.
2. La caméra ne traverse jamais le terrain sur toute la plage de scroll.
3. Acte 1 : le terrain proche ne paraît ni flou ni anguleux (détail + densité corridor).
4. Les labels des 5 stops restent lisibles et cliquables en acte 3.
5. Fluidité : pas de chute sous ~30 fps sur iGPU récent, 60 fps sur GPU dédié.
