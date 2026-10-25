"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { SceneMaterials } from "@/lib/materials";
import { oliveTree, rockGeometry, shrubGeometry, type Vec3 } from "@/lib/geometry";
import { createContactShadowTexture } from "@/lib/textures";
import { Selectable } from "./Selectable";
import { GY } from "./MainEnvironment";
import { SUN_DIRECTION } from "./EnvironmentLighting";

/* --------------------------------------------------------------------- sky */

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGround;
  uniform vec3 uSun;
  uniform vec3 uSunColor;
  void main() {
    vec3 dir = normalize(vDir);
    float h = dir.y;
    vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.42, h));
    col = mix(uGround, col, smoothstep(-0.09, 0.015, h));
    float d = max(dot(dir, normalize(uSun)), 0.0);
    col += uSunColor * pow(d, 900.0) * 3.2;
    col += uSunColor * pow(d, 26.0) * 0.34;
    col += uSunColor * pow(d, 3.0) * 0.08;
    // subtle dithering so the gradient never bands
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) / 200.0;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function SkyDome({ sunDirection }: { sunDirection: Vec3 }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color("#050a11") },
          uHorizon: { value: new THREE.Color("#c9bfab") },
          uGround: { value: new THREE.Color("#262420") },
          uSun: { value: new THREE.Vector3(...sunDirection) },
          uSunColor: { value: new THREE.Color("#ffd6a6") },
        },
      }),
    [sunDirection],
  );

  return (
    <mesh material={material} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[900, 48, 32]} />
    </mesh>
  );
}

/* ----------------------------------------------------------------- terrain */

function useTerrainGeometry() {
  return useMemo(() => {
    const geometry = new THREE.PlaneGeometry(230, 78, 140, 48);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(2, GY, 0);
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(position.count * 3);
    const gravel = new THREE.Color("#c9c1ae");
    const dry = new THREE.Color("#b0a67e");
    const sand = new THREE.Color("#a79d86");
    const c = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const dx = x - 3;
      const dz = z + 1;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const t = THREE.MathUtils.smoothstep(dist, 18, 48);
      const noise =
        Math.sin(x * 0.075) * Math.cos(z * 0.11) * 0.62 +
        Math.sin(x * 0.19 + 1.7) * Math.cos(z * 0.23 - 0.6) * 0.26 +
        Math.sin(x * 0.42 - 0.4) * Math.sin(z * 0.37) * 0.12;
      position.setY(i, GY + noise * 1.15 * t);

      const patch = THREE.MathUtils.smoothstep(
        Math.sin(x * 0.11 + Math.cos(z * 0.09) * 1.4) * 0.5 + Math.sin(z * 0.17 - x * 0.05) * 0.5,
        -0.2,
        0.9,
      );
      c.copy(gravel).lerp(dry, patch * 0.75);
      if (z < -20) c.lerp(sand, THREE.MathUtils.smoothstep(-z, 20, 36) * 0.6);
      if (dist < 14) c.lerp(gravel, 0.75);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }, []);
}

function Terrain({ m }: { m: SceneMaterials }) {
  const geometry = useTerrainGeometry();
  return (
    <mesh geometry={geometry} material={m.gravel} receiveShadow />
  );
}

/* -------------------------------------------------------------------- coast */

function useCliffGeometry() {
  return useMemo(() => {
    const cols = 90;
    const rows = 14;
    const width = 300;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const top = new THREE.Color("#6b6459");
    const bottom = new THREE.Color("#2a2b2a");
    const c = new THREE.Color();
    for (let j = 0; j <= rows; j++) {
      const t = j / rows;
      for (let i = 0; i <= cols; i++) {
        const x = -width / 2 + (i / cols) * width;
        const ledge =
          Math.sin(x * 0.13) * 1.5 + Math.sin(x * 0.37 + 1.1) * 0.7 + Math.sin(x * 0.71) * 0.32;
        const z = -35.5 - t * 13 - ledge * (0.35 + t * 0.8) + Math.sin(t * 9 + x * 0.2) * 0.5;
        const y = -0.6 - Math.pow(t, 0.82) * 30;
        positions.push(x, y, z);
        c.copy(top).lerp(bottom, Math.min(1, t * 1.35));
        colors.push(c.r, c.g, c.b);
      }
    }
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = j * (cols + 1) + i;
        const b = a + 1;
        const d = a + (cols + 1);
        const e = d + 1;
        indices.push(a, d, b, b, d, e);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }, []);
}

function Coast({ m }: { m: SceneMaterials }) {
  const cliff = useCliffGeometry();
  const rocksGeo = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => rockGeometry(300 + i * 17, 1, 0.3)), []);
  const rocks = useMemo(() => {
    const random = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    };
    const rnd = random(19);
    return Array.from({ length: 26 }, () => ({
      p: [-70 + rnd() * 150, -0.9 - rnd() * 1.1, -30 - rnd() * 5] as [number, number, number],
      s: [1.1 + rnd() * 2.8, 0.7 + rnd() * 1.5, 1.1 + rnd() * 2.4] as [number, number, number],
      r: rnd() * Math.PI,
    }));
  }, []);
  const stacks = useMemo(
    () => [
      { p: [-24, -22, -56] as [number, number, number], s: [7, 12, 6] as [number, number, number] },
      { p: [26, -24, -63] as [number, number, number], s: [9, 9, 7] as [number, number, number] },
      { p: [-58, -26, -74] as [number, number, number], s: [12, 7, 8] as [number, number, number] },
    ],
    [],
  );

  return (
    <group>
      <mesh geometry={cliff} material={m.rock} receiveShadow castShadow={false} />
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          geometry={rocksGeo[i % rocksGeo.length]}
          material={m.rock}
          position={rock.p}
          rotation={[rock.r, rock.r * 1.7, rock.r * 0.6]}
          scale={rock.s}
          receiveShadow
        />
      ))}
      {stacks.map((stack, i) => (
        <mesh
          key={`s${i}`}
          geometry={rocksGeo[(i + 3) % rocksGeo.length]}
          material={m.rock}
          position={stack.p}
          scale={stack.s}
          rotation={[0.2 * i, i, 0.1]}
        />
      ))}
      <Sea sunDirection={SUN_DIRECTION} />
    </group>
  );
}


/* -------------------------------------------------------------------- sea */

const SEA_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/*
 * A distance-graded sea: dark, dense water close to the coast, dissolving into
 * the colour of the horizon band by aerial perspective, with a restrained sun
 * path on the surface. A flat dark plane read as a painted stripe; this reads
 * as depth.
 */
const SEA_FRAG = /* glsl */ `
  varying vec3 vWorld;
  uniform vec3 uNear;
  uniform vec3 uFar;
  uniform vec3 uSun;
  uniform vec3 uSunColor;
  void main() {
    vec3 view = cameraPosition - vWorld;
    float dist = length(view);
    vec3 V = normalize(view);
    float t = pow(clamp((dist - 55.0) / 420.0, 0.0, 1.0), 0.7);
    vec3 col = mix(uNear, uFar, t);
    vec3 N = vec3(0.0, 1.0, 0.0);
    vec3 H = normalize(normalize(uSun) + V);
    float spec = pow(max(dot(N, H), 0.0), 260.0);
    float sheen = pow(max(dot(N, H), 0.0), 18.0);
    col += uSunColor * (spec * 1.15 + sheen * 0.09) * (1.0 - t * 0.55);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function Sea({ sunDirection }: { sunDirection: Vec3 }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SEA_VERT,
        fragmentShader: SEA_FRAG,
        fog: false,
        uniforms: {
          uNear: { value: new THREE.Color("#08131a") },
          uFar: { value: new THREE.Color("#b3ac9c") },
          uSun: { value: new THREE.Vector3(...sunDirection) },
          uSunColor: { value: new THREE.Color("#ffd7a8") },
        },
      }),
    [sunDirection],
  );

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -27, -240]} material={material} frustumCulled={false}>
      <planeGeometry args={[1600, 1600]} />
    </mesh>
  );
}

/* --------------------------------------------------------------- vegetation */

function Tree({
  position,
  scale,
  seed,
  m,
  detail = 2,
}: {
  position: Vec3;
  scale: number;
  seed: number;
  m: SceneMaterials;
  detail?: number;
}) {
  const tree = useMemo(
    () => oliveTree(seed, 3.0 * scale, 1.3 * scale, detail),
    [seed, scale, detail],
  );
  return (
    <group position={position}>
      <mesh geometry={tree.branches} material={m.bark} castShadow receiveShadow />
      <mesh geometry={tree.canopy} material={m.foliage} castShadow receiveShadow />
    </group>
  );
}

function Shrubs({ m }: { m: SceneMaterials }) {
  const shrubs = useMemo(
    () => [
      { p: [-7.6, GY, 6.6] as Vec3, s: 1.0, seed: 3 },
      { p: [12.9, GY, 7.4] as Vec3, s: 1.2, seed: 8 },
      { p: [6.4, GY, -9.4] as Vec3, s: 0.9, seed: 12 },
      { p: [-5.6, GY, -8.4] as Vec3, s: 1.1, seed: 21 },
      { p: [17.8, GY, -3.4] as Vec3, s: 0.8, seed: 26 },
      { p: [-11.2, GY, -3.6] as Vec3, s: 1.3, seed: 31 },
    ],
    [],
  );

  const geometries = useMemo(
    () => shrubs.map((s) => shrubGeometry(s.seed, 0.72)),
    [shrubs],
  );

  return (
    <group>
      {shrubs.map((shrub, i) => (
        <mesh
          key={i}
          geometry={geometries[i]}
          material={m.foliageLight}
          position={[shrub.p[0], shrub.p[1] + 0.05, shrub.p[2]]}
          scale={shrub.s}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

/* -------------------------------------------------------------- contact AO */

function ContactShadow() {
  const texture = useMemo(() => createContactShadowTexture(), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[3.4, GY + 0.02, -0.8]}>
      <planeGeometry args={[27, 19]} />
      <meshBasicMaterial
        alphaMap={texture}
        transparent
        opacity={0.4}
        depthWrite={false}
        color={0x000000}
        fog
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ export */

export function SceneLandscape({
  m,
  sunDirection,
  quality,
}: {
  m: SceneMaterials;
  sunDirection: Vec3;
  quality: "high" | "medium" | "low";
}) {
  return (
    <group>
      <SkyDome sunDirection={sunDirection} />
      <Terrain m={m} />
      <Coast m={m} />
      <ContactShadow />
      <Selectable id="coast">
        <Tree position={[-9.6, GY - 0.1, 2.2]} scale={1.3} seed={41} m={m} detail={quality === "high" ? 3 : quality === "medium" ? 2 : 1} />
        <Tree position={[19.4, GY - 0.1, 7.4]} scale={1.1} seed={63} m={m} detail={1} />
        {quality !== "low" ? (
          <Tree position={[-14.6, GY - 0.2, -6.4]} scale={0.95} seed={77} m={m} detail={1} />
        ) : null}
        <mesh position={[3.4, GY - 0.35, -18]} rotation={[0.1, 0.6, 0.05]} material={m.rock} receiveShadow>
          <dodecahedronGeometry args={[2.6, 0]} />
        </mesh>
        <mesh position={[-6.2, GY - 0.42, -15.5]} rotation={[0.3, 0.2, 0.1]} material={m.rock} receiveShadow>
          <dodecahedronGeometry args={[1.7, 0]} />
        </mesh>
      </Selectable>
      <Shrubs m={m} />
    </group>
  );
}

export function useSunDirection(): Vec3 {
  return useMemo<Vec3>(() => {
    const v = new THREE.Vector3(-0.62, 0.3, -0.36).normalize();
    return [v.x, v.y, v.z];
  }, []);
}
