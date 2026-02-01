"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls, Center, Environment, Grid } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";
import { RotateCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ModelViewerProps {
  url: string;
  fileType: "stl" | "obj";
}

function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Center and scale the geometry
  geometry.center();
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDim;

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={[scale, scale, scale]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color={hovered ? "#f19244" : "#14b8a6"}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

function OBJModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Center and scale the object
  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDim;

  obj.position.sub(center);

  // Apply material to all meshes
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: hovered ? "#f19244" : "#14b8a6",
        metalness: 0.3,
        roughness: 0.4,
      });
    }
  });

  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group
      ref={groupRef}
      scale={[scale, scale, scale]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={obj} />
    </group>
  );
}

function ModelScene({ url, fileType }: ModelViewerProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      <Center>
        <Suspense fallback={null}>
          {fileType === "stl" ? <STLModel url={url} /> : <OBJModel url={url} />}
        </Suspense>
      </Center>

      <Grid
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#404040"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#606060"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        position={[0, -1.5, 0]}
      />

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={1}
        maxDistance={20}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2 + 0.1}
      />

      <Environment preset="studio" />
    </>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-white/60">Loading model...</p>
      </div>
    </div>
  );
}

export default function ModelViewer({ url, fileType }: ModelViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="model-viewer relative">
      <Suspense fallback={<LoadingSpinner />}>
        <Canvas
          camera={{ position: [3, 3, 3], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <ModelScene url={url} fileType={fileType} />
        </Canvas>
      </Suspense>

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm text-white transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white/60 text-sm">
        <p>Drag to rotate • Scroll to zoom • Shift+drag to pan</p>
      </div>
    </div>
  );
}
