export type Quality = "high" | "medium" | "low";

export interface DeviceProfile {
  quality: Quality;
  mobile: boolean;
  coarsePointer: boolean;
  reducedMotion: boolean;
  dpr: [number, number];
  shadows: boolean;
  shadowMapSize: number;
  maxTexture: number;
  envResolution: number;
  maxDpr: number;
}

function detectMaxTexture(): number {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return 0;
    return gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  } catch {
    return 0;
  }
}

/** QA / presentation switch: `?instant=1` skips the cinematic build-up. */
export function prefersInstant(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("instant") === "1";
}

/**
 * Coarse but honest capability profile. We never claim a frame-rate:
 * we scale resolution, shadow cost and texture density to the device.
 */
export function detectProfile(): DeviceProfile {
  if (typeof window === "undefined") {
    return {
      quality: "medium",
      mobile: false,
      coarsePointer: false,
      reducedMotion: false,
      dpr: [1, 1.6],
      shadows: true,
      shadowMapSize: 1024,
      maxTexture: 2048,
      envResolution: 256,
      maxDpr: 1.6,
    };
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const mobile =
    coarsePointer ||
    /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent) ||
    window.innerWidth < 820;
  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches || prefersInstant();
  const maxTexture = detectMaxTexture();

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 4;

  let quality: Quality = "high";

  // explicit override for QA and low-power devices (?q=low|medium|high)
  const override = new URLSearchParams(window.location.search).get("q");
  if (override === "low" || override === "medium" || override === "high") {
    const config = {
      low: { dpr: [0.75, 1] as [number, number], shadows: false, shadowMapSize: 512, envResolution: 128, maxDpr: 1 },
      medium: { dpr: [0.9, 1.5] as [number, number], shadows: true, shadowMapSize: 1024, envResolution: 256, maxDpr: 1.5 },
      high: { dpr: [1, 2] as [number, number], shadows: true, shadowMapSize: 2048, envResolution: 512, maxDpr: 2 },
    }[override];
    return {
      quality: override,
      mobile,
      coarsePointer,
      reducedMotion,
      maxTexture: maxTexture || 2048,
      ...config,
    };
  }
  if (mobile) quality = "medium";
  if (mobile && (cores <= 4 || memory <= 4 || maxTexture < 4096)) quality = "low";
  if (!mobile && (cores <= 4 || memory <= 4)) quality = "medium";
  if (maxTexture > 0 && maxTexture < 4096) quality = "low";

  const config: Record<Quality, Omit<DeviceProfile, "quality" | "mobile" | "coarsePointer" | "reducedMotion" | "maxTexture">> = {
    high: {
      dpr: [1, Math.min(window.devicePixelRatio || 1, 2)],
      shadows: true,
      shadowMapSize: 2048,
      envResolution: 512,
      maxDpr: 2,
    },
    medium: {
      dpr: [0.9, Math.min(window.devicePixelRatio || 1, 1.5)],
      shadows: true,
      shadowMapSize: 1024,
      envResolution: 256,
      maxDpr: 1.5,
    },
    low: {
      dpr: [0.75, 1],
      shadows: false,
      shadowMapSize: 512,
      envResolution: 128,
      maxDpr: 1,
    },
  };

  return {
    quality,
    mobile,
    coarsePointer,
    reducedMotion,
    maxTexture: maxTexture || 2048,
    ...config[quality],
  };
}
