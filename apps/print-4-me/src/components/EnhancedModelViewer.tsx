/**
 * Enhanced STL Model Viewer with Resize Controls
 * Full-featured 3D viewer for STL files with dimension display,
 * scaling controls, and build volume visualization
 */

"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Maximize2,
  RotateCw,
  Ruler,
  AlertTriangle,
  CheckCircle,
  Minimize2,
} from "lucide-react";
import type { ModelDimensions, ValidationResult } from "@/types/model";
import {
  calculateBoundingBox,
  calculateMeshDimensions,
  validateModelSize,
  calculateScaleToFit,
  applyScaleToDimensions,
  formatDimensions,
  formatScalePercentage,
  createBuildVolumeHelper,
  DEFAULT_BUILD_VOLUME,
  isLikelyInches,
  inchesToMm,
} from "@/lib/stl-utils";

interface EnhancedModelViewerProps {
  /** URL or path to STL file */
  modelUrl: string;
  /** Callback when dimensions change */
  onDimensionsChange?: (
    dimensions: ModelDimensions,
    scaleFactor: number,
  ) => void;
  /** Callback when model is loaded */
  onModelLoaded?: (originalDimensions: ModelDimensions) => void;
  /** Callback when validation changes */
  onValidationChange?: (validation: ValidationResult) => void;
  /** Initial scale factor */
  initialScale?: number;
  /** Show build volume */
  showBuildVolume?: boolean;
  /** Custom build volume */
  buildVolume?: typeof DEFAULT_BUILD_VOLUME;
  /** Container class name */
  className?: string;
}

export default function EnhancedModelViewer({
  modelUrl,
  onDimensionsChange,
  onModelLoaded,
  onValidationChange,
  initialScale = 1.0,
  showBuildVolume = true,
  buildVolume = DEFAULT_BUILD_VOLUME,
  className = "",
}: EnhancedModelViewerProps) {
  // Refs for Three.js objects
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const buildVolumeRef = useRef<THREE.LineSegments | null>(null);

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [originalDimensions, setOriginalDimensions] =
    useState<ModelDimensions | null>(null);
  const [currentDimensions, setCurrentDimensions] =
    useState<ModelDimensions | null>(null);
  const [scaleFactor, setScaleFactor] = useState(initialScale);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [scaleInput, setScaleInput] = useState("100");
  const [dimensionInputs, setDimensionInputs] = useState({
    x: "",
    y: "",
    z: "",
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      5000,
    );
    camera.position.set(200, 200, 200);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 1000;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(200, 200, 100);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-100, -100, -50);
    scene.add(directionalLight2);

    // Grid helper
    const gridHelper = new THREE.GridHelper(500, 50, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Axis helper
    const axisHelper = new THREE.AxesHelper(100);
    scene.add(axisHelper);

    // Build volume helper
    if (showBuildVolume) {
      const volumeHelper = createBuildVolumeHelper(buildVolume);
      buildVolumeRef.current = volumeHelper;
      scene.add(volumeHelper);
    }

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
      );
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      controls.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [showBuildVolume, buildVolume]);

  // Load STL model
  useEffect(() => {
    if (!sceneRef.current || !modelUrl) return;

    setLoading(true);
    setError("");

    const loader = new STLLoader();
    loader.load(
      modelUrl,
      (geometry) => {
        // Remove old mesh if exists
        if (meshRef.current) {
          sceneRef.current!.remove(meshRef.current);
          meshRef.current.geometry.dispose();
          (meshRef.current.material as THREE.Material).dispose();
        }

        // Calculate original dimensions
        let dims = calculateBoundingBox(geometry).size;

        // Check if likely in inches
        if (isLikelyInches(dims)) {
          dims = inchesToMm(dims);
          // Scale geometry
          geometry.scale(25.4, 25.4, 25.4);
        }

        setOriginalDimensions(dims);
        setCurrentDimensions(dims);
        setDimensionInputs({
          x: dims.x.toFixed(2),
          y: dims.y.toFixed(2),
          z: dims.z.toFixed(2),
        });

        // Validate
        const validationResult = validateModelSize(dims, buildVolume);
        setValidation(validationResult);

        // Create mesh
        const material = new THREE.MeshPhongMaterial({
          color: 0xed7420,
          specular: 0x111111,
          shininess: 200,
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Center mesh
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;
        const center = new THREE.Vector3(
          (bbox.min.x + bbox.max.x) / 2,
          (bbox.min.y + bbox.max.y) / 2,
          (bbox.min.z + bbox.max.z) / 2,
        );
        mesh.position.set(-center.x, -center.y, -center.z);

        meshRef.current = mesh;
        sceneRef.current!.add(mesh);

        // Callbacks
        onModelLoaded?.(dims);
        onValidationChange?.(validationResult);

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error("Error loading STL:", err);
        setError("Failed to load 3D model");
        setLoading(false);
      },
    );
  }, [modelUrl, buildVolume, onModelLoaded, onValidationChange]);

  // Apply scale to mesh
  const applyScale = (newScaleFactor: number) => {
    if (!meshRef.current || !originalDimensions) return;

    meshRef.current.scale.set(newScaleFactor, newScaleFactor, newScaleFactor);
    const newDims = applyScaleToDimensions(originalDimensions, newScaleFactor);
    setCurrentDimensions(newDims);
    setScaleFactor(newScaleFactor);
    setScaleInput((newScaleFactor * 100).toFixed(0));

    // Update dimension inputs
    setDimensionInputs({
      x: newDims.x.toFixed(2),
      y: newDims.y.toFixed(2),
      z: newDims.z.toFixed(2),
    });

    // Validate
    const validationResult = validateModelSize(newDims, buildVolume);
    setValidation(validationResult);

    // Callbacks
    onDimensionsChange?.(newDims, newScaleFactor);
    onValidationChange?.(validationResult);
  };

  // Handle scale percentage input
  const handleScalePercentageChange = (value: string) => {
    setScaleInput(value);
    const percentage = parseFloat(value);
    if (!isNaN(percentage) && percentage > 0) {
      applyScale(percentage / 100);
    }
  };

  // Handle dimension input change
  const handleDimensionChange = (axis: "x" | "y" | "z", value: string) => {
    setDimensionInputs((prev) => ({ ...prev, [axis]: value }));

    if (!originalDimensions) return;

    const targetValue = parseFloat(value);
    if (isNaN(targetValue) || targetValue <= 0) return;

    // Calculate scale factor based on this axis
    const newScaleFactor = targetValue / originalDimensions[axis];

    if (lockAspectRatio) {
      applyScale(newScaleFactor);
    } else {
      // Non-uniform scaling not implemented in this version
      // Would require separate scale factors for each axis
      console.warn("Non-uniform scaling not yet supported");
    }
  };

  // Scale to fit printer
  const handleScaleToFit = () => {
    if (!originalDimensions) return;
    const fitScale = calculateScaleToFit(originalDimensions, buildVolume);
    applyScale(fitScale);
  };

  // Reset scale
  const handleResetScale = () => {
    applyScale(1.0);
  };

  // Preset scales
  const presetScales = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Viewer Container */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
        <div ref={containerRef} className="w-full h-[600px]" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-white text-lg">Loading model...</div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        )}

        {/* Validation Badge */}
        {validation && (
          <div className="absolute top-4 right-4">
            {validation.fitsInBuildVolume ? (
              <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Fits in build volume</span>
              </div>
            ) : (
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Exceeds build volume!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Dimensions Display */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-forge-500" />
            Model Dimensions
          </h3>

          <div className="space-y-4">
            {/* Current dimensions */}
            {currentDimensions && (
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  Current Size (mm)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["x", "y", "z"] as const).map((axis) => (
                    <div key={axis}>
                      <label className="text-xs text-gray-500 uppercase">
                        {axis}
                      </label>
                      <input
                        type="number"
                        value={dimensionInputs[axis]}
                        onChange={(e) =>
                          handleDimensionChange(axis, e.target.value)
                        }
                        disabled={!lockAspectRatio}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        step="0.1"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {formatDimensions(currentDimensions)}
                </div>
              </div>
            )}

            {/* Original dimensions */}
            {originalDimensions && (
              <div className="text-sm text-gray-500">
                Original: {formatDimensions(originalDimensions)}
              </div>
            )}

            {/* Build volume */}
            <div className="text-sm text-gray-500 pt-2 border-t">
              Build Volume: {buildVolume.x} × {buildVolume.y} × {buildVolume.z}{" "}
              mm
            </div>

            {/* Lock aspect ratio */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lockAspectRatio}
                onChange={(e) => setLockAspectRatio(e.target.checked)}
                className="w-4 h-4 text-forge-500 rounded"
              />
              <span className="text-sm text-gray-700">Lock aspect ratio</span>
            </label>
          </div>
        </div>

        {/* Scale Controls */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-flow-500" />
            Scale Controls
          </h3>

          <div className="space-y-4">
            {/* Scale percentage input */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Scale Percentage
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={scaleInput}
                  onChange={(e) => handleScalePercentageChange(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono"
                  min="1"
                  step="1"
                />
                <span className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
                  %
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Current: {formatScalePercentage(scaleFactor)}
              </div>
            </div>

            {/* Preset scales */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {presetScales.map((scale) => (
                  <button
                    key={scale}
                    onClick={() => applyScale(scale)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      Math.abs(scaleFactor - scale) < 0.01
                        ? "bg-forge-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {formatScalePercentage(scale)}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2 border-t">
              {validation && !validation.fitsInBuildVolume && (
                <button
                  onClick={handleScaleToFit}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                  Scale to Fit Printer
                </button>
              )}
              <button
                onClick={handleResetScale}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                Reset to Original
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {validation && !validation.fitsInBuildVolume && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">
                Model Too Large
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
              {validation.suggestedScaleFactor && (
                <p className="text-sm text-red-700 mt-2">
                  Suggested scale:{" "}
                  {formatScalePercentage(validation.suggestedScaleFactor)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
