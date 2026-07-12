/**
 * Sélection adaptative de la qualité vidéo du parcours.
 *
 * Trois paliers encodés (all-intra) : 720p, 1080p, 1440p.
 * Le palier est choisi selon :
 *   - le réseau : Network Information API (saveData / effectiveType / downlink)
 *     là où elle existe, complétée par une mesure réelle de bande passante
 *     (cross-browser, via un range HTTP) ;
 *   - l'appareil : cœurs CPU, mémoire, densité + taille d'écran réelle
 *     (décoder du 1440p en scrub est coûteux, inutile sur petit écran).
 */

export type VideoTier = '720' | '1080' | '1440';

const ORDER: VideoTier[] = ['720', '1080', '1440'];

type NavExt = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string; downlink?: number };
  deviceMemory?: number;
  hardwareConcurrency?: number;
};

/**
 * Palier maximal utile pour la surface d'affichage réelle : la vidéo occupe
 * toute la largeur du viewport, donc on compare aux pixels device de rendu
 * (innerWidth × dpr) aux largeurs natives des sources (720p=1280, 1080p=1920).
 * Au-delà d'un palier, la source serait sur-échantillonnée pour rien.
 */
function maxByScreen(): VideoTier {
  const dpr = window.devicePixelRatio || 1;
  const px =
    (window.innerWidth || document.documentElement?.clientWidth || 1280) * dpr;
  // Le scrub ne sert jamais du 1440p : plein écran, le 1080p suffit visuellement
  // et se décode bien plus vite frame par frame.
  if (px <= 1320) return '720';
  return '1080';
}

/** Palier maximal justifié par les capacités de calcul (décodage du scrub). */
function maxByDevice(nav: NavExt): VideoTier {
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  if (cores <= 4 || mem <= 4) return '720';
  return '1080';
}

/**
 * Machine modeste / préférence utilisateur → mode allégé : le parcours affiche
 * des images fixes au lieu de scrubber de la vidéo (décodage par frame trop
 * coûteux). Déclencheurs : ?lite=1, saveData, prefers-reduced-motion, ou peu
 * de cœurs/mémoire. Les machines puissantes gardent le film.
 */
export function isLowPower(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('lite') === '1') {
    // Interrupteur manuel persistant : une fois activé, reste allégé (jusqu'à ?lite=0)
    try {
      localStorage.setItem(LOW_POWER_KEY, '1');
    } catch {
      /* ignore */
    }
    return true;
  }
  if (params.get('lite') === '0') {
    // Force le film + réinitialise le verdict mémorisé (debug / fausse détection)
    try {
      localStorage.removeItem(LOW_POWER_KEY);
    } catch {
      /* ignore */
    }
    return false;
  }
  // Verdict mémorisé d'une session précédente où le scrub a été jugé trop lent
  // à l'exécution (voir markLowPower). Bien plus fiable que les specs matérielles.
  try {
    if (localStorage.getItem(LOW_POWER_KEY) === '1') return true;
  } catch {
    /* localStorage indisponible (mode privé) */
  }
  const nav = navigator as NavExt;
  if (nav.connection?.saveData) return true;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true;
  // Signaux matériels — grossiers (deviceMemory plafonne à 8, ignore le GPU),
  // ne servent qu'à attraper les cas franchement faibles ; la vraie décision
  // vient de la mesure FPS à l'exécution.
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  return cores <= 2 || mem <= 2;
}

const LOW_POWER_KEY = 'journey-lite';

/** Mémorise que cette machine peine au scrub, pour démarrer allégé ensuite. */
export function markLowPower(): void {
  try {
    localStorage.setItem(LOW_POWER_KEY, '1');
  } catch {
    /* ignore */
  }
}

function lowest(...tiers: VideoTier[]): VideoTier {
  return ORDER[Math.min(...tiers.map((t) => ORDER.indexOf(t)))];
}

/** Override manuel via ?vq=720|1080|1440 (test / debug). */
export function forcedTier(): VideoTier | null {
  if (typeof window === 'undefined') return null;
  const v = new URLSearchParams(window.location.search).get('vq');
  return v === '720' || v === '1080' || v === '1440' ? v : null;
}

/** Choix synchrone immédiat, avant toute mesure — sert de valeur de départ. */
export function pickInitialTier(): VideoTier {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return '1080';
  const forced = forcedTier();
  if (forced) return forced;
  const nav = navigator as NavExt;
  const conn = nav.connection;

  if (conn?.saveData) return '720';

  let byNet: VideoTier = '1080'; // défaut prudent si l'API est absente (Safari/Firefox)
  if (conn) {
    const et = conn.effectiveType;
    if (et === 'slow-2g' || et === '2g' || et === '3g') byNet = '720';
    else if (typeof conn.downlink === 'number' && conn.downlink < 5) byNet = '1080';
    else byNet = '1440';
  }

  return lowest(byNet, maxByDevice(nav), maxByScreen());
}

/** Mesure réelle de bande passante via un range HTTP (~1 Mo). Retourne des Mbps, ou null. */
export async function measureBandwidthMbps(
  probeUrl: string,
  bytes = 1024 * 1024,
  timeoutMs = 4500,
): Promise<number | null> {
  if (typeof fetch === 'undefined') return null;
  try {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);
    const t0 = performance.now();
    const res = await fetch(probeUrl, {
      headers: { Range: `bytes=0-${bytes - 1}` },
      signal: controller.signal,
      cache: 'no-store',
    });
    // Si le serveur ignore Range (réponse 200 = fichier entier), on abandonne
    // pour ne pas télécharger tout le fichier juste pour mesurer.
    if (res.status !== 206) {
      controller.abort();
      clearTimeout(to);
      return null;
    }
    const buf = await res.arrayBuffer();
    clearTimeout(to);
    const secs = (performance.now() - t0) / 1000;
    if (secs <= 0 || buf.byteLength === 0) return null;
    return (buf.byteLength * 8) / secs / 1e6;
  } catch {
    return null;
  }
}

/** Recommandation finale à partir de la bande passante mesurée + appareil + écran. */
export function tierFromBandwidth(mbps: number): VideoTier {
  const nav = navigator as NavExt;
  const byNet: VideoTier = mbps >= 9 ? '1080' : '720';
  return lowest(byNet, maxByDevice(nav), maxByScreen());
}

export function videoSrc(id: number, tier: VideoTier): string {
  return `/videos/journey-act${id}-${tier}.mp4`;
}
