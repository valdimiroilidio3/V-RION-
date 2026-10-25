"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUI } from "@/lib/store";
import { detectProfile, type DeviceProfile } from "@/lib/quality";
import { Chrome } from "./ui/Chrome";
import { ViewSelector } from "./ui/ViewSelector";
import { SceneInformationPanel } from "./ui/SceneInformationPanel";
import { SceneLoadingState } from "./ui/SceneLoadingState";
import { Runway } from "./ui/Runway";
import { SceneFallback } from "./ui/Fallback";
import { HotspotLabels } from "./ui/HotspotLabels";
import { cameraBridge } from "@/lib/cameraBridge";

const SceneCanvas = dynamic(() => import("./scene/SceneCanvas"), { ssr: false });

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

export default function Site() {
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const scrollRef = useRef(0);

  const phase = useUI((state) => state.phase);
  const exploreMode = useUI((state) => state.exploreMode);
  const error = useUI((state) => state.error);

  const mobile = profile?.mobile ?? false;

  useEffect(() => {
    setProfile(detectProfile());
    setWebgl(supportsWebGL());
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setFullscreen(active);
      useUI.getState().setFullscreen(active);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      useUI.getState().setError("O modo de ecrã inteiro não está disponível neste navegador.");
    }
  }, []);

  const toggleExplore = useCallback(() => {
    const ui = useUI.getState();
    const next = !ui.exploreMode;
    if (next) {
      scrollRef.current = window.scrollY;
      document.body.classList.add("is-exploring");
    } else {
      document.body.classList.remove("is-exploring");
      window.scrollTo(0, scrollRef.current);
    }
    ui.setExploreMode(next);
    ui.setSelected(null);
    if (!next) ui.setView("approach");
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const ui = useUI.getState();
      if (event.key === "f" || event.key === "F") {
        void toggleFullscreen();
      }
      if (event.key === "e" || event.key === "E") {
        if (profile?.mobile) toggleExplore();
      }
      if (event.key >= "1" && event.key <= "5" && ui.phase === "explore") {
        const order = ["approach", "pool", "terrace", "interior", "aerial"] as const;
        ui.setSelected(null);
        ui.setView(order[Number(event.key) - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profile?.mobile, toggleExplore, toggleFullscreen]);

  const showEnter = phase === "entry";

  if (webgl === false) {
    return <SceneFallback />;
  }

  return (
    <main className="site">
      <div className="stage" data-interactive={!mobile || exploreMode}>
        {webgl ? <SceneCanvas /> : null}
      </div>

      <Runway />

      <Chrome
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
        mobile={mobile}
        onToggleExplore={toggleExplore}
      />

      <HotspotLabels />
      <ViewSelector />
      <SceneInformationPanel />

      <button
        type="button"
        className="enter"
        data-show={showEnter}
        onClick={() => useUI.getState().requestSkip()}
      >
        <span className="enter__pulse" aria-hidden="true" />
        Saltar introdução
      </button>

      {error ? (
        <div className="error" role="status">
          <span>{error}</span>
          <button type="button" onClick={() => window.location.reload()}>
            Recarregar
          </button>
          <button type="button" onClick={() => useUI.getState().setError(null)}>
            Fechar
          </button>
        </div>
      ) : null}

      <SceneLoadingState />
    </main>
  );
}
