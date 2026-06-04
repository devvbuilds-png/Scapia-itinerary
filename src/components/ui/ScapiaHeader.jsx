import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, FONT, SHADOW } from "../../theme";
import { DemoChip } from "./MockLabels";

// The Scapia wordmark: coral "scapia" + serif-italic accent word.
// Kept consistent as "scapia itinerary" across the app (sticky on scroll).
export function Wordmark({ accent = "itinerary", size = 21, light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, lineHeight: 1 }}>
      <span
        style={{
          fontFamily: FONT.sans,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: -0.5,
          color: C.coral,
          transition: "color 0.25s ease",
        }}
      >
        scapia
      </span>
      <span
        style={{
          fontFamily: FONT.serif,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: size + 1,
          color: light ? C.white : C.ink,
          textShadow: light ? "0 1px 6px rgba(0,0,0,0.35)" : "none",
          transition: "color 0.25s ease",
        }}
      >
        {accent}
      </span>
    </div>
  );
}

function CircleButton({ children, onClick, light = false, ariaLabel }) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "none",
        background: light ? "rgba(255,255,255,0.92)" : C.white,
        boxShadow: SHADOW.cardSoft,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        fontSize: 19,
        color: C.ink,
        padding: 0,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

/**
 * Unified sticky header used on every screen.
 * - Over a hero (`transparent`) and at the top → fully see-through, white wordmark.
 * - On scroll (or on non-hero screens) → smoothly fades into a frosted, slightly
 *   translucent bar pinned to the top (blur + subtle shadow + ink wordmark).
 * This scroll behaviour is one of Scapia's most recognisable cues — same everywhere.
 */
export default function ScapiaHeader({
  accent = "itinerary",
  onBack,
  backTo,
  right = null,
  transparent = false,
  hideBack = false,
  demo = false,
}) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Frosted whenever there's no hero behind, or once the user scrolls past the hero.
  const frosted = !transparent || scrolled;
  const overHero = transparent && !scrolled;

  const handleBack = () => {
    if (onBack) return onBack();
    if (backTo) return navigate(backTo);
    navigate(-1);
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        paddingTop: "calc(12px + env(safe-area-inset-top))",
        paddingBottom: 12,
        paddingLeft: "calc(16px + env(safe-area-inset-left))",
        paddingRight: "calc(16px + env(safe-area-inset-right))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        background: frosted ? "rgba(247,249,252,0.80)" : "transparent",
        backdropFilter: frosted ? "blur(14px) saturate(1.15)" : "none",
        WebkitBackdropFilter: frosted ? "blur(14px) saturate(1.15)" : "none",
        borderBottom: `1px solid ${frosted ? C.line : "transparent"}`,
        boxShadow: frosted ? "0 2px 14px rgba(18,32,59,0.06)" : "none",
        transition: "background 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease",
      }}
    >
      {hideBack ? (
        <div style={{ width: 40 }} />
      ) : (
        <CircleButton onClick={handleBack} light={overHero} ariaLabel="Back">
          ‹
        </CircleButton>
      )}
      <div style={{ position: "absolute", left: 64, right: 64, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <button
          aria-label="Go to profile home"
          onClick={handleHome}
          style={{
            border: "none",
            background: "transparent",
            padding: "8px 10px",
            margin: -8,
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          <Wordmark accent={accent} light={overHero} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", zIndex: 1 }}>
        {right || (demo ? <DemoChip /> : <div style={{ width: 40 }} />)}
      </div>
    </div>
  );
}
