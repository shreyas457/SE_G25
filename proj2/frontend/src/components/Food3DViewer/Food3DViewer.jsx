import React, { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import './Food3DViewer.css';

function FoodModel({ modelBase64, contentType }) {
  const meshRef = useRef();
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (modelBase64) {
      try {
        // Convert base64 to binary string
        const binary = atob(modelBase64);
        
        // Convert binary string to Uint8Array
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        
        // Create blob and object URL
        const blob = new Blob([array], { type: contentType || 'model/gltf-binary' });
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        
        return () => URL.revokeObjectURL(objectUrl);
      } catch (error) {
        console.error('Error loading 3D model:', error);
      }
    }
  }, [modelBase64, contentType]);

  // Always call useGLTF, but with conditional URL
  const { scene } = useGLTF(url || '', true);
  
  // Don't render if no URL or scene
  if (!url || !scene) return null;
  
  return <primitive ref={meshRef} object={scene} scale={1.5} />;
}

function Loader() {
  return (
    <Html center>
      <div className="loading-3d">Loading 3D Model...</div>
    </Html>
  );
}

const Food3DViewer = ({ modelData }) => {
  if (!modelData || !modelData.data) return null;
  
  const { data, contentType } = modelData;
  
  return (
    <div className="food-3d-viewer">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, 0, -5]} intensity={0.3} />
        <Environment preset="studio" />

        <Suspense fallback={<Loader />}>
          <FoodModel modelBase64={data} contentType={contentType} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={2}
          maxDistance={10}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>

      <div className="viewer-instructions">
        <p>🖱️ Left click: Rotate • Right click: Pan • Scroll: Zoom</p>
      </div>
    </div>
  );
};

export default Food3DViewer;