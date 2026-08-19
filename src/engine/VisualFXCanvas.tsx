import React, { useEffect, useRef } from 'react';
import { gfx } from './GraphicsEngine';

export const VisualFXCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      gfx.init(canvasRef.current);
    }
    return () => {
      gfx.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="global-visual-fx-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-50 gpu-layer"
      style={{ touchAction: 'none' }}
    />
  );
};
