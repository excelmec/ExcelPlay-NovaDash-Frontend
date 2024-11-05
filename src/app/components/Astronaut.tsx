"use client"
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useStore } from "../store";
import gsap from "gsap";
import * as THREE from "three";

export default function Astronaut() {
  const { nodes, materials } = useGLTF("/astronaut.glb") as any; // Adjusting type to 'any' for simplicity here
  const ref = useRef<THREE.Mesh>(null);
  const { currentLane, setLane } = useStore();

  const moveLane = (lane: number) => {
    if (ref.current) {
      gsap.to(ref.current.position, { x: lane * 1.5, duration: 0.5 });
      setLane(lane);
    }
  };

  useFrame(() => {
    if (currentLane === 0) moveLane(0);
    else if (currentLane === 1) moveLane(1.5);
    else if (currentLane === -1) moveLane(-1.5);
  });

  return (
    <mesh ref={ref} geometry={nodes.Astronaut.geometry} material={materials.Material}>
      <primitive object={nodes.Astronaut} scale={0.5} />
    </mesh>
  );
}
