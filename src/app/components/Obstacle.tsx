"use client"
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

function Obstacle() {
  const [ref, api] = useBox<THREE.Mesh>(() => ({
    position: [Math.random() * 3 - 1.5, 1, -10],
    args: [0.5, 0.5, 0.5],
  }));

  useFrame(() => {
    if (ref.current) {
      const { position } = ref.current;
      position.z += 0.1;
      if (position.z > 0) {
        api.position.set(Math.random() * 3 - 1.5, 1, -10);
      }
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

export default Obstacle;
