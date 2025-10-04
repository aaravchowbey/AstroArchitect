import { useEffect, useRef, useState } from "react";

type Vec = { x: number; y: number };
type Cell = { r: number; c: number };
type Room = { id: string; cells: Cell[]; color: string; type?: string };
type Ghost =
  | { kind: "h"; r: number; c0: number; c1: number }
  | { kind: "v"; c: number; r0: number; r1: number }
  | null;

const UNTYPED_COLOR = "#808996"; // muted gray for unassigned rooms
const TYPE_COLORS: Record<string, string> = {
Sleep:"#7CC6FE", Food:"#FFD166", Hygiene:"#95D5B2",
Exercise:"#EF476F", Control:"#B8B8FF", Storage:"#F4A261",
};


export default function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dpr = window.devicePixelRatio || 1;

  // ----- grid/world -----
  const GRID = 50;       // world units per cell
  const ROWS = 30;
  const COLS = 40;
  const WALL_THICK = 8;  // world units

  // view transform
  let scale = 1;
  let offset: Vec = { x: 0, y: 0 };

  // walls
  const [hWalls, setHWalls] = useState<boolean[][]>(
    () => Array.from({ length: ROWS + 1 }, () => Array(COLS).fill(false))
  );
  const [vWalls, setVWalls] = useState<boolean[][]>(
    () => Array.from({ length: ROWS }, () => Array(COLS + 1).fill(false))
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mode, setMode] = useState<"walls" | "pan">("walls");
  
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

    // ----- transforms -----
    const setSize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const worldFromScreen = (sx: number, sy: number): Vec => ({
      x: (sx - offset.x) / scale,
      y: (sy - offset.y) / scale,
    });
    const screenFromWorld = (wx: number, wy: number): Vec => ({
      x: wx * scale + offset.x,
      y: wy * scale + offset.y,
    });
    const nodeToWorld = (n: Cell): Vec => ({
      x: worldOrigin.x + n.c * GRID,
      y: worldOrigin.y + n.r * GRID,
    });
    const clampNode = (n: Cell): Cell => ({
      r: Math.max(0, Math.min(ROWS, n.r)),
      c: Math.max(0, Math.min(COLS, n.c)),
    });
    const nearestNode = (w: Vec): Cell => {
      const c = Math.round((w.x - worldOrigin.x) / GRID);
      const r = Math.round((w.y - worldOrigin.y) / GRID);
      return clampNode({ r, c });
    };

    // ----- visuals -----
    const drawGrid = () => {
      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, width, height);

      const minW = worldFromScreen(0, 0);
      const maxW = worldFromScreen(width, height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      for (let c = 0; c <= COLS; c++) {
        const wx = worldOrigin.x + c * GRID;
        if (wx < minW.x - GRID || wx > maxW.x + GRID) continue;
        const sx = screenFromWorld(wx, 0).x;
        ctx.moveTo(sx, 0); ctx.lineTo(sx, height);
      }
      for (let r = 0; r <= ROWS; r++) {
        const wy = worldOrigin.y + r * GRID;
        if (wy < minW.y - GRID || wy > maxW.y + GRID) continue;
        const sy = screenFromWorld(0, wy).y;
        ctx.moveTo(0, sy); ctx.lineTo(width, sy);
      }
      ctx.stroke();

      // grid bounds
      const tl = screenFromWorld(worldOrigin.x, worldOrigin.y);
      const br = screenFromWorld(worldOrigin.x + COLS * GRID, worldOrigin.y + ROWS * GRID);
      ctx.strokeStyle = "rgba(80,200,255,0.6)";
      ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    };

    const colorForId = (id: string) => {
      let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
      return `hsl(${h},65%,62%)`;
    };

    const drawRooms = () => {
      ctx.save();
      ctx.globalAlpha = 0.28;
      for (const room of rooms) {
        const color = room.type ? (TYPE_COLORS[room.type] ?? UNTYPED_COLOR) : UNTYPED_COLOR;
        ctx.fillStyle = color;
        for (const cell of room.cells) {
          const p = screenFromWorld(worldOrigin.x + cell.c * GRID, worldOrigin.y + cell.r * GRID);
          ctx.fillRect(p.x, p.y, GRID * scale, GRID * scale);
        }
      }
      ctx.restore();
    };

    const drawWalls = () => {
      const w = Math.max(1.5, WALL_THICK * scale);
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.strokeStyle = "white";

      // horizontal
      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!hWalls[r][c]) continue;
          const a = screenFromWorld(worldOrigin.x + c * GRID,     worldOrigin.y + r * GRID);
          const b = screenFromWorld(worldOrigin.x + (c + 1) * GRID, worldOrigin.y + r * GRID);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // vertical
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          if (!vWalls[r][c]) continue;
          const a = screenFromWorld(worldOrigin.x + c * GRID, worldOrigin.y + r * GRID);
          const b = screenFromWorld(worldOrigin.x + c * GRID, worldOrigin.y + (r + 1) * GRID);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    };

    const drawGhost = () => {
      if (!state.ghost) return;
      const w = Math.max(1.5, WALL_THICK * scale);
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(79, 209, 197, 0.95)";

      if (state.ghost.kind === "h") {
        const y = state.ghost.r;
        const a = screenFromWorld(worldOrigin.x + state.ghost.c0 * GRID, worldOrigin.y + y * GRID);
        const b = screenFromWorld(worldOrigin.x + state.ghost.c1 * GRID, worldOrigin.y + y * GRID);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      } else {
        const x = state.ghost.c;
        const a = screenFromWorld(worldOrigin.x + x * GRID, worldOrigin.y + state.ghost.r0 * GRID);
        const b = screenFromWorld(worldOrigin.x + x * GRID, worldOrigin.y + state.ghost.r1 * GRID);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    };

    const drawSnap = () => {
      // highlight snapped corner under cursor
      const p = screenFromWorld(...Object.values(nodeToWorld(state.hoverNode)) as [number, number]);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, 4 * Math.sqrt(scale)), 0, Math.PI * 2);
      ctx.fill();
    };

    const drawHUD = () => {
      ctx.fillStyle = "#cde7ff";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(`mode: ${mode} | scale: ${scale.toFixed(2)} | rooms: ${rooms.length}`, 10, 18);
      ctx.fillText("Click a corner, drag to another corner to lay a wall. Space=pan. Clear resets.", 10, 34);
    };

    const draw = () => {
      drawGrid();
      drawRooms();
      drawWalls();
      drawGhost();
      drawSnap();
      drawHUD();
    };

    // ----- rooms via flood fill -----
    const canGo = (a: Cell, b: Cell): boolean => {
      if (b.r < 0 || b.r >= ROWS || b.c < 0 || b.c >= COLS) return false;
      if (b.r === a.r && b.c === a.c + 1) return !vWalls[a.r][a.c + 1]; // right
      if (b.r === a.r && b.c === a.c - 1) return !vWalls[a.r][a.c];     // left
      if (b.c === a.c && b.r === a.r + 1) return !hWalls[a.r + 1][a.c]; // down
      if (b.c === a.c && b.r === a.r - 1) return !hWalls[a.r][a.c];     // up
      return false;
    };

    function recomputeRooms() {
        const prevOwner = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
        rooms.forEach((r, ri) => r.cells.forEach(({r: rr, c: cc}) => { prevOwner[rr][cc] = ri; }));
      // mark outside by BFS from edges through openings
      const outside = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      const q: Cell[] = [];

      for (let c = 0; c < COLS; c++) {
        if (!hWalls[0][c]) { outside[0][c] = true; q.push({ r: 0, c }); }
        if (!hWalls[ROWS][c]) { outside[ROWS - 1][c] = true; q.push({ r: ROWS - 1, c }); }
      }
      for (let r = 0; r < ROWS; r++) {
        if (!vWalls[r][0]) { outside[r][0] = true; q.push({ r, c: 0 }); }
        if (!vWalls[r][COLS]) { outside[r][COLS - 1] = true; q.push({ r, c: COLS - 1 }); }
      }

      while (q.length) {
        const cur = q.shift()!;
        const nbrs = [
          { r: cur.r, c: cur.c + 1 },
          { r: cur.r, c: cur.c - 1 },
          { r: cur.r + 1, c: cur.c },
          { r: cur.r - 1, c: cur.c },
        ];
        for (const nb of nbrs) {
          if (nb.r < 0 || nb.r >= ROWS || nb.c < 0 || nb.c >= COLS) continue;
          if (outside[nb.r][nb.c]) continue;
          if (canGo(cur, nb)) { outside[nb.r][nb.c] = true; q.push(nb); }
        }
      }

      // collect enclosed components
      const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      const newRooms: Room[] = [];

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (outside[r][c] || seen[r][c]) continue;
          const comp: Cell[] = [];
          const stack: Cell[] = [{ r, c }];
          seen[r][c] = true;

          while (stack.length) {
            const cur = stack.pop()!;
            comp.push(cur);
            const nbrs = [
              { r: cur.r, c: cur.c + 1 },
              { r: cur.r, c: cur.c - 1 },
              { r: cur.r + 1, c: cur.c },
              { r: cur.r - 1, c: cur.c },
            ];
            for (const nb of nbrs) {
              if (nb.r < 0 || nb.r >= ROWS || nb.c < 0 || nb.c >= COLS) continue;
              if (seen[nb.r][nb.c]) continue;
              if (!outside[nb.r][nb.c] && canGo(cur, nb)) {
                seen[nb.r][nb.c] = true;
                stack.push(nb);
              }
            }
          }

          // after you built `comp` for this new room
const counts = new Map<number, number>();
for (const {r, c} of comp) {
  const oi = prevOwner[r][c];
  if (oi >= 0) counts.set(oi, (counts.get(oi) ?? 0) + 1);
}
let winner = -1, best = 0;
counts.forEach((cnt, oi) => { if (cnt > best) { best = cnt; winner = oi; } });

const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
const newRoom = { id, cells: comp, color: UNTYPED_COLOR, type: winner >= 0 ? rooms[winner].type : undefined };
newRooms.push(newRoom);

        }
      }

      setRooms(newRooms);
    }
    
    // ----- commit wall segment -----
    function commitGhost(g: Ghost) {
      if (!g) return;
      if (g.kind === "h") {
        const r = g.r;
        const c0 = Math.max(0, Math.min(COLS - 1, Math.min(g.c0, g.c1)));
        const c1 = Math.max(0, Math.min(COLS - 1, Math.max(g.c0, g.c1) - 1));
        const next = hWalls.map(row => row.slice());
        for (let c = c0; c <= c1; c++) next[r][c] = true;
        setHWalls(next);
      } else {
        const c = g.c;
        const r0 = Math.max(0, Math.min(ROWS - 1, Math.min(g.r0, g.r1)));
        const r1 = Math.max(0, Math.min(ROWS - 1, Math.max(g.r0, g.r1) - 1));
        const next = vWalls.map(row => row.slice());
        for (let r = r0; r <= r1; r++) next[r][c] = true;
        setVWalls(next);
      }
      setTimeout(recomputeRooms, 10);
    }

    // ----- events -----
    const onResize = () => setSize();

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (mode === "pan") {
        state.panning = true;
        state.last = { x: e.clientX, y: e.clientY };
        return;
      }

      // snap to nearest corner
      const node = nearestNode(worldFromScreen(sx, sy));
      state.startNode = node;
      state.hoverNode = node;
      state.drawing = true;
      state.ghost = null;
      draw();
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (state.panning) {
        offset.x += e.clientX - state.last.x;
        offset.y += e.clientY - state.last.y;
        state.last = { x: e.clientX, y: e.clientY };
        draw();
        return;
      }

      // update snapped hover
      state.hoverNode = nearestNode(worldFromScreen(sx, sy));

      if (state.drawing) {
        // build ghost aligned to dominant axis
        const a = state.startNode;
        const b = state.hoverNode;
        const dr = Math.abs(b.r - a.r);
        const dc = Math.abs(b.c - a.c);

        if (dr === 0 && dc === 0) {
          state.ghost = null;
        } else if (dc >= dr) {
          state.ghost = { kind: "h", r: a.r, c0: a.c, c1: b.c };
        } else {
          state.ghost = { kind: "v", c: a.c, r0: a.r, r1: b.r };
        }
      }
      draw();
    };

    const onMouseUp = () => {
      state.panning = false;
      if (!state.drawing) return;
      state.drawing = false;
      if (state.ghost) commitGhost(state.ghost);
      state.ghost = null;
      draw();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") setMode("pan");
      if (e.key === "Backspace") {
        // erase the wall exactly under the snapped hover
        const n = state.hoverNode;
        // try erase horizontal first
        const tryH = () => {
          const r = n.r;
          const c = Math.max(0, Math.min(COLS - 1, n.c - 1));
          if (r >= 0 && r <= ROWS && c >= 0 && c < COLS && hWalls[r][c]) {
            const next = hWalls.map(row => row.slice());
            next[r][c] = false; setHWalls(next); return true;
          }
          return false;
        };
        const tryV = () => {
          const c = n.c;
          const r = Math.max(0, Math.min(ROWS - 1, n.r - 1));
          if (c >= 0 && c <= COLS && r >= 0 && r < ROWS && vWalls[r][c]) {
            const next = vWalls.map(row => row.slice());
            next[r][c] = false; setVWalls(next); return true;
          }
          return false;
        };
        if (tryH() || tryV()) setTimeout(recomputeRooms, 0);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setMode("walls");
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const worldBefore = worldFromScreen(mx, my);
      const zoom = Math.exp(-e.deltaY * 0.001);
      const newScale = Math.min(4, Math.max(0.25, scale * zoom));
      offset.x = mx - worldBefore.x * newScale;
      offset.y = my - worldBefore.y * newScale;
      scale = newScale;
      draw();
    };


    // DnD from Palette
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

    // find room index containing that cell
    const ri = rooms.findIndex(room => room.cells.some(cell => cell.r === r && cell.c === c));
    if (ri < 0) return;

    if (payload && payload.kind === "roomType") {
        setRooms(prev => prev.map((room, idx) =>
        idx === ri ? { ...room, type: payload!.id } : room
        ));
    }
    // objects optional: ignore or place in your own objects state
    draw();
    };
    
    // init
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
    
  }, [dpr, hWalls, vWalls, rooms, mode]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: "100vw", height: "100vh", display: "block", cursor: mode === "pan" ? "grab" : "crosshair" }}
      />
      <div
        style={{
          position: "fixed", top: 8, right: 8, background: "rgba(0,0,0,0.55)",
          color: "white", padding: "8px 10px", borderRadius: 8, fontFamily: "ui-monospace, monospace",
          fontSize: 12
        }}
      >
        <div>Mode: <strong>{mode}</strong></div>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button onClick={() => setMode("walls")} style={{ padding: "4px 8px" }}>Walls</button>
          <button onClick={() => setMode("pan")} style={{ padding: "4px 8px" }}>Pan</button>
          <button
            onClick={() => {
              setHWalls(Array.from({ length: ROWS + 1 }, () => Array(COLS).fill(false)));
              setVWalls(Array.from({ length: ROWS }, () => Array(COLS + 1).fill(false)));
              setRooms([]);
            }}
            style={{ padding: "4px 8px" }}
          >
            Clear
          </button>
        </div>
        <div style={{ marginTop: 6 }}>Click a corner, drag to another corner to place a wall.</div>
        <div>Space=pan • Wheel=zoom • Backspace=erase near cursor</div>
      </div>
    </>
  );
}
