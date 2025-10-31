import { useState, useCallback, useRef, useEffect } from 'react';

interface HFTPerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  errorCount: number;
}

interface HFTPerformance {
  metrics: HFTPerformanceMetrics;
  healthScore: number;
  isHealthy: boolean;
  measureRender: <T>(fn: () => T) => T;
  recordError: (error: Error) => void;
}

export const useHFTPerformance = (): HFTPerformance => {
  const [metrics, setMetrics] = useState<HFTPerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    errorCount: 0,
  });

  const errorCountRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  // Calculate FPS
  const updateMetrics = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
      
      setMetrics(prev => ({
        ...prev,
        fps,
      }));

      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }

    frameCountRef.current++;
    animationFrameRef.current = requestAnimationFrame(updateMetrics);
  }, []);

  // Start FPS tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      animationFrameRef.current = requestAnimationFrame(updateMetrics);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [updateMetrics]);

  const measureRender = useCallback(<T,>(fn: () => T): T => {
    const start = performance.now();
    try {
      const result = fn();
      const renderTime = performance.now() - start;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
      }));

      return result;
    } catch (error) {
      setMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
      }));
      throw error;
    }
  }, []);

  const recordError = useCallback((error: Error) => {
    errorCountRef.current++;
    setMetrics(prev => ({
      ...prev,
      errorCount: errorCountRef.current,
    }));
    console.error('HFT Performance Error:', error);
  }, []);

  // Calculate health score (0-100)
  const healthScore = Math.max(0, Math.min(100, 
    100 - (metrics.errorCount * 10) - Math.max(0, (60 - metrics.fps))
  ));

  const isHealthy = healthScore >= 70 && metrics.errorCount < 5;

  return {
    metrics,
    healthScore,
    isHealthy,
    measureRender,
    recordError,
  };
};
