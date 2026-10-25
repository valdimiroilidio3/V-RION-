"use client";

import type { ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useUI } from "@/lib/store";
import type { SceneObjectId } from "@/lib/objects";

interface SelectableProps {
  id: SceneObjectId;
  children: ReactNode;
  /** disable pointer picking (e.g. glass that should not block the terrace) */
  pickable?: boolean;
}

/**
 * A group that can be selected in the scene. Selection drives the DOM panel and
 * the camera (through the store subscription in CameraController).
 */
export function Selectable({ id, children, pickable = true }: SelectableProps) {
  if (!pickable) return <group>{children}</group>;

  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const ui = useUI.getState();
    if (ui.phase !== "explore") return;
    document.body.style.cursor = "auto";
    ui.setSelected(id);
    ui.setView(null);
  };

  return (
    <group
      userData={{ objectId: id }}
      onClick={select}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {children}
    </group>
  );
}
