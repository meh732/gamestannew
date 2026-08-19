import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeDice3DProps {
  value: number;
  isRolling: boolean;
  size?: number; // Size in px
  onClick?: () => void;
  className?: string;
}

// Generate canvas texture for a dice face with luxury gold pips
function createDiceFaceTexture(value: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background: Deep Royal Crimson / Obsidian Gradient
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 160);
  grad.addColorStop(0, '#1c150e');
  grad.addColorStop(1, '#090705');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Luxury Gold Filigree Border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 14;
  ctx.strokeRect(12, 12, 232, 232);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 22, 212, 212);

  // Draw Gold Pips
  const drawPip = (x: number, y: number) => {
    // Outer glow
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;

    const pipGrad = ctx.createRadialGradient(x, y, 4, x, y, 22);
    pipGrad.addColorStop(0, '#fffbeb');
    pipGrad.addColorStop(0.4, '#fbbf24');
    pipGrad.addColorStop(1, '#b45309');

    ctx.fillStyle = pipGrad;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  };

  const c = 128;
  const l = 68;
  const r = 188;
  const t = 68;
  const b = 188;

  switch (value) {
    case 1:
      drawPip(c, c);
      break;
    case 2:
      drawPip(l, t);
      drawPip(r, b);
      break;
    case 3:
      drawPip(l, t);
      drawPip(c, c);
      drawPip(r, b);
      break;
    case 4:
      drawPip(l, t);
      drawPip(r, t);
      drawPip(l, b);
      drawPip(r, b);
      break;
    case 5:
      drawPip(l, t);
      drawPip(r, t);
      drawPip(c, c);
      drawPip(l, b);
      drawPip(r, b);
      break;
    case 6:
      drawPip(l, t);
      drawPip(l, c);
      drawPip(l, b);
      drawPip(r, t);
      drawPip(r, c);
      drawPip(r, b);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Map dice face values (1..6) to box material index [Right, Left, Top, Bottom, Front, Back]
// Right: 1, Left: 6, Top: 2, Bottom: 5, Front: 3, Back: 4
const FACE_ROTATIONS: Record<number, { x: number; y: number; z: number }> = {
  1: { x: 0, y: -Math.PI / 2, z: 0 },
  2: { x: Math.PI / 2, y: 0, z: 0 },
  3: { x: 0, y: 0, z: 0 },
  4: { x: 0, y: Math.PI, z: 0 },
  5: { x: -Math.PI / 2, y: 0, z: 0 },
  6: { x: 0, y: Math.PI / 2, z: 0 },
};

export const ThreeDice3D: React.FC<ThreeDice3DProps> = ({
  value,
  isRolling,
  size = 120,
  onClick,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const diceMeshRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const isRollingRef = useRef<boolean>(isRolling);

  isRollingRef.current = isRolling;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfbbf24, 2.0);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);

    const backLight = new THREE.PointLight(0x06b6d4, 1.0, 10);
    backLight.position.set(-3, -2, 2);
    scene.add(backLight);

    // Create 6 Texture Materials for 6 Faces
    // Standard dice geometry faces: [0: +X (1), 1: -X (6), 2: +Y (2), 3: -Y (5), 4: +Z (3), 5: -Z (4)]
    const materials = [
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(1), roughness: 0.25, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(6), roughness: 0.25, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(2), roughness: 0.25, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(5), roughness: 0.25, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(3), roughness: 0.25, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(4), roughness: 0.25, metalness: 0.1 }),
    ];

    // Dice Geometry with bevel-like chamfer
    const geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const diceMesh = new THREE.Mesh(geometry, materials);
    diceMesh.castShadow = true;
    scene.add(diceMesh);
    diceMeshRef.current = diceMesh;

    // Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (diceMeshRef.current) {
        if (isRollingRef.current) {
          // Rapid physics rotation while rolling
          diceMeshRef.current.rotation.x += 0.35;
          diceMeshRef.current.rotation.y += 0.45;
          diceMeshRef.current.rotation.z += 0.25;
        } else {
          // Smoothly interpolate (slerp) to target face rotation
          const target = targetRotationRef.current;
          diceMeshRef.current.rotation.x += (target.x - diceMeshRef.current.rotation.x) * 0.18;
          diceMeshRef.current.rotation.y += (target.y - diceMeshRef.current.rotation.y) * 0.18;
          diceMeshRef.current.rotation.z += (target.z - diceMeshRef.current.rotation.z) * 0.18;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      geometry.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  // Update target rotation when value or rolling state changes
  useEffect(() => {
    if (FACE_ROTATIONS[value]) {
      targetRotationRef.current = FACE_ROTATIONS[value];
    }
  }, [value, isRolling]);

  return (
    <div
      ref={mountRef}
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center cursor-pointer select-none gpu-layer ${className}`}
    />
  );
};
