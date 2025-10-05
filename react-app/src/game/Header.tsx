// src/game/Header.tsx
import type { CSSProperties } from "react";

export default function Header() {
  return (
    <header style={styles.wrap}>
      <div style={styles.bg} />
      <div style={styles.row}>
        <div style={styles.brand}>
          <span style={styles.logo} aria-hidden>🛰️</span>
          <div>
            <h1 style={styles.title}>AstroArchitect</h1>
            <p style={styles.tagline}>Design habitats. Teach constraints. Thrive in space.</p>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    position: "relative",
    padding: "14px 24px",
    overflow: "hidden",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  bg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(800px 200px at 10% -40%, rgba(80,200,255,0.18), transparent 60%)," +
      "radial-gradient(600px 150px at 110% 140%, rgba(176,145,255,0.16), transparent 60%)",
    pointerEvents: "none",
  },
  row: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1080,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    fontSize: 28,
    filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.35))",
    transform: "translateY(1px)",
  },
  title: {
    margin: 0,
    fontSize: 22,
    letterSpacing: 0.4,
    color: "#E8F1FF",
    textShadow: "0 6px 22px rgba(0,0,0,0.45)",
  },
  tagline: {
    margin: 0,
    marginTop: 2,
    fontSize: 12,
    opacity: 0.85,
    color: "#CFE8FF",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  link: {
    color: "#E8F1FF",
    textDecoration: "none",
    fontSize: 13,
    padding: "6px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    transition: "transform 120ms ease, background 120ms ease, border-color 120ms ease",
  },
  pill: {
    background:
      "linear-gradient(180deg, rgba(80,200,255,0.22), rgba(80,200,255,0.10))",
    border: "1px solid rgba(80,200,255,0.38)",
  },
};
