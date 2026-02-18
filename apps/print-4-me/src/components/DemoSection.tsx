"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  RotateCw,
  Palette,
  Ruler,
  AlertTriangle,
  CheckCircle,
  Minimize2,
} from "lucide-react";
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
  // Printer build volume in mm (max printable size)
  const BUILD_VOLUME = { x: 220, y: 220, z: 250 };

  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewerActive, setViewerActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [modelColor, setModelColor] = useState("#ed7420");
  const [modelScale, setModelScale] = useState(1);
  const [error, setError] = useState<string>("");

  // Dimensions state (in mm)
  const [originalDims, setOriginalDims] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);
  const [currentDims, setCurrentDims] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);
  const [cmInputs, setCmInputs] = useState({
    width: "",
    depth: "",
    height: "",
  });
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [exceedsBuildVolume, setExceedsBuildVolume] = useState(false);
  const [exceededAxes, setExceededAxes] = useState<string[]>([]);

  // Three.js refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const boundingBoxGroupRef = useRef<THREE.Group | null>(null);
  const originalDimsRef = useRef<{ x: number; y: number; z: number } | null>(
    null,
  );
  const buildVolumeBoxRef = useRef<THREE.LineSegments | null>(null);

  // Resize handle refs
  const handleMeshesRef = useRef<THREE.Mesh[]>([]);
  const isDraggingHandleRef = useRef(false);
  const dragStartRef = useRef<{ mouseY: number; scale: number } | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const hoveredHandleRef = useRef<THREE.Mesh | null>(null);

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

    // Build plate grid (sized to build volume)
    const gridHelper = new THREE.GridHelper(
      BUILD_VOLUME.x,
      22,
      0x444444,
      0x333333,
    );
    scene.add(gridHelper);

    // Printer build volume — red wireframe box with transparent faces
    const bvW = BUILD_VOLUME.x,
      bvD = BUILD_VOLUME.y,
      bvH = BUILD_VOLUME.z;
    const bvGeo = new THREE.BoxGeometry(bvW, bvH, bvD);

    // Semi-transparent red faces
    const bvFaceMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.04,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const bvFaceMesh = new THREE.Mesh(bvGeo, bvFaceMat);
    bvFaceMesh.position.y = bvH / 2;
    scene.add(bvFaceMesh);

    // Red wireframe edges
    const bvEdges = new THREE.EdgesGeometry(bvGeo);
    const bvLine = new THREE.LineSegments(
      bvEdges,
      new THREE.LineBasicMaterial({
        color: 0xff3333,
        opacity: 0.6,
        transparent: true,
      }),
    );
    bvLine.position.y = bvH / 2;
    scene.add(bvLine);
    buildVolumeBoxRef.current = bvLine;

    // Build volume dimension labels
    const bvLabelW = createBuildVolumeLabel(`${(bvW / 10).toFixed(0)} cm`);
    bvLabelW.position.set(0, -8, bvD / 2 + 15);
    scene.add(bvLabelW);

    const bvLabelD = createBuildVolumeLabel(`${(bvD / 10).toFixed(0)} cm`);
    bvLabelD.position.set(bvW / 2 + 15, -8, 0);
    scene.add(bvLabelD);

    const bvLabelH = createBuildVolumeLabel(`${(bvH / 10).toFixed(0)} cm`);
    bvLabelH.position.set(bvW / 2 + 15, bvH / 2, bvD / 2 + 15);
    scene.add(bvLabelH);

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
      // Update current dims based on scale
      if (originalDimsRef.current) {
        const newDims = {
          x: originalDimsRef.current.x * modelScale,
          y: originalDimsRef.current.y * modelScale,
          z: originalDimsRef.current.z * modelScale,
        };
        setCurrentDims(newDims);
        // dims.x=X(width), dims.y=Y(height in Three.js), dims.z=Z(depth in Three.js)
        setCmInputs({
          width: (newDims.x / 10).toFixed(2),
          height: (newDims.y / 10).toFixed(2),
          depth: (newDims.z / 10).toFixed(2),
        });
        // Check if exceeds build volume
        // BUILD_VOLUME: x=width, y=depth(printer), z=height(printer)
        // Three.js: X=width, Y=height, Z=depth
        const exceeded: string[] = [];
        if (newDims.x > BUILD_VOLUME.x) exceeded.push("W");
        if (newDims.y > BUILD_VOLUME.z) exceeded.push("H"); // dims.y (Three.js height) vs BV.z (printer height)
        if (newDims.z > BUILD_VOLUME.y) exceeded.push("D"); // dims.z (Three.js depth) vs BV.y (printer depth)
        setExceedsBuildVolume(exceeded.length > 0);
        setExceededAxes(exceeded);
        updateBoundingBox(newDims);
      }
    }
  }, [modelScale, showBoundingBox]);

  // Pointer events for interactive resize handles
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container || !viewerActive) return;

    function getNDC(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      return new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    }

    function pickHandle(ndc: THREE.Vector2): THREE.Mesh | null {
      if (!cameraRef.current || handleMeshesRef.current.length === 0)
        return null;
      raycasterRef.current.setFromCamera(ndc, cameraRef.current);
      const hits = raycasterRef.current.intersectObjects(
        handleMeshesRef.current,
      );
      return hits.length > 0 ? (hits[0].object as THREE.Mesh) : null;
    }

    function onPointerDown(e: PointerEvent) {
      const ndc = getNDC(e);
      const hit = pickHandle(ndc);
      if (hit) {
        e.stopPropagation();
        isDraggingHandleRef.current = true;
        dragStartRef.current = { mouseY: e.clientY, scale: modelScale };
        if (controlsRef.current) controlsRef.current.enabled = false;
        container!.style.cursor = "grabbing";
        container!.setPointerCapture(e.pointerId);
      }
    }

    function onPointerMove(e: PointerEvent) {
      const ndc = getNDC(e);

      if (isDraggingHandleRef.current && dragStartRef.current) {
        // Dragging: compute scale delta from vertical mouse movement
        const deltaY = dragStartRef.current.mouseY - e.clientY; // up = bigger
        const sensitivity = 0.005;
        const newScale = Math.max(
          0.05,
          dragStartRef.current.scale + deltaY * sensitivity,
        );
        setModelScale(newScale);
        return;
      }

      // Hover detection
      const hit = pickHandle(ndc);
      if (hit && hoveredHandleRef.current !== hit) {
        // Un-hover previous
        if (hoveredHandleRef.current) {
          (
            hoveredHandleRef.current.material as THREE.MeshBasicMaterial
          ).color.setHex(0xffcc00);
          hoveredHandleRef.current.scale.set(1, 1, 1);
        }
        hoveredHandleRef.current = hit;
        (hit.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
        hit.scale.set(1.3, 1.3, 1.3);
        container!.style.cursor = "grab";
      } else if (!hit && hoveredHandleRef.current) {
        (
          hoveredHandleRef.current.material as THREE.MeshBasicMaterial
        ).color.setHex(0xffcc00);
        hoveredHandleRef.current.scale.set(1, 1, 1);
        hoveredHandleRef.current = null;
        container!.style.cursor = "";
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (isDraggingHandleRef.current) {
        isDraggingHandleRef.current = false;
        dragStartRef.current = null;
        if (controlsRef.current) controlsRef.current.enabled = true;
        container!.style.cursor = "";
        container!.releasePointerCapture(e.pointerId);
      }
    }

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
    };
  }, [viewerActive, modelScale, showBoundingBox]);

  /** Create a red label sprite for build volume dimensions */
  function createBuildVolumeLabel(text: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = 192;
    canvas.height = 48;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "rgba(80, 0, 0, 0.7)";
    ctx.beginPath();
    ctx.roundRect(4, 4, canvas.width - 8, canvas.height - 8, 6);
    ctx.fill();
    ctx.fillStyle = "#ff5555";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(40, 10, 1);
    return sprite;
  }

  /** Create a text sprite for dimension labels */
  function createTextSprite(text: string, color = "#ffffff"): THREE.Sprite {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = 256;
    canvas.height = 64;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 24px monospace";
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    const textWidth = ctx.measureText(text).width;
    const pillW = Math.min(canvas.width, Math.max(100, textWidth + 40));
    const pillH = 40;
    const pillX = (canvas.width - pillW) / 2;
    const pillY = (canvas.height - pillH) / 2;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 8);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(50, 12.5, 1);
    return sprite;
  }

  /** Create a dashed measurement line between two points */
  function createMeasurementLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    color: number,
  ): THREE.Group {
    const group = new THREE.Group();
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color,
      dashSize: 3,
      gapSize: 2,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    group.add(line);
    // End caps
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(3);
    for (const pt of [start, end]) {
      const capGeom = new THREE.BufferGeometry().setFromPoints([
        pt.clone().add(perp.clone().negate()),
        pt.clone().add(perp),
      ]);
      group.add(
        new THREE.Line(capGeom, new THREE.LineBasicMaterial({ color })),
      );
    }
    return group;
  }

  /** Build/update bounding box with cm dimension labels */
  function updateBoundingBox(dims: { x: number; y: number; z: number }) {
    if (!sceneRef.current) return;
    // Remove old
    if (boundingBoxGroupRef.current) {
      sceneRef.current.remove(boundingBoxGroupRef.current);
      boundingBoxGroupRef.current = null;
    }
    if (!showBoundingBox) return;

    const group = new THREE.Group();
    // dims.x = Three.js X (width), dims.y = Three.js Y (height), dims.z = Three.js Z (depth)

    // Wireframe box matching geometry axes — bottom sits on Y=0
    const boxGeo = new THREE.BoxGeometry(dims.x, dims.y, dims.z);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const wireframe = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0x00ccff,
        opacity: 0.6,
        transparent: true,
      }),
    );
    wireframe.position.y = dims.y / 2; // lift so bottom is at Y=0
    group.add(wireframe);

    const wCm = (dims.x / 10).toFixed(1);
    const hCm = (dims.y / 10).toFixed(1);
    const dCm = (dims.z / 10).toFixed(1);
    const offset = Math.max(12, Math.max(dims.x, dims.y, dims.z) * 0.08);

    // Width label (X axis) — along bottom front edge at Y=0
    const widthLabel = createTextSprite(`W: ${wCm} cm`, "#ff6666");
    widthLabel.position.set(0, -offset, dims.z / 2 + offset);
    group.add(widthLabel);
    group.add(
      createMeasurementLine(
        new THREE.Vector3(-dims.x / 2, -offset / 2, dims.z / 2 + offset / 2),
        new THREE.Vector3(dims.x / 2, -offset / 2, dims.z / 2 + offset / 2),
        0xff6666,
      ),
    );

    // Depth label (Z axis) — along bottom right edge at Y=0
    const depthLabel = createTextSprite(`D: ${dCm} cm`, "#66ff66");
    depthLabel.position.set(dims.x / 2 + offset, -offset, 0);
    group.add(depthLabel);
    group.add(
      createMeasurementLine(
        new THREE.Vector3(dims.x / 2 + offset / 2, -offset / 2, -dims.z / 2),
        new THREE.Vector3(dims.x / 2 + offset / 2, -offset / 2, dims.z / 2),
        0x66ff66,
      ),
    );

    // Height label (Y axis) — along right front vertical edge from Y=0 to Y=dims.y
    const heightLabel = createTextSprite(`H: ${hCm} cm`, "#6666ff");
    heightLabel.position.set(
      dims.x / 2 + offset,
      dims.y / 2,
      dims.z / 2 + offset,
    );
    group.add(heightLabel);
    group.add(
      createMeasurementLine(
        new THREE.Vector3(dims.x / 2 + offset / 2, 0, dims.z / 2 + offset / 2),
        new THREE.Vector3(
          dims.x / 2 + offset / 2,
          dims.y,
          dims.z / 2 + offset / 2,
        ),
        0x6666ff,
      ),
    );

    boundingBoxGroupRef.current = group;
    sceneRef.current.add(group);

    // Create draggable corner handles
    createResizeHandles(dims);
  }

  /** Create interactive corner handles for drag-to-resize */
  function createResizeHandles(dims: { x: number; y: number; z: number }) {
    if (!sceneRef.current) return;

    // Remove old handles
    handleMeshesRef.current.forEach((h) => {
      sceneRef.current!.remove(h);
      h.geometry.dispose();
      (h.material as THREE.Material).dispose();
    });
    handleMeshesRef.current = [];

    if (!showBoundingBox) return;

    const halfW = dims.x / 2;
    const halfD = dims.z / 2;
    const h = dims.y;
    const handleSize = Math.max(6, Math.max(dims.x, dims.y, dims.z) * 0.04);

    // Place handles at all 8 corners of the bounding box
    const corners = [
      new THREE.Vector3(-halfW, 0, -halfD),
      new THREE.Vector3(halfW, 0, -halfD),
      new THREE.Vector3(halfW, 0, halfD),
      new THREE.Vector3(-halfW, 0, halfD),
      new THREE.Vector3(-halfW, h, -halfD),
      new THREE.Vector3(halfW, h, -halfD),
      new THREE.Vector3(halfW, h, halfD),
      new THREE.Vector3(-halfW, h, halfD),
    ];

    const handleGeo = new THREE.SphereGeometry(handleSize, 12, 12);
    const handleMat = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      depthTest: false,
    });

    corners.forEach((pos) => {
      const handle = new THREE.Mesh(handleGeo, handleMat.clone());
      handle.position.copy(pos);
      handle.userData.isResizeHandle = true;
      handle.renderOrder = 999;
      sceneRef.current!.add(handle);
      handleMeshesRef.current.push(handle);
    });
  }

  /** Handle cm input change — always proportional */
  function handleCmChange(dim: "width" | "depth" | "height", value: string) {
    setCmInputs((prev) => ({ ...prev, [dim]: value }));
    if (!originalDimsRef.current) return;
    const targetCm = parseFloat(value);
    if (isNaN(targetCm) || targetCm <= 0) return;
    const targetMm = targetCm * 10;
    // width=X, height=Y(Three.js up), depth=Z(Three.js forward)
    const axisMap: Record<string, "x" | "y" | "z"> = {
      width: "x",
      height: "y",
      depth: "z",
    };
    const axis = axisMap[dim];
    const newScale = targetMm / originalDimsRef.current[axis];
    // Always proportional scaling
    setModelScale(newScale);
  }

  /** Scale model down to fit the printer build volume */
  function scaleToFitBuildVolume() {
    if (!originalDimsRef.current) return;
    // BUILD_VOLUME: x=width, y=depth(printer), z=height(printer)
    // Three.js dims: x=width, y=height, z=depth
    const scaleX = BUILD_VOLUME.x / originalDimsRef.current.x;
    const scaleY = BUILD_VOLUME.z / originalDimsRef.current.y; // printer height vs Three.js Y
    const scaleZ = BUILD_VOLUME.y / originalDimsRef.current.z; // printer depth vs Three.js Z
    // Use smallest factor so it fits all axes, with 5% margin
    const fitScale = Math.min(scaleX, scaleY, scaleZ) * 0.95;
    setModelScale(fitScale);
  }

  /**
   * Centers the mesh inside the build volume (on the build plate)
   */
  function centerAndScale(mesh: THREE.Mesh) {
    if (!cameraRef.current || !controlsRef.current) return;

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Position model: centered in X/Z, sitting on the build plate (Y=0)
    mesh.position.set(
      -center.x,
      -box.min.y, // bottom of model at Y=0 (on the grid)
      -center.z,
    );

    // Camera: position to see the build volume nicely
    const bvMax = Math.max(BUILD_VOLUME.x, BUILD_VOLUME.y, BUILD_VOLUME.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(bvMax / Math.tan(fov / 2)) * 1.2;

    cameraRef.current.position.set(
      cameraDistance * 0.7,
      cameraDistance * 0.5,
      cameraDistance * 0.7,
    );
    // Look at center of build volume
    const lookTarget = new THREE.Vector3(0, BUILD_VOLUME.z / 3, 0);
    cameraRef.current.lookAt(lookTarget);
    controlsRef.current.target.copy(lookTarget);
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

      // Calculate original dimensions from raw geometry bounding box
      geometry.computeBoundingBox();
      const geoBBox = geometry.boundingBox!;
      const dims = {
        x: geoBBox.max.x - geoBBox.min.x,
        y: geoBBox.max.y - geoBBox.min.y,
        z: geoBBox.max.z - geoBBox.min.z,
      };
      console.log("Original STL dimensions (mm):", dims);
      originalDimsRef.current = dims;
      setOriginalDims(dims);
      setCurrentDims(dims);
      setCmInputs({
        width: (dims.x / 10).toFixed(2),
        height: (dims.y / 10).toFixed(2),
        depth: (dims.z / 10).toFixed(2),
      });
      setModelScale(1);

      // Check if original size exceeds build volume
      const exceeded: string[] = [];
      if (dims.x > BUILD_VOLUME.x) exceeded.push("W");
      if (dims.y > BUILD_VOLUME.z) exceeded.push("H"); // dims.y (Three.js height) vs BV.z (printer height)
      if (dims.z > BUILD_VOLUME.y) exceeded.push("D"); // dims.z (Three.js depth) vs BV.y (printer depth)
      setExceedsBuildVolume(exceeded.length > 0);
      setExceededAxes(exceeded);

      // Create bounding box
      updateBoundingBox(dims);

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
    setOriginalDims(null);
    setCurrentDims(null);
    setCmInputs({ width: "", depth: "", height: "" });
    setExceedsBuildVolume(false);
    setExceededAxes([]);
    originalDimsRef.current = null;
    if (boundingBoxGroupRef.current && sceneRef.current) {
      sceneRef.current.remove(boundingBoxGroupRef.current);
      boundingBoxGroupRef.current = null;
    }
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
                <div className="relative">
                  <div
                    ref={canvasContainerRef}
                    className="w-full aspect-[4/3] bg-gray-900"
                  />

                  {/* Alert overlay when model exceeds build volume */}
                  {exceedsBuildVolume && (
                    <div className="absolute top-0 left-0 right-0 z-10">
                      <div className="mx-4 mt-4 p-4 bg-red-600/95 backdrop-blur-sm rounded-xl shadow-2xl border border-red-400/50 animate-pulse-once">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">
                              ⚠️ Model Too Large to Print!
                            </h4>
                            <p className="text-red-100 text-xs mt-1">
                              The model exceeds the printer&apos;s build volume
                              ({exceededAxes.join(", ")}). Maximum printable
                              size is {(BUILD_VOLUME.x / 10).toFixed(0)} ×{" "}
                              {(BUILD_VOLUME.y / 10).toFixed(0)} ×{" "}
                              {(BUILD_VOLUME.z / 10).toFixed(0)} cm. Please
                              scale it down to fit.
                            </p>
                            <button
                              onClick={scaleToFitBuildVolume}
                              className="mt-2 px-4 py-1.5 bg-white text-red-700 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
                            >
                              <Minimize2 className="w-3.5 h-3.5" />
                              Auto-Scale to Fit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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

                  {/* Dimension Inputs (cm) */}
                  {currentDims && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <Ruler className="w-4 h-4" />
                          Dimensions (cm)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showBoundingBox}
                            onChange={(e) =>
                              setShowBoundingBox(e.target.checked)
                            }
                            className="w-3.5 h-3.5 accent-cyan-500 rounded"
                          />
                          <span className="text-xs text-gray-400">Guides</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            key: "width" as const,
                            label: "W",
                            color: "text-red-400",
                            border: "border-red-500/40 focus:border-red-400",
                          },
                          {
                            key: "depth" as const,
                            label: "D",
                            color: "text-green-400",
                            border:
                              "border-green-500/40 focus:border-green-400",
                          },
                          {
                            key: "height" as const,
                            label: "H",
                            color: "text-blue-400",
                            border: "border-blue-500/40 focus:border-blue-400",
                          },
                        ].map(({ key, label, color, border }) => (
                          <div key={key}>
                            <label
                              className={`text-xs font-bold ${color} block mb-1`}
                            >
                              {label}
                            </label>
                            <input
                              type="number"
                              value={cmInputs[key]}
                              onChange={(e) =>
                                handleCmChange(key, e.target.value)
                              }
                              className={`w-full px-2 py-1.5 bg-gray-700 border rounded text-white text-sm font-mono ${border} focus:outline-none focus:ring-1`}
                              step="0.1"
                              min="0.1"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Proportional scaling — changing any dimension adjusts
                        all others
                      </p>
                      {originalDims && (
                        <p className="text-xs text-gray-500 mt-1">
                          Original: {(originalDims.x / 10).toFixed(1)} ×{" "}
                          {(originalDims.y / 10).toFixed(1)} ×{" "}
                          {(originalDims.z / 10).toFixed(1)} cm
                        </p>
                      )}
                      {/* Build volume info */}
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400">
                          🖨️ Max print size: {(BUILD_VOLUME.x / 10).toFixed(0)}{" "}
                          × {(BUILD_VOLUME.y / 10).toFixed(0)} ×{" "}
                          {(BUILD_VOLUME.z / 10).toFixed(0)} cm
                        </p>
                      </div>
                      {/* Exceeds build volume warning */}
                      {exceedsBuildVolume ? (
                        <div className="mt-2 p-2 bg-red-900/40 border border-red-500/50 rounded-lg">
                          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Exceeds build volume ({exceededAxes.join(", ")})
                          </div>
                          <button
                            onClick={scaleToFitBuildVolume}
                            className="w-full mt-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Minimize2 className="w-3 h-3" />
                            Scale to Fit Printer
                          </button>
                        </div>
                      ) : (
                        currentDims && (
                          <div className="mt-2 flex items-center gap-1.5 text-green-400 text-xs">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Fits within build volume
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={resetViewer}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Upload New File
                    </button>
                    <button
                      disabled={exceedsBuildVolume}
                      className={`flex-1 px-4 py-2 text-white font-semibold rounded-lg transition-all ${
                        exceedsBuildVolume
                          ? "bg-gray-600 cursor-not-allowed opacity-50"
                          : "bg-gradient-to-r from-forge-500 to-forge-600 hover:shadow-lg hover:shadow-forge-500/25"
                      }`}
                    >
                      {exceedsBuildVolume
                        ? "Model Too Large"
                        : "Continue to Quote"}
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
