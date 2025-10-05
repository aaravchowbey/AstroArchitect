// src/game/Play.tsx
import { useParams } from "react-router-dom";
import GridCanvas from "../components/grid/GridCanvas";
import ConstraintsPanel from "../components/stages/ConstraintsPanel";
import { GridProvider } from "../components/grid/GridContext";
import Palette from "../palette/Palette";

export default function Play() {
  const { levelId } = useParams(); // "moon" | "transit" | "mars"
  // Choose a background per level
  const bgStyles: Record<string, React.CSSProperties> = {
    tutorial: {
      position: "fixed",
      inset: 0,
      background:
        "radial-gradient(600px 300px at 50% 30%, rgba(120,200,255,0.12), transparent 60%)," +
        "linear-gradient(180deg, #071224 0%, #04101a 100%)",
      zIndex: -1,
      pointerEvents: "none",
    },
    moon: {
      position: "fixed",
      inset: 0,
      background:
        "radial-gradient(1200px 600px at 20% 10%, rgba(80,200,255,0.12), transparent 60%)," +
        "linear-gradient(180deg, #021024 0%, #071430 100%)",
      zIndex: -1,
      pointerEvents: "none",
    },
    transit: {
      position: "fixed",
      inset: 0,
      background:
        "radial-gradient(800px 400px at 50% 20%, rgba(180,135,255,0.12), transparent 60%)," +
        "linear-gradient(180deg, #081018 0%, #0b1f2b 100%)",
      zIndex: -1,
      pointerEvents: "none",
    },
    mars: {
      position: "fixed",
      inset: 0,
      background:
        "radial-gradient(1200px 600px at 30% 30%, rgba(255,160,110,0.12), transparent 60%)," +
        "linear-gradient(180deg, #1a0b04 0%, #2b0f06 100%)",
      zIndex: -1,
      pointerEvents: "none",
    },
  };

  const chosenBg = bgStyles[levelId ?? "moon"] ?? bgStyles["moon"];

  return (
    <>
      <div style={chosenBg} />
      <GridProvider>
        <GridCanvas levelId={levelId} />
        <ConstraintsPanel levelId={levelId} />
        <Palette levelId={levelId} />
      </GridProvider>
    </>
  );
}
