"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, RotateCw, Palette } from "lucide-react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Demo STL files configuration
const DEMO_FILES = [
  {
    id: "box-small",
    name: "Box 210x120x40",
    url: "/models/box_210x120x40_v2.stl",
  },
  {
    id: "box-large",
    name: "Box 210x120x70",
    url: "/models/box_210x120x70_v2.stl",
  },
  {
    id: "cover",
    name: "Cover 210x120",
    url: "/models/cover_210x120_v2.stl",
  },
  {
    id: "washer-bowl",
    name: "Washer Bowl",
    url: "/models/washer bowl.stl",
  },
  {
    id: "valentine-dragon",
    name: "Valentine Dragon",
    url: "/models/valentine-dragon.stl",
  },
  {
    id: "car1",
    name: "Car Model",
    url: "/models/car1.stl",
    thumbnail: "/models/car1.png",
  },
];

export default function DemoSection() {
  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewerActive, setViewerActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [modelColor, setModelColor] = useState("#ed7420");
  const [modelScale, setModelScale] = useState(1);
  const [error, setError] = useState<string>("");

  // Three.js refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasContainerRef.current || !viewerActive) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      canvasContainerRef.current.clientWidth /
        canvasContainerRef.current.clientHeight,
      0.1,
      2000,
    );
    camera.position.set(150, 150, 150);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      canvasContainerRef.current.clientWidth,
      canvasContainerRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    canvasContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    controlsRef.current = controls;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(100, 100, 50);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-100, -100, -50);
    scene.add(directionalLight2);

    // Build plate grid
    const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!canvasContainerRef.current || !camera || !renderer) return;
      const width = canvasContainerRef.current.clientWidth;
      const height = canvasContainerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      if (canvasContainerRef.current && renderer.domElement) {
        canvasContainerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [viewerActive]);

  // Update model color when changed
  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      (meshRef.current.material as THREE.MeshStandardMaterial).color.set(
        modelColor,
      );
    }
  }, [modelColor]);

  // Update model scale when changed
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(modelScale, modelScale, modelScale);
    }
  }, [modelScale]);

  /**
   * Centers and scales the mesh to fit the viewport
   */
  function centerAndScale(mesh: THREE.Mesh) {
    if (!cameraRef.current || !controlsRef.current) return;

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center at origin
    mesh.position.sub(center);

    // Scale to fit camera view
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    const distance = cameraDistance * 2.5;

    cameraRef.current.position.set(distance, distance, distance);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }

  /**
   * Loads STL model from File object or ArrayBuffer
   */
  async function loadModel(source: File | ArrayBuffer) {
    setError("");
    console.log(
      "Loading model, source type:",
      source instanceof File ? "File" : "ArrayBuffer",
    );

    // Activate viewer first if not already active
    if (!viewerActive) {
      console.log("Activating viewer...");
      setViewerActive(true);
      // Wait for scene to initialize
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Wait for scene to be ready
    let attempts = 0;
    while (!sceneRef.current && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      attempts++;
    }

    if (!sceneRef.current) {
      console.error("Scene not initialized after waiting");
      setError("3D viewer not ready. Please try again.");
      setIsUploading(false);
      return;
    }

    console.log("Scene is ready, loading model...");

    try {
      // Clear previous mesh
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
        if (meshRef.current.material) {
          (meshRef.current.material as THREE.Material).dispose();
        }
        meshRef.current = null;
      }

      const loader = new STLLoader();
      let geometry: THREE.BufferGeometry;

      if (source instanceof File) {
        // Load from File object
        console.log("Loading from File:", source.name, "size:", source.size);
        const arrayBuffer = await source.arrayBuffer();
        geometry = loader.parse(arrayBuffer);
      } else {
        // Load from ArrayBuffer
        console.log("Loading from ArrayBuffer, size:", source.byteLength);
        geometry = loader.parse(source);
      }

      console.log(
        "Geometry loaded successfully, vertices:",
        geometry.attributes.position.count,
      );

      // Create material
      const material = new THREE.MeshStandardMaterial({
        color: modelColor,
        roughness: 0.5,
        metalness: 0.3,
      });

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Add to scene
      sceneRef.current.add(mesh);
      meshRef.current = mesh;

      console.log("Mesh added to scene, centering and scaling...");

      // Center and scale
      centerAndScale(mesh);

      console.log("Model loaded successfully!");
      setIsUploading(false);
      setUploadProgress(0);
    } catch (err) {
      console.error("Error loading STL:", err);
      setError(
        `Invalid STL file: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setIsUploading(false);
      setUploadProgress(0);
      setViewerActive(false);
    }
  }

  /**
   * Simulates upload progress
   */
  function simulateUploadProgress(callback: () => void) {
    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(callback, 200);
      } else {
        setUploadProgress(Math.min(progress, 95));
      }
    }, 100);
  }

  /**
   * Handles file upload from input or drop
   */
  function handleFileUpload(file: File) {
    if (!file.name.toLowerCase().endsWith(".stl")) {
      setError("Only STL files are supported");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File too large (max 50MB)");
      return;
    }

    setCurrentFile(file.name);
    simulateUploadProgress(() => {
      loadModel(file);
    });
  }

  /**
   * Handles demo file selection (click or drag)
   */
  async function handleDemoFile(demoFile: (typeof DEMO_FILES)[0]) {
    setCurrentFile(demoFile.name);
    setError("");
    simulateUploadProgress(async () => {
      try {
        // Encode the URL to handle spaces and special characters
        const encodedUrl = encodeURI(demoFile.url);
        console.log("Fetching demo file:", encodedUrl);

        const response = await fetch(encodedUrl);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch demo file: ${response.status} ${response.statusText}`,
          );
        }
        const arrayBuffer = await response.arrayBuffer();
        console.log("Demo file loaded, size:", arrayBuffer.byteLength);
        await loadModel(arrayBuffer);
      } catch (err) {
        console.error("Error loading demo file:", err);
        setError("Failed to load demo file. Please try another one.");
        setIsUploading(false);
        setUploadProgress(0);
      }
    });
  }

  /**
   * Drag and drop handlers
   */
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Check if it's a demo file
    const demoId = e.dataTransfer.getData("demo-file-id");
    if (demoId) {
      const demoFile = DEMO_FILES.find((f) => f.id === demoId);
      if (demoFile) {
        handleDemoFile(demoFile);
        return;
      }
    }

    // Handle regular file drop
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }

  /**
   * Reset viewer to upload state
   */
  function resetViewer() {
    setViewerActive(false);
    setCurrentFile("");
    setModelScale(1);
    setError("");
    if (meshRef.current && sceneRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current = null;
    }
  }

  /**
   * Reset camera view
   */
  function resetView() {
    if (meshRef.current && cameraRef.current && controlsRef.current) {
      centerAndScale(meshRef.current);
    }
  }

  return (
    <section id="demo" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Try It Yourself
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your STL file or try one of our demo models
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* LEFT PANEL - Demo STL Library */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Demo Files
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Click to load or drag to upload area
            </p>

            <div className="space-y-3">
              {DEMO_FILES.map((file) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("demo-file-id", file.id);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => handleDemoFile(file)}
                  className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-forge-500 cursor-pointer transition-all hover:shadow-lg active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {file.thumbnail ? (
                        <img
                          src={file.thumbnail}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-2xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {file.name}
                      </h4>
                      <p className="text-xs text-gray-500">STL File</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL - Upload Area / Viewer */}
          <div className="relative">
            {!viewerActive ? (
              /* UPLOAD AREA */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer min-h-[500px] flex flex-col items-center justify-center ${
                  isDragging
                    ? "border-forge-500 bg-forge-50 scale-[1.02]"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".stl"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileUpload(files[0]);
                    }
                  }}
                  className="hidden"
                />

                {!isUploading ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Upload className="w-10 h-10 text-forge-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Drag & drop STL files here
                    </h3>
                    <p className="text-gray-600 mb-6">or click to upload</p>
                    <div className="inline-block px-6 py-3 bg-gradient-to-r from-forge-500 to-forge-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-forge-500/25 transition-all">
                      Choose File
                    </div>
                    <p className="text-sm text-gray-500 mt-8">
                      Accepted formats: .stl
                    </p>
                  </>
                ) : (
                  /* UPLOAD PROGRESS */
                  <div className="w-full max-w-md">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Uploading...
                        </span>
                        <span className="text-sm font-semibold text-forge-600">
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-forge-500 to-forge-600 transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{currentFile}</p>
                  </div>
                )}

                {error && (
                  <div className="mt-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              /* 3D VIEWER */
              <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                {/* Viewer Header */}
                <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-gray-400 truncate max-w-xs">
                    {currentFile}
                  </span>
                  <button
                    onClick={resetView}
                    className="text-gray-400 hover:text-white p-1 transition-colors"
                    title="Reset view"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Three.js Canvas */}
                <div
                  ref={canvasContainerRef}
                  className="w-full aspect-[4/3] bg-gray-900"
                />

                {/* Viewer Controls */}
                <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Color Picker */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <Palette className="w-4 h-4" />
                        Model Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={modelColor}
                          onChange={(e) => setModelColor(e.target.value)}
                          className="w-12 h-10 rounded border-2 border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={modelColor}
                          onChange={(e) => setModelColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          placeholder="#ed7420"
                        />
                      </div>
                    </div>

                    {/* Scale Control */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Scale: {modelScale.toFixed(2)}x
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={modelScale}
                        onChange={(e) =>
                          setModelScale(parseFloat(e.target.value))
                        }
                        className="w-full h-10 accent-forge-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1x</span>
                        <span>3x</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={resetViewer}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Upload New File
                    </button>
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-forge-500 to-forge-600 hover:shadow-lg hover:shadow-forge-500/25 text-white font-semibold rounded-lg transition-all">
                      Continue to Quote
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
