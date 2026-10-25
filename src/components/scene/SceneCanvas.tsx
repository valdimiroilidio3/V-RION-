"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { detectProfile, type DeviceProfile } from "@/lib/quality";
import { createMaterials, REVEAL_PLANE, disposeMaterials, type SceneMaterials } from "@/lib/materials";
import { useUI } from "@/lib/store";
import { INTRO_POSE } from "@/lib/camera";
import { MainEnvironment } from "./MainEnvironment";
import { SceneLandscape } from "./SceneLandscape";
import { EnvironmentLighting } from "./EnvironmentLighting";
import { CameraController } from "./CameraController";
import { CinematicSequence } from "./CinematicSequence";
import { HotspotProjector } from "./SceneHotspots";
import { SelectionFrame } from "./SelectionFrame";
import { ScenePostFX } from "./ScenePostFX";

function FrameGate({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    frames.current += 1;
    if (frames.current >= 4) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

function ContextGuard({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const handler = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", handler);
    return () => canvas.removeEventListener("webglcontextlost", handler);
  }, [gl, onLost]);
  return null;
}

export default function SceneCanvas() {
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [materials, setMaterials] = useState<SceneMaterials | null>(null);
  const [environmentReady, setEnvironmentReady] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const exploreMode = useUI((state) => state.exploreMode);

  useEffect(() => {
    setProfile(detectProfile());
  }, []);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    const aniso = profile.quality === "high" ? 8 : profile.quality === "medium" ? 4 : 2;
    createMaterials(profile, aniso, (value) => {
      useUI.getState().setBootProgress(0.08 + value * 0.52);
    })
      .then((result) => {
        if (cancelled) {
          disposeMaterials(result);
          return;
        }
        setMaterials(result);
      })
      .catch((error: unknown) => {
        console.error(error);
        useUI
          .getState()
          .setError("Não foi possível preparar os materiais da cena neste dispositivo.");
        useUI.getState().setBootProgress(0.4);
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const handleEnvironment = useCallback(() => {
    setEnvironmentReady(true);
  }, []);

  const handleFrames = useCallback(() => setFramesReady(true), []);

  useEffect(() => {
    if (environmentReady) useUI.getState().setBootProgress(0.88);
  }, [environmentReady]);

  useEffect(() => {
    if (!materials || !environmentReady || !framesReady) return;
    useUI.getState().setBootProgress(1);
    const timeout = window.setTimeout(() => {
      const ui = useUI.getState();
      if (ui.phase === "loading") ui.setPhase("entry");
    }, 260);
    return () => window.clearTimeout(timeout);
  }, [materials, environmentReady, framesReady]);

  const onContextLost = useCallback(() => {
    useUI
      .getState()
      .setError("O contexto WebGL foi perdido. Recarrega a página para retomar a cena.");
  }, []);

  if (!profile) {
    return <div className="stage" aria-hidden="true" />;
  }

  const interactive = !profile.mobile || exploreMode;

  return (
    <Canvas
      dpr={profile.dpr}
      shadows={profile.shadows ? "soft" : false}
      frameloop={hidden ? "never" : "always"}
      gl={{
        antialias: profile.quality !== "low",
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false,
      }}
      camera={{
        position: INTRO_POSE.pos,
        fov: INTRO_POSE.fov,
        near: 0.1,
        far: 3000,
      }}
      onCreated={({ gl, scene, camera, size }) => {
        if (process.env.NODE_ENV !== "production") {
          (window as unknown as Record<string, unknown>).__VERTEX = {
            camera,
            scene,
            gl,
            get state() {
              return {
                pos: camera.position.toArray(),
                fov: (camera as THREE.PerspectiveCamera).fov,
                ui: useUI.getState(),
              };
            },
            reveal: () => REVEAL_PLANE.constant,
          };
        }
        gl.localClippingEnabled = true;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.22;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        scene.background = new THREE.Color("#080a0c");
        REVEAL_PLANE.constant = -1.2;
      }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <ContextGuard onLost={onContextLost} />
      <EnvironmentLighting profile={profile} onEnvironment={handleEnvironment} />

      {materials ? (
        <>
          <SceneLandscape m={materials} sunDirection={[-0.78, 0.245, 0.5]} quality={profile.quality} />
          <MainEnvironment m={materials} quality={profile.quality} />
          <SelectionFrame />
          <CinematicSequence profile={profile} />
          <CameraController profile={profile} interactive={interactive} />
        </>
      ) : null}

      <HotspotProjector />
      {materials && framesReady ? <ScenePostFX profile={profile} /> : null}
      <AdaptiveDpr />
      <FrameGate onReady={handleFrames} />
    </Canvas>
  );
}
