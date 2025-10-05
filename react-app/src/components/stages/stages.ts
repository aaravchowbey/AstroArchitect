import type { Room } from "./types";

/** Requirement types */
export type Requirement =
  | { kind: "roomCount"; type: string; atLeast: number } // >= N rooms of a type
  | { kind: "minArea"; type: string; atLeast: number }; // any one room of type has >= N cells

export type Stage = {
  id: string;
  title: string;
  explain?: string;
  requirements: Requirement[];
};

export const MOON_STAGES: Stage[] = [
  {
    id: "moon-1-clean-dirty-basics",
    title: "Set up the clean & dirty basics",
    explain:
      "In space, layout matters more than size! A small, well-organized habitat is better than a big messy one. " +
      "Astronauts separate clean areas (sleeping, kitchen (also called a galley!)), control) from dirty areas (hygiene and exercise). " +
      "Start with an airlock as your anchor and then attaching one of each essential room so the crew can rest, eat, and stay healthy. " +
      "Tip: keep Sleep + Galley + Hygiene near each other, and Waste Collection Systems (WCS) + Exercise a little apart to reduce germs and smells.",
    requirements: [
      { kind: "roomCount", type: "Sleep", atLeast: 1 },
      { kind: "roomCount", type: "Galley", atLeast: 1 },
      { kind: "roomCount", type: "WCS", atLeast: 1 },
      { kind: "roomCount", type: "Hygiene", atLeast: 1 },
      { kind: "roomCount", type: "Airlock", atLeast: 1 },
    ],
  },

  {
    id: "moon-2-private-quarters",
    title: "Give everyone a private bunk",
    explain:
      "Every crewmember needs a private spot to sleep and relax. For missions under 30 days, sleeping quarters can be deployable instead of fully permanent, " +
      'but they still need to feel safe and comftorbale. Real designs aim for at least 30" wide x 30" deep x >78" long with a door or curtain, adjustable ventilation, power, ' +
      "and places to mount personal items. Add another Sleep room so two people can rest at once—and keep Sleep with the other clean areas.",
    requirements: [{ kind: "roomCount", type: "Sleep", atLeast: 2 }],
  },

  {
    id: "moon-3-ops-and-command",
    title: "Bring ops/command online",
    explain:
      "The crew needs a small Control area to watch the habitat, talk to Earth, and run procedures. " +
      "Critical commanding should be on a hard-wired workstation (wireless is fine for casual monitoring, not for commands). " +
      "Place Control with other clean spaces so it stays quiet and tidy. Keep traffic paths clear so people can move during alarms.",
    requirements: [{ kind: "roomCount", type: "Control", atLeast: 1 }],
  },

  {
    id: "moon-4-fitness-zone",
    title: "Add an exercise spot",
    explain:
      "In microgravity, muscles and bones weaken unless astronauts work out. For short (<30-day) trips a deployable exercise device is OK; " +
      "longer trips prefer a permanent setup. Put Exercise near the dirty cluster (close to WCS) with good airflow. " +
      "Exercise rooms often have windows nearby as a bonus for mood! Watching Earth or the Moon while training helps morale!",
    requirements: [{ kind: "roomCount", type: "Exercise", atLeast: 1 }],
  },

  {
    id: "moon-5-stow-it-smart",
    title: "Make space for supplies",
    explain:
      "Food packs, tools, and spare parts need a home so the hab doesn't turn into floating clutter. " +
      "Create a Storage room large enough for short-trip logistics and clearly label zones so items are easy to find. " +
      "Real missions budget roughly a week of consumables in quick-reach stowage; we'll simulate that by asking for a Storage area of several tiles. " +
      "Keep Storage out of tight corridors and away from the most sensitive clean workspaces.",
    requirements: [{ kind: "minArea", type: "Storage", atLeast: 6 }],
  },

  {
    id: "moon-6-galley-that-works",
    title: "Make the galley truly usable",
    explain:
      "The Galley area should handle warming meals and drinks without blocking paths. " +
      "For short missions, a potable water dispenser and food warmer can be enough; longer missions add hot/cold water, cold storage, and a table big enough for everyone. " +
      "Keep the galley with other clean areas and give it a bit more footprint so two crew can use it without bumping elbows.",
    requirements: [{ kind: "minArea", type: "Galley", atLeast: 4 }],
  },
  {
    id: "moon-final-congrats",
    title: "Mission accomplished!",
    explain:
      "Great work, Mission Designer! You planned a functional Moon habitat by balancing clean vs. dirty areas, " +
      "privacy, airflow, and storage. Try tweaking layouts (or advance to longer-duration missions) to see how " +
      "small changes affect livability.",
    requirements: [],
  },
];

// Deep-space Transit (30–180 days)
// Uses ONLY: { kind: "roomCount" | "minArea" }
export const TRANSIT_STAGES: Stage[] = [
  {
    id: "dst-1-core-systems",
    title: "Bring the ship online",
    explain:
      "For months in deep space, you'll need a bigger habitat. Once again, start small and smart: you need places to sleep, eat, stay healthy, and command the vehicle. " +
      "Keep “clean” areas (sleep, galley, control, hygiene) apart from “dirty” areas (WCS, exercise) to limit cross-contamination.",
    requirements: [
      { kind: "roomCount", type: "Sleep", atLeast: 2 },
      { kind: "roomCount", type: "Galley", atLeast: 1 }, // galley
      { kind: "roomCount", type: "Control", atLeast: 1 }, // hardwired workstation lives here
      { kind: "roomCount", type: "Hygiene", atLeast: 1 },
      { kind: "roomCount", type: "WCS", atLeast: 1 },
    ],
  },
  {
    id: "dst-2-private-quarters",
    title: "Private quarters for the crew",
    explain:
      "Privacy helps crews rest and manage stress. Everyone should have a private sleep pod near other clean areas. " +
      "For missions longer than 30 days, these pods should be permanent, with ventilation and simple power/data hookups.",
    requirements: [
      { kind: "roomCount", type: "Sleep", atLeast: 4 },
      // (If you later add per-room sizing, enforce ≥1–2 tiles each here.)
    ],
  },
  {
    id: "dst-3-hygiene-and-wcs",
    title: "Hygiene + WCS should be far apart",
    explain:
      "Hygiene and the WCS are opposite by definition. Keep them far apart from each other and keep the WCS far from the kitchen to limit contamination. " +
      "Both should be enclosed and well-ventilated so smells/particles don't migrate. Maintenance access around the WCS is important.",
    requirements: [
      { kind: "roomCount", type: "Hygiene", atLeast: 1 },
      { kind: "roomCount", type: "WCS", atLeast: 1 },
      // (When adjacency rules exist, nudge these to be neighbors.)
    ],
  },
  {
    id: "dst-4-nutrition-and-common-table",
    title: "Galley with space to gather",
    explain:
      "The galley is more than a microwave—it's where the crew rehydrates meals, stows a week of food, and meets. " +
      "Give the galley enough area to prep/eat without blocking traffic. A shared table doubles as a morale-boosting common area.",
    requirements: [
      { kind: "minArea", type: "Galley", atLeast: 6 }, // roomy enough for prep + seating
    ],
  },
  {
    id: "dst-5-exercise-ventilation",
    title: "Exercise capability and airflow",
    explain:
      "Long trips weaken bones and muscles. Add an exercise area near the 'dirty' cluster so cleanup and airflow are straightforward. " +
      "Keep it out of clean zones and ensure good ventilation. A nearby window (if available) helps morale during workouts.",
    requirements: [{ kind: "roomCount", type: "Exercise", atLeast: 1 }],
  },
  {
    id: "dst-6-logistics-stowage",
    title: "Logistics: stowage for weeks",
    explain:
      "Supplies pile up fast. Provide a dedicated storage room large enough for food packs, spares, and trash segregation. " +
      "A well-placed store keeps the galley clear and reduces time spent hunting for gear.",
    requirements: [{ kind: "minArea", type: "Storage", atLeast: 12 }],
  },
  {
    id: "dst-7-redundant-command",
    title: "Redundancy for critical commanding",
    explain:
      "Deep-space vehicles rely on reliable, hardwired commanding. Provide a backup control space so critical functions continue if one station is down. " +
      "Wireless tablets are fine for monitoring, not for commanding.",
    requirements: [{ kind: "roomCount", type: "Control", atLeast: 2 }],
  },
  {
    id: "dst-8-congrats",
    title: "Transit-ready habitat - nice work!",
    explain:
      "You built a compact, functional ship: clean/dirty separation, private sleep, a usable galley/common table, exercise, logistics stowage, and redundant control. " +
      "Try iterating: shrink footprints, improve separation, or regroup rooms to shorten daily travel paths without sacrificing safety.",
    requirements: [
      // No additional requirements—this is your victory lap.
      { kind: "roomCount", type: "Sleep", atLeast: 4 },
      { kind: "roomCount", type: "Galley", atLeast: 1 },
      { kind: "roomCount", type: "Hygiene", atLeast: 1 },
      { kind: "roomCount", type: "WCS", atLeast: 1 },
      { kind: "roomCount", type: "Exercise", atLeast: 1 },
      { kind: "roomCount", type: "Control", atLeast: 2 },
      { kind: "minArea", type: "Storage", atLeast: 12 },
    ],
  },
];

export const MARS_STAGES: Stage[] = [
  {
    id: "mars-1-foundation",
    title: "Foundation: survive the long stay",
    explain:
      "Mars missions are long and unforgiving. Start with the must-haves: a sealed Airlock for EVAs, a Control area for commanding, "
      + "a Galley for safe food prep, private Sleep quarters, plus enclosed Hygiene and a dedicated WCS. "
      + "Keep clean zones (Sleep, Galley, Control) separated from dirty zones (Hygiene, WCS, Exercise). A well-laid-out small footprint beats a messy large one.",
    requirements: [
      { kind: "roomCount", type: "Airlock", atLeast: 1 },
      { kind: "roomCount", type: "Control", atLeast: 1 },
      { kind: "roomCount", type: "Galley", atLeast: 1 },
      { kind: "roomCount", type: "Sleep", atLeast: 2 },
      { kind: "roomCount", type: "Hygiene", atLeast: 1 },
      { kind: "roomCount", type: "WCS", atLeast: 1 },
    ],
  },
  {
    id: "mars-2-crew-capacity",
    title: "Crew capacity & private quarters",
    explain:
      "Every crewmember needs a private sleep pod (permanent for long missions), located with other clean areas. "
      + "Targets often use ≥30\"×30\"×78\" pods with ventilation, power/data, and stowage access. Scale sleep to full crew.",
    requirements: [{ kind: "roomCount", type: "Sleep", atLeast: 4 }],
  },
  {
    id: "mars-3-redundant-airlocks",
    title: "Redundant airlocks for EVA safety",
    explain:
      "Airlock redundancy protects the habitat if one seal fails or is down for maintenance. "
      + "Two independent Airlocks also deconflict science/maintenance egress with logistics returns.",
    requirements: [{ kind: "roomCount", type: "Airlock", atLeast: 2 }],
  },
  {
    id: "mars-4-galley-upgrade",
    title: "Galley: meal prep + crew table",
    explain:
      "For >180 days, the Galley should support hot/cold potable water, warming, local cold storage, and a table large enough for the whole crew. "
      + "Keep it in the clean cluster and out of traffic pinch points. Give it real working area.",
    requirements: [{ kind: "minArea", type: "Galley", atLeast: 8 }],
  },
  {
    id: "mars-5-hygiene-and-wcs-scale",
    title: "Scale hygiene & WCS for duration",
    explain:
      "Separate, enclosed, and well-ventilated Hygiene and WCS reduce cross-contamination. "
      + "Ensure room to access all sides of the WCS for maintenance; do not co-locate with the Galley.",
    requirements: [
      { kind: "roomCount", type: "Hygiene", atLeast: 2 },
      { kind: "roomCount", type: "WCS", atLeast: 2 },
    ],
  },
  {
    id: "mars-6-exercise-and-airflow",
    title: "Exercise: daily countermeasures",
    explain:
      "Long stays demand consistent exercise to protect bone and muscle. "
      + "Place Exercise with the dirty cluster for easier cleanup and airflow management. "
      + "A nearby view window (if available) helps morale during workouts.",
    requirements: [{ kind: "roomCount", type: "Exercise", atLeast: 2 }],
  },
  {
    id: "mars-7-common-area-morale",
    title: "Common area for team cohesion",
    explain:
      "A common space where the entire crew can gather supports mental health and teamwork. "
      + "It can integrate with the Galley table, but must not block critical egress or work paths.",
    requirements: [
      { kind: "roomCount", type: "Common", atLeast: 1 },
      { kind: "minArea", type: "Common", atLeast: 8 },
    ],
  },
  {
    id: "mars-8-science-capability",
    title: "Science lab & work surfaces",
    explain:
      "Dedicated science space enables sampling, analysis, and payload ops away from food and personal areas. "
      + "Provide stable work surfaces, stowage, and contamination control within the clean cluster.",
    requirements: [
      { kind: "roomCount", type: "Science", atLeast: 1 },
      { kind: "minArea", type: "Science", atLeast: 12 },
    ],
  },
  {
    id: "mars-9-logistics-and-stowage",
    title: "Logistics stowage for months",
    explain:
      "Consumables, spares, and waste grow with mission length. "
      + "A large, organized Storage room keeps other areas usable and shortens search time. "
      + "Separate wet/dry trash; keep Storage out of tight corridors.",
    requirements: [{ kind: "minArea", type: "Storage", atLeast: 40 }],
  },
  {
    id: "mars-10-redundant-command",
    title: "Redundant hardwired command",
    explain:
      "Critical commanding must remain available through failures. "
      + "Provide a second hardwired Control location-wireless tablets are fine for monitoring, not for commands.",
    requirements: [{ kind: "roomCount", type: "Control", atLeast: 2 }],
  },
  {
    id: "mars-11-living-quality-pass",
    title: "Living-quality pass: refine layout",
    explain:
      "Do a final pass: clean/dirty separation, private quarters near clean areas, enclosed Hygiene/WCS with airflow, "
      + "a usable Galley/Common, robust Storage, Exercise in dirty cluster, a Science lab in clean cluster, and redundant Control/Airlocks. "
      + "Aim for the smallest layout that still supports safe daily ops.",
    requirements: [
      { kind: "roomCount", type: "Airlock", atLeast: 2 },
      { kind: "roomCount", type: "Control", atLeast: 2 },
      { kind: "roomCount", type: "Galley", atLeast: 1 },
      { kind: "minArea", type: "Galley", atLeast: 8 },
      { kind: "roomCount", type: "Sleep", atLeast: 4 },
      { kind: "roomCount", type: "Hygiene", atLeast: 2 },
      { kind: "roomCount", type: "WCS", atLeast: 2 },
      { kind: "roomCount", type: "Exercise", atLeast: 2 },
      { kind: "roomCount", type: "Common", atLeast: 1 },
      { kind: "minArea", type: "Common", atLeast: 8 },
      { kind: "roomCount", type: "Science", atLeast: 1 },
      { kind: "minArea", type: "Science", atLeast: 12 },
      { kind: "minArea", type: "Storage", atLeast: 40 },
    ],
  },
  {
    id: "mars-final-congrats",
    title: "Surface-ready outpost — congratulations!",
    explain:
      "Congrats! You've designed a Mars habitat with long-duration essentials and smart layout. "
      + "Next challenges (when you add systems): enforce adjacency rules, windows/views, ventilation paths, and maintainability clearances.",
    requirements: [],
  },
];


const TUTORIAL_STAGES: Stage[] = [
  {
    id: "tutorial-0-basics",
    title: "Tutorial: Build & Assign",
    explain:
      "Learn the basics: Click-and-drag to draw walls to enclose a room. Switch to the Door tool (2) to place doors so rooms connect, and use the Partition tool (3) for soft dividers that visually separate space without full sealing. Additionally, there's the Eraser tool (E) to erase walls that you've built.\n\n" +
      "Once you've enclosed a room, open the Palette and drag a room type (for example 'Sleep Quarters') onto the room to assign it.\n\n" +
      "Try: build one small room, add at least one door, optionally add a partition, and assign the room type from the Palette.",
    requirements: [{ kind: "roomCount", type: "Sleep", atLeast: 1 }],
  },
];

export function getStagesForLevel(levelId?: string): Stage[] {
  switch (levelId) {
    case "tutorial":
      return TUTORIAL_STAGES;
    case "transit":
      return TRANSIT_STAGES;
    case "mars":
      return MARS_STAGES;
    case "moon":
    default:
      return MOON_STAGES;
  }
}

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
    if (req.kind === "minArea") {
      const have = maxArea[req.type] ?? 0; // cells
      return { req, have, met: have >= req.atLeast };
    }

    return { req, have: 0, met: false };
  });

  const met = results.filter((r) => r.met).length;
  return {
    results,
    progress: results.length ? met / results.length : 0,
    complete: met === results.length,
  };
}
