"use client";

import { cameraBridge } from "@/lib/cameraBridge";

/**
 * Honest fallback: no WebGL means no 3D. We show the drawn elevation and the
 * project information instead of pretending a render loaded.
 */
export function SceneFallback() {
  return (
    <main className="fallback">
      <div className="fallback__inner">
        <span className="fallback__badge">Visualização indisponível</span>
        <h1 className="fallback__title">Casa Vértice</h1>
        <p className="fallback__text">
          Este dispositivo não disponibiliza WebGL, pelo que a cena tridimensional
          interactiva não pode ser apresentada. A elevação sul e os dados essenciais do
          projecto permanecem disponíveis.
        </p>

        <svg
          viewBox="0 0 640 220"
          width="100%"
          role="img"
          aria-label="Elevação sul da Casa Vértice"
          style={{ margin: "18px 0" }}
        >
          <rect width="640" height="220" fill="#0c0f11" />
          <line x1="60" y1="170" x2="600" y2="170" stroke="#92979D" strokeWidth="0.8" />
          <rect x="110" y="78" width="440" height="14" fill="none" stroke="#F3F3EF" strokeWidth="1.2" />
          <rect x="110" y="92" width="440" height="78" fill="none" stroke="#92979D" strokeWidth="0.7" />
          <line x1="110" y1="92" x2="110" y2="170" stroke="#F3F3EF" strokeWidth="1.2" />
          <line x1="550" y1="92" x2="550" y2="170" stroke="#F3F3EF" strokeWidth="1.2" />
          <line x1="290" y1="92" x2="290" y2="170" stroke="#92979D" strokeWidth="0.5" strokeDasharray="3 5" />
          <line x1="420" y1="92" x2="420" y2="170" stroke="#92979D" strokeWidth="0.5" strokeDasharray="3 5" />
          <line x1="110" y1="164" x2="550" y2="164" stroke="#92979D" strokeWidth="0.5" />
          <text x="110" y="196" fill="#92979D" fontSize="9" letterSpacing="2">
            ELEVAÇÃO SUL · 1:200
          </text>
          <text x="470" y="196" fill="#B9FF00" fontSize="9" letterSpacing="2">
            +38 M
          </text>
          <text x="60" y="60" fill="#92979D" fontSize="9" letterSpacing="2">
            V-RION ATELIER
          </text>
        </svg>

        <p className="fallback__text">
          268 m² · 13,6 × 9,7 m · betão aparente, carvalho, vidro e água.
          <br />
          Costa alentejana, Portugal · 2024
        </p>

        <button type="button" className="ghost-button" onClick={() => cameraBridge.reset()}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 6a5 5 0 1 0 1.5-3.5M1 1v4h4" />
          </svg>
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
