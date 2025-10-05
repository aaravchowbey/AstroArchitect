export type Cell = { r: number; c: number };
export type Room = { id: string; cells: Cell[]; color: string; type?: string };

export const ROOM_TYPES = [
  "Sleep",
  "Food",
  "Hygiene",
  "Exercise",
  "Control",
  "Storage",
] as const;
