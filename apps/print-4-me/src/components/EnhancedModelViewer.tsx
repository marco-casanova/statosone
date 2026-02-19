/**
 * Enhanced STL Model Viewer with Resize Controls
 * Full-featured 3D viewer for STL files with dimension display,
 * scaling controls, and build volume visualization
 */

"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
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
  /** File type */
  fileType?: "stl" | "obj";
  /** Preview color */
  modelColor?: string;
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
  fileType = "stl",
  modelColor = "#ed7420",
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
  const modelRef = useRef<THREE.Object3D | null>(null);
  const buildVolumeRef = useRef<THREE.LineSegments | null>(null);
  const modelBoundingBoxRef = useRef<THREE.Group | null>(null);

  // State
  const [sceneReady, setSceneReady] = useState(false);
  const [loading, setLoading] = useState(false);
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
  // cm inputs for width/depth/height
  const [cmInputs, setCmInputs] = useState({
    width: "",
    depth: "",
    height: "",
  });
  const [showBoundingBoxMeasure, setShowBoundingBoxMeasure] = useState(true);

  function disposeObject3D(object: THREE.Object3D) {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.geometry?.dispose();

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      materials.forEach((material) => material?.dispose());
    });
  }

  function applyColor(object: THREE.Object3D, colorHex: string) {
    const color = new THREE.Color(colorHex);

    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const oldMaterials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      oldMaterials.forEach((material) => material?.dispose());

      mesh.material = new THREE.MeshPhongMaterial({
        color,
        specular: 0x111111,
        shininess: 200,
      });
    });
  }

  function getObjectDimensions(object: THREE.Object3D): ModelDimensions {
    const bounds = new THREE.Box3().setFromObject(object);
    const size = bounds.getSize(new THREE.Vector3());
    return {
      x: size.x,
      y: size.y,
      z: size.z,
    };
  }

  /** Create a text sprite for dimension labels */
  function createTextSprite(text: string, color = "#ffffff"): THREE.Sprite {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = 256;
    canvas.height = 64;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Background pill
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.font = "bold 24px monospace";
    const textWidth = ctx.measureText(text).width;
    const pillW = Math.min(canvas.width, Math.max(100, textWidth + 40));
    const pillH = 40;
    const pillX = (canvas.width - pillW) / 2;
    const pillY = (canvas.height - pillH) / 2;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 8);
    ctx.fill();
    // Text
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(60, 15, 1);
    return sprite;
  }

  /** Create a measurement line between two points */
  function createMeasurementLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    color: number,
  ): THREE.Group {
    const group = new THREE.Group();

    // Dashed line
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color,
      dashSize: 3,
      gapSize: 2,
      linewidth: 1,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    group.add(line);

    // End caps (small perpendicular lines)
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const perpA = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(3);

    for (const pt of [start, end]) {
      const capGeom = new THREE.BufferGeometry().setFromPoints([
        pt.clone().add(perpA.clone().negate()),
        pt.clone().add(perpA),
      ]);
      const capLine = new THREE.Line(
        capGeom,
        new THREE.LineBasicMaterial({ color }),
      );
      group.add(capLine);
    }

    return group;
  }

  /** Build/update the model bounding box with cm dimension labels */
  function updateModelBoundingBox(dims: ModelDimensions) {
    if (!sceneRef.current) return;

    // Remove existing
    if (modelBoundingBoxRef.current) {
      sceneRef.current.remove(modelBoundingBoxRef.current);
      modelBoundingBoxRef.current = null;
    }

    if (!showBoundingBoxMeasure) return;

    const group = new THREE.Group();

    const w = dims.x; // width (X)
    const d = dims.y; // depth (Y)
    const h = dims.z; // height (Z)

    // Wireframe cube centered on origin, bottom at y=0 if model is centered
    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00ccff,
      opacity: 0.6,
      transparent: true,
    });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    group.add(wireframe);

    // Convert to cm for labels
    const wCm = (w / 10).toFixed(1);
    const dCm = (d / 10).toFixed(1);
    const hCm = (h / 10).toFixed(1);

    // Measurement offset from the box
    const offset = 15;

    // Width label (X axis) — along bottom front edge
    const widthLabel = createTextSprite(`${wCm} cm`, "#ff6666");
    widthLabel.position.set(0, -h / 2 - offset, d / 2 + offset);
    group.add(widthLabel);

    // Width measurement line
    const widthLine = createMeasurementLine(
      new THREE.Vector3(-w / 2, -h / 2 - offset / 2, d / 2 + offset / 2),
      new THREE.Vector3(w / 2, -h / 2 - offset / 2, d / 2 + offset / 2),
      0xff6666,
    );
    group.add(widthLine);

    // Depth label (Z in three.js / Y in model dims) — along bottom right edge
    const depthLabel = createTextSprite(`${dCm} cm`, "#66ff66");
    depthLabel.position.set(w / 2 + offset, -h / 2 - offset, 0);
    group.add(depthLabel);

    // Depth measurement line
    const depthLine = createMeasurementLine(
      new THREE.Vector3(w / 2 + offset / 2, -h / 2 - offset / 2, -d / 2),
      new THREE.Vector3(w / 2 + offset / 2, -h / 2 - offset / 2, d / 2),
      0x66ff66,
    );
    group.add(depthLine);

    // Height label (Y in three.js / Z in model dims) — along right front vertical edge
    const heightLabel = createTextSprite(`${hCm} cm`, "#6666ff");
    heightLabel.position.set(w / 2 + offset, 0, d / 2 + offset);
    group.add(heightLabel);

    // Height measurement line
    const heightLine = createMeasurementLine(
      new THREE.Vector3(w / 2 + offset / 2, -h / 2, d / 2 + offset / 2),
      new THREE.Vector3(w / 2 + offset / 2, h / 2, d / 2 + offset / 2),
      0x6666ff,
    );
    group.add(heightLine);

    modelBoundingBoxRef.current = group;
    sceneRef.current.add(group);
  }

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

    // Mark scene as ready for model loading
    setSceneReady(true);

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
      if (modelRef.current) {
        scene.remove(modelRef.current);
        disposeObject3D(modelRef.current);
        modelRef.current = null;
      }
      if (modelBoundingBoxRef.current) {
        scene.remove(modelBoundingBoxRef.current);
        modelBoundingBoxRef.current = null;
      }
      renderer.dispose();
      controls.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [showBuildVolume, buildVolume]);

  // Load model (STL/OBJ)
  useEffect(() => {
    if (!sceneReady || !sceneRef.current || !modelUrl) return;

    setLoading(true);
    setError("");
    const scene = sceneRef.current;

    const removePreviousModel = () => {
      if (!modelRef.current) return;
      scene.remove(modelRef.current);
      disposeObject3D(modelRef.current);
      modelRef.current = null;
    };

    const finishModelSetup = (
      object: THREE.Object3D,
      baseDimensions?: ModelDimensions,
    ) => {
      removePreviousModel();

      let dims = baseDimensions || getObjectDimensions(object);
      if (isLikelyInches(dims)) {
        object.scale.multiplyScalar(25.4);
        dims = baseDimensions ? inchesToMm(dims) : getObjectDimensions(object);
      }

      // Rotate STL/OBJ from Z-up (CAD convention) to Y-up (Three.js convention)
      // so the model stands upright instead of tilting on its side
      object.rotation.x = -Math.PI / 2;
      object.updateMatrixWorld(true);

      // Center the model at origin after rotation
      const bounds = new THREE.Box3().setFromObject(object);
      const center = bounds.getCenter(new THREE.Vector3());
      object.position.sub(center);
      // Sit model on the grid (bottom at y=0)
      const size = bounds.getSize(new THREE.Vector3());
      object.position.y += size.y / 2;

      applyColor(object, modelColor);
      modelRef.current = object;
      scene.add(object);

      const startScale = initialScale > 0 ? initialScale : 1;
      object.scale.set(startScale, startScale, startScale);
      const scaledDims = applyScaleToDimensions(dims, startScale);

      setOriginalDimensions(dims);
      setCurrentDimensions(scaledDims);
      setScaleFactor(startScale);
      setScaleInput((startScale * 100).toFixed(0));
      setDimensionInputs({
        x: scaledDims.x.toFixed(2),
        y: scaledDims.y.toFixed(2),
        z: scaledDims.z.toFixed(2),
      });
      setCmInputs({
        width: (scaledDims.x / 10).toFixed(2),
        depth: (scaledDims.y / 10).toFixed(2),
        height: (scaledDims.z / 10).toFixed(2),
      });

      const validationResult = validateModelSize(scaledDims, buildVolume);
      setValidation(validationResult);
      updateModelBoundingBox(scaledDims);

      onModelLoaded?.(dims);
      onDimensionsChange?.(scaledDims, startScale);
      onValidationChange?.(validationResult);
      setLoading(false);
    };

    if (fileType === "obj") {
      const loader = new OBJLoader();
      loader.load(
        modelUrl,
        (object) => {
          finishModelSetup(object);
        },
        undefined,
        (err) => {
          console.error("Error loading OBJ:", err);
          setError("Failed to load 3D model");
          setLoading(false);
        },
      );
      return;
    }

    const loader = new STLLoader();
    loader.load(
      modelUrl,
      (geometry) => {
        let dims = calculateBoundingBox(geometry).size;
        if (isLikelyInches(dims)) {
          geometry.scale(25.4, 25.4, 25.4);
          dims = inchesToMm(dims);
        }

        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshPhongMaterial({
            color: 0xed7420,
            specular: 0x111111,
            shininess: 200,
          }),
        );
        finishModelSetup(mesh, dims);
      },
      undefined,
      (err) => {
        console.error("Error loading STL:", err);
        setError("Failed to load 3D model");
        setLoading(false);
      },
    );
  }, [
    sceneReady,
    modelUrl,
    fileType,
    initialScale,
    buildVolume,
    onModelLoaded,
    onDimensionsChange,
    onValidationChange,
  ]);

  // Apply preview color without reloading geometry
  useEffect(() => {
    if (!modelRef.current) return;
    applyColor(modelRef.current, modelColor);
  }, [modelColor]);

  // Apply scale to mesh
  const applyScale = (newScaleFactor: number) => {
    if (!modelRef.current || !originalDimensions) return;

    modelRef.current.scale.set(newScaleFactor, newScaleFactor, newScaleFactor);
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

    // Update cm inputs
    setCmInputs({
      width: (newDims.x / 10).toFixed(2),
      depth: (newDims.y / 10).toFixed(2),
      height: (newDims.z / 10).toFixed(2),
    });

    // Update bounding box
    updateModelBoundingBox(newDims);

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
      console.warn("Non-uniform scaling not yet supported");
    }
  };

  // Handle cm dimension input change
  const handleCmDimensionChange = (
    dim: "width" | "depth" | "height",
    value: string,
  ) => {
    setCmInputs((prev) => ({ ...prev, [dim]: value }));

    if (!originalDimensions) return;

    const targetCm = parseFloat(value);
    if (isNaN(targetCm) || targetCm <= 0) return;

    // Convert cm to mm
    const targetMm = targetCm * 10;

    // Map dim to axis
    const axisMap: Record<string, "x" | "y" | "z"> = {
      width: "x",
      depth: "y",
      height: "z",
    };
    const axis = axisMap[dim];

    const newScaleFactor = targetMm / originalDimensions[axis];

    if (lockAspectRatio) {
      applyScale(newScaleFactor);
    } else {
      console.warn("Non-uniform scaling not yet supported");
    }
  };

  // Rebuild bounding box when toggle changes
  useEffect(() => {
    if (currentDimensions) {
      updateModelBoundingBox(currentDimensions);
    }
  }, [showBoundingBoxMeasure]);

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
        <div ref={containerRef} className="w-full h-150" />

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
            {/* Width / Depth / Height in cm */}
            {currentDimensions && (
              <div>
                <div className="text-sm text-gray-600 mb-2 font-semibold">
                  Size (cm)
                </div>
                <div className="space-y-2">
                  {[
                    {
                      key: "width" as const,
                      label: "Width",
                      color: "text-red-500",
                      borderColor: "border-red-300 focus:border-red-500",
                    },
                    {
                      key: "depth" as const,
                      label: "Depth",
                      color: "text-green-500",
                      borderColor: "border-green-300 focus:border-green-500",
                    },
                    {
                      key: "height" as const,
                      label: "Height",
                      color: "text-blue-500",
                      borderColor: "border-blue-300 focus:border-blue-500",
                    },
                  ].map(({ key, label, color, borderColor }) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className={`text-sm font-semibold w-14 ${color}`}>
                        {label}
                      </label>
                      <input
                        type="number"
                        value={cmInputs[key]}
                        onChange={(e) =>
                          handleCmDimensionChange(key, e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm font-mono ${borderColor} focus:outline-none focus:ring-1`}
                        step="0.1"
                        min="0"
                      />
                      <span className="text-xs text-gray-400 w-6">cm</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current dimensions in mm (compact) */}
            {currentDimensions && (
              <div className="text-sm text-gray-500 pt-2 border-t">
                <span className="font-medium text-gray-600">mm:</span>{" "}
                {formatDimensions(currentDimensions)}
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

            {/* Show bounding box measurements */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showBoundingBoxMeasure}
                onChange={(e) => setShowBoundingBoxMeasure(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded"
              />
              <span className="text-sm text-gray-700">
                Show dimension guides
              </span>
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
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
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
