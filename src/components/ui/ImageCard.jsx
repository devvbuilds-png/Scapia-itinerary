import { C, FONT, RADIUS, SHADOW, HERO_BLEED } from "../../theme";

/**
 * Signature Scapia portrait image card — full-bleed photo, dark bottom gradient,
 * text/badges overlaid. Slots: topLeft, topRight, bottom (over gradient).
 */
export function OverlayCard({
  image,
  height = 220,
  title,
  subtitle,
  topLeft,
  topRight,
  bottom,
  onClick,
  selected = false,
  style,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        height,
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        boxShadow: SHADOW.card,
        border: selected ? `2.5px solid ${C.coral}` : `1px solid ${C.line}`,
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
    >
      {/* bottom gradient for legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(8,14,26,0.86) 0%, rgba(8,14,26,0.35) 42%, rgba(8,14,26,0) 70%)",
        }}
      />
      {topLeft && <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>{topLeft}</div>}
      {topRight && <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>{topRight}</div>}
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 13 }}>
        {(title || subtitle) && (
          <div style={{ marginBottom: bottom ? 8 : 0 }}>
            {subtitle && (
              <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.86)", marginBottom: 2 }}>
                {subtitle}
              </div>
            )}
            {title && (
              <div style={{ fontFamily: FONT.sans, fontSize: 20, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                {title}
              </div>
            )}
          </div>
        )}
        {bottom}
      </div>
    </div>
  );
}

/**
 * Photo-on-top, content-below card (used in listings: experiences/hotels grids).
 * Slots: badges over the image (topLeft/topRight), ratingChip bottom-left of image,
 * children = body content under the photo.
 */
export function MediaCard({
  image,
  imageHeight = 170,
  topLeft,
  topRight,
  imageBottomLeft,
  children,
  onClick,
  selected = false,
  style,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card,
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        boxShadow: SHADOW.cardSoft,
        border: selected ? `2.5px solid ${C.coral}` : `1px solid ${C.line}`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          height: imageHeight,
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {imageBottomLeft && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(8,14,26,0.55) 0%, rgba(8,14,26,0) 45%)",
            }}
          />
        )}
        {topLeft && <div style={{ position: "absolute", top: 11, left: 11, display: "flex", gap: 6 }}>{topLeft}</div>}
        {topRight && <div style={{ position: "absolute", top: 11, right: 11, display: "flex", gap: 6 }}>{topRight}</div>}
        {imageBottomLeft && <div style={{ position: "absolute", left: 11, bottom: 11 }}>{imageBottomLeft}</div>}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

/**
 * Full-bleed hero image that bleeds up behind a (transparent) header.
 * Children render at the bottom over a gradient.
 */
export function HeroImage({ image, height = 230, children, overlay = true }) {
  return (
    <div
      style={{
        position: "relative",
        height,
        marginTop: HERO_BLEED, // pull up under the transparent sticky header (safe-area aware)
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(238,241,246,1) 0%, rgba(238,241,246,0.2) 40%, rgba(8,14,26,0.25) 100%)",
          }}
        />
      )}
      {children && <div style={{ position: "absolute", left: 16, right: 16, bottom: 14 }}>{children}</div>}
    </div>
  );
}
