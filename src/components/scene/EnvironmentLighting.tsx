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
    scene.environmentIntensity = profile.quality === "low" ? 0.5 : 0.64;
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
      <fogExp2 attach="fog" args={["#a8a89a", profile.quality === "low" ? 0.002 : 0.0024]} />

      {/* sky/ground bounce */}
      <hemisphereLight args={["#7f95a3", "#4a4234", 0.22]} />

      {/* key light */}
      {profile.shadows ? (
        <directionalLight
          ref={sunRef}
          position={sunPosition}
          intensity={3.9}
          color="#ffe0bc"
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
      <directionalLight position={[18, 16, -40]} intensity={0.6} color="#a9c4d4" />

      {/* warm interior practicals: seen through glass, they carry the dusk */}
      <pointLight position={[6.3, 3.4, -1.0]} intensity={9} distance={9} decay={2} color="#ffb877" />
      <pointLight position={[0.4, 3.2, -2.6]} intensity={6} distance={7.5} decay={2} color="#ffbd85" />
      <pointLight position={[8.35, 1.2, -3.2]} intensity={3.4} distance={3.6} decay={2} color="#ff8c3c" />
      <pointLight position={[13.4, 2.3, -3.6]} intensity={3.2} distance={6.5} decay={2} color="#ffc48f" />
      <pointLight position={[4.7, 2.85, 4.2]} intensity={2.4} distance={5.5} decay={2} color="#ffc48f" />
    </group>
  );
}
