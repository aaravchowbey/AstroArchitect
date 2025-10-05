// src/game/levels.ts
export type Level = {
  id: "tutorial" | "moon" | "transit" | "mars";
  title: string;
  blurb: string;
  durationHint: string;
};
export const LEVELS: Level[] = [
  {
    id: "tutorial",
    title: "Tutorial: Getting Started",
    blurb:
      "A guided tutorial that teaches drawing walls, placing doors, using partitions, and assigning room types.",
    durationHint: "—",
  },
  {
    id: "moon",
    title: "Lunar Outpost (≤ 30 days)",
    blurb:
      "Short stay. Deployable quarters ok. Lightweight galley. Compact dirty zone.",
    durationHint: "≤ 30 days",
  },
  {
    id: "transit",
    title: "Deep-Space Transit (30-180 days)",
    blurb:
      "Cruise phase. More permanence, good ventilation, window near exercise.",
    durationHint: "30-180 days",
  },
  {
    id: "mars",
    title: "Mars Surface (≥ 180 days)",
    blurb:
      "Long duration. Permanent quarters, robust galley, larger stowage & work areas.",
    durationHint: "≥ 180 days",
  },
];
