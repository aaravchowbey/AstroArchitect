import type { Room } from "./types";
import { ROOM_TYPES } from "./types";

/** Requirement types */
export type Requirement =
  | { kind: "roomCount"; type: string; atLeast: number }         // >= N rooms of a type
  | { kind: "minArea";   type: string; atLeast: number };        // any one room of type has >= N cells

export type Stage = {
  id: string;
  title: string;
  explain?: string;
  requirements: Requirement[];
};

/** Basic stages:
 *  1) One of every room type
 *  2) Three sleeping rooms
 *  3) A storage room with at least 12 cells
 */
export const STAGES: Stage[] = [
  {
    id: "moon-1-core",
    title: "Core habitats online",
    explain:
      "Let’s build the basics of a tiny space home! You need one room for sleeping, one for eating (galley), one for getting clean (hygiene), one toilet (WCS), and one for running the habitat (control). "
      + "Astronauts group “clean” areas (sleep, food, control) away from “dirty” areas (WCS, hygiene) to keep germs down and equipment safe.",
    requirements: [
      { kind: "roomCount", type: "Sleep", atLeast: 1 },
      { kind: "roomCount", type: "Food", atLeast: 1 },
      { kind: "roomCount", type: "Hygiene", atLeast: 1 },
      { kind: "roomCount", type: "WCS", atLeast: 1 },
      { kind: "roomCount", type: "Control", atLeast: 1 },
    ],
  },
  {
    id: "moon-2-rest-capacity",
    title: "Crew rest capacity",
    explain:
      "Good sleep keeps astronauts healthy and focused. Add more sleeping rooms so at least two people can rest at the same time. "
      + "Private sleep areas also help with privacy and quiet time in a busy habitat.",
    requirements: [{ kind: "roomCount", type: "Sleep", atLeast: 2 }],
  },
  {
    id: "moon-3-storage",
    title: "Logistics stowage",
    explain:
      "Where do food packs, tools, and spare parts go? Storage! Make a storage room big enough to hold short-trip supplies. "
      + "Bigger storage = fewer resupplies and less clutter. Aim for at least 8 map cells of storage area.",
    requirements: [{ kind: "minArea", type: "Storage", atLeast: 8 }],
  },
  {
    id: "moon-4-exercise",
    title: "Exercise capability",
    explain:
      "In space, muscles and bones can get weaker. An exercise area lets the crew stay strong and healthy. "
      + "Place at least one exercise room. It’s usually near “dirty” areas (like hygiene) because workouts need ventilation and cleaning.",
    requirements: [{ kind: "roomCount", type: "Exercise", atLeast: 1 }],
  },
  {
    id: "moon-5-galley-usable",
    title: "Usable galley footprint",
    explain:
      "The galley is the kitchen of space! Make it big enough to prepare and warm food safely without blocking walkways. "
      + "Give it at least 4 map cells so the crew can eat and clean up comfortably.",
    requirements: [{ kind: "minArea", type: "Food", atLeast: 4 }],
  },
];


/* ---- evaluation helpers ---- */

function countRoomsByType(rooms: Room[]) {
  const m: Record<string, number> = {};
  for (const r of rooms) {
    if (!r.type) continue;
    m[r.type] = (m[r.type] ?? 0) + 1;
  }
  return m;
}

function largestAreaByType(rooms: Room[]) {
  const m: Record<string, number> = {};
  for (const r of rooms) {
    if (!r.type) continue;
    const area = r.cells.length;
    m[r.type] = Math.max(m[r.type] ?? 0, area);
  }
  return m;
}

export function evaluateStage(stage: Stage, rooms: Room[]) {
  const counts = countRoomsByType(rooms);
  const maxArea = largestAreaByType(rooms);

  const results = stage.requirements.map((req) => {
    if (req.kind === "roomCount") {
      const have = counts[req.type] ?? 0;
      return { req, have, met: have >= req.atLeast };
    }
    // req.kind === "minArea"
    const have = maxArea[req.type] ?? 0; // cells
    return { req, have, met: have >= req.atLeast };
  });

  const met = results.filter((r) => r.met).length;
  return {
    results,
    progress: results.length ? met / results.length : 0,
    complete: met === results.length,
  };
}
