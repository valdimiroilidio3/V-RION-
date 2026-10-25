"use client";

import { useUI } from "@/lib/store";
import type { ViewId } from "@/lib/store";
import { VIEWS } from "@/lib/camera";
import { cameraBridge } from "@/lib/cameraBridge";

const VIEW_INDEX: Record<ViewId, string> = {
  approach: "01",
  pool: "02",
  terrace: "03",
  interior: "04",
  aerial: "05",
};

export function Chrome({
  fullscreen,
  onToggleFullscreen,
  mobile,
  onToggleExplore,
}: {
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  mobile: boolean;
  onToggleExplore: () => void;
}) {
  const phase = useUI((state) => state.phase);
  const viewId = useUI((state) => state.viewId);
  const selectedId = useUI((state) => state.selectedId);
  const exploreMode = useUI((state) => state.exploreMode);
  const narrative = useUI((state) => state.narrative);

  const heroHidden = phase !== "explore" || narrative > 0.035 || exploreMode || selectedId !== null;
  const index = viewId ? VIEW_INDEX[viewId] : "--";

  return (
    <div className="chrome">
      <div className="scrim scrim--top" aria-hidden="true" />
      <div className="scrim scrim--bottom" aria-hidden="true" />
      <div className="scrim scrim--hero" data-hidden={heroHidden} aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <div className="brand__mark">
            V—RION <span>Atelier</span>
          </div>
          <div className="brand__rule" aria-hidden="true" />
          <div className="brand__meta">
            Casa Vértice · Costa Alentejana, PT
          </div>
        </div>

        <div className="topbar__right">
          <div className="scale-readout" aria-hidden="true">
            <span className="scale-readout__bar" />
            <span>1 : 200</span>
          </div>
          {!mobile ? (
            <div className="zoom-group">
              <button
                type="button"
                className="icon-button icon-button--sm"
                aria-label="Afastar câmara"
                onClick={() => cameraBridge.zoomOut()}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10" />
                </svg>
              </button>
              <button
                type="button"
                className="icon-button icon-button--sm"
                aria-label="Aproximar câmara"
                onClick={() => cameraBridge.zoomIn()}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 3v10M3 8h10" />
                </svg>
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="icon-button"
            aria-label="Repor a vista inicial"
            onClick={() => cameraBridge.reset()}
            disabled={phase === "loading"}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 8a6 6 0 1 0 1.8-4.2M2 2v4h4" />
            </svg>
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={fullscreen ? "Sair do ecrã inteiro" : "Ecrã inteiro"}
            aria-pressed={fullscreen}
            onClick={onToggleFullscreen}
          >
            {fullscreen ? (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 2v4H2M10 2v4h4M10 14v-4h4M6 14v-4H2" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 6V2h4M14 6V2h-4M14 10v4h-4M2 10v4h4" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="chrome__mid">
        <div className="hero" data-hidden={heroHidden}>
          <div className="hero__eyebrow">
            <i aria-hidden="true" />
            Habitação unifamiliar · 2024
          </div>
          <h1 className="hero__title">
            Casa
            <br />
            <em>Vértice</em>
          </h1>
          <div className="hero__footer">
            <span>
              <strong>268 m²</strong> sobre a plataforma costeira
            </span>
            <span>
              Betão aparente · carvalho · vidro · água
            </span>
            <span className="hero__scroll">Descer para entrar</span>
          </div>
        </div>
      </div>

      <footer className="bottombar">
        <div className="hint">
          {mobile ? (
            exploreMode ? (
              <>
                <span>Arrasta para orbitar · pinça para aproximar</span>
                <span className="hint__sep" aria-hidden="true" />
                <span>Narrativa em pausa</span>
              </>
            ) : (
              <>
                <span>Desliza para percorrer a narrativa</span>
                <span className="hint__sep" aria-hidden="true" />
                <span>Toca nos pontos para explorar</span>
              </>
            )
          ) : (
            <>
              <span>
                <kbd>Arrastar</kbd> orbitar
              </span>
              <span className="hint__sep" aria-hidden="true" />
              <span>
                <kbd>Scroll</kbd> narrativa
              </span>
              <span className="hint__sep" aria-hidden="true" />
              <span>
                <kbd>Ctrl</kbd> + scroll zoom
              </span>
              <span className="hint__sep" aria-hidden="true" />
              <span>
                <kbd>1–5</kbd> vistas
              </span>
            </>
          )}
        </div>

        <div className="bottombar__right">
          {mobile ? (
            <button
              type="button"
              className="explore-toggle"
              onClick={onToggleExplore}
              aria-pressed={exploreMode}
            >
              {exploreMode ? "← Voltar à narrativa" : "Explorar em 3D"}
            </button>
          ) : null}
          <div className="bottom-meta">
            <span>
              Vista <b>{index}</b>
              {selectedId
                ? " · detalhe"
                : viewId
                  ? ` · ${VIEWS[viewId].name}`
                  : " · narrativa"}
            </span>
            <span aria-hidden="true">/</span>
            <span>
              Cota <b>+38 m</b>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
