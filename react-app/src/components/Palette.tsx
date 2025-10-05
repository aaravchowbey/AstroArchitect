import { useState } from "react";

type Dropped = { kind: "roomType" | "object"; id: string };

const ROOM_TYPES = [
  { id: "Sleep", label: "Sleep Quarters", icon: "🛌", color: "#7CC6FE" },
  { id: "Galley", label: "Galley", icon: "🍽️", color: "#FFD166" }, // (replaces 'Food')
  { id: "Hygiene", label: "Hygiene", icon: "🚿", color: "#95D5B2" },
  { id: "WCS", label: "WCS", icon: "🚽", color: "#FFFFFF" },
  { id: "Exercise", label: "Exercise", icon: "🏋️", color: "#EF476F" },
  { id: "Control", label: "Control", icon: "🛰️", color: "#B8B8FF" },
  { id: "Storage", label: "Storage", icon: "📦", color: "#F4A261" },
  { id: "Common", label: "Common Area", icon: "🧑‍🚀", color: "#9AA2FF" },
  { id: "Science", label: "Science Lab", icon: "🔬", color: "#6EE7B7" },
  { id: "Airlock", label: "Airlock", icon: "🛂", color: "#60A5FA" },
];

const OBJECTS = [
  { id: "Treadmill", label: "Treadmill", icon: "🏃" },
  { id: "PlantRack", label: "Plant Rack", icon: "🪴" },
  { id: "MedicalKit", label: "Med Kit", icon: "🧰" },
  { id: "SuitLocker", label: "Suit Locker", icon: "🧑‍🚀" },
  { id: "Workstation", label: "Workstation", icon: "🖥️" },
  { id: "Table", label: "Table", icon: "🍽️" },
  { id: "Fridge", label: "Cold Storage", icon: "🧊" },
  { id: "Water", label: "Water Disp.", icon: "🚰" },
  { id: "FoodWarmer", label: "Food Warmer", icon: "🍲" },
  { id: "TrashWet", label: "Wet Trash", icon: "🗑️" },
  { id: "TrashDry", label: "Dry Trash", icon: "🗑️" },
];

type PaletteProps = {
  levelId?: string;
};

export default function Palette({ levelId }: PaletteProps) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<"RoomTypes" | "Objects">("RoomTypes");

  const dragPayload = (d: Dropped) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(d));
    e.dataTransfer.effectAllowed = "copy";
  };

  const items = tab === "RoomTypes" ? ROOM_TYPES : OBJECTS;

  console.log("Palette received levelId:", levelId);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.75)",
        color: "white",
        fontFamily: "ui-sans-serif, system-ui",
        padding: 8,
        transform: open ? "translateY(0)" : "translateY(70%)",
        transition: "transform 180ms ease",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <button onClick={() => setOpen(!open)} style={{ padding: "4px 8px" }}>
          {open ? "Hide" : "Show"}
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setTab("RoomTypes")}
            style={{
              padding: "4px 10px",
              background: tab === "RoomTypes" ? "#1f2937" : "transparent",
              color: "white",
              borderRadius: 6,
            }}
          >
            Room types
          </button>
          <button
            onClick={() => setTab("Objects")}
            style={{
              padding: "4px 10px",
              background: tab === "Objects" ? "#1f2937" : "transparent",
              color: "white",
              borderRadius: 6,
            }}
          >
            Objects
          </button>
        </div>
        <span style={{ opacity: 0.8, fontSize: 12 }}>
          Drag an item onto the canvas
        </span>
      </div>

      <div
        style={{ whiteSpace: "nowrap", overflowX: "auto", paddingBottom: 6 }}
      >
        <div style={{ display: "inline-flex", gap: 10 }}>
          {items.map((it) => (
            <div
              key={it.id}
              draggable
              onDragStart={dragPayload({
                kind: tab === "RoomTypes" ? "roomType" : "object",
                id: it.id,
              })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "8px 10px",
                borderRadius: 10,
                cursor: "grab",
                userSelect: "none",
              }}
              title={it.label}
            >
              <span style={{ fontSize: 18 }}>{(it as any).icon}</span>
              {"color" in it ? (
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: (it as any).color,
                    display: "inline-block",
                  }}
                />
              ) : null}
              <span style={{ fontSize: 13 }}>{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
