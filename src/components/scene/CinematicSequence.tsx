"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useUI } from "@/lib/store";
import { REVEAL_PLANE } from "@/lib/materials";
import { boxGeometry, type BoxPart } from "@/lib/geometry";
import type { DeviceProfile } from "@/lib/quality";

/**
 * Materialisation: a world-space clipping plane rises through the building,
 * the exposure lifts out of the dark and the atmosphere clears. Everything is
 * real geometry, real materials and a real camera — no still-image fades.
 */
export function CinematicSequence({ profile }: { profile: DeviceProfile }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const sweep = useRef<THREE.Mesh>(null);
  const sweepMaterial = useRef<THREE.MeshBasicMaterial>(null);

  // Phase B: the massing is drawn first as a technical line study, then the
  // materials rise through it. Real geometry, real edges — not a video.
  const lineMaterial = useRef<THREE.LineBasicMaterial>(null);
  const massingEdges = useMemo(() => {
    const box = (s: [number, number, number], p: [number, number, number]) => {
      const g = new THREE.BoxGeometry(s[0], s[1], s[2]);
      g.translate(p[0], p[1], p[2]);
      return new THREE.EdgesGeometry(g);
    };
    const parts = [
      box([15.6, 1.0, 9.7], [3.4, -0.44, -1.45]),
      box([15.6, 9.1, 0.4], [3.4, 1.98, -6.1]),
      box([15.6, 0.4, 10.0], [3.5, 4.16, -1.3]),
      box([11.2, 3.8, 0.08], [4.2, 1.96, 3.4]),
      box([6.4, 2.76, 6.2], [13.4, 1.43, -3.3]),
      box([6.6, 0.3, 6.6], [13.4, 2.9, -3.2]),
      box([14.8, 0.06, 4.2], [3.0, 0.05, 5.5]),
      box([2.4, 0.6, 2.4], [4.7, 4.4, -3.3]),
      box([0.14, 3.2, 0.14], [10.85, 1.65, 2.12]),
      box([0.14, 3.2, 0.14], [16.25, 1.65, 2.12]),
    ];
    const positions: number[] = [];
    for (const edge of parts) {
      const array = edge.attributes.position.array as Float32Array;
      for (let i = 0; i < array.length; i++) positions.push(array[i]);
      edge.dispose();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);

  const sweepGeometry = useMemo(() => {
    const t = 0.05;
    const parts: BoxPart[] = [
      { s: [14.2, 0.012, t], p: [3, 0, -6.3] },
      { s: [14.2, 0.012, t], p: [3, 0, 3.4] },
      { s: [t, 0.012, 9.7], p: [-3.4, 0, -1.45] },
      { s: [t, 0.012, 9.7], p: [10.2, 0, -1.45] },
      { s: [15.3, 0.012, t], p: [3.35, 0, 7.6] },
      { s: [t, 0.012, 4.2], p: [-4.4, 0, 5.5] },
      { s: [t, 0.012, 4.2], p: [10.4, 0, 5.5] },
      { s: [6.6, 0.012, t], p: [13.4, 0, -0.2] },
    ];
    return boxGeometry(parts);
  }, []);

  useEffect(() => {
    REVEAL_PLANE.constant = -1.45;
    if (profile.reducedMotion) {
      REVEAL_PLANE.constant = 6;
      gl.toneMappingExposure = 1;
      if (scene.fog && "density" in scene.fog) {
        (scene.fog as THREE.FogExp2).density = 0.0038;
      }
      return;
    }
    gl.toneMappingExposure = 0.24;
    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog) fog.density = 0.015;

    const start = () => {
      timeline.current?.kill();
      REVEAL_PLANE.constant = -1.2;
      gl.toneMappingExposure = 0.24;
      if (fog) fog.density = 0.015;
      const lines = lineMaterial.current;
      const tl = gsap.timeline({ delay: 0.2 });
      if (lines) {
        tl.fromTo(lines, { opacity: 0 }, { opacity: 0.85, duration: 0.7, ease: "sine.out" }, 0);
        tl.to(lines, { opacity: 0.22, duration: 1.6, ease: "sine.inOut" }, 1.5);
        tl.to(lines, { opacity: 0, duration: 1.1, ease: "sine.in" }, 2.6);
      }
      tl.to(gl, { toneMappingExposure: 1, duration: 2.6, ease: "power1.inOut" }, 0.1);
      tl.to(REVEAL_PLANE, { constant: 5.5, duration: 3.0, ease: "power2.inOut" }, 0.55);
      if (fog) tl.to(fog, { density: 0.0024, duration: 3.4, ease: "power2.out" }, 0);
      tl.to(gl, { toneMappingExposure: 0.96, duration: 1.4, ease: "sine.inOut" }, 3.0);
      timeline.current = tl;
    };

    start();

    const unsubscribe = useUI.subscribe((state, previous) => {
      if (state.skipRequested && !previous.skipRequested) {
        const tl = timeline.current;
        if (tl) {
          tl.progress(1);
          tl.kill();
        }
        REVEAL_PLANE.constant = 6;
        gl.toneMappingExposure = 1;
        if (lineMaterial.current) lineMaterial.current.opacity = 0;
        if (fog) fog.density = 0.0024;
      }
    });

    return () => {
      unsubscribe();
      timeline.current?.kill();
    };
  }, [gl, scene, profile.reducedMotion]);

  useFrame(() => {
    const material = sweepMaterial.current;
    const mesh = sweep.current;
    if (!material || !mesh) return;
    const c = REVEAL_PLANE.constant;
    mesh.position.y = THREE.MathUtils.clamp(c, -1.4, 5.6);
    material.opacity =
      c > -1.4 && c < 5.6 ? 0.5 * (1 - THREE.MathUtils.smoothstep(c, 4.3, 5.6)) : 0;
  });

  return (
    <group>
      <mesh ref={sweep} geometry={sweepGeometry} frustumCulled={false} renderOrder={2}>
        <meshBasicMaterial
          ref={sweepMaterial}
          color="#ffd9a8"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <lineSegments geometry={massingEdges} frustumCulled={false} renderOrder={3}>
        <lineBasicMaterial
          ref={lineMaterial}
          color="#dfe6d8"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </lineSegments>
    </group>
  );
}
