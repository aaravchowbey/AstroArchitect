export type Cell = { r: number; c: number };
export type Room = { id: string; cells: Cell[]; color: string; type?: string };

export const ROOM_TYPES = [
  "Sleep",
  "Galley",
  "Hygiene",
  "WCS",
  "Exercise",
  "Control",
  "Storage",
  "Common",
  "Science",
  "Airlock",
] as const;