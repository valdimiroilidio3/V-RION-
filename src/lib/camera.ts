import type { ViewId } from "./store";

export interface CamPose {
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface ViewDef {
  id: ViewId;
  num: string;
  name: string;
  /** short label used in the view selector */
  short: string;
  pose: CamPose;
  minDistance: number;
  maxDistance: number;
  /** azimuth limits, radians, measured from +z */
  azimuth: [number, number];
  /** polar limits, radians */
  polar: [number, number];
  /** how far the orbit target may travel from the view anchor */
  targetRadius: number;
}

export const VIEWS: Record<ViewId, ViewDef> = {
  approach: {
    id: "approach",
    num: "01",
    name: "Aproximação",
    short: "Aproximação",
    pose: { pos: [18.6, 5.6, 21.0], target: [4.6, 1.55, -0.5], fov: 40 },
    minDistance: 14,
    maxDistance: 46,
    azimuth: [0.28, 1.18],
    polar: [0.55, 1.36],
    targetRadius: 7,
  },
  pool: {
    id: "pool",
    num: "02",
    name: "Espelho de água",
    short: "Piscina",
    pose: { pos: [0.9, 1.35, 10.2], target: [1.5, 1.15, 2.2], fov: 46 },
    minDistance: 3.2,
    maxDistance: 22,
    azimuth: [-0.42, 0.3],
    polar: [1.14, 1.53],
    targetRadius: 3.2,
  },
  terrace: {
    id: "terrace",
    num: "03",
    name: "Terraço",
    short: "Terraço",
    pose: { pos: [10.6, 2.35, 9.2], target: [5.2, 1.35, -0.6], fov: 44 },
    minDistance: 3.5,
    maxDistance: 24,
    azimuth: [0.2, 1.5],
    polar: [1.02, 1.47],
    targetRadius: 5,
  },
  interior: {
    id: "interior",
    num: "04",
    name: "Interior",
    short: "Interior",
    pose: { pos: [5.8, 1.68, 1.2], target: [1.6, 1.3, -4.4], fov: 54 },
    minDistance: 1.4,
    maxDistance: 9,
    azimuth: [0.12, 1.3],
    polar: [1.18, 1.52],
    targetRadius: 2.4,
  },
  aerial: {
    id: "aerial",
    num: "05",
    name: "Implantação",
    short: "Aérea",
    pose: { pos: [23.0, 17.5, 27.5], target: [4.0, 1.1, -0.6], fov: 34 },
    minDistance: 20,
    maxDistance: 58,
    azimuth: [0.24, 0.98],
    polar: [0.2, 0.95],
    targetRadius: 8,
  },
};

export const VIEW_ORDER: ViewId[] = [
  "approach",
  "pool",
  "terrace",
  "interior",
  "aerial",
];

export interface NarrativeKey {
  at: number;
  pose: CamPose;
}

/**
 * Scroll-driven camera narrative. Interpolated with a smootherstep so the
 * camera always eases in and out instead of running linearly.
 */
export const NARRATIVE: NarrativeKey[] = [
  {
    at: 0,
    pose: { pos: [18.6, 5.6, 21.0], target: [4.6, 1.55, -0.5], fov: 40 },
  },
  {
    at: 0.2,
    pose: { pos: [-7.6, 5.0, 16.8], target: [4.6, 1.9, 0.4], fov: 40 },
  },
  {
    at: 0.4,
    pose: { pos: [2.1, 1.5, 10.9], target: [2.4, 1.0, 2.3], fov: 44 },
  },
  {
    at: 0.6,
    pose: { pos: [8.7, 2.15, 7.4], target: [9.5, 1.55, -0.9], fov: 34 },
  },
  {
    at: 0.8,
    pose: { pos: [6.2, 2.35, 2.7], target: [1.9, 1.5, -3.4], fov: 49 },
  },
  {
    at: 1,
    pose: { pos: [17.5, 14.0, 21.0], target: [3.8, 0.8, -1.4], fov: 37 },
  },
];

const smoother = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export function poseAt(progress: number): CamPose {
  const p = Math.min(1, Math.max(0, progress));
  for (let i = 0; i < NARRATIVE.length - 1; i++) {
    const a = NARRATIVE[i];
    const b = NARRATIVE[i + 1];
    if (p <= b.at || i === NARRATIVE.length - 2) {
      const span = Math.max(1e-5, b.at - a.at);
      const t = smoother((p - a.at) / span);
      return {
        pos: lerp3(a.pose.pos, b.pose.pos, t),
        target: lerp3(a.pose.target, b.pose.target, t),
        fov: lerp(a.pose.fov, b.pose.fov, t),
      };
    }
  }
  return NARRATIVE[NARRATIVE.length - 1].pose;
}

export function viewPose(id: ViewId): CamPose {
  return VIEWS[id].pose;
}

export const INTRO_POSE: CamPose = {
  pos: [29, 15, 33],
  target: [3.0, 2.2, -1.4],
  fov: 30,
};
