import { create } from "zustand";
import type { SceneObjectId } from "./objects";

export type Phase = "loading" | "entry" | "explore";
export type ViewId = "approach" | "pool" | "terrace" | "interior" | "aerial";

export interface UIState {
  phase: Phase;
  bootProgress: number;
  introReady: boolean;

  selectedId: SceneObjectId | null;
  viewId: ViewId | null;
  section: number;
  narrative: number;

  panelOpen: boolean;
  pointerActive: boolean;
  fullscreen: boolean;
  orbitUsed: boolean;
  exploreMode: boolean;
  skipRequested: boolean;

  error: string | null;

  setBootProgress: (n: number) => void;
  setPhase: (p: Phase) => void;
  setIntroReady: (b: boolean) => void;
  setSelected: (id: SceneObjectId | null) => void;
  setView: (id: ViewId | null) => void;
  setSection: (n: number) => void;
  setNarrative: (n: number) => void;
  setPanelOpen: (b: boolean) => void;
  setPointerActive: (b: boolean) => void;
  setFullscreen: (b: boolean) => void;
  setOrbitUsed: (b: boolean) => void;
  setExploreMode: (b: boolean) => void;
  requestSkip: () => void;
  setError: (e: string | null) => void;
}

/**
 * UI store kept deliberately outside the r3f tree so the frame loop can read
 * state imperatively (getState) without re-rendering the scene graph.
 */
export const useUI = create<UIState>((set) => ({
  phase: "loading",
  bootProgress: 0,
  introReady: false,

  selectedId: null,
  viewId: "approach",
  section: 0,
  narrative: 0,

  panelOpen: false,
  pointerActive: false,
  fullscreen: false,
  orbitUsed: false,
  exploreMode: false,
  skipRequested: false,

  error: null,

  setBootProgress: (n) => set({ bootProgress: Math.max(0, Math.min(1, n)) }),
  setPhase: (phase) => set({ phase }),
  setIntroReady: (introReady) => set({ introReady }),
  setSelected: (selectedId) => set({ selectedId, panelOpen: selectedId !== null }),
  setView: (viewId) => set({ viewId }),
  setSection: (section) => set({ section }),
  setNarrative: (narrative) => set({ narrative }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setPointerActive: (pointerActive) => set({ pointerActive }),
  setFullscreen: (fullscreen) => set({ fullscreen }),
  setOrbitUsed: (orbitUsed) => set({ orbitUsed }),
  setExploreMode: (exploreMode) => set({ exploreMode }),
  requestSkip: () => set({ skipRequested: true }),
  setError: (error) => set({ error }),
}));

export const uiStore = useUI;
