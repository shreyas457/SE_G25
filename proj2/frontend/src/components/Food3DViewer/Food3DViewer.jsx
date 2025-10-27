import React, { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import './Food3DViewer.css';

function FoodModel({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const meshRef = useRef();

  return <primitive ref={meshRef} object={scene} scale={1.5} />;
}

function Loader() {
  return (
    <Html center>
      <div className="loading-3d">Loading 3D Model...</div>
    </Html>
  );
}

const Food3DViewer = ({ modelPath, name }) => {
  return (
    <div className="food-3d-viewer">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, 0, -5]} intensity={0.3} />
        
        <Environment preset="studio" />
        
        <Suspense fallback={<Loader />}>
          <FoodModel modelPath={modelPath} />
        </Suspense>
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minDistance={0}
          maxDistance={30}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
      
      <div className="viewer-instructions">
        <p>🖱️ Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default Food3DViewer;