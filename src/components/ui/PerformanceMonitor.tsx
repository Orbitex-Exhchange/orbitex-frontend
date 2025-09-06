'use client';

import React, { useState } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useTradingStore } from '@/store/tradingStore';
import { cn } from '@/lib/utils';

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  showDetails = false,
  position = 'top-right',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { metrics, getPerformanceStatus, getPerformanceColor } = usePerformanceMonitor({
    targetFps: 60,
    updateInterval: 1000,
    enableMemoryTracking: true,
  });

  // const { performance: tradingPerformance } = useTradingStore();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const status = getPerformanceStatus();
  const statusColor = getPerformanceColor();

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        positionClasses[position],
        className
      )}
    >
      <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">Performance</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        <div className="space-y-2">
          {/* FPS Display */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">FPS</span>
            <span className={cn('text-sm font-mono font-semibold', statusColor)}>
              {metrics.fps}
            </span>
          </div>

          {/* Latency Display */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Latency</span>
            <span className="text-sm font-mono">
              {metrics.latency.toFixed(1)}ms
            </span>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  status === 'excellent' && 'bg-green-500',
                  status === 'good' && 'bg-yellow-500',
                  status === 'fair' && 'bg-orange-500',
                  status === 'poor' && 'bg-red-500'
                )}
              />
              <span className="text-xs capitalize">{status}</span>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="pt-2 border-t border-border space-y-2">
              {/* Memory Usage */}
              {metrics.memoryUsage !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Memory</span>
                  <span className="text-sm font-mono">
                    {metrics.memoryUsage.toFixed(1)}MB
                  </span>
                </div>
              )}

              {/* Render Time */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Render</span>
                <span className="text-sm font-mono">
                  {metrics.renderTime.toFixed(1)}ms
                </span>
              </div>

              {/* Update Count */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Updates</span>
                <span className="text-sm font-mono">{metrics.updateCount}</span>
              </div>

              {/* Trading Performance - Disabled for now */}
              {/* <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Trading FPS</span>
                <span className="text-sm font-mono">
                  {tradingPerformance.fps}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Trading Latency</span>
                <span className="text-sm font-mono">
                  {tradingPerformance.latency.toFixed(1)}ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Orders</span>
                <span className="text-sm font-mono">
                  {tradingPerformance.orderCount}
                </span>
              </div> */}

              {/* Last Update */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Updated</span>
                <span className="text-xs font-mono">
                  {metrics.lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Compact version for minimal display
export const CompactPerformanceMonitor: React.FC<{
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ className, position = 'top-right' }) => {
  const { metrics, getPerformanceStatus, getPerformanceColor } = usePerformanceMonitor({
    targetFps: 60,
    updateInterval: 1000,
  });

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  const status = getPerformanceStatus();
  const statusColor = getPerformanceColor();

  return (
    <div
      className={cn(
        'fixed z-50 bg-background/90 backdrop-blur-sm border border-border rounded-md shadow-md px-2 py-1',
        positionClasses[position],
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            status === 'excellent' && 'bg-green-500',
            status === 'good' && 'bg-yellow-500',
            status === 'fair' && 'bg-orange-500',
            status === 'poor' && 'bg-red-500'
          )}
        />
        <span className={cn('text-xs font-mono font-semibold', statusColor)}>
          {metrics.fps}
        </span>
        <span className="text-xs text-muted-foreground">
          {metrics.latency.toFixed(0)}ms
        </span>
      </div>
    </div>
  );
};

// Performance warning component
export const PerformanceWarning: React.FC<{
  threshold?: number;
  className?: string;
}> = ({ threshold = 30, className }) => {
  const { metrics } = usePerformanceMonitor({
    targetFps: 60,
    updateInterval: 1000,
  });

  if (metrics.fps >= threshold) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-sm font-medium">
          Low Performance Detected: {metrics.fps} FPS
        </span>
      </div>
    </div>
  );
};
