"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useUI } from "@/lib/store";
import type { ViewId } from "@/lib/store";
import { INTRO_POSE, VIEWS, poseAt, type CamPose } from "@/lib/camera";
import { OBJECT_MAP, type SceneObjectId } from "@/lib/objects";
import { SOLIDS, WORLD_BOUNDS } from "@/lib/plan";
import type { DeviceProfile } from "@/lib/quality";
import { cameraBridge } from "@/lib/cameraBridge";

type Mode = "intro" | "scroll" | "free";

interface Flight {
  from: CamPose;
  to: CamPose;
  t: number;
  duration: number;
  ease: (t: number) => number;
  done?: () => void;
}

const easeInOut = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutQuint = (t: number) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

const clamp = THREE.MathUtils.clamp;

const tmpVec = new THREE.Vector3();

/**
 * Portrait screens need their own framing, not a desktop frame squeezed into a
 * column: the camera pulls back and rises so the building keeps its horizon
 * line and the lower third stays clear for the editorial copy.
 */
function adaptPose(pose: CamPose, aspect: number): CamPose {
  if (aspect >= 1.02) return pose;
  const t = clamp((1.02 - aspect) / 0.58, 0, 1);
  const k = THREE.MathUtils.lerp(1.0, 1.46, t);
  const lift = THREE.MathUtils.lerp(0, 1.5, t);
  return {
    pos: [
      pose.target[0] + (pose.pos[0] - pose.target[0]) * k,
      pose.target[1] + (pose.pos[1] - pose.target[1]) * (1 + (k - 1) * 0.22) + lift,
      pose.target[2] + (pose.pos[2] - pose.target[2]) * k,
    ],
    target: [pose.target[0], pose.target[1] - THREE.MathUtils.lerp(0, 0.35, t), pose.target[2]],
    fov: Math.min(70, pose.fov + (k - 1) * 19),
  };
}

function resolveCollision(position: THREE.Vector3) {
  const pad = 0.3;
  for (let iteration = 0; iteration < 3; iteration++) {
    let moved = false;
    for (const box of SOLIDS) {
      const minX = box.min[0] - pad;
      const maxX = box.max[0] + pad;
      const minY = box.min[1] - pad;
      const maxY = box.max[1] + pad;
      const minZ = box.min[2] - pad;
      const maxZ = box.max[2] + pad;
      if (
        position.x > minX &&
        position.x < maxX &&
        position.y > minY &&
        position.y < maxY &&
        position.z > minZ &&
        position.z < maxZ
      ) {
        const dxMin = position.x - minX;
        const dxMax = maxX - position.x;
        const dyMin = position.y - minY;
        const dyMax = maxY - position.y;
        const dzMin = position.z - minZ;
        const dzMax = maxZ - position.z;
        const smallest = Math.min(dxMin, dxMax, dyMin, dyMax, dzMin, dzMax);
        if (smallest === dxMin) position.x = minX;
        else if (smallest === dxMax) position.x = maxX;
        else if (smallest === dyMin) position.y = minY;
        else if (smallest === dyMax) position.y = maxY;
        else if (smallest === dzMin) position.z = minZ;
        else position.z = maxZ;
        moved = true;
      }
    }
    if (!moved) break;
  }
  position.x = clamp(position.x, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX);
  position.z = clamp(position.z, WORLD_BOUNDS.minZ, WORLD_BOUNDS.maxZ);
  position.y = clamp(position.y, WORLD_BOUNDS.minY, WORLD_BOUNDS.maxY);
}

export function CameraController({
  profile,
  interactive,
}: {
  profile: DeviceProfile;
  interactive: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const phase = useUI((state) => state.phase);

  const mode = useRef<Mode>("intro");
  const flight = useRef<Flight | null>(null);
  const savedPose = useRef<CamPose | null>(null);
  const anchor = useRef(new THREE.Vector3(...VIEWS.approach.pose.target));
  const introStarted = useRef(false);
  const readoutTick = useRef(0);
  const limits = useRef({
    minDistance: 12,
    maxDistance: 60,
    minPolar: 0.2,
    maxPolar: 1.53,
    azimuth: [-0.7, 1.4] as [number, number],
    targetRadius: 8,
  });

  const applyLimits = (id: ViewId | null, selected: SceneObjectId | null) => {
    const c = controlsRef.current;
    if (!c) return;
    const view = VIEWS[id ?? "approach"];
    const focusPose = selected ? OBJECT_MAP[selected]?.focus : null;
    if (selected && focusPose) {
      const azimuth = Math.atan2(
        focusPose.pos[0] - focusPose.target[0],
        focusPose.pos[2] - focusPose.target[2],
      );
      limits.current = {
        minDistance: 1.3,
        maxDistance: 13,
        minPolar: 0.35,
        maxPolar: 1.52,
        azimuth: [azimuth - 0.85, azimuth + 0.85],
        targetRadius: 2.1,
      };
    } else if (id) {
      limits.current = {
        minDistance: view.minDistance,
        maxDistance: view.maxDistance * 1.4,
        minPolar: view.polar[0],
        maxPolar: view.polar[1],
        azimuth: [view.azimuth[0] - 0.15, view.azimuth[1] + 0.15],
        targetRadius: view.targetRadius * 1.4,
      };
    } else {
      limits.current = {
        minDistance: 3,
        maxDistance: 62,
        minPolar: 0.18,
        maxPolar: 1.53,
        azimuth: [-Math.PI, Math.PI],
        targetRadius: 10,
      };
    }
    c.minDistance = limits.current.minDistance;
    c.maxDistance = limits.current.maxDistance;
    c.minPolarAngle = limits.current.minPolar;
    c.maxPolarAngle = limits.current.maxPolar;
  };

  const capturePose = (): CamPose => {
    const c = controlsRef.current;
    return {
      pos: [camera.position.x, camera.position.y, camera.position.z],
      target: c ? [c.target.x, c.target.y, c.target.z] : [0, 1, 0],
      fov: (camera as THREE.PerspectiveCamera).fov,
    };
  };

  const startFlight = (
    pose: CamPose,
    duration: number,
    ease: (t: number) => number = easeInOut,
    done?: () => void,
  ) => {
    const c = controlsRef.current;
    const aspect = gl.domElement.clientWidth / Math.max(1, gl.domElement.clientHeight);
    const adapted = adaptPose(pose, aspect);
    const from = capturePose();
    flight.current = { from, to: adapted, t: 0, duration, ease, done };
    anchor.current.set(...adapted.target);
    if (c) c.enabled = false;
  };

  const finishFlight = () => {
    const current = flight.current;
    if (!current) return;
    camera.position.set(...current.to.pos);
    (camera as THREE.PerspectiveCamera).fov = current.to.fov;
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(...current.to.target);
      controlsRef.current.update();
    }
    resolveCollision(camera.position);
    flight.current = null;
    if (current.done) current.done();
  };

  /* ------------------------------------------------------------ mounting */
  useEffect(() => {
    camera.position.set(...INTRO_POSE.pos);
    (camera as THREE.PerspectiveCamera).fov = INTRO_POSE.fov;
    camera.updateProjectionMatrix();
    camera.far = 3000;
    if (controlsRef.current) {
      controlsRef.current.target.set(...INTRO_POSE.target);
      controlsRef.current.enabled = false;
      controlsRef.current.update();
    }
    applyLimits(null, null);
    anchor.current.set(...INTRO_POSE.target);
    introStarted.current = false;
  }, [camera]);

  /* ------------------------------------------------------ intro sequence */
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    (window as unknown as Record<string, unknown>).__CAM = () => ({
      mode: mode.current,
      flight: flight.current
        ? { t: +flight.current.t.toFixed(2), d: flight.current.duration, hasDone: Boolean(flight.current.done) }
        : null,
      introStarted: introStarted.current,
      phase: useUI.getState().phase,
      view: useUI.getState().viewId,
      narrative: +useUI.getState().narrative.toFixed(3),
    });
  }

  const startIntro = () => {
    if (introStarted.current) return;
    introStarted.current = true;
    useUI.getState().setView("approach");
    if (profile.reducedMotion) {
      camera.position.set(...VIEWS.approach.pose.pos);
      (camera as THREE.PerspectiveCamera).fov = VIEWS.approach.pose.fov;
      camera.updateProjectionMatrix();
      if (controlsRef.current) {
        controlsRef.current.target.set(...VIEWS.approach.pose.target);
        controlsRef.current.update();
      }
      anchor.current.set(...VIEWS.approach.pose.target);
      useUI.getState().setPhase("explore");
      useUI.getState().setView("approach");
      mode.current = "scroll";
      return;
    }
    mode.current = "intro";
    startFlight(
      VIEWS.approach.pose,
      4.2,
      easeInOutQuint,
      () => {
        const ui = useUI.getState();
        ui.setPhase("explore");
        ui.setView("approach");
        mode.current = "scroll";
        applyLimits("approach", null);
        if (controlsRef.current) controlsRef.current.enabled = interactive;
      },
    );
  };

  useEffect(() => {
    const ui = useUI.getState();
    if (ui.phase === "entry") startIntro();

    const unsubscribe = useUI.subscribe((state, previous) => {
      if (state.phase === "entry" && previous.phase !== "entry") {
        startIntro();
        return;
      }
      if (state.phase !== "explore") return;

      if (state.skipRequested && !previous.skipRequested && mode.current === "intro") {
        const f = flight.current;
        if (f) {
          f.t = f.duration;
          f.ease = easeOut;
        }
        return;
      }

      if (state.selectedId && state.selectedId !== previous.selectedId) {
        const object = OBJECT_MAP[state.selectedId];
        if (object) {
          savedPose.current = capturePose();
          mode.current = "free";
          startFlight(object.focus, 1.35, easeInOut);
          applyLimits(null, state.selectedId);
        }
      } else if (!state.selectedId && previous.selectedId) {
        const back = savedPose.current ?? VIEWS[state.viewId ?? "approach"].pose;
        savedPose.current = null;
        mode.current = "free";
        startFlight(back, 1.15, easeInOut);
        applyLimits(state.viewId, null);
      } else if (state.viewId && state.viewId !== previous.viewId) {
        savedPose.current = null;
        mode.current = "free";
        startFlight(VIEWS[state.viewId].pose, 1.7, easeInOut);
        applyLimits(state.viewId, null);
      }
    });

    return unsubscribe;
  }, [camera, gl, interactive]);

  /* ------------------------------------------------ key + gesture bridge */
  useEffect(() => {
    cameraBridge.dolly = (factor: number) => {
      const c = controlsRef.current;
      if (!c || useUI.getState().phase !== "explore") return;
      const direction = new THREE.Vector3().subVectors(camera.position, c.target);
      const distance = clamp(direction.length() * factor, c.minDistance, c.maxDistance);
      const destination = c.target.clone().add(direction.setLength(distance));
      const pose: CamPose = {
        pos: [destination.x, destination.y, destination.z],
        target: [c.target.x, c.target.y, c.target.z],
        fov: (camera as THREE.PerspectiveCamera).fov,
      };
      startFlight(pose, 0.55, easeOut);
      mode.current = "free";
    };
    cameraBridge.zoomIn = () => cameraBridge.dolly(0.82);
    cameraBridge.zoomOut = () => cameraBridge.dolly(1.22);
    cameraBridge.reset = () => {
      const ui = useUI.getState();
      const wasApproach = ui.viewId === "approach" && ui.selectedId === null;
      ui.setSelected(null);
      ui.setView("approach");
      if (wasApproach) {
        startFlight(VIEWS.approach.pose, 1.4, easeInOut);
        mode.current = "free";
      }
    };
    cameraBridge.focus = (id: string) => {
      const state = useUI.getState();
      state.setView(null);
      state.setSelected(id as SceneObjectId);
    };
  }, [camera]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = () => {
      if (useUI.getState().phase === "entry") {
        useUI.getState().requestSkip();
      }
      mode.current = "free";
      if (flight.current) {
        finishFlight();
      }
    };
    const onScroll = () => {
      const ui = useUI.getState();
      if (ui.phase === "entry") {
        ui.requestSkip();
        return;
      }
      if (ui.phase !== "explore") return;
      if (ui.selectedId) return;
      mode.current = "scroll";
      if (ui.viewId && ui.narrative > 0.02) ui.setView(null);
    };
    const onWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      const factor = Math.exp(event.deltaY * 0.0016);
      cameraBridge.dolly(factor);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) return;
      if (event.key === "+" || event.key === "=") cameraBridge.zoomIn();
      if (event.key === "-" || event.key === "_") cameraBridge.zoomOut();
      if (event.key === "0") cameraBridge.reset();
      if (event.key === "Escape") {
        const ui = useUI.getState();
        ui.setSelected(null);
        ui.setPanelOpen(false);
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [gl]);

  /* ------------------------------------------------------------- frame loop */
  useFrame((_, delta) => {
    const ui = useUI.getState();
    const controls = controlsRef.current;
    if (!controls) return;
    const dt = Math.min(0.12, delta);
    const cam = camera as THREE.PerspectiveCamera;

    if (ui.phase === "entry" && !introStarted.current) startIntro();
    if (ui.phase !== "explore" && ui.phase !== "entry") {
      controls.update();
      return;
    }

    if (flight.current) {
      const f = flight.current;
      f.t += dt;
      const k = clamp(f.t / Math.max(0.0001, f.duration), 0, 1);
      const v = f.ease(k);
      camera.position.set(
        THREE.MathUtils.lerp(f.from.pos[0], f.to.pos[0], v),
        THREE.MathUtils.lerp(f.from.pos[1], f.to.pos[1], v),
        THREE.MathUtils.lerp(f.from.pos[2], f.to.pos[2], v),
      );
      controls.target.set(
        THREE.MathUtils.lerp(f.from.target[0], f.to.target[0], v),
        THREE.MathUtils.lerp(f.from.target[1], f.to.target[1], v),
        THREE.MathUtils.lerp(f.from.target[2], f.to.target[2], v),
      );
      cam.fov = THREE.MathUtils.lerp(f.from.fov, f.to.fov, v);
      cam.updateProjectionMatrix();
      resolveCollision(camera.position);
      controls.update();
      if (k >= 1) {
        const done = f.done;
        flight.current = null;
        if (done) done();
      }
      return;
    }

    if (
      ui.phase === "explore" &&
      mode.current === "scroll" &&
      !ui.selectedId
    ) {
      const aspect = gl.domElement.clientWidth / Math.max(1, gl.domElement.clientHeight);
      const pose = adaptPose(poseAt(ui.narrative), aspect);
      const damping = 1 - Math.exp(-dt * 2.1);
      camera.position.lerp(tmpVec.set(...pose.pos), damping);
      controls.target.lerp(tmpVec.set(...pose.target), damping);
      cam.fov += (pose.fov - cam.fov) * damping;
      cam.updateProjectionMatrix();
      anchor.current.lerp(tmpVec.set(...pose.target), damping);
    }

    // interaction limits around the current anchor
    const lim = limits.current;
    controls.minDistance = lim.minDistance;
    controls.maxDistance = lim.maxDistance;
    controls.minPolarAngle = lim.minPolar;
    controls.maxPolarAngle = lim.maxPolar;
    {
      const offset = tmpVec.subVectors(controls.target, anchor.current);
      const radius = offset.length();
      if (radius > lim.targetRadius) {
        controls.target.copy(anchor.current).add(offset.setLength(lim.targetRadius));
      }
      controls.target.y = clamp(controls.target.y, 0.05, 6.5);
    }

    resolveCollision(camera.position);
    controls.update();

    // live optics: distance to the orbit target and the full-frame equivalent
    // focal length of the current vertical FOV (24 mm sensor height). Written
    // to the store at ~8 Hz and only when it actually moved, so the DOM
    // readout never becomes a per-frame cost.
    const readout = useUI.getState();
    readoutTick.current += dt;
    if (readoutTick.current > 0.12) {
      readoutTick.current = 0;
      const distance = camera.position.distanceTo(controls.target);
      const focal = 12 / Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
      if (
        Math.abs(distance - readout.cameraDistance) > 0.08 ||
        Math.abs(focal - readout.focalLength) > 0.6
      ) {
        readout.setCameraInfo(distance, focal);
      }
    }

    // keep the orbit inside its art-directed azimuth range
    const offset = tmpVec.subVectors(camera.position, controls.target);
    const azimuth = Math.atan2(offset.x, offset.z);
    const clampedAzimuth = clamp(azimuth, lim.azimuth[0], lim.azimuth[1]);
    if (Math.abs(clampedAzimuth - azimuth) > 0.0005 && mode.current !== "scroll") {
      const d = clampedAzimuth - azimuth;
      const cos = Math.cos(d);
      const sin = Math.sin(d);
      const x = offset.x * cos + offset.z * sin;
      const z = -offset.x * sin + offset.z * cos;
      camera.position.set(controls.target.x + x, camera.position.y, controls.target.z + z);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={interactive && phase === "explore"}
      enableDamping
      dampingFactor={0.075}
      enableZoom={profile.mobile}
      enablePan
      panSpeed={0.9}
      rotateSpeed={profile.mobile ? 0.55 : 0.62}
      zoomSpeed={0.8}
      screenSpacePanning={false}
      onStart={() => {
        if (useUI.getState().phase === "entry") return;
        mode.current = "free";
      }}
    />
  );
}
