// src/grid/GridContext.tsx
import React, { createContext, useContext, useState } from "react";
import type { Room } from "../stages/types";

type GridCtx = {
  // grid constants
  ROWS: number;
  COLS: number;

  // edges
  hEdges: number[][];
  vEdges: number[][];
  setHEdges: React.Dispatch<React.SetStateAction<number[][]>>;
  setVEdges: React.Dispatch<React.SetStateAction<number[][]>>;

  // rooms
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
};

const GridContext = createContext<GridCtx | null>(null);

export const GridProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // keep your existing sizes here so Canvas & Constraints agree
  const ROWS = 30;
  const COLS = 40;

  // edge state lives in the context (shared)
  const [hEdges, setHEdges] = useState<number[][]>(
    () => Array.from({ length: ROWS + 1 }, () => Array(COLS).fill(0))
  );
  const [vEdges, setVEdges] = useState<number[][]>(
    () => Array.from({ length: ROWS }, () => Array(COLS + 1).fill(0))
  );

  // rooms are also shared
  const [rooms, setRooms] = useState<Room[]>([]);

  return (
    <GridContext.Provider
      value={{ ROWS, COLS, hEdges, vEdges, setHEdges, setVEdges, rooms, setRooms }}
    >
      {children}
    </GridContext.Provider>
  );
};

export function useGrid() {
  const ctx = useContext(GridContext);
  if (!ctx) throw new Error("useGrid must be used within a GridProvider");
  return ctx;
}
