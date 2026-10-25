import * as THREE from "three";
import type { DeviceProfile } from "./quality";
import {
  concreteMaterialMaps,
  fabricMaps,
  gravelMaps,
  createGrassTuftTexture,
  travertineMaps,
  woodMaterialMaps,
} from "./textures";

/**
 * Shared clipping plane used by the cinematic "materialisation" phase: the
 * building rises out of the ground because the materials are clipped by a
 * moving world-space plane, not because a still image cross-fades.
 */
export const REVEAL_PLANE = new THREE.Plane(new THREE.Vector3(0, -1, 0), 12);
export const REVEAL_PLANES = [REVEAL_PLANE];

function std(params: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ envMapIntensity: 0.85, ...params });
}

function clipped<T extends THREE.Material>(material: T): T {
  material.clippingPlanes = REVEAL_PLANES;
  material.clipShadows = true;
  material.needsUpdate = true;
  return material;
}

export interface SceneMaterials {
  concrete: THREE.MeshStandardMaterial;
  concreteSmooth: THREE.MeshStandardMaterial;
  concreteDark: THREE.MeshStandardMaterial;
  travertine: THREE.MeshStandardMaterial;
  terraceStone: THREE.MeshStandardMaterial;
  plaster: THREE.MeshStandardMaterial;
  floorWood: THREE.MeshStandardMaterial;
  oak: THREE.MeshStandardMaterial;
  walnut: THREE.MeshStandardMaterial;
  bronze: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  blackSteel: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  glassRail: THREE.MeshPhysicalMaterial;
  water: THREE.MeshPhysicalMaterial;
  basin: THREE.MeshStandardMaterial;
  pebble: THREE.MeshStandardMaterial;
  fabric: THREE.MeshStandardMaterial;
  fabricDark: THREE.MeshStandardMaterial;
  leather: THREE.MeshStandardMaterial;
  linen: THREE.MeshStandardMaterial;
  rug: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  foliageLight: THREE.MeshStandardMaterial;
  tuft: THREE.MeshStandardMaterial;
  bark: THREE.MeshStandardMaterial;
  terracotta: THREE.MeshStandardMaterial;
  gravel: THREE.MeshStandardMaterial;
  ballast: THREE.MeshStandardMaterial;
  soil: THREE.MeshStandardMaterial;
  sea: THREE.MeshStandardMaterial;
  rock: THREE.MeshStandardMaterial;
  glow: THREE.MeshStandardMaterial;
  lamp: THREE.MeshStandardMaterial;
  paper: THREE.MeshStandardMaterial;
  char: THREE.MeshStandardMaterial;
  terracottaDark: THREE.MeshStandardMaterial;
  all: THREE.Material[];
}

export async function createMaterials(
  profile: DeviceProfile,
  anisotropy: number,
  onProgress?: (value: number) => void,
): Promise<SceneMaterials> {
  const size = profile.quality === "high" ? 1024 : profile.quality === "medium" ? 512 : 256;
  const small = Math.max(128, size / 2);
  const tick = async (v: number) => {
    onProgress?.(v);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  };

  const crowd = profile.quality === "high";

  const concrete = concreteMaterialMaps(size, [2.2, 1.4], anisotropy);
  const concreteWall = concreteMaterialMaps(size, [3.4, 1.6], anisotropy);
  const concreteFloor = concreteMaterialMaps(size, [7, 5], anisotropy);
  await tick(0.18);

  const travertine = travertineMaps(size, [2, 1], anisotropy);
  const terraceStone = travertineMaps(size, [9, 3.4], anisotropy);
  await tick(0.3);

  const floor = woodMaterialMaps(size, [4.5, 4.5], anisotropy, "floor");
  const oak = woodMaterialMaps(size, [1, 1], anisotropy, "oak");
  await tick(0.44);

  const walnut = woodMaterialMaps(small, [1, 1], anisotropy, "walnut");
  const gravel = gravelMaps(size, [64, 64], anisotropy);
  const fabric = fabricMaps(small, [3, 3], anisotropy, "sand");
  const fabricDark = fabricMaps(small, [2, 2], anisotropy, "charcoal");
  await tick(0.62);

  const mat = {
    concrete: clipped(
      std({
        map: concrete.map,
        bumpMap: concrete.bumpMap,
        bumpScale: 1.6,
        roughnessMap: concrete.roughnessMap,
        color: 0xb7b5ae,
        roughness: 0.93,
        metalness: 0,
      }),
    ),
    concreteSmooth: clipped(
      std({
        map: concreteWall.map,
        bumpMap: concreteWall.bumpMap,
        bumpScale: 1.3,
        roughnessMap: concreteWall.roughnessMap,
        color: 0xc2c0b8,
        roughness: 0.86,
      }),
    ),
    concreteDark: clipped(
      std({
        map: concreteFloor.map,
        bumpMap: concreteFloor.bumpMap,
        bumpScale: 0.4,
        color: 0xb9b6ad,
        roughness: 0.9,
      }),
    ),
    travertine: clipped(
      std({
        map: travertine.map,
        bumpMap: travertine.bumpMap,
        bumpScale: 0.35,
        color: 0xf1e9d8,
        roughness: 0.55,
      }),
    ),
    terraceStone: clipped(
      std({
        map: terraceStone.map,
        bumpMap: terraceStone.bumpMap,
        bumpScale: 0.3,
        color: 0xd3ccbd,
        roughness: 0.66,
      }),
    ),
    plaster: clipped(std({ color: 0xdedacf, roughness: 0.96, envMapIntensity: 0.5 })),
    floorWood: clipped(
      std({
        map: floor.map,
        roughnessMap: floor.roughnessMap,
        color: 0xd9cbb4,
        roughness: 0.58,
        metalness: 0.02,
      }),
    ),
    oak: clipped(
      std({
        map: oak.map,
        roughnessMap: oak.roughnessMap,
        color: 0xd8c6aa,
        roughness: 0.66,
      }),
    ),
    walnut: clipped(
      std({
        map: walnut.map,
        color: 0x9c8067,
        roughness: 0.55,
      }),
    ),
    bronze: clipped(
      std({ color: 0x4a3b2b, metalness: 0.82, roughness: 0.34, envMapIntensity: 1.15 }),
    ),
    steel: clipped(
      std({ color: 0x8a8d8c, metalness: 0.92, roughness: 0.32, envMapIntensity: 1.1 }),
    ),
    blackSteel: clipped(
      std({ color: 0x24262a, metalness: 0.78, roughness: 0.42, envMapIntensity: 0.9 }),
    ),
    brass: clipped(
      std({ color: 0x9a7c4d, metalness: 0.95, roughness: 0.28, envMapIntensity: 1.2 }),
    ),
    glass: clipped(
      new THREE.MeshPhysicalMaterial({
        color: 0xdfeaea,
        metalness: 0,
        roughness: 0.035,
        transmission: 0,
        transparent: true,
        opacity: 0.085,
        envMapIntensity: 1.55,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        side: THREE.DoubleSide,
        depthWrite: false,
        ior: 1.52,
        reflectivity: 0.55,
      }),
    ),
    glassRail: clipped(
      new THREE.MeshPhysicalMaterial({
        color: 0xc7d4d2,
        metalness: 0,
        roughness: 0.02,
        transparent: true,
        opacity: 0.2,
        envMapIntensity: 2.2,
        clearcoat: 1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    ),
    water: clipped(
      new THREE.MeshPhysicalMaterial({
        color: 0x0d191c,
        metalness: 0.62,
        roughness: 0.02,
        transparent: true,
        opacity: 0.96,
        envMapIntensity: 3.6,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    ),
    // pale stone lining: what you actually see through the water
    basin: clipped(std({ color: 0x93a49d, roughness: 0.62, metalness: 0.03 })),
    pebble: clipped(std({ color: 0x6c6b63, roughness: 0.85 })),
    fabric: clipped(
      std({ map: fabric.map, color: 0xe4dccd, roughness: 0.96, envMapIntensity: 0.6 }),
    ),
    fabricDark: clipped(
      std({ map: fabricDark.map, color: 0x9a9992, roughness: 0.96, envMapIntensity: 0.55 }),
    ),
    leather: clipped(std({ color: 0x453328, roughness: 0.62, metalness: 0.02 })),
    linen: clipped(std({ color: 0xd9d4c8, roughness: 0.95, envMapIntensity: 0.5 })),
    rug: clipped(std({ color: 0x8d897d, roughness: 1, envMapIntensity: 0.4 })),
    foliage: clipped(
      std({ color: 0x4e5a3a, roughness: 0.86, envMapIntensity: 0.6, side: THREE.DoubleSide }),
    ),
    foliageLight: clipped(
      std({ color: 0x6f7a4c, roughness: 0.88, envMapIntensity: 0.6, side: THREE.DoubleSide }),
    ),
    tuft: clipped(
      std({
        map: createGrassTuftTexture(),
        alphaMap: createGrassTuftTexture(),
        transparent: false,
        alphaTest: 0.32,
        color: 0xa8a176,
        roughness: 1,
        envMapIntensity: 0.5,
        side: THREE.DoubleSide,
      }),
    ),
    bark: clipped(std({ color: 0x3f3830, roughness: 0.96 })),
    terracotta: clipped(std({ color: 0x8d6448, roughness: 0.82 })),
    terracottaDark: clipped(std({ color: 0x5d4331, roughness: 0.86 })),
    gravel: std({
      map: gravel.map,
      bumpMap: gravel.bumpMap,
      bumpScale: 1.3,
      color: 0xffffff,
      vertexColors: true,
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0.7,
    }),
    ballast: clipped(
      std({
        map: gravel.map,
        bumpMap: gravel.bumpMap,
        bumpScale: 1,
        color: 0x8d8b85,
        roughness: 1,
        envMapIntensity: 0.65,
      }),
    ),
    soil: std({ color: 0x4b463b, roughness: 1, envMapIntensity: 0.4 }),
    sea: new THREE.MeshStandardMaterial({
      color: 0x0d1a20,
      roughness: 0.1,
      metalness: 0.55,
      envMapIntensity: 1.9,
      fog: false,
    }),
    rock: std({ color: 0x555049, roughness: 0.94, envMapIntensity: 0.5 }),
    glow: clipped(
      std({
        color: 0xffd6a4,
        emissive: new THREE.Color(0xffc98a),
        emissiveIntensity: 0.85,
        roughness: 1,
        metalness: 0,
      }),
    ),
    lamp: clipped(
      std({
        color: 0xf2ece1,
        emissive: new THREE.Color(0xffd8b0),
        emissiveIntensity: 0.4,
        roughness: 0.6,
      }),
    ),
    paper: clipped(std({ color: 0xe6e2d9, roughness: 0.9 })),
    char: clipped(std({ color: 0x141414, roughness: 1 })),
    all: [] as THREE.Material[],
  };

  const collected: THREE.Material[] = [];
  for (const value of Object.values(mat)) {
    if (value instanceof THREE.Material) collected.push(value);
  }
  mat.all = collected;

  if (!crowd) {
    // low tier: drop the most expensive unused features, keep the look
    mat.glass.opacity = 0.18;
    mat.water.envMapIntensity = 1.4;
  }

  onProgress?.(0.7);
  return mat;
}

/**
 * Materials are disposed on unmount; canvas textures stay in their module
 * cache (a few MB) so a StrictMode remount never resurrects a disposed map.
 */
export function disposeMaterials(materials: SceneMaterials) {
  for (const material of materials.all) material.dispose();
}
