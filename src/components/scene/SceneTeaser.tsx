"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { detectProfile, prefersInstant, type DeviceProfile } from "@/lib/quality";
import {
  createMaterials,
  disposeMaterials,
  REVEAL_PLANE,
  type SceneMaterials,
} from "@/lib/materials";
import { EnvironmentLighting, SUN_DIRECTION } from "./EnvironmentLighting";
import { SceneLandscape } from "./SceneLandscape";
import { MainEnvironment } from "./MainEnvironment";

/**
 * A showcase window, not a second application.
 *
 * The landing page needs a living image of the house, but it must not compete
 * with the full experience: no hotspots, no chrome, no scroll narrative, no
 * post-processing chain — just the real geometry, the real materials and a slow
 * orbit around the terrace. The device profile is capped (never above `medium`,
 * DPR held down, shadows kept) because this frame is a fraction of the viewport.
 */

function AutoOrbit({ reduced }: { reduced: boolean }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const target = useMemo(() => new THREE.Vector3(4.1, 2.05, -0.6), []);
  /**
   * Framing solved from the two real extents that matter — 23 m of terrace
   * across and 11 m of house and sky vertically — instead of a single bounding
   * radius. On a phone the stage is narrow, so the horizontal constraint binds
   * and the camera pulls back; on a wide desktop the vertical one binds and the
   * house fills the frame. A single radius cropped one or the other.
   */
  const distance = useMemo(() => {
    const aspect = Math.max(0.35, size.width / Math.max(1, size.height));
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const vHalf = fov / 2;
    const hHalf = Math.atan(Math.tan(vHalf) * aspect);
    const horizontal = 12.4 / Math.tan(hHalf);
    const vertical = 6.5 / Math.tan(vHalf);
    return Math.max(horizontal, vertical);
  }, [camera, size.width, size.height]);

  const dir = useMemo(() => new THREE.Vector3(1, 0.19, 1).normalize(), []);

  useFrame((state) => {
    const t = reduced ? 0 : state.clock.elapsedTime * 0.05;
    // a slow lateral drift, never enough to lose the terrace
    const swing = Math.sin(t) * 0.16;
    const cos = Math.cos(swing);
    const sin = Math.sin(swing);
    const x = dir.x * cos - dir.z * sin;
    const z = dir.x * sin + dir.z * cos;
    camera.position.set(
      target.x + x * distance,
      target.y + dir.y * distance + (reduced ? 0 : Math.sin(t * 0.7) * 0.25),
      target.z + z * distance,
    );
    camera.lookAt(target);
  });

  return null;
}

export default function SceneTeaser() {
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [materials, setMaterials] = useState<SceneMaterials | null>(null);
  const [active, setActive] = useState(false);
  const instant = useRef(typeof window !== "undefined" && prefersInstant());
  const [failed, setFailed] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setActive(entry.isIntersecting);
      },
      { rootMargin: "120px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active || profile) return;
    const detected = detectProfile();
    setProfile({
      ...detected,
      quality: detected.mobile ? "low" : "medium",
      shadows: true,
      shadowMapSize: detected.mobile ? 512 : 1024,
      dpr: [1, 1.25],
      maxDpr: 1.25,
    });
  }, [active, profile]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    const aniso = profile.mobile ? 2 : 4;
    createMaterials(profile, aniso)
      .then((result) => {
        if (cancelled) {
          disposeMaterials(result);
          return;
        }
        setMaterials(result);
      })
      .catch((error: unknown) => {
        console.error(error);
        setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  useEffect(() => {
    if (!materials) return;
    return () => disposeMaterials(materials);
  }, [materials]);

  const hidden = typeof document !== "undefined" && document.hidden;

  return (
    <div className="teaser" ref={hostRef}>
      {profile && materials && !failed ? (
        <Canvas
          dpr={profile.dpr}
          shadows={profile.shadows ? "soft" : false}
          frameloop={active && !hidden ? "always" : "never"}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true,
          }}
          camera={{ position: [15.2, 4.35, 16.6], fov: 40, near: 0.1, far: 3000 }}
          onCreated={({ gl, scene }) => {
            gl.localClippingEnabled = true;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.04;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            scene.background = new THREE.Color("#0a0c0e");
            REVEAL_PLANE.constant = 6;
          }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <EnvironmentLighting profile={profile} />
          <SceneLandscape m={materials} sunDirection={SUN_DIRECTION} quality={profile.quality} />
          <MainEnvironment m={materials} quality={profile.quality} />
          <AutoOrbit reduced={profile.reducedMotion || instant.current} />
        </Canvas>
      ) : (
        <div className="teaser__pending" aria-hidden="true" />
      )}
      <div className="teaser__grain" aria-hidden="true" />
      <div className="teaser__shade" aria-hidden="true" />
    </div>
  );
}
