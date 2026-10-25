"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneMaterials } from "@/lib/materials";
import { REVEAL_PLANE } from "@/lib/materials";
import { createRippleTexture } from "@/lib/textures";
import type { Quality } from "@/lib/quality";
import { applyWorldUV, boxGeometry, oliveTree, type BoxPart } from "@/lib/geometry";
import { Selectable } from "./Selectable";
import { Interior } from "./SceneInterior";
import { ArchitecturalDetail, SiteDetail, SoffitLighting, TerraceFurniture } from "./SceneDetail";

/* ------------------------------------------------------------------ plan */
export const X0 = -3.4;
export const X1 = 10.2;
export const Z0 = -6.3;
export const Z1 = 3.4;
export const IX0 = -2.5;
export const IX1 = 9.85;
export const IZ0 = -5.0;
export const CEIL = 3.96;
export const ROOF = 4.36;
export const FY = 0.05;
export const GY = -0.94;
export const PAV = { x0: 10.2, x1: 16.6, z0: -6.4, z1: -0.2, roof: 2.76, top: 3.06 };
export const POOL = { x0: -1.7, x1: 1.7, z0: 3.95, z1: 7.05, water: 0.02 };
export const TERRACE = { x0: -4.4, x1: 10.4, z0: 3.4, z1: 7.6 };

function PartMesh({
  parts,
  material,
  castShadow = true,
  receiveShadow = true,
  uvUnit,
}: {
  parts: BoxPart[];
  material: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
  /** when set, UVs are projected from world space at this metric scale */
  uvUnit?: number;
}) {
  const geometry = useMemo(() => {
    const merged = boxGeometry(parts);
    if (uvUnit) applyWorldUV(merged, uvUnit);
    return merged;
  }, [parts, uvUnit]);
  return (
    <mesh
      geometry={geometry}
      material={material}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

/* ------------------------------------------------------------- foundation */

function Foundation({ m }: { m: SceneMaterials }) {
  const parts = useMemo<BoxPart[]>(
    () => [
      // structural plinth under the house
      { s: [X1 - X0, 1.0, Z1 - Z0], p: [(X0 + X1) / 2, (GY + FY) / 2, (Z0 + Z1) / 2] },
      // two wide steps down to the site, south edge
      { s: [14.8, 0.5, 0.62], p: [3, GY + 0.25, 7.9] },
      { s: [14.8, 0.26, 0.6], p: [3, GY + 0.13, 8.52] },
      // east terrace plinth
      { s: [6.5, 1.0, 4.2], p: [13.65, (GY + FY) / 2, 2.6] },
      // steps east
      { s: [0.6, 0.5, 3.0], p: [17.15, GY + 0.25, 2.6] },
      // pavilion plinth
      { s: [PAV.x1 - PAV.x0, 1.0, PAV.z1 - PAV.z0], p: [(PAV.x0 + PAV.x1) / 2, (GY + FY) / 2, (PAV.z0 + PAV.z1) / 2] },
    ],
    [],
  );
  return <PartMesh parts={parts} material={m.concreteDark} />;
}

/* ------------------------------------------------------------------ walls */

function Walls({ m }: { m: SceneMaterials }) {
  const north = useMemo<BoxPart[]>(() => {
    const slots: [number, number][] = [
      [0.7, 1.0],
      [6.8, 7.1],
    ];
    const segs: [number, number][] = [
      [X0, slots[0][0]],
      [slots[0][1], slots[1][0]],
      [slots[1][1], X1],
    ];
    const parts: BoxPart[] = segs.map(([a, b]) => ({
      s: [b - a, CEIL + 0.05, 1.3],
      p: [(a + b) / 2, (CEIL - 0.05) / 2, -5.65],
    }));
    for (const [a, b] of slots) {
      parts.push({ s: [b - a, 1.0, 1.3], p: [(a + b) / 2, 0.45, -5.65] });
      parts.push({ s: [b - a, CEIL - 2.6, 1.3], p: [(a + b) / 2, (CEIL + 2.6) / 2, -5.65] });
    }
    // inner leaf / pier at the south west corner
    parts.push({ s: [1.1, CEIL + 0.05, 0.3], p: [-1.95, (CEIL - 0.05) / 2, 3.25] });
    return parts;
  }, []);

  const west = useMemo<BoxPart[]>(() => {
    const parts: BoxPart[] = [
      { s: [0.9, CEIL + 0.05, 7.0], p: [-2.95, (CEIL - 0.05) / 2, -2.8] },
      { s: [0.9, CEIL + 0.05, 0.5], p: [-2.95, (CEIL - 0.05) / 2, 3.15] },
      { s: [0.9, 1.0, 2.2], p: [-2.95, 0.45, 1.8] },
      { s: [0.9, CEIL - 2.5, 2.2], p: [-2.95, (CEIL + 2.5) / 2, 1.8] },
    ];
    return parts;
  }, []);

  const east = useMemo<BoxPart[]>(() => {
    const parts: BoxPart[] = [
      { s: [0.35, CEIL + 0.05, 3.6], p: [10.02, (CEIL - 0.05) / 2, -4.5] },
      { s: [0.35, CEIL + 0.05, 4.9], p: [10.02, (CEIL - 0.05) / 2, 0.95] },
      { s: [0.35, CEIL - 2.35, 1.2], p: [10.02, (CEIL + 2.35) / 2, -2.1] },
    ];
    return parts;
  }, []);

  const reveals = useMemo<BoxPart[]>(
    () => [
      // deep window reveals painted plaster
      { s: [0.9, 1.62, 0.02], p: [-2.94, 1.8, 0.7] },
      { s: [0.9, 1.62, 0.02], p: [-2.94, 1.8, 2.9] },
      { s: [0.9, 1.0, 2.22], p: [-2.94, 0.49, 1.8] },
      { s: [0.9, 0.02, 2.22], p: [-2.94, 1.0, 1.8] },
      { s: [0.9, 0.02, 2.22], p: [-2.94, 2.5, 1.8] },
      // north slots
      { s: [0.02, 1.62, 1.3], p: [0.69, 1.81, -5.65] },
      { s: [0.02, 1.62, 1.3], p: [1.01, 1.81, -5.65] },
      { s: [0.32, 1.62, 0.02], p: [0.85, 1.81, -5.0] },
      { s: [0.32, 1.62, 0.02], p: [0.85, 1.81, -6.29] },
      { s: [0.02, 1.62, 1.3], p: [6.79, 1.81, -5.65] },
      { s: [0.02, 1.62, 1.3], p: [7.11, 1.81, -5.65] },
      { s: [0.32, 1.62, 0.02], p: [6.95, 1.81, -5.0] },
      { s: [0.32, 1.62, 0.02], p: [6.95, 1.81, -6.29] },
    ],
    [],
  );

  return (
    <group>
      <PartMesh parts={north} material={m.concrete} />
      <PartMesh parts={west} material={m.concrete} />
      <PartMesh parts={east} material={m.concrete} />
      <PartMesh parts={reveals} material={m.plaster} castShadow={false} />
    </group>
  );
}

/* -------------------------------------------------------------------- roof */

function Roof({ m }: { m: SceneMaterials }) {
  const parts = useMemo<BoxPart[]>(() => {
    const y = (CEIL + ROOF) / 2;
    const h = ROOF - CEIL;
    return [
      // around the skylight opening (x 3.5–5.9, z -4.5–-2.1)
      { s: [X1 - X0, h, 1.8], p: [(X0 + X1) / 2, y, -5.4] },
      { s: [X1 - X0, h, 5.5], p: [(X0 + X1) / 2, y, 0.65] },
      { s: [6.9, h, 2.4], p: [0.05, y, -3.3] },
      { s: [4.3, h, 2.4], p: [8.05, y, -3.3] },
      // south blade, cantilevered 0.6 m past the glass line
      { s: [14.3, h, 0.62], p: [3.4, y, 3.71] },
      // west and east blades
      { s: [0.35, h, 10.0], p: [-3.57, y, -1.3] },
      { s: [0.35, h, 10.0], p: [10.37, y, -1.3] },
    ];
  }, []);

  const ballast = useMemo<BoxPart[]>(() => {
    const inset = 0.34;
    const bx0 = X0 + inset;
    const bx1 = X1 - inset;
    const bz0 = Z0 + inset;
    const bz1 = Z1 - inset;
    const p = 0.2; // parapet height
    return [
      // substrate, flush with the parapet base
      { s: [bx1 - bx0, 0.06, bz1 - bz0], p: [(bx0 + bx1) / 2, ROOF + 0.03, (bz0 + bz1) / 2] },
      // parapet on all four sides — a protected roof, not a floating slab
      { s: [X1 - X0, p, 0.14], p: [(X0 + X1) / 2, ROOF + p / 2, Z0 + 0.07] },
      { s: [X1 - X0, p, 0.14], p: [(X0 + X1) / 2, ROOF + p / 2, Z1 - 0.07] },
      { s: [0.14, p, Z1 - Z0], p: [X0 + 0.07, ROOF + p / 2, (Z0 + Z1) / 2] },
      { s: [0.14, p, Z1 - Z0], p: [X1 - 0.07, ROOF + p / 2, (Z0 + Z1) / 2] },
    ];
  }, []);

  const coping = useMemo<BoxPart[]>(
    () => [
      { s: [X1 - X0, 0.016, 0.18], p: [(X0 + X1) / 2, ROOF + 0.208, Z0 + 0.07] },
      { s: [X1 - X0, 0.016, 0.18], p: [(X0 + X1) / 2, ROOF + 0.208, Z1 - 0.07] },
      { s: [0.18, 0.016, Z1 - Z0], p: [X0 + 0.07, ROOF + 0.208, (Z0 + Z1) / 2] },
      { s: [0.18, 0.016, Z1 - Z0], p: [X1 - 0.07, ROOF + 0.208, (Z0 + Z1) / 2] },
    ],
    [],
  );

  const soffit = useMemo<BoxPart[]>(
    () => [
      { s: [X1 - IX0 - 0.35, 0.012, 3.35], p: [(IX0 + X1) / 2, CEIL - 0.006, 1.66] },
      { s: [IX0 - X0, 0.012, 8.3], p: [(X0 + IX0) / 2, CEIL - 0.006, -1.7] },
      { s: [IX1 - IX0, 0.012, 2.9], p: [(IX0 + IX1) / 2, CEIL - 0.006, -3.55] },
      { s: [3.4, 0.012, 2.4], p: [0.2, CEIL - 0.006, -3.3] },
      { s: [4.0, 0.012, 2.4], p: [7.9, CEIL - 0.006, -3.3] },
    ],
    [],
  );

  return (
    <group>
      <PartMesh parts={parts} material={m.concrete} />
      <PartMesh parts={ballast} material={m.ballast} castShadow={false} uvUnit={0.85} />
      <PartMesh parts={coping} material={m.steel} castShadow={false} />
      <PartMesh parts={soffit} material={m.plaster} castShadow={false} />
    </group>
  );
}

/* --------------------------------------------------------------- skylight */

function Skylight({ m }: { m: SceneMaterials }) {
  const well = useMemo<BoxPart[]>(
    () => [
      // solid curb, thick enough to read as a real upstand
      { s: [2.9, 0.56, 0.34], p: [4.7, 4.24, -4.5] },
      { s: [2.9, 0.56, 0.34], p: [4.7, 4.24, -2.1] },
      { s: [0.34, 0.56, 2.06], p: [3.42, 4.24, -3.3] },
      { s: [0.34, 0.56, 2.06], p: [5.98, 4.24, -3.3] },
    ],
    [],
  );

  const frames = useMemo<BoxPart[]>(
    () => [
      { s: [2.62, 0.04, 0.07], p: [4.7, 4.53, -4.32] },
      { s: [2.62, 0.04, 0.07], p: [4.7, 4.53, -2.28] },
      { s: [0.07, 0.04, 2.1], p: [3.47, 4.53, -3.3] },
      { s: [0.07, 0.04, 2.1], p: [5.93, 4.53, -3.3] },
      { s: [0.05, 0.035, 2.1], p: [4.7, 4.53, -3.3] },
    ],
    [],
  );

  return (
    <Selectable id="skylight">
      <PartMesh parts={well} material={m.concreteSmooth} />
      <PartMesh parts={frames} material={m.steel} castShadow={false} />
      <mesh position={[4.7, 4.5, -3.3]} material={m.glassRail} castShadow={false}>
        <boxGeometry args={[2.5, 0.018, 2.04]} />
      </mesh>
    </Selectable>
  );
}

/* ----------------------------------------------------------------- glazing */

function Glazing({ m }: { m: SceneMaterials }) {
  const frames = useMemo<BoxPart[]>(
    () => [
      // head and sill tracks
      { s: [11.14, 0.1, 0.14], p: [4.23, 3.9, 3.4] },
      { s: [11.14, 0.045, 0.16], p: [4.23, 0.07, 3.4] },
      // vertical joints between 3.8 m panels
      { s: [0.035, 3.8, 0.13], p: [1.87, 1.98, 3.4] },
      { s: [0.035, 3.8, 0.13], p: [5.67, 1.98, 3.4] },
      { s: [0.035, 3.8, 0.13], p: [9.47, 1.98, 3.4] },
      // sliding panel, parked 0.6 m open
      { s: [0.04, 3.72, 0.1], p: [5.67, 1.95, 3.47] },
      { s: [0.04, 3.72, 0.1], p: [6.27, 1.95, 3.47] },
      { s: [0.6, 0.04, 0.1], p: [5.97, 3.78, 3.47] },
      { s: [0.6, 0.04, 0.1], p: [5.97, 0.11, 3.47] },
    ],
    [],
  );

  const sideFrames = useMemo<BoxPart[]>(
    () => [
      // west slot glazing
      { s: [0.06, 1.56, 2.24], p: [-2.93, 1.8, 1.8] },
      // north slots
      { s: [0.32, 1.62, 0.06], p: [0.85, 1.81, -5.65] },
      { s: [0.32, 1.62, 0.06], p: [6.95, 1.81, -5.65] },
    ],
    [],
  );

  return (
    <Selectable id="glass">
      <PartMesh parts={frames} material={m.bronze} castShadow={false} />
      <PartMesh parts={sideFrames} material={m.glassRail} castShadow={false} />
      <mesh position={[4.23, 1.96, 3.4]} material={m.glass} castShadow={false}>
        <boxGeometry args={[11.06, 3.78, 0.012]} />
      </mesh>
      <mesh position={[5.97, 1.96, 3.47]} material={m.glass} castShadow={false}>
        <boxGeometry args={[0.56, 3.68, 0.012]} />
      </mesh>
      <mesh position={[-2.94, 1.8, 1.8]} material={m.glassRail} castShadow={false}>
        <boxGeometry args={[0.012, 1.5, 2.18]} />
      </mesh>
    </Selectable>
  );
}

/* ---------------------------------------------------------------- terrace */

function Terrace({ m }: { m: SceneMaterials }) {
  const slab = useMemo<BoxPart[]>(
    () => [
      { s: [TERRACE.x1 - TERRACE.x0, 0.99, 0.55], p: [(TERRACE.x0 + TERRACE.x1) / 2, (GY + FY) / 2, 3.675] },
      { s: [TERRACE.x1 - TERRACE.x0, 0.99, 0.55], p: [(TERRACE.x0 + TERRACE.x1) / 2, (GY + FY) / 2, 7.325] },
      { s: [POOL.x0 - TERRACE.x0, 0.99, POOL.z1 - POOL.z0], p: [(TERRACE.x0 + POOL.x0) / 2, (GY + FY) / 2, (POOL.z0 + POOL.z1) / 2] },
      { s: [TERRACE.x1 - POOL.x1, 0.99, POOL.z1 - POOL.z0], p: [(POOL.x1 + TERRACE.x1) / 2, (GY + FY) / 2, (POOL.z0 + POOL.z1) / 2] },
    ],
    [],
  );

  const paving = useMemo<BoxPart[]>(
    () => [
      { s: [TERRACE.x1 - TERRACE.x0, 0.03, 0.55], p: [(TERRACE.x0 + TERRACE.x1) / 2, FY + 0.015, 3.675] },
      { s: [TERRACE.x1 - TERRACE.x0, 0.03, 0.55], p: [(TERRACE.x0 + TERRACE.x1) / 2, FY + 0.015, 7.325] },
      { s: [POOL.x0 - TERRACE.x0, 0.03, POOL.z1 - POOL.z0], p: [(TERRACE.x0 + POOL.x0) / 2, FY + 0.015, (POOL.z0 + POOL.z1) / 2] },
      { s: [TERRACE.x1 - POOL.x1, 0.03, POOL.z1 - POOL.z0], p: [(POOL.x1 + TERRACE.x1) / 2, FY + 0.015, (POOL.z0 + POOL.z1) / 2] },
      // pool coping
      { s: [3.6, 0.04, 0.12], p: [0, FY + 0.02, 3.89] },
      { s: [3.6, 0.04, 0.12], p: [0, FY + 0.02, 7.11] },
      { s: [0.12, 0.04, 3.1], p: [-1.76, FY + 0.02, 5.5] },
      { s: [0.12, 0.04, 3.1], p: [1.76, FY + 0.02, 5.5] },
      // east terrace paving
      { s: [6.5, 0.03, 4.2], p: [13.65, FY + 0.015, 2.6] },
    ],
    [],
  );

  /*
   * Setting-out joints. Slabs are laid in a 1.32 m grid; the recessed joints
   * are what give the deck a scale in the aerial view, where a single large
   * plane of stone reads as nothing at all. Any line that would cross the pool
   * is split around it, so no strip ever floats over the water.
   */
  const joints = useMemo<BoxPart[]>(() => {
    const parts: BoxPart[] = [];
    const step = 1.32;
    const y = FY + 0.028;
    const g = 0.026;
    const zMin = TERRACE.z0;
    const zMax = TERRACE.z1;
    const xMin = TERRACE.x0;
    const xMax = TERRACE.x1;

    const pushZ = (x: number, z0: number, z1: number) => {
      if (z1 - z0 < 0.08) return;
      parts.push({ s: [g, 0.012, z1 - z0], p: [x, y, (z0 + z1) / 2] });
    };
    const pushX = (z: number, x0: number, x1: number) => {
      if (x1 - x0 < 0.08) return;
      parts.push({ s: [x1 - x0, 0.012, g], p: [(x0 + x1) / 2, y, z] });
    };

    for (let x = Math.ceil(xMin / step) * step; x < xMax; x += step) {
      const overPool = x > POOL.x0 - 0.05 && x < POOL.x1 + 0.05;
      if (overPool) {
        pushZ(x, zMin, POOL.z0 - 0.05);
        pushZ(x, POOL.z1 + 0.05, zMax);
      } else pushZ(x, zMin, zMax);
    }
    for (let z = Math.ceil(zMin / step) * step; z < zMax; z += step) {
      const overPool = z > POOL.z0 - 0.05 && z < POOL.z1 + 0.05;
      if (overPool) {
        pushX(z, xMin, POOL.x0 - 0.05);
        pushX(z, POOL.x1 + 0.05, xMax);
      } else pushX(z, xMin, xMax);
    }
    // east terrace
    for (let x = 10.6; x < 16.9; x += step) pushZ(x, -0.4, 4.7);
    for (let z = 0.2; z < 4.7; z += step) pushX(z, 10.4, 16.9);
    return parts;
  }, []);

  return (
    <group>
      <PartMesh parts={slab} material={m.concrete} />
      {/* world-space UVs: one travertine field, one scale, coping included */}
      <PartMesh parts={paving} material={m.terraceStone} uvUnit={2.6} />
      <PartMesh parts={joints} material={m.joint} castShadow={false} />
    </group>
  );
}

function Pool({ m }: { m: SceneMaterials }) {
  const ripple = useMemo(() => createRippleTexture(), []);
  const waterRef = useRef<THREE.MeshPhysicalMaterial>(null);

  /*
   * Still water is dead water. The ripple field is already tiling, so drifting
   * its offset — and letting the bump do the work — gives the surface a slow,
   * continuous movement for one texture fetch per frame and no geometry cost.
   */
  useFrame((state) => {
    const water = waterRef.current;
    if (!water) return;
    const t = state.clock.elapsedTime;
    if (water.bumpMap) {
      water.bumpMap.offset.set(t * 0.006, t * 0.009);
      water.roughnessMap = water.bumpMap;
    }
    water.bumpScale = 0.3 + Math.sin(t * 0.35) * 0.05;
  });

  const basin = useMemo<BoxPart[]>(
    () => [
      { s: [3.4, 0.1, 3.1], p: [0, -1.5, 5.5] },
      { s: [3.4, 1.5, 0.1], p: [0, -0.75, 4.0] },
      { s: [3.4, 1.5, 0.1], p: [0, -0.75, 7.0] },
      { s: [0.1, 1.5, 2.9], p: [-1.65, -0.75, 5.5] },
      { s: [0.1, 1.5, 2.9], p: [1.65, -0.75, 5.5] },
      { s: [3.42, 0.06, 0.05], p: [0, 0.0, 7.08] },
    ],
    [],
  );

  /*
   * Planar reflection (drei's MeshReflectorMaterial) was measured and removed:
   * it re-renders the scene through a mirrored camera and, combined with our
   * clipped materials, blew large patches to pure white. The water instead
   * relies on a hard physical material — a very dark, near-mirror finish with
   * a varying roughness map, plus the PMREM environment — which reflects the
   * dusk sky convincingly and never fails.
   */
  return (
    <Selectable id="pool">
      <PartMesh parts={basin} material={m.basin} castShadow={false} />
      <mesh rotation-x={-Math.PI / 2} position={[0, POOL.water, 5.5]} receiveShadow>
        <planeGeometry args={[3.36, 3.06]} />
        {/*
          Water is a dielectric: at the steep angles you get from above it is
          almost transparent and you read the tiled basin, while at grazing
          angles the fresnel term takes over and it mirrors the sky. A dark
          opaque sheet looked like a hole in the deck from the aerial view.
        */}
        <meshPhysicalMaterial
          ref={waterRef}
          color={0x1d3b3d}
          transparent
          opacity={0.66}
          metalness={0.12}
          roughness={0.05}
          roughnessMap={ripple}
          bumpMap={ripple}
          bumpScale={0.3}
          envMapIntensity={4.6}
          clearcoat={1}
          clearcoatRoughness={0.03}
          reflectivity={1}
          ior={1.33}
          depthWrite={false}
          toneMapped
        />
      </mesh>
      {/* thin bright meniscus at the overflow edge, as water actually reads */}
      <mesh rotation-x={-Math.PI / 2} position={[0, POOL.water + 0.002, 7.02]}>
        <planeGeometry args={[3.34, 0.07]} />
        <meshBasicMaterial color={0xa9bdb8} transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.55, 5.5]} intensity={2.4} distance={4} decay={2} color="#7fd0c8" />
    </Selectable>
  );
}

/* ---------------------------------------------------------------- pavilion */

function Pavilion({ m }: { m: SceneMaterials }) {
  const shell = useMemo<BoxPart[]>(
    () => [
      // north wall
      { s: [PAV.x1 - PAV.x0, PAV.top + 0.05, 0.4], p: [(PAV.x0 + PAV.x1) / 2, (PAV.top - 0.05) / 2, -6.2] },
      // west wall with a doorway to the main house
      { s: [0.3, PAV.top + 0.05, 3.2], p: [10.35, (PAV.top - 0.05) / 2, -4.6] },
      { s: [0.3, PAV.top + 0.05, 2.6], p: [10.35, (PAV.top - 0.05) / 2, -1.5] },
      { s: [0.3, PAV.top - 2.35, 1.2], p: [10.35, (PAV.top + 2.35) / 2, -2.8] },
      // floor
      { s: [PAV.x1 - PAV.x0 - 0.4, 0.1, PAV.z1 - PAV.z0 - 0.4], p: [(PAV.x0 + PAV.x1) / 2, 0, -3.3] },
      // roof with a 0.4 m overhang to the south
      { s: [PAV.x1 - PAV.x0 + 0.3, 0.3, PAV.z1 - PAV.z0 + 0.5], p: [(PAV.x0 + PAV.x1) / 2, (PAV.roof + PAV.top) / 2, -3.2] },
      // east pier
      { s: [0.4, PAV.top + 0.05, 1.0], p: [16.4, (PAV.top - 0.05) / 2, -5.8] },
    ],
    [],
  );

  const glazing = useMemo<BoxPart[]>(
    () => [
      // south glazing frame
      { s: [5.8, 0.08, 0.1], p: [13.3, 2.72, -0.25] },
      { s: [5.8, 0.04, 0.1], p: [13.3, 0.09, -0.25] },
      { s: [0.035, 2.7, 0.1], p: [12.5, 1.4, -0.25] },
      { s: [0.035, 2.7, 0.1], p: [13.3, 1.4, -0.25] },
      { s: [0.035, 2.7, 0.1], p: [14.1, 1.4, -0.25] },
      // east glazing
      { s: [0.1, 2.7, 0.035], p: [16.25, 1.4, -4.4] },
      { s: [0.1, 2.7, 0.035], p: [16.25, 1.4, -3.0] },
      { s: [0.1, 2.7, 0.035], p: [16.25, 1.4, -1.6] },
      { s: [0.1, 0.06, 5.6], p: [16.25, 2.72, -3.0] },
      { s: [0.1, 0.04, 5.6], p: [16.25, 0.09, -3.0] },
    ],
    [],
  );

  return (
    <Selectable id="suite">
      <PartMesh parts={shell} material={m.concrete} />
      <PartMesh parts={glazing} material={m.bronze} castShadow={false} />
      <mesh position={[13.3, 1.4, -0.25]} material={m.glass} castShadow={false}>
        <boxGeometry args={[5.74, 2.64, 0.012]} />
      </mesh>
      <mesh position={[16.25, 1.4, -3.0]} material={m.glass} castShadow={false}>
        <boxGeometry args={[0.012, 2.64, 5.54]} />
      </mesh>
      {/* plaster ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[13.3, PAV.roof - 0.01, -3.3]} material={m.plaster}>
        <planeGeometry args={[5.8, 5.6]} />
      </mesh>
    </Selectable>
  );
}

/* ----------------------------------------------------------------- pergola */

function Pergola({ m }: { m: SceneMaterials }) {
  const slats = useMemo<BoxPart[]>(() => {
    const parts: BoxPart[] = [];
    for (let i = 0; i < 7; i++) {
      const z = 0.12 + i * 0.335;
      parts.push({ s: [5.9, 0.26, 0.13], p: [13.55, 3.33, z] });
    }
    parts.push({ s: [6.0, 0.2, 0.16], p: [13.55, 3.42, 0.06] });
    parts.push({ s: [6.0, 0.2, 0.16], p: [13.55, 3.42, 2.2] });
    parts.push({ s: [0.14, 3.2, 0.14], p: [10.85, 1.65, 2.12] });
    parts.push({ s: [0.14, 3.2, 0.14], p: [16.25, 1.65, 2.12] });
    return parts;
  }, []);

  return (
    <Selectable id="pergola">
      <PartMesh parts={slats} material={m.concreteSmooth} />
    </Selectable>
  );
}

/* ------------------------------------------------------- travertine volume */

function StoneVolume({ m }: { m: SceneMaterials }) {
  const parts = useMemo<BoxPart[]>(
    () => [
      { s: [1.2, 2.35, 1.3], p: [11.1, 1.225, 2.65] },
      { s: [1.24, 0.08, 1.34], p: [11.1, 2.42, 2.65] },
    ],
    [],
  );
  const recess = useMemo<BoxPart[]>(
    () => [
      { s: [0.06, 1.4, 0.9], p: [10.48, 1.35, 2.65] },
      { s: [0.3, 0.06, 0.06], p: [10.7, 2.25, 2.65] },
    ],
    [],
  );
  return (
    <group>
      <PartMesh parts={parts} material={m.travertine} />
      <PartMesh parts={recess} material={m.char} castShadow={false} />
    </group>
  );
}

/* ---------------------------------------------------------------- courtyard */

function Courtyard({ m }: { m: SceneMaterials }) {
  const tree = useMemo(() => oliveTree(7, 3.1, 1.35), []);
  const planter = useMemo<BoxPart[]>(
    () => [
      { s: [1.7, 0.62, 1.7], p: [-3.05, 0.36, 5.4] },
      { s: [1.76, 0.06, 1.76], p: [-3.05, 0.68, 5.4] },
    ],
    [],
  );

  return (
    <Selectable id="courtyard">
      <PartMesh parts={planter} material={m.travertine} />
      <mesh position={[-3.05, 0.66, 5.4]} material={m.soil} receiveShadow>
        <boxGeometry args={[1.5, 0.06, 1.5]} />
      </mesh>
      <mesh geometry={tree.branches} material={m.bark} castShadow receiveShadow position={[-3.05, 0.66, 5.4]} />
      <mesh geometry={tree.canopy} material={m.foliage} castShadow receiveShadow position={[-3.05, 0.66, 5.4]} />
      {/* bollards */}
      {[
        [-3.9, 3.6],
        [2.1, 7.2],
        [8.9, 7.2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, FY + 0.24, z]}>
          <mesh material={m.blackSteel} castShadow>
            <cylinderGeometry args={[0.055, 0.07, 0.48, 12]} />
          </mesh>
          <mesh position={[0, 0.26, 0]} material={m.glow}>
            <cylinderGeometry args={[0.05, 0.05, 0.035, 12]} />
          </mesh>
        </group>
      ))}
    </Selectable>
  );
}

/* ------------------------------------------------------------------ floor */

function InteriorFloor({ m }: { m: SceneMaterials }) {
  return (
    <Selectable id="floor">
      <mesh
        position={[(IX0 + IX1) / 2, 0.062, (IZ0 + Z1) / 2]}
        material={m.floorWood}
        receiveShadow
      >
        <boxGeometry args={[IX1 - IX0, 0.025, Z1 - IZ0]} />
      </mesh>
    </Selectable>
  );
}

/* --------------------------------------------------------------- assemble */

export function MainEnvironment({
  m,
  quality,
  showInterior = true,
}: {
  m: SceneMaterials;
  quality: Quality;
  showInterior?: boolean;
}) {
  return (
    <group>
      <Foundation m={m} />
      <Terrace m={m} />
      <InteriorFloor m={m} />
      <Walls m={m} />
      <Roof m={m} />
      <Skylight m={m} />
      <Glazing m={m} />
      <Pool m={m} />
      <Pavilion m={m} />
      <Pergola m={m} />
      <StoneVolume m={m} />
      <Courtyard m={m} />
      <ArchitecturalDetail m={m} />
      <SoffitLighting m={m} />
      <TerraceFurniture m={m} />
      <SiteDetail m={m} quality={quality} />
      {showInterior ? <Interior m={m} /> : null}
    </group>
  );
}
