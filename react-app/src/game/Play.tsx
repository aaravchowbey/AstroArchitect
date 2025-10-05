// src/game/Play.tsx
import { useParams } from "react-router-dom";
import GridCanvas from "../components/grid/GridCanvas";
import ConstraintsPanel from "../components/stages/ConstraintsPanel";
import { GridProvider } from "../components/grid/GridContext";
import Palette from "../components/Palette";

export default function Play() {
  const { levelId } = useParams(); // "moon" | "transit" | "mars"
  // TODO: pass levelId into your Grid/Constraints via context or props if needed
  return (
    <>
      <GridProvider>
        <GridCanvas levelId={levelId} />
        <ConstraintsPanel levelId={levelId} />
        <Palette levelId={levelId} />
      </GridProvider>
    </>
  );
}
