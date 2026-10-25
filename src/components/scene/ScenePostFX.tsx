"use client";

import { useMemo } from "react";
import {
  BrightnessContrast,
  EffectComposer,
  FXAA,
  HueSaturation,
  Noise,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { DeviceProfile } from "@/lib/quality";

type FxMode = "all" | "none";

function readMode(): FxMode {
  if (typeof window === "undefined") return "all";
  return new URLSearchParams(window.location.search).get("fx") === "none" ? "none" : "all";
}

/**
 * The film finish: anti-aliased edges, a slight desaturation of the shadows, a
 * touch of contrast and a vignette. Nothing else.
 *
 * Three expensive effects were implemented and then removed after measurement:
 *  - MSAA and N8AO both break the framebuffer on large ANGLE/SwiftShader
 *    buffers (white or black frames) and the AO additionally produced a noisy
 *    halo on thin glazing;
 *  - Bloom turned every small practical into a glowing disc, which is exactly
 *    the artificial look this project avoids. Highlights are handled by real
 *    emissive materials and by the PMREM environment instead.
 * Depth of field is also out on purpose: an orbit control changes the focal
 * distance constantly, and a permanently blurred frame is not a photograph.
 */
export function ScenePostFX({ profile }: { profile: DeviceProfile }) {
  const tier = profile.quality;
  const mode = useMemo(readMode, []);
  const aa = useMemo(
    () =>
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("aa")) ||
      "smaa",
    [],
  );

  const grade = useMemo(() => {
    if (tier === "high") return { contrast: 0.06, saturation: 0.06, vignette: 0.6 };
    if (tier === "medium") return { contrast: 0.05, saturation: 0.05, vignette: 0.56 };
    return { contrast: 0.035, saturation: 0.04, vignette: 0.48 };
  }, [tier]);

  if (mode === "none") return null;

  return (
    <EffectComposer multisampling={0} resolutionScale={1}>
      {aa === "smaa" ? <SMAA /> : aa === "fxaa" ? <FXAA /> : null}
      <HueSaturation saturation={grade.saturation} hue={-0.008} />
      <BrightnessContrast contrast={grade.contrast} brightness={-0.006} />
      <Vignette eskil={false} offset={0.22} darkness={grade.vignette} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.026} />
    </EffectComposer>
  );
}
