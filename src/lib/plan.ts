/**
 * Site plan (metres). Shared by the geometry, the camera limits and the
 * collision volumes, so the architecture, the art direction and the
 * interaction can never drift apart.
 *
 *              z-  (coast, north)
 *        ┌──────────────────────────────┐
 *        │  house: interior 14.2 × 8.4   │
 *        │  roof y 4.36                  │
 *        └──────────── glass wall z=+3.4 ┘
 *              terrace + reflecting pool (z 3.9 → 7.1)
 *              z+ (approach, south)
 */

export const ARCH = {
  /** finished floor level (also terrace level) */
  floorY: 0.06,
  /** top of the structural slab / roof */
  roofY: 4.36,
  /** underside of the roof slab (interior clear height 3.9 m) */
  ceilingY: 3.96,
  roofThickness: 0.4,
  /** south glass plane */
  glassZ: 3.4,
  /** interior north face of glass */
  backZ: -5.0,
  /** inner west face */
  westX: -2.5,
  /** inner east face */
  eastX: 10.0,
  /** north outer wall face */
  northOuterZ: -6.3,
  /** west outer wall face */
  westOuterX: -3.4,
  /** east outer wall face (main volume) */
  eastOuterX: 10.2,
  plinthTop: 0.06,
  /** site grade */
  gradeY: -0.94,
  pool: { x0: -1.7, x1: 1.7, z0: 3.95, z1: 7.05, waterY: 0.02, depth: 1.5 },
  terrace: { x0: -4.4, x1: 10.4, z0: 3.4, z1: 7.6 },
  pavilion: { x0: 10.2, x1: 16.4, z0: -6.3, z1: -0.4, roofY: 3.06 },
  courtyard: { x0: -4.4, x1: -1.7, z0: 3.4, z1: 7.6 },
} as const;

export interface AABB {
  min: [number, number, number];
  max: [number, number, number];
}

/** Solid volumes used to keep the camera out of the walls. */
export const SOLIDS: AABB[] = [
  // north wall of the main volume
  { min: [-3.4, -0.9, -6.3], max: [10.2, ARCH.roofY, ARCH.backZ] },
  // west wall of the main volume
  { min: [-3.4, -0.9, -6.3], max: [ARCH.westX, ARCH.roofY, ARCH.glassZ] },
  // roof slab
  { min: [-3.4, ARCH.ceilingY, -6.3], max: [10.2, ARCH.roofY, ARCH.glassZ] },
  // pavilion west / north walls
  { min: [10.2, ARCH.floorY, -6.3], max: [10.5, ARCH.pavilion.roofY, -0.4] },
  { min: [10.2, ARCH.floorY, -6.3], max: [16.4, ARCH.pavilion.roofY, -6.0] },
  // pavilion roof
  { min: [10.1, 2.76, -6.4], max: [16.5, ARCH.pavilion.roofY, -0.25] },
  // travertine volume on the east terrace (outdoor shower)
  { min: [10.5, ARCH.floorY, 2.0], max: [11.7, 2.4, 3.3] },
];

/** Outer bounds so the visitor can never lose the scene. */
export const WORLD_BOUNDS = {
  minX: -42,
  maxX: 46,
  minZ: -46,
  maxZ: 48,
  minY: 0.35,
  maxY: 30,
};

/** Terrain displacement shared by the landscape mesh and everything placed on it. */
export function terrainHeight(x: number, z: number): number {
  const dx = x - 3;
  const dz = z + 1;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const t = smoothstep(dist, 18, 48);
  const noise =
    Math.sin(x * 0.075) * Math.cos(z * 0.11) * 0.62 +
    Math.sin(x * 0.19 + 1.7) * Math.cos(z * 0.23 - 0.6) * 0.26 +
    Math.sin(x * 0.42 - 0.4) * Math.sin(z * 0.37) * 0.12;
  return ARCH.gradeY + noise * 1.15 * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function isInsideSolid(
  x: number,
  y: number,
  z: number,
  pad = 0.28,
): boolean {
  for (const box of SOLIDS) {
    if (
      x > box.min[0] - pad &&
      x < box.max[0] + pad &&
      y > box.min[1] - pad &&
      y < box.max[1] + pad &&
      z > box.min[2] - pad &&
      z < box.max[2] + pad
    ) {
      return true;
    }
  }
  return false;
}
