"use client";

import { useUI } from "@/lib/store";
import { VIEWS, VIEW_ORDER } from "@/lib/camera";

export function ViewSelector() {
  const viewId = useUI((state) => state.viewId);
  const phase = useUI((state) => state.phase);

  return (
    <nav className="views" aria-label="Vistas da cena">
      <span className="views__label">Vistas</span>
      {VIEW_ORDER.map((id) => {
        const view = VIEWS[id];
        const current = viewId === id;
        return (
          <button
            key={id}
            type="button"
            className="view"
            aria-current={current}
            disabled={phase === "loading"}
            onClick={() => {
              const ui = useUI.getState();
              ui.setSelected(null);
              ui.setView(id);
            }}
          >
            <span className="view__num">{view.num}</span>
            <span className="view__name">{view.short}</span>
            <span className="view__tick" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
