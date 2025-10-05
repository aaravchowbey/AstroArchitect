// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LevelSelect from "./game/LevelSelect";
import Play from "./game/Play"; // a thin wrapper that reads :levelId and renders your GridCanvas + ConstraintsPanel

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LevelSelect />} />
        <Route path="/play/:levelId" element={<Play />} />
      </Routes>
    </BrowserRouter>
  );
}
