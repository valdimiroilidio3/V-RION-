"use client";

import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DeviceProfile } from "@/lib/quality";
import { createEnvironmentTexture } from "@/lib/textures";
import type { Vec3 } from "@/lib/geometry";

/** Late afternoon sun, low in the north-west. Shared by sky, light and env. */
export const SUN_DIRECTION: Vec3 = (() => {
  // late afternoon, west-south-west: rakes the glass facade and throws long
  // shadows to the north-east
  const v = new THREE.Vector3(-0.78, 0.245, 0.5).normalize();
  return [v.x, v.y, v.z];
})();

export function EnvironmentLighting({
  profile,
  onEnvironment,
}: {
  profile: DeviceProfile;
  onEnvironment?: () => void;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const sunRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    const width = profile.quality === "high" ? 1024 : profile.quality === "medium" ? 512 : 256;
    const equirect = createEnvironmentTexture(width);
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const target = pmrem.fromEquirectangular(equirect);
    scene.environment = target.texture;
    scene.environmentIntensity = profile.quality === "low" ? 0.45 : 0.58;
    onEnvironment?.();

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, profile.quality, onEnvironment]);

  const sunPosition = useMemo<[number, number, number]>(() => {
    const v = new THREE.Vector3(...SUN_DIRECTION).multiplyScalar(72);
    return [v.x, v.y, v.z];
  }, []);

  const shadowSize = profile.shadowMapSize;

  return (
    <group>
      <fogExp2 attach="fog" args={["#a3a396", profile.quality === "low" ? 0.0015 : 0.0019]} />

      {/* sky/ground bounce */}
      <hemisphereLight args={["#6d8899", "#3c372a", 0.14]} />

      {/* key light */}
      {profile.shadows ? (
        <directionalLight
          ref={sunRef}
          position={sunPosition}
          intensity={5.4}
          color="#ffd9ac"
          castShadow
          shadow-mapSize-width={shadowSize}
          shadow-mapSize-height={shadowSize}
          shadow-camera-left={-27}
          shadow-camera-right={27}
          shadow-camera-top={24}
          shadow-camera-bottom={-24}
          shadow-camera-near={22}
          shadow-camera-far={130}
          shadow-bias={-0.0005}
          shadow-normalBias={0.035}
        />
      ) : (
        <directionalLight position={sunPosition} intensity={3} color="#ffdcb4" />
      )}

      {/* cool fill from the sea side, no shadow cost */}
      <directionalLight position={[14, 19, -38]} intensity={1.15} color="#9dbdd4" />

      {/*
        The interior is read almost entirely through the glass, so it is lit by
        the small practicals themselves plus two soft interior fills. Each
        point light costs per-fragment shading on every material, so the budget
        is deliberately short and the rest of the warmth comes from emissive
        geometry and the environment map.
      */}
      <pointLight position={[6.1, 2.4, -0.7]} intensity={4.4} distance={7.5} decay={2} color="#ffab63" />
      <pointLight position={[0.7, 2.4, -2.3]} intensity={3.1} distance={6.5} decay={2} color="#ffb877" />
      <pointLight position={[13.3, 2.25, -3.3]} intensity={2.6} distance={5.5} decay={2} color="#ffb877" />

      {/*
        Daylight inside. The room would otherwise be lit only by its own
        practicals, which turns every surface into the same warm gradient — no
        value structure, nothing to read as architecture. These two cool fills
        stand in for the sky bouncing off the terrace and through the 11 m of
        glazing: cheap, unshadowed, and they give the warm fixtures something
        to contrast with.
      */}
      <pointLight position={[3.2, 2.7, 2.2]} intensity={3.2} distance={9} decay={2} color="#c3d6e2" />
      <pointLight position={[0.4, 2.6, -1.0]} intensity={1.9} distance={7} decay={2} color="#b9cfe0" />
    </group>
  );
}
