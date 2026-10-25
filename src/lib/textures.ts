import * as THREE from "three";

/**
 * All surface detail is authored procedurally on the client (canvas → texture).
 * No external asset CDN, no failed requests, no licensing ambiguity, and the
 * textures are generated at a resolution the device can actually afford.
 */

type Ctx = CanvasRenderingContext2D;
type Vec2 = [number, number];

const cache = new Map<string, THREE.Texture>();

function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeCanvas(size: number): { canvas: HTMLCanvasElement; ctx: Ctx } {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas 2D indisponível");
  return { canvas, ctx };
}

function toTexture(
  canvas: HTMLCanvasElement,
  opts: { srgb?: boolean; repeat?: Vec2; anisotropy?: number } = {},
): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const repeat = opts.repeat ?? [1, 1];
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = opts.anisotropy ?? 4;
  texture.colorSpace = opts.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function softBlobs(
  ctx: Ctx,
  size: number,
  count: number,
  random: () => number,
  colors: string[],
  radius: [number, number],
  alpha: [number, number],
) {
  for (let i = 0; i < count; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = radius[0] + random() * (radius[1] - radius[0]);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const color = colors[Math.floor(random() * colors.length)];
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = alpha[0] + random() * (alpha[1] - alpha[0]);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function grain(ctx: Ctx, size: number, count: number, random: () => number, maxAlpha = 0.1) {
  for (let i = 0; i < count; i++) {
    const x = random() * size;
    const y = random() * size;
    const a = random() * maxAlpha;
    const v = random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${a})`;
    ctx.fillRect(x, y, 1 + random() * 1.4, 1 + random() * 1.4);
  }
}

/* ------------------------------------------------------------------ concrete */

function concreteAlbedo(size: number, seed: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const random = seeded(seed);
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#b5b3ac");
  grad.addColorStop(0.55, "#adaaa3");
  grad.addColorStop(1, "#b8b5ae");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  softBlobs(ctx, size, 34, random, ["#8d8a80", "#cbc6b9", "#a09b90"], [size * 0.07, size * 0.34], [0.035, 0.11]);
  softBlobs(ctx, size, 22, random, ["#d2cdc0", "#9a958a"], [size * 0.03, size * 0.14], [0.04, 0.09]);

  // board-formed horizontal joints
  const boards = 6;
  for (let i = 1; i < boards; i++) {
    const y = (i / boards) * size + (random() - 0.5) * 3;
    ctx.fillStyle = "rgba(46,43,38,0.46)";
    ctx.fillRect(0, y, size, Math.max(1.5, size / 480));
    ctx.fillStyle = "rgba(248,245,236,0.2)";
    ctx.fillRect(0, y - Math.max(1, size / 700), size, Math.max(1, size / 700));
  }

  // tie-rod holes
  const cols = 4;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < boards; r++) {
      const x = ((c + 0.5) / cols) * size;
      const y = ((r + 0.5) / boards) * size;
      const rad = size * 0.0045;
      ctx.fillStyle = "rgba(58,55,49,0.62)";
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(238,235,225,0.22)";
      ctx.lineWidth = Math.max(1, size / 700);
      ctx.beginPath();
      ctx.arc(x, y, rad * 1.5, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
  }

  // fine aggregate
  grain(ctx, size, Math.floor(size * 1.8), random, 0.055);
  // hairline cracks
  ctx.strokeStyle = "rgba(70,67,60,0.16)";
  for (let i = 0; i < 5; i++) {
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    let x = random() * size;
    let y = random() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 12; s++) {
      x += (random() - 0.5) * size * 0.06;
      y += random() * size * 0.03;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return canvas;
}

function concreteHeight(size: number, seed: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const random = seeded(seed);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  softBlobs(ctx, size, 60, random, ["#6f6f6f", "#8e8e8e"], [size * 0.03, size * 0.26], [0.1, 0.3]);
  const boards = 6;
  for (let i = 1; i < boards; i++) {
    const y = (i / boards) * size;
    ctx.fillStyle = "rgba(30,30,30,0.75)";
    ctx.fillRect(0, y, size, Math.max(2, size / 320));
  }
  grain(ctx, size, Math.floor(size * 1.2), random, 0.1);
  return canvas;
}

export function concreteMaterialMaps(
  size: number,
  repeat: Vec2,
  anisotropy: number,
): { map: THREE.Texture; bumpMap: THREE.Texture; roughnessMap: THREE.Texture } {
  const key = `concrete-${size}-${repeat.join("x")}`;
  const height = concreteHeight(size, 71);
  const bump = cachedTexture(`${key}-b`, () => toTexture(height, { repeat, anisotropy }), height);
  const rough = cachedTexture(`${key}-r`, () => toTexture(height, { repeat, anisotropy }), height);
  const map = cachedTexture(
    `${key}-a`,
    () => {
      const tex = toTexture(concreteAlbedo(size, 42), { srgb: true, repeat, anisotropy });
      return tex;
    },
    null,
  );
  return { map, bumpMap: bump, roughnessMap: rough };
}

function cachedTexture(
  key: string,
  factory: () => THREE.Texture,
  _canvas: HTMLCanvasElement | null,
): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  const tex = factory();
  cache.set(key, tex);
  return tex;
}

/* --------------------------------------------------------------------- wood */

function woodCanvas(size: number, seed: number, tone: "floor" | "oak" | "walnut"): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const random = seeded(seed);
  const base =
    tone === "floor"
      ? { h: 33, s: 30, l: 43 }
      : tone === "oak"
        ? { h: 36, s: 26, l: 36 }
        : { h: 24, s: 22, l: 24 };

  ctx.fillStyle = `hsl(${base.h} ${base.s}% ${base.l}%)`;
  ctx.fillRect(0, 0, size, size);

  const planks = 7;
  const ph = size / planks;
  for (let p = 0; p < planks; p++) {
    const offset = random() * size;
    const jitter = (random() - 0.5) * 7;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, p * ph, size, ph);
    ctx.clip();
    ctx.fillStyle = `hsl(${base.h + (random() - 0.5) * 6} ${base.s + (random() - 0.5) * 8}% ${base.l + jitter}%)`;
    ctx.fillRect(0, p * ph, size, ph);

    // grain
    for (let g = 0; g < 34; g++) {
      const y = p * ph + random() * ph;
      const amp = (2 + random() * 7) * (size / 1024);
      ctx.strokeStyle =
        random() > 0.45
          ? `rgba(30,18,8,${0.05 + random() * 0.12})`
          : `rgba(250,232,205,${0.03 + random() * 0.07})`;
      ctx.lineWidth = 0.6 + random() * 1.7;
      ctx.beginPath();
      ctx.moveTo(-20, y);
      for (let x = 0; x <= size + 20; x += size / 8) {
        ctx.quadraticCurveTo(
          x + offset * 0.02,
          y + Math.sin((x + offset) * 0.02) * amp,
          x + size / 8,
          y + Math.sin((x + offset) * 0.014 + 1.3) * amp * 0.7,
        );
      }
      ctx.stroke();
    }

    // occasional knot
    if (random() > 0.62) {
      const kx = random() * size;
      const ky = p * ph + ph * (0.3 + random() * 0.4);
      for (let r = 6; r > 0; r--) {
        ctx.strokeStyle = `rgba(28,16,7,${0.06 + r * 0.02})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(kx, ky, r * 4 * (size / 512), r * 2.4 * (size / 512), random() * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // plank seam
    ctx.fillStyle = "rgba(14,9,4,0.55)";
    ctx.fillRect(0, p * ph, size, Math.max(1, size / 700));
    ctx.fillStyle = "rgba(255,240,215,0.09)";
    ctx.fillRect(0, p * ph + Math.max(1, size / 700), size, Math.max(1, size / 900));
    // butt joint
    const bx = ((p * 0.37 + 0.2) % 1) * size;
    ctx.fillStyle = "rgba(14,9,4,0.5)";
    ctx.fillRect(bx, p * ph, Math.max(1, size / 800), ph);
    ctx.restore();
  }

  grain(ctx, size, Math.floor(size * 0.7), random, 0.05);
  return canvas;
}

export function woodMaterialMaps(
  size: number,
  repeat: Vec2,
  anisotropy: number,
  tone: "floor" | "oak" | "walnut",
): { map: THREE.Texture; roughnessMap: THREE.Texture } {
  const key = `wood-${tone}-${size}-${repeat.join("x")}`;
  const canvas = woodCanvas(size, tone === "floor" ? 11 : tone === "oak" ? 23 : 37, tone);
  const map = cachedTexture(`${key}-a`, () => toTexture(canvas, { srgb: true, repeat, anisotropy }), canvas);
  const rough = cachedTexture(
    `${key}-r`,
    () => {
      const { canvas: rc, ctx } = makeCanvas(Math.max(128, size >> 1));
      ctx.drawImage(canvas, 0, 0, rc.width, rc.height);
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, rc.width, rc.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(128,128,128,0.55)";
      ctx.fillRect(0, 0, rc.width, rc.height);
      return toTexture(rc, { repeat, anisotropy });
    },
    null,
  );
  return { map, roughnessMap: rough };
}

/* ---------------------------------------------------------------- travertine */

function travertineCanvas(size: number, seed: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const random = seeded(seed);
  ctx.fillStyle = "#cec2ab";
  ctx.fillRect(0, 0, size, size);

  let y = 0;
  while (y < size) {
    const h = 2 + random() * (size * 0.035);
    const l = 62 + random() * 18;
    ctx.fillStyle = `hsl(38 ${16 + random() * 12}% ${l}%)`;
    ctx.globalAlpha = 0.25 + random() * 0.35;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += size / 12) {
      ctx.lineTo(x, y + Math.sin((x / size) * Math.PI * 2 + random() * 0.4) * 2.2);
    }
    ctx.lineTo(size, y + h);
    for (let x = size; x >= 0; x -= size / 12) {
      ctx.lineTo(x, y + h + Math.sin((x / size) * Math.PI * 2) * 2.2);
    }
    ctx.closePath();
    ctx.fill();
    y += h;
  }
  ctx.globalAlpha = 1;

  // pores
  for (let i = 0; i < 900; i++) {
    const px = random() * size;
    const py = random() * size;
    const rw = 1 + random() * (size * 0.006);
    const rh = rw * (0.3 + random() * 0.5);
    ctx.fillStyle = `rgba(96,84,66,${0.08 + random() * 0.24})`;
    ctx.beginPath();
    ctx.ellipse(px, py, rw, rh, (random() - 0.5) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  softBlobs(ctx, size, 26, random, ["#e2d8c2", "#b3a58c"], [size * 0.04, size * 0.2], [0.06, 0.16]);
  grain(ctx, size, Math.floor(size * 1.1), random, 0.04);
  return canvas;
}

export function travertineMaps(
  size: number,
  repeat: Vec2,
  anisotropy: number,
): { map: THREE.Texture; bumpMap: THREE.Texture } {
  const key = `travertine-${size}-${repeat.join("x")}`;
  const canvas = cachedCanvas(`${key}-canvas`, () => travertineCanvas(size, 91));
  const map = cachedTexture(`${key}-a`, () => toTexture(canvas, { srgb: true, repeat, anisotropy }), canvas);
  const bump = cachedTexture(`${key}-b`, () => toTexture(canvas, { repeat, anisotropy }), canvas);
  return { map, bumpMap: bump };
}

function cachedCanvas(key: string, factory: () => HTMLCanvasElement): HTMLCanvasElement {
  const hit = canvasCache.get(key);
  if (hit) return hit;
  const c = factory();
  canvasCache.set(key, c);
  return c;
}

const canvasCache = new Map<string, HTMLCanvasElement>();

/* ------------------------------------------------------------------- ground */

function gravelCanvas(size: number, seed: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const random = seeded(seed);
  ctx.fillStyle = "#a79c88";
  ctx.fillRect(0, 0, size, size);
  softBlobs(ctx, size, 40, random, ["#8a8071", "#c0b49d", "#9a9080"], [size * 0.05, size * 0.35], [0.1, 0.3]);

  for (let i = 0; i < 14000; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = 0.4 + random() * (size / 700);
    const l = 38 + random() * 52;
    ctx.fillStyle = `hsl(${34 + random() * 14} ${5 + random() * 12}% ${l}%)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // larger stones with a soft contact shadow
  for (let i = 0; i < 260; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = size / 220 + random() * (size / 90);
    ctx.fillStyle = "rgba(28,24,20,0.35)";
    ctx.beginPath();
    ctx.ellipse(x + r * 0.3, y + r * 0.4, r, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    grad.addColorStop(0, `hsl(${38 + random() * 10} 8% ${64 + random() * 18}%)`);
    grad.addColorStop(1, `hsl(${34 + random() * 10} 7% ${38 + random() * 12}%)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.8, random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  grain(ctx, size, Math.floor(size * 2), random, 0.07);
  return canvas;
}

export function gravelMaps(
  size: number,
  repeat: Vec2,
  anisotropy: number,
): { map: THREE.Texture; bumpMap: THREE.Texture } {
  const key = `gravel-${size}-${repeat.join("x")}`;
  const canvas = gravelCanvas(size, 57);
  const map = cachedTexture(`${key}-a`, () => toTexture(canvas, { srgb: true, repeat, anisotropy }), canvas);
  const bump = cachedTexture(`${key}-b`, () => toTexture(canvas, { repeat, anisotropy }), canvas);
  return { map, bumpMap: bump };
}

/* ------------------------------------------------------------------- fabric */

export function fabricMaps(
  size: number,
  repeat: Vec2,
  anisotropy: number,
  tone: "sand" | "charcoal",
): { map: THREE.Texture } {
  const key = `fabric-${tone}-${size}`;
  const canvas = cachedCanvas(`${key}-canvas`, () => {
    const c = makeCanvas(size);
    const { ctx } = c;
    const random = seeded(tone === "sand" ? 13 : 17);
    ctx.fillStyle = tone === "sand" ? "#b3a894" : "#3a3b39";
    ctx.fillRect(0, 0, size, size);
    const step = Math.max(3, size / 180);
    for (let i = 0; i < size; i += step) {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(i, 0, 1, size);
      ctx.fillStyle = "rgba(0,0,0,0.07)";
      ctx.fillRect(0, i, size, 1);
    }
    softBlobs(ctx, size, 20, random, ["#8f8472", "#cfc4b0"], [size * 0.1, size * 0.4], [0.06, 0.16]);
    grain(ctx, size, size * 2, random, 0.05);
    return c.canvas;
  });
  const map = cachedTexture(`${key}-a`, () => toTexture(canvas, { srgb: true, repeat, anisotropy }), canvas);
  return { map };
}

/* ---------------------------------------------------------------- environment */

/** Equirectangular dusk sky, used to build the PMREM lighting environment. */
export function createEnvironmentTexture(width = 1024): THREE.Texture {
  const key = `env-${width}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const height = width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível");

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#0a1015");
  sky.addColorStop(0.26, "#1b2830");
  sky.addColorStop(0.44, "#4a5a61");
  sky.addColorStop(0.5, "#98a09f");
  sky.addColorStop(0.505, "#6d6660");
  sky.addColorStop(0.62, "#38362f");
  sky.addColorStop(1, "#14130f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // low sun, west of the site
  const sunX = width * 0.31;
  const sunY = height * 0.455;
  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.34);
  sun.addColorStop(0, "rgba(255,236,205,0.95)");
  sun.addColorStop(0.035, "rgba(255,214,164,0.6)");
  sun.addColorStop(0.18, "rgba(226,178,131,0.22)");
  sun.addColorStop(1, "rgba(150,130,110,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, width, height);

  // horizon haze
  const haze = ctx.createLinearGradient(0, height * 0.4, 0, height * 0.56);
  haze.addColorStop(0, "rgba(210,205,190,0)");
  haze.addColorStop(0.5, "rgba(214,206,190,0.28)");
  haze.addColorStop(1, "rgba(150,145,130,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, width, height);

  // dither to avoid banding in reflections
  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 3;
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
}

/** Soft radial alpha used for contact darkening under masses. */
export function createContactShadowTexture(): THREE.Texture {
  const key = "contact";
  const hit = cache.get(key);
  if (hit) return hit;
  const size = 256;
  const { canvas, ctx } = makeCanvas(size);
  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.42)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}

export function disposeTextureCache() {
  for (const texture of cache.values()) texture.dispose();
  cache.clear();
  canvasCache.clear();
}

/* --------------------------------------------------------------- water ripple */

/** Tileable ripple field used as the distortion map for the pool reflector. */
export function createRippleTexture(): THREE.Texture {
  const key = "ripple";
  const hit = cache.get(key);
  if (hit) return hit;
  const size = 256;
  const { canvas, ctx } = makeCanvas(size);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  const random = seeded(404);
  for (let i = 0; i < 260; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = 6 + random() * 34;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const up = random() > 0.5 ? "255,255,255" : "0,0,0";
    grad.addColorStop(0, `rgba(${up},${0.1 + random() * 0.22})`);
    grad.addColorStop(1, `rgba(${up},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + random() * 0.4), random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = toTexture(canvas, { repeat: [2, 2] });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  cache.set(key, tex);
  return tex;
}

/** Dry grass tuft alpha for the site, keeps the ground from reading as felt. */
export function createGrassTuftTexture(): THREE.Texture {
  const key = "tuft";
  const hit = cache.get(key);
  if (hit) return hit;
  const size = 128;
  const { canvas, ctx } = makeCanvas(size);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);
  const random = seeded(77);
  for (let i = 0; i < 90; i++) {
    const x = size / 2 + (random() - 0.5) * size * 0.8;
    const h = size * (0.35 + random() * 0.6);
    const lean = (random() - 0.5) * size * 0.3;
    const w = 0.8 + random() * 1.6;
    const shade = Math.floor(120 + random() * 135);
    const grad = ctx.createLinearGradient(x, size, x + lean, size - h);
    grad.addColorStop(0, `rgb(${shade * 0.55},${shade * 0.55},${shade * 0.4})`);
    grad.addColorStop(1, `rgb(${shade},${shade},${shade * 0.8})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x, size);
    ctx.quadraticCurveTo(x + lean * 0.3, size - h * 0.6, x + lean, size - h);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}
