/// <reference types="@react-three/fiber" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      meshBasicMaterial: any;
      bufferGeometry: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      primitive: any;
    }
  }
}

export {};
