"use client";

import { RoundedBox } from "@react-three/drei";
import type { SceneMaterials } from "@/lib/materials";
import { Selectable } from "./Selectable";

/** Warm interior lighting fixtures, modelled so reflections read at night. */
function Pendant({ x, z, y = 2.62, material, glow }: { x: number; z: number; y?: number; material: SceneMaterials; glow: boolean }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.62, 0]} material={material.blackSteel}>
        <cylinderGeometry args={[0.006, 0.006, 1.2, 6]} />
      </mesh>
      <mesh material={material.brass} castShadow>
        <cylinderGeometry args={[0.12, 0.17, 0.18, 24, 1, true]} />
      </mesh>
      {glow ? (
        <mesh position={[0, -0.085, 0]} material={material.glow}>
          <cylinderGeometry args={[0.165, 0.165, 0.006, 20]} />
        </mesh>
      ) : null}
    </group>
  );
}

function Fireplace({ m }: { m: SceneMaterials }) {
  return (
    <Selectable id="fireplace">
      <group>
        {/* concrete monolith */}
        <mesh position={[9.3, 1.3, -3.3]} material={m.concrete} castShadow receiveShadow>
          <boxGeometry args={[1.1, 2.6, 2.4]} />
        </mesh>
        {/* recessed firebox */}
        <mesh position={[8.74, 1.02, -3.3]} material={m.char} castShadow={false}>
          <boxGeometry args={[0.06, 1.0, 0.78]} />
        </mesh>
        <mesh position={[8.77, 0.72, -3.3]} material={m.glow} castShadow={false}>
          <boxGeometry args={[0.02, 0.22, 0.66]} />
        </mesh>
        {[-3.5, -3.3, -3.1].map((z, i) => (
          <mesh
            key={z}
            position={[8.8, 0.56 + i * 0.03, z]}
            rotation={[0, 0.3 * i, Math.PI / 2]}
            material={m.bark}
          >
            <cylinderGeometry args={[0.055, 0.06, 0.34, 7]} />
          </mesh>
        ))}
        {/* travertine hearth */}
        <mesh position={[8.5, 0.3, -3.3]} material={m.travertine} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.44, 2.0]} />
        </mesh>
        {/* brass detail */}
        <mesh position={[8.735, 1.56, -3.3]} material={m.brass}>
          <boxGeometry args={[0.02, 0.02, 0.86]} />
        </mesh>
      </group>
    </Selectable>
  );
}

function Kitchen({ m }: { m: SceneMaterials }) {
  return (
    <Selectable id="kitchen">
      <group>
        {/* island */}
        <mesh position={[-1.1, 0.46, -3.15]} material={m.oak} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.82, 3.1]} />
        </mesh>
        <mesh position={[-1.1, 0.9, -3.15]} material={m.travertine} castShadow receiveShadow>
          <boxGeometry args={[1.12, 0.06, 3.24]} />
        </mesh>
        {/* hob and sink */}
        <mesh position={[-1.1, 0.937, -4.0]} material={m.char}>
          <boxGeometry args={[0.62, 0.008, 0.78]} />
        </mesh>
        <mesh position={[-1.1, 0.936, -2.2]} material={m.steel}>
          <boxGeometry args={[0.52, 0.01, 0.42]} />
        </mesh>
        <mesh position={[-1.1, 1.06, -2.55]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.017, 0.017, 0.32, 10]} />
        </mesh>
        <mesh position={[-1.1, 1.21, -2.66]} material={m.brass} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.014, 0.014, 0.22, 10]} />
        </mesh>
        {/* stools */}
        {[-4.1, -3.15, -2.2].map((z) => (
          <group key={z} position={[-0.42, 0, z]}>
            <mesh position={[0, 0.63, 0]} material={m.leather} castShadow>
              <cylinderGeometry args={[0.19, 0.18, 0.07, 20]} />
            </mesh>
            {[0, 1, 2, 3].map((i) => {
              const a = (i / 4) * Math.PI * 2 + 0.4;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 0.13, 0.3, Math.sin(a) * 0.13]}
                  rotation={[Math.cos(a) * 0.06, 0, Math.sin(a) * -0.06]}
                  material={m.blackSteel}
                  castShadow
                >
                  <cylinderGeometry args={[0.011, 0.011, 0.6, 6]} />
                </mesh>
              );
            })}
          </group>
        ))}
        {/* back counter along the west wall */}
        <mesh position={[-2.26, 0.88, -3.5]} material={m.travertine} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.06, 2.6]} />
        </mesh>
        <mesh position={[-2.34, 0.44, -3.5]} material={m.oak} castShadow>
          <boxGeometry args={[0.36, 0.86, 2.6]} />
        </mesh>
        {/* tall joinery */}
        <mesh position={[-2.33, 1.4, -1.5]} material={m.oak} castShadow receiveShadow>
          <boxGeometry args={[0.36, 2.72, 1.7]} />
        </mesh>
        {[-1.0, -2.0].map((z) => (
          <mesh key={z} position={[-2.14, 1.4, z]} material={m.blackSteel}>
            <boxGeometry args={[0.012, 2.6, 0.012]} />
          </mesh>
        ))}
        {/* under-counter light */}
        <mesh position={[-2.0, 0.845, -3.5]} material={m.glow}>
          <boxGeometry args={[0.02, 0.012, 2.5]} />
        </mesh>
      </group>
    </Selectable>
  );
}

function Living({ m }: { m: SceneMaterials }) {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[6.4, 0.082, -2.9]} material={m.rug} receiveShadow>
        <planeGeometry args={[4.3, 3.4]} />
      </mesh>
      {/* sofa facing the fireplace */}
      <group position={[6.05, 0.075, -2.95]}>
        <RoundedBox args={[0.95, 0.3, 3.0]} radius={0.06} smoothness={3} material={m.fabricDark} castShadow receiveShadow position={[0, 0.2, 0]} />
        {[-0.76, 0.76].map((z) => (
          <RoundedBox key={z} args={[0.8, 0.16, 1.36]} radius={0.05} smoothness={3} material={m.fabric} castShadow position={[0.02, 0.42, z]} />
        ))}
        {[-0.76, 0.76].map((z) => (
          <RoundedBox key={`b${z}`} args={[0.2, 0.52, 1.3]} radius={0.06} smoothness={3} material={m.fabricDark} castShadow position={[-0.36, 0.66, z]} rotation-z={0.08} />
        ))}
        {[-1.45, 1.45].map((z) => (
          <RoundedBox key={`a${z}`} args={[0.92, 0.42, 0.16]} radius={0.06} smoothness={3} material={m.fabricDark} castShadow position={[0, 0.36, z]} />
        ))}
        {/* cushions */}
        <RoundedBox args={[0.12, 0.34, 0.42]} radius={0.05} smoothness={3} material={m.leather} castShadow position={[-0.22, 0.72, -0.3]} rotation-z={0.3} />
        <RoundedBox args={[0.12, 0.32, 0.4]} radius={0.05} smoothness={3} material={m.fabric} castShadow position={[-0.2, 0.7, 0.95]} rotation-z={0.28} />
      </group>
      {/* travertine coffee table */}
      <group position={[7.55, 0, -2.95]}>
        <mesh position={[0, 0.34, 0]} material={m.travertine} castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.055, 1.9]} />
        </mesh>
        <mesh position={[-0.4, 0.17, -0.78]} material={m.brass}>
          <cylinderGeometry args={[0.02, 0.02, 0.32, 10]} />
        </mesh>
        <mesh position={[0.4, 0.17, 0.78]} material={m.brass}>
          <cylinderGeometry args={[0.02, 0.02, 0.32, 10]} />
        </mesh>
        <mesh position={[0.1, 0.385, 0.3]} material={m.bark} rotation-y={0.4}>
          <boxGeometry args={[0.24, 0.04, 0.32]} />
        </mesh>
        <mesh position={[-0.1, 0.41, -0.4]} material={m.terracotta}>
          <cylinderGeometry args={[0.075, 0.055, 0.14, 16]} />
        </mesh>
      </group>
      {/* lounge chairs near the glass */}
      {[
        { p: [4.55, 0.075, 1.4], r: -0.5 },
        { p: [3.0, 0.075, 1.15], r: -0.95 },
      ].map(({ p, r }, i) => (
        <group key={i} position={p as [number, number, number]} rotation-y={r}>
          <mesh position={[0, 0.17, 0]} material={m.bark} castShadow>
            <boxGeometry args={[0.68, 0.1, 0.72]} />
          </mesh>
          <RoundedBox args={[0.66, 0.16, 0.68]} radius={0.05} smoothness={3} material={m.leather} castShadow position={[0, 0.3, 0]} />
          <RoundedBox args={[0.66, 0.5, 0.14]} radius={0.05} smoothness={3} material={m.leather} castShadow position={[0, 0.56, -0.28]} rotation-x={-0.16} />
          <mesh position={[0, 0.11, 0]} material={m.blackSteel}>
            <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
          </mesh>
        </group>
      ))}
      {/* dining */}
      <group position={[1.65, 0, 0.55]}>
        <mesh position={[0, 0.73, 0]} material={m.oak} castShadow receiveShadow>
          <boxGeometry args={[1.02, 0.05, 2.3]} />
        </mesh>
        {[
          [-0.42, -1.0],
          [0.42, -1.0],
          [-0.42, 1.0],
          [0.42, 1.0],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.36, z]} material={m.oak} castShadow>
            <boxGeometry args={[0.05, 0.72, 0.05]} />
          </mesh>
        ))}
        {[
          [-0.95, -0.65, 0],
          [-0.95, 0.15, 0],
          [-0.95, 0.95, 0],
          [1.0, -0.65, Math.PI],
          [1.0, 0.15, Math.PI],
          [1.0, 0.95, Math.PI],
        ].map(([x, z, rot], i) => (
          <group key={i} position={[x, 0.075, z]} rotation-y={rot}>
            <mesh position={[0, 0.43, 0]} material={m.leather} castShadow>
              <boxGeometry args={[0.42, 0.05, 0.42]} />
            </mesh>
            <mesh position={[0, 0.68, -0.2]} material={m.leather} castShadow>
              <boxGeometry args={[0.42, 0.5, 0.045]} />
            </mesh>
            {[
              [-0.17, -0.17],
              [0.17, -0.17],
              [-0.17, 0.17],
              [0.17, 0.17],
            ].map(([lx, lz], j) => (
              <mesh key={j} position={[lx, 0.21, lz]} material={m.bark} castShadow>
                <cylinderGeometry args={[0.016, 0.016, 0.42, 7]} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0.28, 0.77, 0.1]} material={m.terracotta}>
          <cylinderGeometry args={[0.09, 0.07, 0.2, 16]} />
        </mesh>
      </group>
      {[0.2, 0.55, 0.9].map((z, i) => (
        <Pendant key={z} x={1.65} z={z} y={2.68 - i * 0.05} material={m} glow />
      ))}
      {/* oak sideboard on the north wall */}
      <mesh position={[1.9, 0.42, -4.79]} material={m.oak} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.68, 0.42]} />
      </mesh>
      <mesh position={[1.9, 0.77, -4.79]} material={m.travertine} castShadow>
        <boxGeometry args={[2.74, 0.03, 0.44]} />
      </mesh>
      {[1.1, 1.9, 2.7].map((x) => (
        <mesh key={x} position={[x, 0.42, -4.575]} material={m.blackSteel}>
          <boxGeometry args={[0.008, 0.6, 0.008]} />
        </mesh>
      ))}
      <mesh position={[3.1, 0.83, -4.8]} material={m.terracotta} castShadow>
        <cylinderGeometry args={[0.15, 0.11, 0.32, 20]} />
      </mesh>
      {[2.7, 2.76, 2.82].map((x, i) => (
        <mesh key={x} position={[x, 0.795 + i * 0.035, -4.8]} material={m.paper} castShadow>
          <boxGeometry args={[0.26, 0.03, 0.2]} />
        </mesh>
      ))}
      {/* linen artwork on the concrete wall */}
      <mesh position={[5.15, 1.95, -4.976]} material={m.fabric} receiveShadow>
        <boxGeometry args={[2.3, 1.5, 0.04]} />
      </mesh>
      <mesh position={[5.15, 2.72, -4.96]} material={m.brass}>
        <boxGeometry args={[2.34, 0.012, 0.012]} />
      </mesh>
      {/* floor lamp */}
      <group position={[5.35, 0.075, -0.35]}>
        <mesh position={[0, 0.02, 0]} material={m.blackSteel} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 0.03, 18]} />
        </mesh>
        <mesh position={[0, 0.78, 0]} material={m.blackSteel} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.5, 8]} />
        </mesh>
        <mesh position={[0, 1.52, 0]} material={m.lamp} castShadow>
          <cylinderGeometry args={[0.16, 0.22, 0.24, 22, 1, true]} />
        </mesh>
        <mesh position={[0, 1.44, 0]} material={m.glow}>
          <cylinderGeometry args={[0.19, 0.19, 0.006, 18]} />
        </mesh>
      </group>
      {/* bench under the skylight */}
      <mesh position={[4.7, 0.28, -3.3]} material={m.travertine} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.4, 0.48]} />
      </mesh>
      <mesh position={[5.75, 0.44, -3.35]} material={m.terracotta} castShadow>
        <cylinderGeometry args={[0.19, 0.15, 0.42, 20]} />
      </mesh>
      <mesh position={[5.75, 1.15, -3.35]} material={m.foliage} castShadow>
        <icosahedronGeometry args={[0.34, 1]} />
      </mesh>
    </group>
  );
}

function Suite({ m }: { m: SceneMaterials }) {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[13.45, 0.08, -3.6]} material={m.rug} receiveShadow>
        <planeGeometry args={[3.6, 2.8]} />
      </mesh>
      {/* bed */}
      <group position={[13.45, 0.06, -4.35]}>
        <mesh position={[0, 0.2, 0]} material={m.oak} castShadow receiveShadow>
          <boxGeometry args={[1.95, 0.3, 2.15]} />
        </mesh>
        <RoundedBox args={[1.86, 0.24, 1.98]} radius={0.06} smoothness={3} material={m.linen} castShadow position={[0, 0.45, 0]} />
        <RoundedBox args={[1.5, 0.12, 0.42]} radius={0.05} smoothness={3} material={m.linen} castShadow position={[0, 0.6, -0.75]} />
        <RoundedBox args={[1.5, 0.1, 0.4]} radius={0.05} smoothness={3} material={m.fabric} castShadow position={[0, 0.63, -0.78]} />
        <RoundedBox args={[1.9, 0.14, 0.62]} radius={0.05} smoothness={3} material={m.fabricDark} castShadow position={[0, 0.56, 0.62]} />
        {/* headboard */}
        <mesh position={[0, 0.72, -1.09]} material={m.walnut} castShadow receiveShadow>
          <boxGeometry args={[2.3, 1.05, 0.08]} />
        </mesh>
      </group>
      {[-1.25, 1.25].map((x, i) => (
        <group key={x} position={[13.45 + x, 0.06, -5.1]}>
          <mesh position={[0, 0.24, 0]} material={m.walnut} castShadow>
            <boxGeometry args={[0.5, 0.36, 0.44]} />
          </mesh>
          <mesh position={[0, 0.52, 0]} material={m.lamp} castShadow>
            <sphereGeometry args={[0.11, 18, 12]} />
          </mesh>
          <pointLight position={[0, 0.52, 0]} intensity={i === 0 ? 1.1 : 0.85} distance={2.6} color="#ffcf9e" />
        </group>
      ))}
      <mesh position={[13.45, 0.32, -2.95]} material={m.fabric} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.34, 0.46]} />
      </mesh>
      {/* wardrobe */}
      <mesh position={[10.72, 1.28, -4.4]} material={m.oak} castShadow receiveShadow>
        <boxGeometry args={[0.42, 2.5, 2.4]} />
      </mesh>
      {/* daybed on the east terrace */}
      <group position={[14.2, 0.075, 1.15]}>
        <mesh position={[0, 0.2, 0]} material={m.oak} castShadow receiveShadow>
          <boxGeometry args={[1.95, 0.3, 0.95]} />
        </mesh>
        <RoundedBox args={[1.8, 0.16, 0.86]} radius={0.06} smoothness={3} material={m.fabric} castShadow position={[0, 0.4, 0]} />
        <RoundedBox args={[0.4, 0.18, 0.7]} radius={0.06} smoothness={3} material={m.leather} castShadow position={[0.6, 0.52, 0.02]} />
      </group>
      <group position={[12.5, 0.075, 1.2]}>
        <mesh position={[0, 0.42, 0]} material={m.travertine} castShadow>
          <cylinderGeometry args={[0.24, 0.22, 0.06, 20]} />
        </mesh>
        <mesh position={[0, 0.21, 0]} material={m.blackSteel} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.42, 10]} />
        </mesh>
      </group>
    </group>
  );
}

function Exterior({ m }: { m: SceneMaterials }) {
  return (
    <group>
      {/* planters flanking the glass line */}
      {[
        [-4.0, 3.75],
        [9.9, 3.75],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.075, z]}>
          <mesh position={[0, 0.28, 0]} material={m.concreteSmooth} castShadow receiveShadow>
            <cylinderGeometry args={[0.36, 0.32, 0.56, 22]} />
          </mesh>
          <mesh position={[0, 0.56, 0]} material={m.soil}>
            <cylinderGeometry args={[0.32, 0.32, 0.04, 20]} />
          </mesh>
          <mesh position={[0, 0.95, 0]} material={m.foliageLight} castShadow>
            <icosahedronGeometry args={[0.42, 1]} />
          </mesh>
        </group>
      ))}
      {/* outdoor shower head in the travertine volume */}
      <mesh position={[10.42, 2.2, 2.65]} material={m.brass} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.02, 0.02, 0.34, 8]} />
      </mesh>
      <mesh position={[10.22, 2.19, 2.65]} material={m.brass}>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 18]} />
      </mesh>
    </group>
  );
}

export function Interior({ m }: { m: SceneMaterials }) {
  return (
    <group>
      <Fireplace m={m} />
      <Kitchen m={m} />
      <Living m={m} />
      <Suite m={m} />
      <Exterior m={m} />
    </group>
  );
}
