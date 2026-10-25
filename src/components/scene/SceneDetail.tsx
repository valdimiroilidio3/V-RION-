"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { SceneMaterials } from "@/lib/materials";
import { boxGeometry, mergeAll, mulberry32, type BoxPart } from "@/lib/geometry";
import { ARCH, terrainHeight } from "@/lib/plan";
import { CEIL, FY, GY, PAV, ROOF, X0, X1, Z0, Z1, IX0, IX1, POOL, TERRACE } from "./MainEnvironment";

function Part({
  parts,
  material,
  cast = false,
  receive = true,
}: {
  parts: BoxPart[];
  material: THREE.Material;
  cast?: boolean;
  receive?: boolean;
}) {
  const geometry = useMemo(() => boxGeometry(parts), [parts]);
  return <mesh geometry={geometry} material={material} castShadow={cast} receiveShadow={receive} />;
}

/* --------------------------------------------------- architectural detail */

/**
 * The millimetre work that separates a study model from an architectural
 * visualisation: shadow gaps, drip grooves, joint lines, seals and copings.
 */
export function ArchitecturalDetail({ m }: { m: SceneMaterials }) {
  const shadowGaps = useMemo<BoxPart[]>(
    () => [
      // soffit perimeter shadow gap (the slab reads as floating)
      { s: [IX1 - IX0, 0.055, 0.03], p: [(IX0 + IX1) / 2, CEIL - 0.028, 3.35] },
      { s: [IX1 - IX0, 0.055, 0.03], p: [(IX0 + IX1) / 2, CEIL - 0.028, -4.93] },
      { s: [0.03, 0.055, Z1 - Z0 - 0.6], p: [IX0 + 0.02, CEIL - 0.028, (Z0 + Z1) / 2] },
      { s: [0.03, 0.055, Z1 - Z0 - 0.6], p: [IX1 - 0.02, CEIL - 0.028, (Z0 + Z1) / 2] },
      // shadow gap at the wall / floor junction inside
      { s: [IX1 - IX0, 0.035, 0.02], p: [(IX0 + IX1) / 2, FY + 0.075, -4.97] },
      { s: [0.02, 0.035, Z1 - Z0 - 0.7], p: [IX0 + 0.015, FY + 0.075, (Z0 + Z1) / 2] },
      { s: [0.02, 0.035, Z1 - Z0 - 0.7], p: [IX1 - 0.015, FY + 0.075, (Z0 + Z1) / 2] },
    ],
    [],
  );

  const dripGroove = useMemo<BoxPart[]>(
    () => [
      // drip line on the underside of the roof blades
      { s: [14.4, 0.022, 0.022], p: [3.4, CEIL - 0.012, 3.86] },
      { s: [0.022, 0.022, 10.1], p: [-3.5, CEIL - 0.012, -1.3] },
      { s: [0.022, 0.022, 10.1], p: [10.3, CEIL - 0.012, -1.3] },
      // reveal line at the base of the terrace band
      { s: [TERRACE.x1 - TERRACE.x0, 0.02, 0.02], p: [(TERRACE.x0 + TERRACE.x1) / 2, GY + 0.09, TERRACE.z1 + 0.005] },
    ],
    [],
  );

  const joints = useMemo<BoxPart[]>(() => {
    const parts: BoxPart[] = [];
    const y = FY + 0.032;
    const t = 0.009;
    // north band of the terrace (between glass line and pool)
    for (let x = -3.2; x <= 9.9; x += 2.35) {
      parts.push({ s: [t, 0.004, 0.55], p: [x, y, 3.675] });
    }
    // south band
    for (let x = -3.2; x <= 9.9; x += 2.35) {
      parts.push({ s: [t, 0.004, 0.55], p: [x, y, 7.325] });
    }
    // west and east strips, joints running north-south
    for (const x of [-3.6, -2.7]) parts.push({ s: [t, 0.004, POOL.z1 - POOL.z0], p: [x, y, 5.5] });
    for (let x = 2.5; x <= 9.9; x += 2.35) {
      parts.push({ s: [t, 0.004, POOL.z1 - POOL.z0], p: [x, y, 5.5] });
    }
    // east terrace slab joints
    for (let x = 11.0; x <= 16.6; x += 2.2) {
      parts.push({ s: [t, 0.004, 4.0], p: [x, y, 2.6] });
    }
    // interior floor threshold (brass sole)
    return parts;
  }, []);

  const seals = useMemo<BoxPart[]>(
    () => [
      // dark gasket under the glazing
      { s: [11.12, 0.02, 0.05], p: [4.23, 0.085, 3.4] },
      // brass threshold at the terrace transition
      { s: [11.12, 0.008, 0.055], p: [4.23, 0.068, 3.36] },
      // window reveal shadow lines on the north slots
      { s: [0.34, 1.66, 0.014], p: [0.85, 1.81, -5.0] },
      { s: [0.34, 1.66, 0.014], p: [6.95, 1.81, -5.0] },
    ],
    [],
  );

  const scuppers = useMemo<BoxPart[]>(
    () => [
      { s: [0.22, 0.1, 0.12], p: [-1.2, ROOF + 0.05, Z0 + 0.06] },
      { s: [0.22, 0.1, 0.12], p: [5.4, ROOF + 0.05, Z0 + 0.06] },
      { s: [0.34, 0.09, 0.1], p: [X1 - 0.1, ROOF + 0.05, -3.2] },
      { s: [0.16, 0.09, 0.1], p: [X0 + 0.1, ROOF + 0.05, 1.4] },
    ],
    [],
  );

  const vents = useMemo<BoxPart[]>(
    () => [
      { s: [0.02, 0.09, 0.5], p: [10.21, 2.62, 1.6] },
      { s: [0.02, 0.09, 0.5], p: [10.21, 2.62, -1.9] },
      { s: [0.5, 0.09, 0.02], p: [-2.0, 2.9, -6.29] },
    ],
    [],
  );

  return (
    <group>
      <Part parts={shadowGaps} material={m.char} />
      <Part parts={dripGroove} material={m.char} />
      <Part parts={joints} material={m.char} />
      <Part parts={scuppers} material={m.char} />
      <Part parts={vents} material={m.bronze} />
      <Part parts={seals} material={m.brass} />
    </group>
  );
}

/* ------------------------------------------------------------ light detail */

export function SoffitLighting({ m }: { m: SceneMaterials }) {
  const downlights = useMemo(() => {
    const positions: [number, number, number][] = [
      [0.4, CEIL - 0.012, 3.72],
      [3.3, CEIL - 0.012, 3.72],
      [6.2, CEIL - 0.012, 3.72],
      [9.1, CEIL - 0.012, 3.72],
      [13.0, 3.32, 0.9],
      [15.6, 3.32, 0.9],
    ];
    return positions;
  }, []);

  const cove = useMemo<BoxPart[]>(
    () => [
      // warm cove grazing the concrete wall
      { s: [IX1 - IX0 - 0.2, 0.018, 0.018], p: [(IX0 + IX1) / 2, CEIL - 0.09, -4.9] },
      { s: [0.018, 0.018, 2.6], p: [IX1 - 0.08, CEIL - 0.09, -2.4] },
      // under-cabinet light in the kitchen is modelled there; this one lines the suite
      { s: [5.2, 0.014, 0.014], p: [13.3, PAV.roof - 0.055, -0.55] },
    ],
    [],
  );

  return (
    <group>
      <Part parts={cove} material={m.glow} />
      {downlights.map((p, i) => (
        <group key={i} position={p}>
          <mesh material={m.char}>
            <cylinderGeometry args={[0.075, 0.075, 0.012, 18]} />
          </mesh>
          <mesh position={[0, -0.008, 0]} material={m.glow}>
            <cylinderGeometry args={[0.045, 0.045, 0.004, 16]} />
          </mesh>
        </group>
      ))}

    </group>
  );
}

/* ------------------------------------------------------- terrace furniture */

function Lounger({
  position,
  rotation = 0,
  m,
}: {
  position: [number, number, number];
  rotation?: number;
  m: SceneMaterials;
}) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, 0.24, 0]} material={m.oak} castShadow receiveShadow>
        <boxGeometry args={[1.92, 0.07, 0.68]} />
      </mesh>
      {[
        [-0.82, -0.26],
        [0.82, -0.26],
        [-0.82, 0.26],
        [0.82, 0.26],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]} material={m.oak} castShadow>
          <boxGeometry args={[0.06, 0.24, 0.06]} />
        </mesh>
      ))}
      <RoundedBox
        args={[1.86, 0.09, 0.62]}
        radius={0.03}
        smoothness={2}
        material={m.linen}
        castShadow
        receiveShadow
        position={[0, 0.32, 0]}
      />
      <group position={[0.66, 0.36, 0]} rotation-z={0.62}>
        <mesh position={[0, 0.24, 0]} material={m.oak} castShadow>
          <boxGeometry args={[0.68, 0.06, 0.64]} />
        </mesh>
        <RoundedBox
          args={[0.64, 0.07, 0.6]}
          radius={0.025}
          smoothness={2}
          material={m.linen}
          castShadow
          position={[0, 0.285, 0]}
        />
      </group>
      <mesh position={[1.02, 0.5, 0]} material={m.terracotta} castShadow>
        <cylinderGeometry args={[0.11, 0.09, 0.16, 18]} />
      </mesh>
    </group>
  );
}

function OutdoorDining({ m }: { m: SceneMaterials }) {
  return (
    <group position={[13.5, FY + 0.03, 0.95]}>
      <mesh position={[0, 0.73, 0]} material={m.oak} castShadow receiveShadow>
        <boxGeometry args={[1.95, 0.05, 0.95]} />
      </mesh>
      {[
        [-0.82, -0.36],
        [0.82, -0.36],
        [-0.82, 0.36],
        [0.82, 0.36],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} material={m.oak} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
        </mesh>
      ))}
      <mesh position={[0, 0.765, 0]} material={m.terracotta} castShadow>
        <cylinderGeometry args={[0.19, 0.13, 0.07, 22]} />
      </mesh>
      <mesh position={[0.05, 0.8, 0]} material={m.foliageLight} castShadow>
        <icosahedronGeometry args={[0.13, 1]} />
      </mesh>
      <mesh position={[0.62, 0.83, 0.1]} material={m.lamp} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.14, 16, 1, true]} />
      </mesh>
      {[
        [-0.55, -0.85, 0],
        [0.55, -0.85, 0],
        [-0.55, 0.85, Math.PI],
        [0.55, 0.85, Math.PI],
      ].map(([x, z, rot], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={rot}>
          <mesh position={[0, 0.44, 0]} material={m.oak} castShadow>
            <boxGeometry args={[0.44, 0.045, 0.44]} />
          </mesh>
          <mesh position={[0, 0.66, -0.2]} material={m.oak} castShadow>
            <boxGeometry args={[0.44, 0.42, 0.04]} />
          </mesh>
          {[
            [-0.18, -0.18],
            [0.18, -0.18],
            [-0.18, 0.18],
            [0.18, 0.18],
          ].map(([lx, lz], j) => (
            <mesh key={j} position={[lx, 0.22, lz]} material={m.blackSteel} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.44, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function TerraceFurniture({ m }: { m: SceneMaterials }) {
  return (
    <group>
      <Lounger position={[12.6, FY + 0.03, 3.55]} rotation={0.04} m={m} />
      <Lounger position={[15.1, FY + 0.03, 3.55]} rotation={-0.02} m={m} />
      <group position={[13.85, FY + 0.03, 3.5]}>
        <mesh position={[0, 0.42, 0]} material={m.travertine} castShadow>
          <cylinderGeometry args={[0.26, 0.23, 0.05, 22]} />
        </mesh>
        <mesh position={[0, 0.21, 0]} material={m.blackSteel} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.4, 12]} />
        </mesh>
        <mesh position={[0.05, 0.47, 0]} material={m.terracotta} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.08, 14]} />
        </mesh>
      </group>
      <OutdoorDining m={m} />
      {/* oversized planter by the glass, with a shrub */}
      <group position={[10.05, FY + 0.03, 3.05]}>
        <mesh position={[0, 0.32, 0]} material={m.concreteSmooth} castShadow receiveShadow>
          <boxGeometry args={[0.52, 0.64, 0.52]} />
        </mesh>
        <mesh position={[0, 0.65, 0]} material={m.soil}>
          <boxGeometry args={[0.44, 0.03, 0.44]} />
        </mesh>
        <mesh position={[0, 1.05, 0]} material={m.foliage} castShadow>
          <icosahedronGeometry args={[0.42, 2]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ the site */

function dryStoneWallGeometry(seed: number) {
  const random = mulberry32(seed);
  const geos: THREE.BufferGeometry[] = [];
  const length = 20;
  const courses = 2;
  const courseH = 0.26;
  for (let c = 0; c < courses; c++) {
    let x = -length / 2;
    while (x < length / 2) {
      const w = 0.52 + random() * 0.62;
      const g = new THREE.BoxGeometry(w, courseH * (0.9 + random() * 0.22), 0.42 + random() * 0.26);
      g.rotateY((random() - 0.5) * 0.1);
      g.rotateZ((random() - 0.5) * 0.04);
      g.translate(x + w / 2, courseH * c + courseH / 2, (random() - 0.5) * 0.14);
      geos.push(g);
      x += w + 0.018;
    }
  }
  return mergeAll(geos);
}

export function SiteDetail({ m, quality }: { m: SceneMaterials; quality: "high" | "medium" | "low" }) {
  const wall = useMemo(() => dryStoneWallGeometry(9), []);

  const tufts = useMemo(() => {
    const random = mulberry32(2024);
    const positions: { p: [number, number, number]; s: number; r: number }[] = [];
    const count = quality === "high" ? 760 : quality === "medium" ? 420 : 160;
    for (let i = 0; i < count; i++) {
      const x = -34 + random() * 62;
      const z = -30 + random() * 46;
      const nearHouse = x > -6 && x < 19 && z > -9 && z < 9;
      if (nearHouse) continue;
      positions.push({
        p: [x, terrainHeight(x, z) - 0.02, z],
        s: 0.55 + random() * 0.6,
        r: random() * Math.PI,
      });
    }
    return positions;
  }, [quality]);

  const tuftGeometry = useMemo(() => {
    const a = new THREE.PlaneGeometry(0.85, 0.62);
    a.translate(0, 0.31, 0);
    const b = a.clone();
    b.rotateY(Math.PI / 2);
    return mergeAll([a, b]);
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    tufts.forEach((tuft, i) => {
      dummy.position.set(tuft.p[0], tuft.p[1], tuft.p[2]);
      dummy.rotation.set(0, tuft.r, 0);
      dummy.scale.setScalar(tuft.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [tufts]);

  const slabs = useMemo(() => {
    const parts: BoxPart[] = [];
    for (let i = 0; i < 6; i++) {
      const z = 8.9 + i * 1.15;
      const x = 2.6 + Math.sin(i * 1.3) * 0.35;
      parts.push({ s: [0.95, 0.07, 0.62], p: [x, GY + 0.04, z] });
    }
    return parts;
  }, []);

  return (
    <group>
      {/* dry-stone retaining wall along the south edge of the platform */}
      <mesh
        geometry={wall}
        material={m.rock}
        position={[3.6, GY + 0.06, 10.9]}
        castShadow
        receiveShadow
      />
      <Part parts={slabs} material={m.travertine} />

      {/* dry grass, instanced: one draw call for hundreds of tufts */}
      <instancedMesh
        ref={meshRef}
        args={[tuftGeometry, m.tuft, Math.max(1, tufts.length)]}
        frustumCulled
      />

      {/* a few boulders anchoring the platform in the landscape */}
      {[
        [-7.6, 0.5, 11.2, 1.1],
        [10.4, 0.6, 12.4, 1.35],
        [-13.2, 0.7, 6.2, 1.6],
      ].map(([x, h, z, s], i) => (
        <mesh
          key={i}
          position={[x, terrainHeight(x, z) + h * 0.25, z]}
          rotation={[0.3 * i, i * 1.3, 0.12]}
          scale={[s, s * 0.7, s * 0.85]}
          material={m.rock}
          receiveShadow
        >
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}

      {/* bronze downpipe at the pavilion corner */}
      <group position={[PAV.x1 + 0.12, 0, PAV.z0 + 0.1]}>
        <mesh position={[0, 1.2, 0]} material={m.bronze} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 2.4, 12]} />
        </mesh>
        <mesh position={[0, 2.44, 0]} material={m.bronze} castShadow>
          <cylinderGeometry args={[0.06, 0.045, 0.1, 12]} />
        </mesh>
      </group>

      {/* exterior sconce on the west courtyard wall */}
      <group position={[ARCH.westOuterX - 0.06, 2.35, 4.6]}>
        <mesh material={m.blackSteel}>
          <boxGeometry args={[0.1, 0.26, 0.1]} />
        </mesh>
        <mesh position={[-0.07, 0, 0]} material={m.glow}>
          <boxGeometry args={[0.02, 0.18, 0.06]} />
        </mesh>

      </group>
    </group>
  );
}
