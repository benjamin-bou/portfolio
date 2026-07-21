import { useState } from 'react';
import { TOK, FONT, TEXTURES, LAYOUT } from './tokens';

/**
 * Hero — affiche typographique pure, sans photo.
 * L'identité litho porte seule : fond sombre chaud dégradé, grain halftone,
 * marque solaire (anneau + disque, reprise en clôture du CTA), titre géant.
 *
 * ANIMATION — entrée cinématographique (lever de soleil) puis boucle d'ambiance.
 * Tout le chronogramme est un multiple de D (durée d'entrée) : changer D
 * accélère ou ralentit la séquence entière sans en casser les enchaînements.
 *
 *   0    → 0.25·D  Aube    — un voile noir se lève, la scène naît du noir
 *   0.1  → 0.45·D  Anneau  — l'anneau surgit avec rebond
 *   0.25 → 0.8·D   Soleil  — le disque se lève DE SOUS l'anneau (masqué par son bord)
 *   0.4  → 0.9·D   Flash   — une bouffée chaude balaie l'écran
 *   0.45 → 1·D     Halo    — bloom du halo derrière la marque
 *   0.5  → 0.9·D   Titre   — chaque ligne monte derrière son masque
 *   0.85·D         Point   — le point final orange éclot
 *   0.75 → 1.2·D   Filet   — le filet se trace, le sous-titre monte en fondu
 *   1.2·D →        Boucle  — halo qui respire, soleil qui dérive, anneau qui pulse
 *
 * Les états AU REPOS (styles inline) sont les états FINAUX : les animations
 * n'ajoutent que le chemin pour y arriver (`both` tient l'état de départ
 * pendant le delay). Résultat : en `prefers-reduced-motion`, il suffit de ne
 * poser aucune animation pour que tout s'affiche correctement.
 */

/** Durée de l'entrée (s). Tout le chronogramme en est un multiple. */
const D = 3;
/** Période de la boucle d'ambiance (s) — lente et discrète. */
const LOOP = 13;

/** Convertit un multiple de D en durée CSS. */
const t = (multiple: number) => `${+(D * multiple).toFixed(3)}s`;
/** La boucle prend le relais quand l'entrée est finie. */
const LOOP_DELAY = t(1.2);

/** Easings : `OUT` pour les arrivées douces, `BACK` pour les rebonds. */
const OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export default function LithoHero() {
  const [reduce] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  /** Ne pose l'animation que si le mouvement est accepté. */
  const anim = (value: string) => (reduce ? undefined : value);

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100svh',
        overflow: 'hidden',
        color: TOK.cream,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: `clamp(110px, 16vh, 150px) ${LAYOUT.padX} clamp(44px, 7vh, 90px)`,
        background: `linear-gradient(180deg, ${TOK.bg} 0%, ${TOK.bg} 55%, ${TOK.bgDeep} 100%)`,
      }}
    >
      {/* Halo chaud très doux derrière la marque solaire */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-12%',
          width: 'clamp(480px, 55vw, 900px)',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226, 122, 46, 0.16) 0%, transparent 62%)',
          pointerEvents: 'none',
          animation: anim(
            `lithoHaloBloom ${t(0.55)} ${OUT} ${t(0.45)} both, lithoHaloBreathe ${LOOP}s ease-in-out ${LOOP_DELAY} infinite`,
          ),
        }}
      />
      {/* Marque solaire — anneau fin + disque, motif repris en clôture (CTA) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'clamp(96px, 15vh, 180px)',
          right: 'clamp(24px, 6vw, 96px)',
          width: 'clamp(190px, 24vw, 340px)',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          border: '1px solid rgba(240, 231, 212, 0.35)',
          pointerEvents: 'none',
          animation: anim(
            `lithoRingIn ${t(0.35)} ${BACK} ${t(0.1)} both, lithoRingPulse ${LOOP}s ease-in-out ${LOOP_DELAY} infinite`,
          ),
        }}
      >
        {/* Masque circulaire : le disque se lève DE SOUS l'anneau et reste
            découpé par son bord pendant toute la montée. inset:0 = la boîte de
            padding de l'anneau, donc le disque garde exactement sa position. */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '23%',
              width: '54%',
              height: '54%',
              borderRadius: '50%',
              background: TOK.sun,
              opacity: 0.94,
              animation: anim(
                `lithoSunrise ${t(0.55)} ${OUT} ${t(0.25)} both, lithoSunDrift ${LOOP}s ease-in-out ${LOOP_DELAY} infinite`,
              ),
            }}
          />
        </div>
      </div>
      {/* Grain — sans mix-blend-mode (perf : calque cacheable, pas de re-blend au scroll) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* CONTENT */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: LAYOUT.maxW, margin: '0 auto', width: '100%' }}>
        <h1
          style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 'clamp(60px, 10vw, 176px)',
            lineHeight: 0.87,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: TOK.cream,
            margin: 0,
          }}
        >
          {/* Chaque ligne a son masque. Le padding/marge négative de 0.08em se
              compensent (décalage net nul) : ils donnent juste l'air nécessaire
              pour que `overflow:hidden` ne rogne pas les glyphes, la
              line-height de 0.87 étant plus serrée que les lettres. */}
          <span style={LINE_MASK}>
            <span style={{ display: 'block', animation: anim(`lithoLineUp ${t(0.4)} ${OUT} ${t(0.5)} both`) }}>
              Benjamin
            </span>
          </span>
          <span style={{ ...LINE_MASK, marginLeft: '0.55em' }}>
            <span style={{ display: 'block', animation: anim(`lithoLineUp ${t(0.4)} ${OUT} ${t(0.6)} both`) }}>
              Boutrois
              <span
                style={{
                  color: TOK.sun,
                  display: 'inline-block',
                  animation: anim(`lithoDotPop ${t(0.17)} ${BACK} ${t(0.85)} both`),
                }}
              >
                .
              </span>
            </span>
          </span>
        </h1>

        {/* Le filet passe en div absolu dédié pour pouvoir se tracer (scaleX).
            paddingTop 25 = l'ancien borderTop 1px + paddingTop 24 : le texte
            reste exactement à la même place. */}
        <div style={{ position: 'relative', marginTop: 40, paddingTop: 25, maxWidth: '52ch' }}>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: TOK.line,
              transformOrigin: 'left',
              animation: anim(`lithoRuleIn ${t(0.45)} ${OUT} ${t(0.75)} both`),
            }}
          />
          <div
            style={{
              fontFamily: FONT.serif,
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 1.6vw, 23px)',
              lineHeight: 1.5,
              color: TOK.cream,
              opacity: 0.92,
              animation: anim(`lithoFadeUp ${t(0.45)} ${OUT} ${t(0.75)} both`),
            }}
          >
            Développeur full-stack — en master à Epitech Rennes, en alternance chez Spayr à Paris.
          </div>
        </div>
      </div>

      {/* Flash chaud — bouffée de lumière qui balaie la scène (au-dessus du
          contenu, d'où le zIndex 3). Non rendu si le mouvement est refusé. */}
      {!reduce && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 78% 22%, rgba(226, 122, 46, 0.28), transparent 70%)',
            pointerEvents: 'none',
            opacity: 0,
            zIndex: 3,
            animation: `lithoFlash ${t(0.5)} ease-out ${t(0.4)} both`,
          }}
        />
      )}

      {/* Aube — voile plein écran (fixed : couvre aussi la nav) qui se lève.
          Non rendu si le mouvement est refusé, sinon il masquerait la page. */}
      {!reduce && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            background: '#1A140C',
            pointerEvents: 'none',
            zIndex: 100,
            // Base à 0 par sécurité : si l'animation venait à être neutralisée,
            // le voile ne doit jamais rester à couvrir la page. Le `both` tient
            // quand même l'état de départ (opacity 1) pendant la phase active.
            opacity: 0,
            animation: `lithoDawn ${t(0.25)} ease-out both`,
          }}
        />
      )}
    </section>
  );
}

/** Masque d'une ligne de titre — voir la note dans le h1. */
const LINE_MASK = {
  display: 'block',
  overflow: 'hidden',
  paddingTop: '0.08em',
  paddingBottom: '0.08em',
  marginTop: '-0.08em',
  marginBottom: '-0.08em',
} as const;
