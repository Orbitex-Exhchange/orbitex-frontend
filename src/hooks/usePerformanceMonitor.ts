import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  latency: number;
  memoryUsage?: number;
  renderTime: number;
  updateCount: number;
  lastUpdate: Date;
}

interface PerformanceConfig {
  targetFps?: number;
  updateInterval?: number;
  enableMemoryTracking?: boolean;
}

export const usePerformanceMonitor = (
  config: PerformanceConfig = {}
) => {
  const {
    targetFps = 60,
    updateInterval = 1000,
    enableMemoryTracking = false,
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    latency: 0,
    memoryUsage: 0,
    renderTime: 0,
    updateCount: 0,
    lastUpdate: new Date(),
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const updateCountRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const intervalRef = useRef<NodeJS.Timeout>();

  const measureFrame = useCallback(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime >= updateInterval) {
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
      const latency = deltaTime / frameCountRef.current;
      
      const newMetrics: PerformanceMetrics = {
        fps,
        latency,
        renderTime: performance.now() - currentTime,
        updateCount: updateCountRef.current,
        lastUpdate: new Date(),
      };

      if (enableMemoryTracking && 'memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }

      setMetrics(newMetrics);
      
      frameCountRef.current = 0;
      updateCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }

    animationFrameRef.current = requestAnimationFrame(measureFrame);
  }, [updateInterval, enableMemoryTracking]);

  const startMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(measureFrame);
  }, [measureFrame]);

  const stopMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const incrementUpdateCount = useCallback(() => {
    updateCountRef.current++;
  }, []);

  const getPerformanceStatus = useCallback(() => {
    const { fps, latency } = metrics;
    
    if (fps >= targetFps * 0.9 && latency < 16.67) {
      return 'excellent';
    } else if (fps >= targetFps * 0.7 && latency < 33.33) {
      return 'good';
    } else if (fps >= targetFps * 0.5 && latency < 50) {
      return 'fair';
    } else {
      return 'poor';
    }
  }, [metrics, targetFps]);

  const getPerformanceColor = useCallback(() => {
    const status = getPerformanceStatus();
    switch (status) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-yellow-500';
      case 'fair':
        return 'text-orange-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }, [getPerformanceStatus]);

  useEffect(() => {
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics,
    startMonitoring,
    stopMonitoring,
    incrementUpdateCount,
    getPerformanceStatus,
    getPerformanceColor,
    isMonitoring: !!animationFrameRef.current,
  };
};

// Hook for monitoring specific component performance
export const useComponentPerformance = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());
  const [renderMetrics, setRenderMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
  });

  const trackRender = useCallback(() => {
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTimeRef.current;
    
    renderCountRef.current++;
    
    setRenderMetrics(prev => ({
      renderCount: renderCountRef.current,
      averageRenderTime: (prev.averageRenderTime + renderTime) / 2,
      lastRenderTime: renderTime,
    }));
    
    lastRenderTimeRef.current = currentTime;
  }, []);

  useEffect(() => {
    trackRender();
  });

  return {
    renderMetrics,
    trackRender,
  };
};

// Hook for monitoring WebSocket performance
export const useWebSocketPerformance = () => {
  const [wsMetrics, setWsMetrics] = useState({
    messageCount: 0,
    averageLatency: 0,
    lastLatency: 0,
    connectionTime: 0,
    reconnectCount: 0,
  });

  const trackMessage = useCallback((latency: number) => {
    setWsMetrics(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      averageLatency: (prev.averageLatency + latency) / 2,
      lastLatency: latency,
    }));
  }, []);

  const trackConnection = useCallback((connectionTime: number) => {
    setWsMetrics(prev => ({
      ...prev,
      connectionTime,
    }));
  }, []);

  const trackReconnect = useCallback(() => {
    setWsMetrics(prev => ({
      ...prev,
      reconnectCount: prev.reconnectCount + 1,
    }));
  }, []);

  return {
    wsMetrics,
    trackMessage,
    trackConnection,
    trackReconnect,
  };
};

// Hook for monitoring API performance
export const useApiPerformance = () => {
  const [apiMetrics, setApiMetrics] = useState({
    requestCount: 0,
    averageResponseTime: 0,
    lastResponseTime: 0,
    errorCount: 0,
    successRate: 100,
  });

  const trackRequest = useCallback((responseTime: number, success: boolean) => {
    setApiMetrics(prev => {
      const newRequestCount = prev.requestCount + 1;
      const newErrorCount = success ? prev.errorCount : prev.errorCount + 1;
      const newSuccessRate = ((newRequestCount - newErrorCount) / newRequestCount) * 100;
      
      return {
        requestCount: newRequestCount,
        averageResponseTime: (prev.averageResponseTime + responseTime) / 2,
        lastResponseTime: responseTime,
        errorCount: newErrorCount,
        successRate: newSuccessRate,
      };
    });
  }, []);

  return {
    apiMetrics,
    trackRequest,
  };
};
