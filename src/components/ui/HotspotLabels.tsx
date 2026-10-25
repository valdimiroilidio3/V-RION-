"use client";

import { useUI } from "@/lib/store";
import { OBJECTS } from "@/lib/objects";
import { hotspotElements } from "../scene/hotspotRegistry";

/** Accessible, crisp DOM buttons tracked by the in-canvas projector. */
const PRIORITY = new Set(["glass", "pool", "fireplace", "suite", "coast"]);

export function HotspotLabels() {
  const selectedId = useUI((state) => state.selectedId);

  return (
    <div className="labels">
      {OBJECTS.map((object) => (
        <button
          key={object.id}
          ref={(node) => {
            if (node) hotspotElements.set(object.id, node);
            else hotspotElements.delete(object.id);
          }}
          type="button"
          className="hotspot"
          data-active={selectedId === object.id}
          data-priority={PRIORITY.has(object.id)}
          aria-label={`Ver ficha: ${object.name}`}
          onClick={() => {
            const ui = useUI.getState();
            if (ui.phase !== "explore") return;
            ui.setView(null);
            ui.setSelected(object.id);
          }}
        >
          <span className="hotspot__dot">
            <span className="hotspot__pulse" />
          </span>
          <span className="hotspot__label">{object.label}</span>
        </button>
      ))}
    </div>
  );
}
