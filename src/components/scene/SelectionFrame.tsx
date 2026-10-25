"use client";

import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useUI } from "@/lib/store";

/**
 * Technical selection frame: the bounding volume of the selected element,
 * drawn as a thin acid contour. It is the only place the accent colour appears
 * inside the 3D scene.
 */
export function SelectionFrame() {
  const scene = useThree((state) => state.scene);
  const selectedId = useUI((state) => state.selectedId);
  const [box, setBox] = useState<{ center: THREE.Vector3; size: THREE.Vector3 } | null>(null);

  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), []);

  useEffect(() => {
    if (!selectedId || selectedId === "coast") {
      setBox(null);
      return;
    }
    let found: THREE.Object3D | null = null;
    scene.traverse((child) => {
      if (!found && child.userData?.objectId === selectedId) found = child;
    });
    if (!found) {
      setBox(null);
      return;
    }
    const bounds = new THREE.Box3().setFromObject(found);
    if (bounds.isEmpty()) {
      setBox(null);
      return;
    }
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    setBox({ center, size });
  }, [selectedId, scene]);

  if (!box) return null;

  return (
    <group position={box.center} renderOrder={1}>
      <lineSegments geometry={edges} scale={[box.size.x + 0.02, box.size.y + 0.02, box.size.z + 0.02]}>
        <lineBasicMaterial
          color="#b9ff00"
          transparent
          opacity={0.55}
          depthTest={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}
