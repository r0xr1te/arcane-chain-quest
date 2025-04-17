
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

const GameBackground = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="sunset" />
        <Sparkles 
          count={100}
          scale={10}
          size={4}
          speed={0.4}
          opacity={0.1}
        />
        <mesh ref={meshRef} position={[0, 0, -5]}>
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial color="#4ade80" opacity={0.2} transparent />
        </mesh>
      </Canvas>
    </div>
  );
};

export default GameBackground;
