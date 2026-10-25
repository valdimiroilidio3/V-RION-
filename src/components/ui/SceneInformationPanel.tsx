"use client";

import { useEffect, useRef } from "react";
import { useUI } from "@/lib/store";
import { getObject } from "@/lib/objects";
import { cameraBridge } from "@/lib/cameraBridge";

export function SceneInformationPanel() {
  const selectedId = useUI((state) => state.selectedId);
  const panelOpen = useUI((state) => state.panelOpen);
  const closeRef = useRef<HTMLButtonElement>(null);
  const object = getObject(selectedId);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") useUI.getState().setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  return (
    <aside
      className="panel"
      data-open={Boolean(panelOpen && object)}
      role="dialog"
      aria-modal="false"
      aria-labelledby="panel-title"
      aria-hidden={!panelOpen}
    >
      {object ? (
        <>
          <button
            ref={closeRef}
            type="button"
            className="panel__close"
            aria-label="Fechar ficha"
            onClick={() => useUI.getState().setSelected(null)}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
          <div className="panel__eyebrow">
            <i aria-hidden="true" />
            {object.kicker} · {object.num}
          </div>
          <h2 className="panel__title" id="panel-title">
            {object.name}
          </h2>
          <p className="panel__subtitle">{object.subtitle}</p>
          <p className="panel__body">{object.summary}</p>
          <dl className="panel__specs">
            {object.specs.map((spec) => (
              <div className="panel__spec" key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
          <div className="panel__actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                cameraBridge.reset();
              }}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M1 6a5 5 0 1 0 1.5-3.5M1 1v4h4" />
              </svg>
              Repor vista
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => useUI.getState().setSelected(null)}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" />
              </svg>
              Sair do foco
            </button>
          </div>
        </>
      ) : null}
    </aside>
  );
}
