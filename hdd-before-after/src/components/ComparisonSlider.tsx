import { useState, useRef, useCallback, useEffect } from 'react';
import type { SliderComparison } from '../types';

interface ComparisonSliderProps {
  comparison: SliderComparison;
  className?: string;
  showLabels?: boolean;
  initialPosition?: number;
}

export function ComparisonSlider({
  comparison,
  className = '',
  showLabels = true,
  initialPosition = 50,
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isHorizontal = comparison.orientation === 'horizontal';

  const calculatePosition = useCallback(
    (clientX: number, clientY: number): number => {
      if (!containerRef.current) return position;

      const rect = containerRef.current.getBoundingClientRect();

      if (isHorizontal) {
        const x = clientX - rect.left;
        return Math.max(0, Math.min(100, (x / rect.width) * 100));
      } else {
        const y = clientY - rect.top;
        return Math.max(0, Math.min(100, (y / rect.height) * 100));
      }
    },
    [isHorizontal, position]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (isDragging) {
        setPosition(calculatePosition(clientX, clientY));
      }
    },
    [isDragging, calculatePosition]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [handleMove]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only respond to clicks on the container, not the handle
    if ((e.target as HTMLElement).closest('.slider-handle')) return;
    setPosition(calculatePosition(e.clientX, e.clientY));
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer select-none ${className}`}
      style={{ aspectRatio: '4/3' }}
      onClick={handleClick}
    >
      {/* After image (background) */}
      <div className="absolute inset-0">
        <img
          src={comparison.afterImage.url}
          alt={comparison.afterImage.caption}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={
          isHorizontal
            ? { width: `${position}%` }
            : { height: `${position}%` }
        }
      >
        <img
          src={comparison.beforeImage.url}
          alt={comparison.beforeImage.caption}
          className="object-cover"
          style={
            isHorizontal
              ? { width: `${10000 / position}%`, height: '100%', maxWidth: 'none' }
              : { width: '100%', height: `${10000 / position}%`, maxHeight: 'none' }
          }
          draggable={false}
        />
      </div>

      {/* Slider handle */}
      <div
        className={`slider-handle absolute z-10 ${
          isHorizontal
            ? 'top-0 bottom-0 w-1 cursor-ew-resize'
            : 'left-0 right-0 h-1 cursor-ns-resize'
        }`}
        style={
          isHorizontal
            ? { left: `${position}%`, transform: 'translateX(-50%)' }
            : { top: `${position}%`, transform: 'translateY(-50%)' }
        }
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Handle line */}
        <div
          className={`absolute bg-[#2F5233] shadow-lg ${
            isHorizontal ? 'inset-0 w-1' : 'inset-0 h-1'
          }`}
        />

        {/* Handle circle */}
        <div
          className="absolute w-10 h-10 bg-[#2F5233] rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          style={
            isHorizontal
              ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
              : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
          }
        >
          <span className="text-white text-lg font-bold">
            {isHorizontal ? '\u2194' : '\u2195'}
          </span>
        </div>
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <div
            className={`absolute bg-[#2F5233]/90 text-white text-xs font-semibold px-3 py-1 rounded ${
              isHorizontal ? 'top-3 left-3' : 'top-3 left-3'
            }`}
          >
            BEFORE
          </div>
          <div
            className={`absolute bg-[#2F5233]/90 text-white text-xs font-semibold px-3 py-1 rounded ${
              isHorizontal ? 'top-3 right-3' : 'bottom-3 right-3'
            }`}
          >
            AFTER
          </div>
        </>
      )}
    </div>
  );
}
