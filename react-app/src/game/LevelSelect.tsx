// src/game/LevelSelect.tsx
import Header from "./Header";
import { LEVELS } from "./levels";
import { useNavigate } from "react-router-dom";

export default function LevelSelect() {
  const nav = useNavigate();

  return (
    <div style={styles.shell}>
      {/* Starfield */}
      <div style={styles.bg} />
      <div style={styles.starsLayer} />
      <div style={styles.starsLayer2} />

      <Header />
      <main style={styles.main}>
        <h1 style={styles.title}>Select Your Mission</h1>
        <p style={styles.subtitle}>
          Plan, place, and prove your habitat design across mission profiles.
        </p>

        <div style={styles.grid}>
          {LEVELS.map((lv) => (
            <button
              key={lv.id}
              onClick={() => nav(`/play/${lv.id}`)}
              style={styles.card}
            >
              <div style={styles.cardTop}>
                <span style={styles.badge}>{lv.durationHint}</span>
                <span aria-hidden>🚀</span>
              </div>

              <div style={styles.cardTitleRow}>
                <span style={styles.cardTitle}>{lv.title}</span>
              </div>

              <p style={styles.cardBlurb}>{lv.blurb}</p>

              <div style={styles.cardFooter}>
                <span style={styles.cta}>Enter Level</span>
                <span aria-hidden style={styles.chev}>
                  ›
                </span>
              </div>

              {/* soft glow */}
              <div style={styles.cardGlow} />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    position: "relative",
    minHeight: "100vh",
    color: "#E8F1FF",
    overflow: "hidden",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial",
  },
  bg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(80,200,255,0.20), transparent 60%)," +
      "radial-gradient(900px 700px at 80% 80%, rgba(123,97,255,0.22), transparent 60%)," +
      "linear-gradient(180deg, #040916 0%, #0B1227 100%)",
    zIndex: 0,
  },
  starsLayer: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.7) 40%, transparent 41%)," +
      "radial-gradient(1.5px 1.5px at 70% 60%, rgba(255,255,255,0.6) 40%, transparent 41%)," +
      "radial-gradient(1.2px 1.2px at 40% 80%, rgba(255,255,255,0.5) 40%, transparent 41%)," +
      "radial-gradient(1.5px 1.5px at 85% 25%, rgba(255,255,255,0.6) 40%, transparent 41%)",
    backgroundRepeat: "no-repeat",
    zIndex: 0,
    opacity: 0.7,
  },
  starsLayer2: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(1.2px 1.2px at 15% 75%, rgba(255,255,255,0.5) 40%, transparent 41%)," +
      "radial-gradient(1.4px 1.4px at 55% 35%, rgba(255,255,255,0.55) 40%, transparent 41%)," +
      "radial-gradient(1.1px 1.1px at 90% 70%, rgba(255,255,255,0.5) 40%, transparent 41%)",
    backgroundRepeat: "no-repeat",
    zIndex: 0,
    opacity: 0.6,
  },
  main: {
    position: "relative",
    zIndex: 1,
    padding: "56px 24px 24px",
    maxWidth: 1080,
    margin: "0 auto",
  },
  title: {
    margin: 0,
    fontSize: 32,
    letterSpacing: 0.5,
    textShadow: "0 8px 30px rgba(0,0,0,0.45)",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.85,
    fontSize: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },
  card: {
    position: "relative",
    textAlign: "left",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 14,
    padding: 16,
    cursor: "pointer",
    overflow: "hidden",
    transition:
      "transform 160ms ease, border-color 160ms ease, background 160ms ease",
    backdropFilter: "blur(6px)",
  },
  cardGlow: {
    content: '""',
    position: "absolute",
    inset: -2,
    background:
      "radial-gradient(600px 120px at 10% -10%, rgba(132,209,255,0.15), transparent 60%)," +
      "radial-gradient(400px 100px at 120% 120%, rgba(176,145,255,0.15), transparent 60%)",
    zIndex: -1,
    pointerEvents: "none",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    opacity: 0.95,
  },
  badge: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 999,
    background:
      "linear-gradient(180deg, rgba(80,200,255,0.25), rgba(80,200,255,0.12))",
    border: "1px solid rgba(80,200,255,0.35)",
    color: "#E8F7FF",
  },
  cardTitleRow: {
    color: "#E8F7FF",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  cardTitle: {
    color: "#E8F7FF",
    fontSize: 18,
    fontWeight: 700 as const,
    letterSpacing: 0.2,
  },
  cardBlurb: {
    color: "#E8F7FF",
    marginTop: 8,
    marginBottom: 14,
    lineHeight: 1.35,
    opacity: 0.9,
    fontSize: 13,
  },
  cardFooter: {
    color: "#E8F7FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px dashed rgba(255,255,255,0.18)",
    paddingTop: 10,
    fontSize: 13,
    opacity: 0.95,
  },
  cta: {
    opacity: 0.95,
  },
  chev: {
    fontSize: 22,
    lineHeight: 1,
    transform: "translateX(0)",
    transition: "transform 160ms ease",
  },
};

// Simple hover effect via inline event handlers (keeps this file self-contained)
const origCard = { ...styles.card };
const origChev = { ...styles.chev };

(function addHoverHelpers() {
  // Patch style objects to include :hover-like behavior with onMouseEnter/Leave
  (styles.card as any).onMouseEnter = function (e: any) {
    Object.assign(e.currentTarget.style, {
      transform: "translateY(-2px)",
      borderColor: "rgba(80,200,255,0.45)",
      background: "rgba(255,255,255,0.09)",
    });
    const chev = e.currentTarget.querySelector("[data-chev]");
    if (chev) (chev as HTMLElement).style.transform = "translateX(4px)";
  };
  (styles.card as any).onMouseLeave = function (e: any) {
    Object.assign(e.currentTarget.style, origCard);
    const chev = e.currentTarget.querySelector("[data-chev]");
    if (chev)
      (chev as HTMLElement).style.transform = origChev.transform as string;
  };
  // Mark the chev for querying
  styles.chev = { ...styles.chev, transform: "translateX(0)" } as any;
})();
