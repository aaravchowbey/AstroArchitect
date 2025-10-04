import { useEffect, useRef, useState } from "react";

type Vec = { x: number; y: number };
type Cell = { r: number; c: number };
type Room = { id: string; cells: Cell[]; color: string; type?: string };
type Ghost =
  | { kind: "h"; r: number; c0: number; c1: number }
  | { kind: "v"; c: number; r0: number; r1: number }
  | null;

// edge types
const E_EMPTY = 0;
const E_WALL  = 1;
const E_DOOR  = 2;
const E_SOFT  = 3;

// visuals
const DOOR_COLOR = "rgba(79,209,197,0.95)";   // teal
const SOFT_COLOR = "rgba(255,255,255,0.82)";  // light white
const BG_COLOR   = "#0b1020";
const GRID_STROKE= "rgba(255,255,255,0.08)";
const BOUNDS_STROKE = "rgba(80,200,255,0.6)";

const UNTYPED_COLOR = "#808996";
const TYPE_COLORS: Record<string, string> = {
  Sleep: "#7CC6FE",
  Food: "#FFD166",
  Hygiene: "#95D5B2",
  Exercise: "#EF476F",
  Control: "#B8B8FF",
  Storage: "#F4A261",
};

export default function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dpr = window.devicePixelRatio || 1;

  // grid/world
  const GRID = 50, ROWS = 30, COLS = 40, WALL_THICK = 8;

  // view
  let scale = 1;
  let offset: Vec = { x: 0, y: 0 };

  // edges
  const [hEdges, setHEdges] = useState<number[][]>(
    () => Array.from({ length: ROWS + 1 }, () => Array(COLS).fill(E_EMPTY))
  );
  const [vEdges, setVEdges] = useState<number[][]>(
    () => Array.from({ length: ROWS }, () => Array(COLS + 1).fill(E_EMPTY))
  );

  const [rooms, setRooms] = useState<Room[]>([]);
  const [mode, setMode] = useState<"walls" | "pan">("walls");
  const [tool, setTool] = useState<"wall" | "door" | "soft">("wall");

  // recompute rooms on any edge change
  useEffect(() => { setRooms(prev => computeRooms(hEdges, vEdges, prev)); }, [hEdges, vEdges]);

function hasHardSealToOutside(
  comp: Cell[],
  outside: boolean[][],
  hE: number[][],
  vE: number[][],
  ROWS: number,
  COLS: number
): boolean {
  const inComp = new Set(comp.map(({ r, c }) => `${r},${c}`));
  const isHard = (t: number) => t === E_WALL || t === E_DOOR;

  for (const { r, c } of comp) {
    // up boundary: outside if r===0 or outside[r-1][c]
    if (r === 0 || outside[r - 1][c]) {
      const t = hE[r][c];
      if (!isHard(t)) return false;
    }
    // down boundary
    if (r === ROWS - 1 || outside[r + 1][c]) {
      const t = hE[r + 1][c];
      if (!isHard(t)) return false;
    }
    // left boundary
    if (c === 0 || outside[r][c - 1]) {
      const t = vE[r][c];
      if (!isHard(t)) return false;
    }
    // right boundary
    if (c === COLS - 1 || outside[r][c + 1]) {
      const t = vE[r][c + 1];
      if (!isHard(t)) return false;
    }
  }
  return true;
}





  function computeRooms(hE: number[][], vE: number[][], prevRooms: Room[]): Room[] {
    const blockedH = (r: number, c: number) => hE[r][c] !== E_EMPTY;
    const blockedV = (r: number, c: number) => vE[r][c] !== E_EMPTY;

    const canGo = (a: Cell, b: Cell): boolean => {
      if (b.r < 0 || b.r >= ROWS || b.c < 0 || b.c >= COLS) return false;
      if (b.r === a.r && b.c === a.c + 1) return !blockedV(a.r, a.c + 1);
      if (b.r === a.r && b.c === a.c - 1) return !blockedV(a.r, a.c);
      if (b.c === a.c && b.r === a.r + 1) return !blockedH(a.r + 1, a.c);
      if (b.c === a.c && b.r === a.r - 1) return !blockedH(a.r, a.c);
      return false;
    };

    // flood from outside
    const outside = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const q: Cell[] = [];
    for (let c = 0; c < COLS; c++) {
      if (!blockedH(0, c)) { outside[0][c] = true; q.push({ r: 0, c }); }
      if (!blockedH(ROWS, c)) { outside[ROWS - 1][c] = true; q.push({ r: ROWS - 1, c }); }
    }
    for (let r = 0; r < ROWS; r++) {
      if (!blockedV(r, 0)) { outside[r][0] = true; q.push({ r, c: 0 }); }
      if (!blockedV(r, COLS)) { outside[r][COLS - 1] = true; q.push({ r, c: COLS - 1 }); }
    }
    while (q.length) {
      const cur = q.shift()!;
      const nbrs = [
        { r: cur.r, c: cur.c + 1 }, { r: cur.r, c: cur.c - 1 },
        { r: cur.r + 1, c: cur.c }, { r: cur.r - 1, c: cur.c },
      ];
      for (const nb of nbrs) {
        if (nb.r < 0 || nb.r >= ROWS || nb.c < 0 || nb.c >= COLS) continue;
        if (outside[nb.r][nb.c]) continue;
        if (canGo(cur, nb)) { outside[nb.r][nb.c] = true; q.push(nb); }
      }
    }

    // map previous ownership to preserve types
    const prevOwner = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
    prevRooms.forEach((r, ri) => r.cells.forEach(({ r: rr, c: cc }) => {
      if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) prevOwner[rr][cc] = ri;
    }));

    // collect enclosed components
    const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const out: Room[] = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (outside[r][c] || seen[r][c]) continue;
      const comp: Cell[] = [];
      const st: Cell[] = [{ r, c }];
      seen[r][c] = true;
      while (st.length) {
        const cur = st.pop()!;
        comp.push(cur);
        const nbrs = [
          { r: cur.r, c: cur.c + 1 }, { r: cur.r, c: cur.c - 1 },
          { r: cur.r + 1, c: cur.c }, { r: cur.r - 1, c: cur.c },
        ];
        for (const nb of nbrs) {
          if (nb.r < 0 || nb.r >= ROWS || nb.c < 0 || nb.c >= COLS) continue;
          if (seen[nb.r][nb.c]) continue;
          if (!outside[nb.r][nb.c] && canGo(cur, nb)) { seen[nb.r][nb.c] = true; st.push(nb); }
        }
      }

// must be hard-sealed only where touching the outside
if (!hasHardSealToOutside(comp, outside, hE, vE, ROWS, COLS)) continue;



      // inherit majority type if overlapping prior room
      const counts = new Map<number, number>();
      for (const { r: rr, c: cc } of comp) {
        const oi = prevOwner[rr][cc];
        if (oi >= 0) counts.set(oi, (counts.get(oi) ?? 0) + 1);
      }
      let winner = -1, best = 0;
      counts.forEach((cnt, oi) => { if (cnt > best) { best = cnt; winner = oi; } });
      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
      out.push({ id, cells: comp, color: UNTYPED_COLOR, type: winner >= 0 ? prevRooms[winner].type : undefined });
    }
    return out;
  }

  // ---------- main drawing + input ----------
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0, height = 0;

    const worldOrigin: Vec = { x: -COLS * GRID / 2, y: -ROWS * GRID / 2 };

    const state = {
      panning: false,
      last: { x: 0, y: 0 } as Vec,
      drawing: false,
      startNode: { r: 0, c: 0 } as Cell,
      hoverNode: { r: 0, c: 0 } as Cell,
      ghost: null as Ghost,
    };

    // ----- helpers -----
    const setSize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const worldFromScreen = (sx: number, sy: number): Vec => ({ x: (sx - offset.x) / scale, y: (sy - offset.y) / scale });
    const screenFromWorld = (wx: number, wy: number): Vec => ({ x: wx * scale + offset.x, y: wy * scale + offset.y });
    const nodeToWorld = (n: Cell): Vec => ({ x: worldOrigin.x + n.c * GRID, y: worldOrigin.y + n.r * GRID });
    const clampNode = (n: Cell): Cell => ({ r: Math.max(0, Math.min(ROWS, n.r)), c: Math.max(0, Math.min(COLS, n.c)) });
    const nearestNode = (w: Vec): Cell => clampNode({ c: Math.round((w.x - worldOrigin.x) / GRID), r: Math.round((w.y - worldOrigin.y) / GRID) });

    const nearestEdge = (w: Vec): { kind: "h" | "v"; r: number; c: number } => {
      const u = (w.x - worldOrigin.x) / GRID;
      const v = (w.y - worldOrigin.y) / GRID;
      const du = Math.abs(u - Math.round(u));
      const dv = Math.abs(v - Math.round(v));
      if (dv < du) {
        const r = Math.max(0, Math.min(ROWS, Math.round(v)));
        const c = Math.max(0, Math.min(COLS - 1, Math.floor(u)));
        return { kind: "h", r, c };
      } else {
        const c = Math.max(0, Math.min(COLS, Math.round(u)));
        const r = Math.max(0, Math.min(ROWS - 1, Math.floor(v)));
        return { kind: "v", r, c };
      }
    };
    const ghostFromEdge = (e: { kind:"h"|"v"; r:number; c:number }): Ghost =>
      e.kind === "h"
        ? { kind: "h", r: e.r, c0: e.c, c1: e.c + 1 }
        : { kind: "v", c: e.c, r0: e.r, r1: e.r + 1 };

    // draw three centered mini-segments on a single tile edge
    function triSeg(ax:number, ay:number, bx:number, by:number, color:string, width:number) {
      const dx = bx - ax, dy = by - ay;
      const L = Math.hypot(dx, dy) || 1;
      const ux = dx / L, uy = dy / L;

      // choose segment and gap lengths so 3 segments are centered
      const segLen = Math.min(L * 0.22, 18);  // in px
      const midGap = Math.min(L * 0.15, 10);  // gap between segments
      const totalSeg = 3 * segLen + 2 * midGap;
      const endGap = Math.max(0, (L - totalSeg) / 2);

      const offs = [
        [endGap, endGap + segLen],
        [endGap + segLen + midGap, endGap + 2 * segLen + midGap],
        [endGap + 2 * segLen + 2 * midGap, endGap + 3 * segLen + 2 * midGap],
      ];

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.setLineDash([]); // solid mini-segments
      for (const [s, t] of offs) {
        const sx = ax + ux * s, sy = ay + uy * s;
        const tx = ax + ux * t, ty = ay + uy * t;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty); ctx.stroke();
      }
      ctx.restore();
    }

    // ----- drawing -----
    const drawGrid = () => {
      ctx.fillStyle = BG_COLOR; ctx.fillRect(0, 0, width, height);
      const minW = worldFromScreen(0, 0), maxW = worldFromScreen(width, height);
      ctx.lineWidth = 1; ctx.strokeStyle = GRID_STROKE; ctx.beginPath();
      for (let c = 0; c <= COLS; c++) {
        const wx = worldOrigin.x + c * GRID; if (wx < minW.x - GRID || wx > maxW.x + GRID) continue;
        const sx = screenFromWorld(wx, 0).x; ctx.moveTo(sx, 0); ctx.lineTo(sx, height);
      }
      for (let r = 0; r <= ROWS; r++) {
        const wy = worldOrigin.y + r * GRID; if (wy < minW.y - GRID || wy > maxW.y + GRID) continue;
        const sy = screenFromWorld(0, wy).y; ctx.moveTo(0, sy); ctx.lineTo(width, sy);
      }
      ctx.stroke();
      const tl = screenFromWorld(worldOrigin.x, worldOrigin.y);
      const br = screenFromWorld(worldOrigin.x + COLS * GRID, worldOrigin.y + ROWS * GRID);
      ctx.strokeStyle = BOUNDS_STROKE; ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    };

    const drawRooms = () => {
      ctx.save(); ctx.globalAlpha = 0.28;
      for (const room of rooms) {
        const color = room.type ? TYPE_COLORS[room.type] ?? UNTYPED_COLOR : UNTYPED_COLOR;
        ctx.fillStyle = color;
        for (const cell of room.cells) {
          const p = screenFromWorld(worldOrigin.x + cell.c * GRID, worldOrigin.y + cell.r * GRID);
          ctx.fillRect(p.x, p.y, GRID * scale, GRID * scale);
        }
      }
      ctx.restore();
    };

    const drawEdges = () => {
      const w = Math.max(2.25, WALL_THICK * scale);
      ctx.lineCap = "round"; ctx.lineJoin = "round";

      const drawSegment = (ax:number, ay:number, bx:number, by:number, type:number) => {
        if (type === E_EMPTY) return;
        if (type === E_WALL) {
          ctx.strokeStyle = "white";
          ctx.lineWidth = w;
          ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          return;
        }
        if (type === E_DOOR) { triSeg(ax, ay, bx, by, DOOR_COLOR, Math.max(1.8, w * 0.7)); return; }
        if (type === E_SOFT) { triSeg(ax, ay, bx, by, SOFT_COLOR, Math.max(1.2, w * 0.5)); return; }
      };

      // horizontal
      for (let r = 0; r <= ROWS; r++) for (let c = 0; c < COLS; c++) {
        const a = screenFromWorld(worldOrigin.x + c * GRID, worldOrigin.y + r * GRID);
        const b = screenFromWorld(worldOrigin.x + (c + 1) * GRID, worldOrigin.y + r * GRID);
        drawSegment(a.x, a.y, b.x, b.y, hEdges[r][c]);
      }
      // vertical
      for (let r = 0; r < ROWS; r++) for (let c = 0; c <= COLS; c++) {
        const a = screenFromWorld(worldOrigin.x + c * GRID, worldOrigin.y + r * GRID);
        const b = screenFromWorld(worldOrigin.x + c * GRID, worldOrigin.y + (r + 1) * GRID);
        drawSegment(a.x, a.y, b.x, b.y, vEdges[r][c]);
      }
    };

    const drawGhost = () => {
      if (!state.ghost) return;
      const w = Math.max(2.25, WALL_THICK * scale);

      // helper to draw a single tile-edge ghost as triSeg
      const triGhost = (ax:number, ay:number, bx:number, by:number, color:string, width:number) => {
        triSeg(ax, ay, bx, by, color, width);
      };

      if (tool === "wall") {
        const [ax, ay, bx, by] = (() => {
          if (state.ghost!.kind === "h") {
            const a = screenFromWorld(worldOrigin.x + state.ghost!.c0 * GRID, worldOrigin.y + state.ghost!.r * GRID);
            const b = screenFromWorld(worldOrigin.x + state.ghost!.c1 * GRID, worldOrigin.y + state.ghost!.r * GRID);
            return [a.x, a.y, b.x, b.y] as const;
          } else {
            const a = screenFromWorld(worldOrigin.x + state.ghost!.c * GRID, worldOrigin.y + state.ghost!.r0 * GRID);
            const b = screenFromWorld(worldOrigin.x + state.ghost!.c * GRID, worldOrigin.y + state.ghost!.r1 * GRID);
            return [a.x, a.y, b.x, b.y] as const;
          }
        })();
        ctx.setLineDash([]); ctx.lineWidth = w; ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        return;
      }

      if (tool === "door") {
        // single tile segment, always centered under cursor
        const [ax, ay, bx, by] = (() => {
          if (state.ghost!.kind === "h") {
            const a = screenFromWorld(worldOrigin.x + state.ghost!.c0 * GRID, worldOrigin.y + state.ghost!.r * GRID);
            const b = screenFromWorld(worldOrigin.x + (state.ghost!.c0 + 1) * GRID, worldOrigin.y + state.ghost!.r * GRID);
            return [a.x, a.y, b.x, b.y] as const;
          } else {
            const a = screenFromWorld(worldOrigin.x + state.ghost!.c * GRID, worldOrigin.y + state.ghost!.r0 * GRID);
            const b = screenFromWorld(worldOrigin.x + state.ghost!.c * GRID, worldOrigin.y + (state.ghost!.r0 + 1) * GRID);
            return [a.x, a.y, b.x, b.y] as const;
          }
        })();
        triGhost(ax, ay, bx, by, DOOR_COLOR, Math.max(1.8, w * 0.7));
        return;
      }

      // tool === "soft": iterate each tile in the span and draw tri segments per tile
      if (state.ghost!.kind === "h") {
        const r = state.ghost!.r;
        const a = Math.min(state.ghost!.c0, state.ghost!.c1);
        const b = Math.max(state.ghost!.c0, state.ghost!.c1);
        for (let c = a; c < b; c++) {
          const A = screenFromWorld(worldOrigin.x + c * GRID, worldOrigin.y + r * GRID);
          const B = screenFromWorld(worldOrigin.x + (c + 1) * GRID, worldOrigin.y + r * GRID);
          triGhost(A.x, A.y, B.x, B.y, SOFT_COLOR, Math.max(1.2, w * 0.5));
        }
      } else {
        const c = state.ghost!.c;
        const a = Math.min(state.ghost!.r0, state.ghost!.r1);
        const b = Math.max(state.ghost!.r0, state.ghost!.r1);
        for (let r = a; r < b; r++) {
          const A = screenFromWorld(worldOrigin.x + c * GRID, worldOrigin.y + r * GRID);
          const B = screenFromWorld(worldOrigin.x + c * GRID, worldOrigin.y + (r + 1) * GRID);
          triGhost(A.x, A.y, B.x, B.y, SOFT_COLOR, Math.max(1.2, w * 0.5));
        }
      }
    };

    const drawSnap = () => {
      const p = screenFromWorld(nodeToWorld(state.hoverNode).x, nodeToWorld(state.hoverNode).y);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(2, 4 * Math.sqrt(scale)), 0, Math.PI * 2); ctx.fill();
    };

    const drawHUD = () => {
      ctx.fillStyle = "#cde7ff";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(`mode: ${mode} | tool: ${tool} | rooms: ${rooms.length}`, 10, 18);
      ctx.fillText("Wall=solid span • Door=3 mini-segs on one tile • Soft=3 mini-segs per tile span. Space=pan. 1/2/3 switch. Backspace=erase.", 10, 34);
    };

    const draw = () => { drawGrid(); drawRooms(); drawEdges(); drawGhost(); drawSnap(); drawHUD(); };

    // ----- commit -----
    function commitGhost(g: Ghost) {
      if (!g) return;

      if (tool === "wall" || tool === "soft") {
        const val = tool === "wall" ? E_WALL : E_SOFT;
        if (g.kind === "h") {
          const r = g.r, a = Math.max(0, Math.min(COLS, g.c0)), b = Math.max(0, Math.min(COLS, g.c1));
          const [c0, c1] = a <= b ? [a, b] : [b, a];
          setHEdges(prev => { const next = prev.map(row => row.slice()); for (let c = c0; c < c1; c++) next[r][c] = val; return next; });
        } else {
          const c = g.c, a = Math.max(0, Math.min(ROWS, g.r0)), b = Math.max(0, Math.min(ROWS, g.r1));
          const [r0, r1] = a <= b ? [a, b] : [b, a];
          setVEdges(prev => { const next = prev.map(row => row.slice()); for (let r = r0; r < r1; r++) next[r][c] = val; return next; });
        }
        return;
      }

      // door: one segment
      const val = E_DOOR;
      if (g.kind === "h") {
        const r = g.r, c = Math.max(0, Math.min(COLS - 1, g.c0));
        setHEdges(prev => { const next = prev.map(row => row.slice()); next[r][c] = val; return next; });
      } else {
        const c = g.c, r = Math.max(0, Math.min(ROWS - 1, g.r0));
        setVEdges(prev => { const next = prev.map(row => row.slice()); next[r][c] = val; return next; });
      }
    }

    // ----- events -----
    const onResize = () => setSize();

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;

      if (mode === "pan") { state.panning = true; state.last = { x: e.clientX, y: e.clientY }; return; }

      const wpos = worldFromScreen(sx, sy);

      if (tool === "door") {
        // single-edge placement
        state.drawing = true;
        state.ghost = ghostFromEdge(nearestEdge(wpos));
        draw();
        return;
      }

      // wall and soft span
      const node = nearestNode(wpos);
      state.startNode = node;
      state.hoverNode = node;
      state.drawing = true;
      state.ghost = null;
      draw();
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;

      if (state.panning) {
        offset.x += e.clientX - state.last.x; offset.y += e.clientY - state.last.y;
        state.last = { x: e.clientX, y: e.clientY }; draw(); return;
      }

      const wpos = worldFromScreen(sx, sy);

      if (tool === "door") {
        // show centered door ghost under cursor even when not dragging
        state.ghost = ghostFromEdge(nearestEdge(wpos));
        state.hoverNode = nearestNode(wpos);
        draw();
        return;
      }

      // wall and soft span preview
      state.hoverNode = nearestNode(wpos);
      if (state.drawing) {
        const a = state.startNode, b = state.hoverNode;
        const dr = Math.abs(b.r - a.r), dc = Math.abs(b.c - a.c);
        state.ghost =
          dr === 0 && dc === 0 ? null
          : (dc >= dr ? { kind:"h", r:a.r, c0:a.c, c1:b.c } : { kind:"v", c:a.c, r0:a.r, r1:b.r });
      }
      draw();
    };

    const onMouseUp = () => {
      state.panning = false;
      if (!state.drawing) return;
      state.drawing = false;
      if (state.ghost) commitGhost(state.ghost);
      state.ghost = null; draw();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") setMode("pan");
      if (e.key === "1") setTool("wall");
      if (e.key === "2") setTool("door");
      if (e.key === "3") setTool("soft");
      if (e.key === "Backspace") {
        // erase edge closest to snapped corner
        const n = state.hoverNode;
        const h = { r: n.r, c: Math.max(0, Math.min(COLS - 1, n.c - 1)) };
        const v = { r: Math.max(0, Math.min(ROWS - 1, n.r - 1)), c: n.c };
        if (h.r >= 0 && h.r <= ROWS && h.c >= 0 && h.c < COLS && hEdges[h.r][h.c] !== E_EMPTY) {
          setHEdges(prev => { const next = prev.map(r=>r.slice()); next[h.r][h.c] = E_EMPTY; return next; });
        } else if (v.r >= 0 && v.r < ROWS && v.c >= 0 && v.c <= COLS && vEdges[v.r][v.c] !== E_EMPTY) {
          setVEdges(prev => { const next = prev.map(r=>r.slice()); next[v.r][v.c] = E_EMPTY; return next; });
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === "Space") setMode("walls"); };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const worldBefore = worldFromScreen(mx, my);
      const zoom = Math.exp(-e.deltaY * 0.001);
      const newScale = Math.min(4, Math.max(0.25, scale * zoom));
      offset.x = mx - worldBefore.x * newScale; offset.y = my - worldBefore.y * newScale; scale = newScale; draw();
    };

    // Drag-and-drop room typing from external palette
    const onDragOver = (e: DragEvent) => { e.preventDefault(); };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer?.getData("text/plain");
      if (!data) return;
      let payload: { kind: "roomType" | "object"; id: string } | null = null;
      try { payload = JSON.parse(data); } catch { return; }

      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      const w = worldFromScreen(sx, sy);
      const c = Math.floor((w.x - worldOrigin.x) / GRID);
      const r = Math.floor((w.y - worldOrigin.y) / GRID);
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

      const ri = rooms.findIndex(room => room.cells.some(cell => cell.r === r && cell.c === c));
      if (ri < 0) return;

      if (payload && payload.kind === "roomType") {
        setRooms(prev => prev.map((room, idx) => idx === ri ? { ...room, type: payload!.id } : room));
      }
      draw();
    };

    // init + listeners
    setSize();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dragover", onDragOver);
    canvas.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onWheel as any);
      canvas.removeEventListener("dragover", onDragOver as any);
      canvas.removeEventListener("drop", onDrop as any);
    };
  }, [dpr, hEdges, vEdges, rooms, mode, tool]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: "100vw", height: "100vh", display: "block", cursor: mode === "pan" ? "grab" : "crosshair" }}
      />
      <div
        style={{
          position: "fixed", top: 8, right: 8, background: "rgba(0,0,0,0.55)",
          color: "white", padding: "8px 10px", borderRadius: 8, fontFamily: "ui-monospace, monospace", fontSize: 12
        }}
      >
        <div>Mode: <strong>{mode}</strong></div>
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          <button onClick={() => setMode("walls")} style={{ padding: "4px 8px" }}>Walls</button>
          <button onClick={() => setMode("pan")} style={{ padding: "4px 8px" }}>Pan</button>
          <button onClick={() => setTool("wall")} style={{ padding: "4px 8px" }}>Tool: Wall (1)</button>
          <button onClick={() => setTool("door")} style={{ padding: "4px 8px" }}>Tool: Door (2)</button>
          <button onClick={() => setTool("soft")} style={{ padding: "4px 8px" }}>Tool: Soft (3)</button>
          <button
            onClick={() => {
              setHEdges(Array.from({ length: ROWS + 1 }, () => Array(COLS).fill(E_EMPTY)));
              setVEdges(Array.from({ length: ROWS }, () => Array(COLS + 1).fill(E_EMPTY)));
              setRooms([]);
            }}
            style={{ padding: "4px 8px" }}
          >Clear</button>
        </div>
        <div style={{ marginTop: 6 }}>
          Wall: solid • Door: 3 centered mini-segments (one tile) • Soft: 3 centered mini-segments per tile (span). All enclose rooms.
        </div>
        <div>Space=pan • 1/2/3 switch tool • Backspace erases edge under cursor</div>
      </div>
    </>
  );
}
