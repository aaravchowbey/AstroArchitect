// ConstraintsPanel.tsx
import { useEffect, useMemo, useState } from "react";
import { useGrid } from "../grid/GridContext";
import { getStagesForLevel, evaluateStage } from "./stages";

type ConstraintsPanelProps = {
  levelId?: string;
};

export default function ConstraintsPanel({ levelId }: ConstraintsPanelProps) {
  const { rooms } = useGrid();

  // Evaluate all stages from current grid state for the selected level
  const stages = useMemo(() => getStagesForLevel(levelId), [levelId]);
  const evals = useMemo(() => stages.map((s) => evaluateStage(s, rooms)), [rooms, stages]);

  // The first incomplete stage is the "active" one
  const activeIdx = evals.findIndex((e) => !e.complete);
  const derivedOpenIdx = activeIdx === -1 ? stages.length - 1 : activeIdx;

  // Multi-expand support
  const [openSet, setOpenSet] = useState<Set<number>>(
    new Set([derivedOpenIdx])
  );
  useEffect(() => {
    setOpenSet((s) => new Set(s).add(derivedOpenIdx)); // auto-open the next active stage
  }, [derivedOpenIdx]);

  const toggleOpen = (i: number) =>
    setOpenSet((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const openAll = () => setOpenSet(new Set(stages.map((_, i) => i)));
  const closeAll = () => setOpenSet(new Set());

  console.log("ConstraintsPanel received levelId:", levelId);

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        top: 12,
        background: "rgba(5,10,22,0.8)",
        backdropFilter: "blur(6px)",
        color: "#E9F2FF",
        padding: 14,
        borderRadius: 12,
        border: "1px solid rgba(120,180,255,0.15)",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial",
        width: 380,
        maxHeight: "82vh",
        overflow: "auto",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: -14,
          paddingTop: 14,
          paddingBottom: 10,
          background:
            "linear-gradient(180deg, rgba(5,10,22,0.96) 0%, rgba(5,10,22,0.78) 85%, rgba(5,10,22,0) 100%)",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: 800, letterSpacing: 0.4, fontSize: 16 }}>
          Mission Constraints
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={openAll}
            style={chipBtnStyle}
            aria-label="Expand all stages"
            title="Expand all"
          >
            ⤢ Expand all
          </button>
          <button
            onClick={closeAll}
            style={chipBtnStyle}
            aria-label="Collapse all stages"
            title="Collapse all"
          >
            ⤡ Collapse all
          </button>
        </div>
      </div>

      {/* Stages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stages.map((stage, i) => {
          const ev = evals[i];
          const locked = i > 0 && !evals[i - 1].complete; // strict unlock order
          const isOpen = openSet.has(i) && !locked;

          const pct = Math.round(ev.progress * 100);
          const pctDisplay = locked ? 0 : pct;
          const titleText = locked ? "Locked" : stage.title;

          return (
            <div
              key={stage.id ?? stage.title + i}
              style={{
                border: "1px solid rgba(120,180,255,0.18)",
                borderRadius: 10,
                overflow: "hidden",
                opacity: locked ? 0.55 : 1,
                background:
                  "linear-gradient(180deg, rgba(14,25,48,0.55), rgba(12,22,42,0.35))",
              }}
            >
              {/* Header */}
              <button
                onClick={() => !locked && toggleOpen(i)}
                title={
                  locked
                    ? "Complete previous stage to unlock"
                    : "Toggle details"
                }
                style={{
                  width: "100%",
                  background: "transparent",
                  color: "inherit",
                  border: "none",
                  cursor: locked ? "not-allowed" : "pointer",
                  textAlign: "left",
                  padding: "12px 12px",
                  display: "grid",
                  gridTemplateColumns: "20px 26px 1fr auto",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                {/* Chevron */}
                <span
                  aria-hidden
                  style={{
                    transition: "transform 160ms ease",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    display: "inline-block",
                    opacity: locked ? 0.5 : 0.95,
                    fontSize: 16,
                  }}
                >
                  ▸
                </span>

                {/* Index / Check / Lock */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    border: "1px solid rgba(150,200,255,0.35)",
                    background: ev.complete
                      ? "rgba(56,239,125,0.35)"
                      : locked
                      ? "rgba(255,200,90,0.15)"
                      : "transparent",
                    fontSize: 12,
                  }}
                >
                  {locked ? "🔒" : ev.complete ? "✓" : i + 1}
                </span>

                {/* Title */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {titleText}
                  </span>
                  <span style={{ opacity: 0.75, fontSize: 12 }}>
                    {locked
                      ? "Unlock by completing the previous stage."
                      : ev.complete
                      ? "Stage complete"
                      : "In progress"}
                  </span>
                </div>

                {/* Percent */}
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {pctDisplay}%
                </span>
              </button>

              {/* Progress bar (always visible) */}
              <div style={{ padding: "0 12px 12px 12px" }}>
                <div
                  style={{
                    height: 10,
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: 6,
                    overflow: "hidden",
                    marginBottom: isOpen ? 10 : 8,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pctDisplay}%`,
                      background: ev.complete
                        ? "linear-gradient(90deg, #24D263, #43FFA1)"
                        : "linear-gradient(90deg, #3FA8FF, #7FD0FF)",
                      transition: "width 220ms ease",
                    }}
                  />
                </div>

                {/* Collapsible body */}
                {isOpen && (
                  <>
                    {stage.explain && (
                      <div
                        style={{
                          marginBottom: 8,
                          opacity: 0.92,
                          lineHeight: 1.35,
                          fontSize: 13,
                        }}
                      >
                        {stage.explain}
                      </div>
                    )}
                    <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
                      {ev.results.map(({ req, have, met }) => (
                        <li key={req.type + (req.kind ?? "")} style={{ marginBottom: 6 }}>
                          <span
                            style={{
                              opacity: met ? 0.75 : 1,
                              fontSize: 13,
                            }}
                          >
                            {met ? "✅" : "⬜️"} {req.type}:
                            {req.kind === "roomCount" || req.kind === "minArea" ? (
                              ` ${have}/${(req as any).atLeast}`
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- styles --- */
const chipBtnStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: 12,
  background: "rgba(30,60,120,0.35)",
  color: "#E9F2FF",
  border: "1px solid rgba(120,180,255,0.28)",
  borderRadius: 999,
  cursor: "pointer",
  backdropFilter: "blur(4px)",
};
