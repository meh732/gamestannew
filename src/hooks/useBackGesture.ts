import { useEffect, useRef } from 'react';
import { sounds } from '../utils/audio';

interface UseBackGestureOptions {
  enabled: boolean;
  onBack: () => void;
  edgeThreshold?: number;
  swipeDistance?: number;
}

export function useBackGesture({
  enabled,
  onBack,
  edgeThreshold = 50,
  swipeDistance = 70,
}: UseBackGestureOptions) {
  const touchStartRef = useRef<{ x: number; y: number; isEdge: boolean } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const screenWidth = window.innerWidth;

      // In RTL (Persian): Swiping from right edge inwards (x > screenWidth - 50)
      // Or in LTR: Swiping from left edge inwards (x < 50)
      const isRightEdge = touch.clientX > screenWidth - edgeThreshold;
      const isLeftEdge = touch.clientX < edgeThreshold;

      if (isRightEdge || isLeftEdge) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          isEdge: true,
        };
      } else {
        touchStartRef.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !touchStartRef.current.isEdge) return;
      if (e.changedTouches.length === 0) return;

      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchStartRef.current.x;
      const diffY = Math.abs(touch.clientY - touchStartRef.current.y);

      // Verify horizontal gesture rather than vertical scroll
      if (diffY < 80) {
        // In Persian RTL: Swiping from right to left (diffX < -swipeDistance)
        // Or standard back: swiping from left to right (diffX > swipeDistance)
        if (Math.abs(diffX) > swipeDistance) {
          sounds.playMove();
          onBack();
        }
      }
      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onBack, edgeThreshold, swipeDistance]);
}
