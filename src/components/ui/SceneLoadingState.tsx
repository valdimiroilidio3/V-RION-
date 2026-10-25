"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/lib/store";

/**
 * The loader is never a fake spinner: it tracks material synthesis, the
 * lighting environment and the first compiled frames, then gets out of the way.
 */
export function SceneLoadingState() {
  const progress = useUI((state) => state.bootProgress);
  const phase = useUI((state) => state.phase);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (progress >= 1) {
      const timeout = window.setTimeout(() => setDismissed(true), 1200);
      return () => window.clearTimeout(timeout);
    }
    setDismissed(false);
    return undefined;
  }, [progress]);

  if (dismissed) return null;

  const percent = Math.round(Math.min(1, progress) * 100);
  const label =
    progress < 0.6
      ? "A preparar materiais"
      : progress < 0.88
        ? "A construir iluminação"
        : "A compilar a cena";

  return (
    <div className="loader" data-done={progress >= 1 && phase !== "loading"}>
      <div className="loader__top">
        <span>V-RION · Atelier</span>
        <span>Casa Vértice</span>
      </div>

      <div className="loader__mid">
        <div className="loader__wordmark">
          Casa Vértice
          <span>Costa Alentejana · PT</span>
        </div>
        <div className="loader__track">
          <div
            className="loader__fill"
            style={{ transform: `scaleX(${Math.max(0.02, progress)})` }}
          />
        </div>
        <div className="loader__row">
          <span>{label}</span>
          <b>{percent.toString().padStart(3, "0")}%</b>
        </div>
      </div>

      <div className="loader__bottom">
        <span>Visualização 3D interactiva · WebGL</span>
        <span>V-RION Atelier · 2024</span>
      </div>
    </div>
  );
}
