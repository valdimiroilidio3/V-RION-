import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type Vec3 = [number, number, number];

export interface BoxPart {
  s: Vec3;
  p: Vec3;
  r?: Vec3;
}

/** Merge many boxes into a single draw call (walls, slabs, joinery). */
export function boxGeometry(parts: BoxPart[]): THREE.BufferGeometry {
  const geos = parts.map(({ s, p, r }) => {
    const g = new THREE.BoxGeometry(s[0], s[1], s[2]);
    if (r) {
      if (r[0]) g.rotateX(r[0]);
      if (r[1]) g.rotateY(r[1]);
      if (r[2]) g.rotateZ(r[2]);
    }
    g.translate(p[0], p[1], p[2]);
    return g;
  });
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  if (!merged) throw new Error("Falha ao combinar geometria");
  merged.computeBoundingSphere();
  return merged;
}

/**
 * Re-project UVs from world space, choosing the projection plane per face from
 * its dominant normal. Merged box sets otherwise inherit 0..1 UVs per box, so
 * a 6 m slab and a 12 cm coping ending up with wildly different stone scale —
 * which is exactly how procedural paving betrays itself. With world UVs one
 * texture unit always equals `unit` metres.
 */
export function applyWorldUV(geometry: THREE.BufferGeometry, unit = 2.4) {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  let uv = geometry.getAttribute("uv") as THREE.BufferAttribute | undefined;
  if (!uv) {
    uv = new THREE.BufferAttribute(new Float32Array(position.count * 2), 2);
    geometry.setAttribute("uv", uv);
  }
  for (let i = 0; i < position.count; i++) {
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const nz = Math.abs(normal.getZ(i));
    const x = position.getX(i) / unit;
    const y = position.getY(i) / unit;
    const z = position.getZ(i) / unit;
    if (ny >= nx && ny >= nz) uv.setXY(i, x, z);
    else if (nx >= nz) uv.setXY(i, z, y);
    else uv.setXY(i, x, y);
  }
  uv.needsUpdate = true;
  return geometry;
}

export function mergeAll(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  if (!merged) throw new Error("Falha ao combinar geometria");
  merged.computeBoundingSphere();
  return merged;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Organic canopy built from displaced icospheres with per-vertex colour.
 * Cheap (one draw call per tree) and far more convincing than a sphere.
 */
export function foliageGeometry(
  blobs: { p: Vec3; r: number }[],
  seed = 1,
  palette: [string, string] = ["#3c4a2c", "#6d7b48"],
  detail = 2,
): THREE.BufferGeometry {
  const random = mulberry32(seed);
  const geos = blobs.map(({ p, r }) => {
    const g = new THREE.IcosahedronGeometry(r, detail);
    const positions = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const scale = 0.82 + random() * 0.36;
      positions.setXYZ(i, x * scale, y * scale * 0.82, z * scale);
    }
    g.translate(p[0], p[1], p[2]);
    g.computeVertexNormals();
    return g;
  });

  const merged = mergeAll(geos);
  const position = merged.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const dark = new THREE.Color(palette[0]);
  const light = new THREE.Color(palette[1]);
  const c = new THREE.Color();
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < position.count; i++) {
    minY = Math.min(minY, position.getY(i));
    maxY = Math.max(maxY, position.getY(i));
  }
  for (let i = 0; i < position.count; i++) {
    const t = (position.getY(i) - minY) / Math.max(0.001, maxY - minY);
    const noise = random();
    c.copy(dark).lerp(light, Math.min(1, t * 0.8 + noise * 0.35));
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  merged.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return merged;
}

export function branchGeometry(branches: { from: Vec3; to: Vec3; r0: number; r1: number }[]) {
  const geos = branches.map(({ from, to, r0, r1 }) => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, 6, 1, true);
    g.translate(0, len / 2, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    g.applyQuaternion(quat);
    g.translate(start.x, start.y, start.z);
    return g;
  });
  return mergeAll(geos);
}

export function oliveTree(seed: number, height = 3.2, spread = 1.5, detail = 2) {
  const random = mulberry32(seed);
  const trunkH = height * 0.42;
  const branches: { from: Vec3; to: Vec3; r0: number; r1: number }[] = [
    { from: [0, 0, 0], to: [0.08, trunkH, 0.04], r0: 0.17, r1: 0.12 },
  ];
  const blobs: { p: Vec3; r: number }[] = [];
  const limbs = 5;
  for (let i = 0; i < limbs; i++) {
    const angle = (i / limbs) * Math.PI * 2 + random() * 0.7;
    const reach = spread * (0.5 + random() * 0.6);
    const tip: Vec3 = [
      Math.cos(angle) * reach,
      trunkH + height * (0.26 + random() * 0.24),
      Math.sin(angle) * reach,
    ];
    branches.push({
      from: [0.08, trunkH - 0.12, 0.04],
      to: tip,
      r0: 0.09,
      r1: 0.035,
    });
    const clusterR = height * (0.19 + random() * 0.08);
    blobs.push({ p: [tip[0], tip[1] + clusterR * 0.4, tip[2]], r: clusterR });
    for (let j = 0; j < 3; j++) {
      blobs.push({
        p: [
          tip[0] + (random() - 0.5) * clusterR * 1.5,
          tip[1] + clusterR * (0.3 + random() * 0.7),
          tip[2] + (random() - 0.5) * clusterR * 1.5,
        ],
        r: clusterR * (0.55 + random() * 0.35),
      });
    }
  }
  blobs.push({ p: [0, trunkH + height * 0.42, 0], r: height * 0.24 });

  return {
    branches: branchGeometry(branches),
    canopy: foliageGeometry(blobs, seed, ["#39422b", "#7c8159"], detail),
  };
}

/**
 * A rock, not a die: an icosahedron with per-vertex displacement along its own
 * radius, then flat-shaded so the facets catch the sun as planes. Used for the
 * scattered boulders and the sea stacks.
 */
export function rockGeometry(seed: number, detail = 1, roughness = 0.24) {
  const geometry = new THREE.IcosahedronGeometry(1, detail);
  const random = mulberry32(seed);
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const cache = new Map<string, number>();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const key = `${v.x.toFixed(3)}:${v.y.toFixed(3)}:${v.z.toFixed(3)}`;
    let k = cache.get(key);
    if (k === undefined) {
      k = 1 + (random() - 0.5) * roughness * 2;
      cache.set(key, k);
    }
    v.multiplyScalar(k);
    // squash slightly so boulders sit rather than float
    v.y *= 0.82;
    position.setXYZ(i, v.x, v.y, v.z);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export function shrubGeometry(seed: number, size = 0.7, detail = 1) {
  const random = mulberry32(seed);
  const blobs: { p: Vec3; r: number }[] = [];
  for (let i = 0; i < 7; i++) {
    blobs.push({
      p: [
        (random() - 0.5) * size * 1.4,
        size * (0.35 + random() * 0.55),
        (random() - 0.5) * size * 1.4,
      ],
      r: size * (0.32 + random() * 0.26),
    });
  }
  return foliageGeometry(blobs, seed + 5, ["#414a30", "#7d8551"], detail);
}
