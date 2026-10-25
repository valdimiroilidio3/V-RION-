"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useUI } from "@/lib/store";
import { OBJECTS } from "@/lib/objects";
import { hotspotElements as elements } from "./hotspotRegistry";

/**
 * Projects world anchors to screen space and drives the DOM hotspot buttons.
 * Rendering the labels outside the canvas keeps text crisp and accessible,
 * while throttled raycasts stop them showing through walls.
 */
export function HotspotProjector() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const scene = useThree((state) => state.scene);

  const occluded = useRef(new Map<string, boolean>());
  const counter = useRef(0);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useFrame(() => {
    const ui = useUI.getState();
    const visible = ui.phase === "explore";

    counter.current += 1;
    const shouldTest = counter.current % 8 === 0;

    for (const object of OBJECTS) {
      const element = elements.get(object.id);
      if (!element) continue;

      target.set(object.anchor[0], object.anchor[1], object.anchor[2]);

      if (shouldTest) {
        direction.copy(target).sub(camera.position);
        const distance = direction.length();
        raycaster.near = 0.05;
        raycaster.far = Math.max(0.1, distance - 0.35);
        raycaster.set(camera.position, direction.normalize());
        const hits = raycaster.intersectObjects(scene.children, true);
        let blocked = false;
        for (const hit of hits) {
          const mesh = hit.object as THREE.Mesh;
          if (mesh.userData?.noOcclude) continue;
          const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
          const materials = Array.isArray(material) ? material : material ? [material] : [];
          if (materials.some((entry) => entry && !entry.transparent)) {
            blocked = true;
            break;
          }
        }
        occluded.current.set(object.id, blocked);
      }

      projected.copy(target).project(camera);
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      const behind = projected.z > 1;
      const inFrame = x > -60 && x < size.width + 60 && y > -60 && y < size.height + 60;
      const hidden =
        !visible ||
        behind ||
        !inFrame ||
        Boolean(occluded.current.get(object.id)) ||
        ui.selectedId === object.id;

      element.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      element.style.opacity = hidden ? "0" : "1";
      element.style.pointerEvents = hidden ? "none" : "auto";
      element.setAttribute("aria-hidden", hidden ? "true" : "false");
      element.tabIndex = hidden ? -1 : 0;
    }
  });

  return null;
}
