"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  BarChart3, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Settings,
  Fullscreen,
  Download,
  Layers,
  Minus,
  Plus,
  Activity,
  Square,
  Circle,
  Type,
  MousePointer,
  Maximize2,
  Volume2,
  Target,
  Ruler,
  PenTool,
  ChevronDown,
  X,
  Search,
  Star,
  Filter,
  ArrowUpDown,
  Eye,
  Clock,
  Zap,
  Globe,
  Bitcoin,
  DollarSign
} from 'lucide-react';
import { TickerSearchPanel } from './TickerSearchPanel';

interface TradingViewChartProps {
  symbol: string;
  interval: string;
  theme?: 'light' | 'dark';
  width?: string;
  height?: string;
  data?: any[];
  onMarketSelect?: (market: string) => void;
  selectedMarket?: string;
}

interface Indicator {
  id: string;
  name: string;
  type: 'sma' | 'ema' | 'rsi' | 'bollinger' | 'macd' | 'stoch';
  enabled: boolean;
  params: any;
  color?: string;
}

const timeframes = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' }
];

const chartTypes = [
  { value: 'candlestick', icon: BarChart3, label: 'Candlestick' },
  { value: 'line', icon: LineChart, label: 'Line' },
  { value: 'area', icon: Activity, label: 'Area' }
];

const drawingTools = [
  { value: 'cursor', icon: MousePointer, label: 'Cursor' },
  { value: 'trendline', icon: TrendingUp, label: 'Trend Line' },
  { value: 'horizontal', icon: Minus, label: 'Horizontal Line' },
  { value: 'vertical', icon: Type, label: 'Vertical Line' },
  { value: 'rectangle', icon: Square, label: 'Rectangle' },
  { value: 'circle', icon: Circle, label: 'Circle' },
  { value: 'fibonacci', icon: TrendingDown, label: 'Fibonacci' },
  { value: 'measure', icon: Ruler, label: 'Measure' }
];

// Memoized chart configuration
const getChartConfig = (theme: 'light' | 'dark') => ({
  layout: {
    background: { 
      type: ColorType.Solid,
      color: theme === 'dark' ? '#0a0a0a' : '#ffffff'
    },
    textColor: theme === 'dark' ? '#e5e7eb' : '#374151',
  },
  grid: {
    vertLines: { 
      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      visible: true
    },
    horzLines: { 
      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      visible: true
    },
  },
  crosshair: {
    mode: 1,
    vertLine: {
      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
      width: 1,
      style: 3,
    },
    horzLine: {
      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
      width: 1,
      style: 3,
    },
  },
  rightPriceScale: {
    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    textColor: theme === 'dark' ? '#e5e7eb' : '#374151',
    autoScale: true,
  },
  timeScale: {
    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    timeVisible: true,
    secondsVisible: false,
  },
  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
  },
  handleScale: {
    axisPressedMouseMove: true,
    mouseWheel: true,
    pinch: true,
  },
});

// Memoized series configuration
const getSeriesConfig = (chartType: string, theme: 'light' | 'dark') => {
  const baseConfig = {
    candlestick: {
      upColor: theme === 'dark' ? '#00ff88' : '#10b981',
      downColor: theme === 'dark' ? '#ff4444' : '#ef4444',
      borderVisible: false,
      wickUpColor: theme === 'dark' ? '#00ff88' : '#10b981',
      wickDownColor: theme === 'dark' ? '#ff4444' : '#ef4444',
    },
    line: {
      color: theme === 'dark' ? '#00ff88' : '#10b981',
      lineWidth: 2,
    },
    area: {
      topColor: theme === 'dark' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(16, 185, 129, 0.3)',
      bottomColor: theme === 'dark' ? 'rgba(0, 255, 136, 0.05)' : 'rgba(16, 185, 129, 0.05)',
      lineColor: theme === 'dark' ? '#00ff88' : '#10b981',
      lineWidth: 2,
    }
  };
  
  return baseConfig[chartType as keyof typeof baseConfig] || baseConfig.candlestick;
};

export const TradingViewChart = React.memo(({ 
  symbol, 
  interval, 
  theme: propTheme, 
  width = '100%', 
  height = '100%',
  data = [],
  onMarketSelect,
  selectedMarket
}: TradingViewChartProps) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDrawingTool, setSelectedDrawingTool] = useState('cursor');
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  const [chartType, setChartType] = useState('candlestick');
  const [showVolume, setShowVolume] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [autoScale, setAutoScale] = useState(true);
  
  // Memoized indicators
  const indicators = useMemo(() => [
    { id: 'sma-20', name: 'SMA 20', type: 'sma' as const, enabled: false, params: { period: 20 }, color: '#FF6B35' },
    { id: 'ema-12', name: 'EMA 12', type: 'ema' as const, enabled: false, params: { period: 12 }, color: '#4ECDC4' },
    { id: 'ema-26', name: 'EMA 26', type: 'ema' as const, enabled: false, params: { period: 26 }, color: '#45B7D1' },
    { id: 'rsi-14', name: 'RSI 14', type: 'rsi' as const, enabled: false, params: { period: 14 }, color: '#FFD93D' },
    { id: 'bb-20', name: 'Bollinger Bands 20', type: 'bollinger' as const, enabled: false, params: { period: 20, stdDev: 2 }, color: '#6C5CE7' },
    { id: 'macd', name: 'MACD', type: 'macd' as const, enabled: false, params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }, color: '#A29BFE' },
    { id: 'stoch-14', name: 'Stochastic 14', type: 'stoch' as const, enabled: false, params: { kPeriod: 14, dPeriod: 3 }, color: '#FD79A8' }
  ], []);

  // Memoized market data
  const marketData = useMemo(() => ({
    lastPrice: 43250.50,
    change24h: 2.45,
    high24h: 44100.00,
    low24h: 42800.00,
    volume: 2847.65,
    openInterest: 125000000
  }), []);

  // Memoized chart configuration
  const chartConfig = useMemo(() => getChartConfig(theme), [theme]);
  const seriesConfig = useMemo(() => getSeriesConfig(chartType, theme), [chartType, theme]);

  // Market selection handlers
  const handleMarketSelect = useCallback((market: string) => {
    onMarketSelect?.(market);
    setMarketDropdownOpen(false);
  }, [onMarketSelect]);

  // Initialize chart with useCallback for performance
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: Math.max(chartContainerRef.current.clientHeight, 600),
      ...chartConfig,
      grid: {
        ...chartConfig.grid,
        vertLines: { ...chartConfig.grid.vertLines, visible: showGrid },
        horzLines: { ...chartConfig.grid.horzLines, visible: showGrid },
      },
      rightPriceScale: {
        ...chartConfig.rightPriceScale,
        autoScale: autoScale,
      },
    });

    // Create main price series
    let mainSeries;
    if (chartType === 'candlestick') {
      mainSeries = chart.addCandlestickSeries(seriesConfig);
    } else if (chartType === 'line') {
      mainSeries = chart.addLineSeries(seriesConfig);
    } else {
      mainSeries = chart.addAreaSeries(seriesConfig);
    }

    // Create volume series
    let volumeSeries;
    if (showVolume) {
      volumeSeries = chart.addHistogramSeries({
        color: theme === 'dark' ? '#00ff88' : '#10b981',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
    }

    // Set initial data
    const mockData = generateMockData(selectedTimeframe, theme);
    if (chartType === 'candlestick') {
      mainSeries.setData(mockData.candlesticks);
    } else {
      const lineData = mockData.candlesticks.map(d => ({
        time: d.time as any,
        value: d.close
      }));
      mainSeries.setData(lineData);
    }
    
    if (volumeSeries) {
      volumeSeries.setData(mockData.volumes);
    }

    chartRef.current = chart;
    candlestickSeriesRef.current = mainSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: Math.max(chartContainerRef.current.clientHeight, 600),
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartConfig, seriesConfig, chartType, showVolume, showGrid, autoScale, selectedTimeframe, theme]);

  // Initialize chart on mount and when dependencies change
  useEffect(() => {
    return initializeChart();
  }, [initializeChart]);

  // Chart controls with useCallback for performance
  const resetChart = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, []);

  const zoomIn = useCallback(() => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const range = timeScale.getVisibleLogicalRange();
      if (range) {
        const newRange = {
          from: range.from + (range.to - range.from) * 0.1,
          to: range.to - (range.to - range.from) * 0.1
        };
        timeScale.setVisibleLogicalRange(newRange);
      }
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const range = timeScale.getVisibleLogicalRange();
      if (range) {
        const newRange = {
          from: range.from - (range.to - range.from) * 0.1,
          to: range.to + (range.to - range.from) * 0.1
        };
        timeScale.setVisibleLogicalRange(newRange);
      }
    }
  }, []);

  // Memoized chart controls
  const chartControls = useMemo(() => ({
    resetChart,
    zoomIn,
    zoomOut,
  }), [resetChart, zoomIn, zoomOut]);

  return (
    <div 
      className={`tradingview-chart ${isFullscreen ? 'fixed inset-0 z-50 bg-[hsl(var(--trading-bg))]' : 'relative'} shadow-lg overflow-hidden bg-gradient-to-br from-[hsl(var(--trading-bg))] to-[hsl(var(--trading-bg-secondary))] h-full`} 
      style={{ width, height }}
    >
      {/* Left Control Panel */}
      <div className="absolute left-0 top-12 bottom-0 z-20 w-10 bg-gradient-to-b from-[hsl(var(--trading-bg-secondary))]/95 to-[hsl(var(--trading-bg))]/95 backdrop-blur-sm border-r border-[hsl(var(--trading-border))] flex flex-col items-center py-1 gap-1">
        {/* Chart Type Control */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10 hover:bg-[hsl(var(--trading-accent))]/20 rounded-md transition-all duration-200 hover:scale-105"
            title="Chart Type"
          >
            {chartType === 'candlestick' && <BarChart3 className="h-4 w-4" />}
            {chartType === 'line' && <LineChart className="h-4 w-4" />}
            {chartType === 'area' && <Activity className="h-4 w-4" />}
          </Button>
          {/* Popup Menu */}
          <div className="absolute left-full top-0 ml-1 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[100px] z-50">
            {chartTypes.map((type) => (
              <Button
                key={type.value}
                variant="ghost"
                size="sm"
                onClick={() => setChartType(type.value as any)}
                className={`w-full justify-start px-2 py-1 text-xs ${
                  chartType === type.value 
                    ? 'bg-[hsl(var(--trading-accent))] text-black' 
                    : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
                }`}
              >
                <type.icon className="h-3 w-3 mr-1" />
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Drawing Tools Control */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] rounded-md transition-all duration-200 hover:scale-105"
            title="Drawing Tools"
          >
            <PenTool className="h-4 w-4" />
          </Button>
          {/* Popup Menu */}
          <div className="absolute left-full top-0 ml-1 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[120px] z-50">
            {drawingTools.map((tool) => (
              <Button
                key={tool.value}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDrawingTool(tool.value)}
                className={`w-full justify-start px-2 py-1 text-xs ${
                  selectedDrawingTool === tool.value 
                    ? 'bg-[hsl(var(--trading-accent))] text-black' 
                    : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
                }`}
              >
                <tool.icon className="h-3 w-3 mr-1" />
                {tool.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Indicators Control */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] rounded-md transition-all duration-200 hover:scale-105"
            title="Indicators"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
          {/* Popup Menu */}
          <div className="absolute left-full top-0 ml-1 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[140px] max-h-[250px] overflow-y-auto z-50">
            {indicators.map((indicator) => (
              <Button
                key={indicator.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Toggle indicator
                  console.log('Toggle indicator:', indicator.id);
                }}
                className={`w-full justify-start px-2 py-1 text-xs ${
                  indicator.enabled 
                    ? 'bg-[hsl(var(--trading-accent))] text-black' 
                    : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
                }`}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full mr-1"
                  style={{ backgroundColor: indicator.enabled ? 'currentColor' : indicator.color }}
                />
                {indicator.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] rounded-md transition-all duration-200 hover:scale-105"
            title="Zoom Controls"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          {/* Popup Menu */}
          <div className="absolute left-full top-0 ml-1 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[100px] z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={chartControls.zoomOut}
              className="w-full justify-start px-2 py-1 text-xs text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
            >
              <Minus className="h-3 w-3 mr-1" />
              Zoom Out
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={chartControls.resetChart}
              className="w-full justify-start px-2 py-1 text-xs text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
            >
              <Target className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={chartControls.zoomIn}
              className="w-full justify-start px-2 py-1 text-xs text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
            >
              <Plus className="h-3 w-3 mr-1" />
              Zoom In
            </Button>
          </div>
        </div>

        {/* Display Options */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] rounded-md transition-all duration-200 hover:scale-105"
            title="Display Options"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {/* Popup Menu */}
          <div className="absolute left-full top-0 ml-1 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[100px] z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVolume(!showVolume)}
              className={`w-full justify-start px-2 py-1 text-xs ${
                showVolume ? 'bg-[hsl(var(--trading-accent))] text-black' : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
              }`}
            >
              <Volume2 className="h-3 w-3 mr-1" />
              Volume
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={`w-full justify-start px-2 py-1 text-xs ${
                showGrid ? 'bg-[hsl(var(--trading-accent))] text-black' : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
              }`}
            >
              <Layers className="h-3 w-3 mr-1" />
              Grid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoScale(!autoScale)}
              className={`w-full justify-start px-2 py-1 text-xs ${
                autoScale ? 'bg-[hsl(var(--trading-accent))] text-black' : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
              }`}
            >
              <Target className="h-3 w-3 mr-1" />
              Auto Scale
            </Button>
          </div>
        </div>

        {/* Fullscreen */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0 text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] rounded-md transition-all duration-200 hover:scale-105"
            title="Fullscreen"
          >
            <Fullscreen className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Top Toolbar - Symbol, Market Stats & Timeframes */}
      <div className="absolute top-0 left-10 right-0 z-20 flex items-center justify-between p-2 bg-gradient-to-r from-[hsl(var(--trading-bg-secondary))]/95 to-[hsl(var(--trading-bg))]/95 backdrop-blur-sm border-b border-[hsl(var(--trading-border))] shadow-lg">
        {/* Left Section - Market Selection & Market Stats */}
        <div className="flex items-center gap-3 flex-1">
          {/* Market Selection Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setMarketDropdownOpen(!marketDropdownOpen)}
              className="flex items-center space-x-1 text-[hsl(var(--trading-text))] hover:text-[hsl(var(--trading-accent))] transition-colors duration-200 h-8 px-2"
            >
              <Bitcoin className="h-4 w-4" />
              <span className="font-mono font-bold text-sm">
                {selectedMarket || symbol}
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${marketDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Market Dropdown Popup */}
            {marketDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-[500px] bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-[9999] max-h-[700px] overflow-hidden">
                <div className="p-3 border-b border-[hsl(var(--trading-border))] flex items-center justify-between bg-[hsl(var(--trading-bg))]">
                  <h3 className="font-bold text-[hsl(var(--trading-text))] text-sm">Markets</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMarketDropdownOpen(false)}
                    className="text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* TickerSearchPanel Integration */}
                <div className="h-[600px] overflow-hidden">
                  <TickerSearchPanel
                    onMarketSelect={handleMarketSelect}
                    selectedMarket={selectedMarket || symbol}
                    compact={true}
                  />
                </div>
              </div>
            )}
          </div>
          
          <Badge variant="outline" className="bg-[hsl(var(--trading-bg-tertiary))] text-[hsl(var(--trading-accent))] border-[hsl(var(--trading-accent))]/30 text-xs px-2 py-0.5">
            {interval}
          </Badge>
          
          {/* Market Stats */}
          <div className="hidden md:flex items-center gap-3 text-xs">
            <div className="bg-[hsl(var(--trading-bg-tertiary))]/50 px-2 py-1 rounded border border-[hsl(var(--trading-border))]">
              <span className="text-[hsl(var(--trading-text-muted))] text-xs">Price: </span>
              <span className="font-mono font-bold text-[hsl(var(--trading-text))] text-xs">
                ${marketData.lastPrice.toFixed(2)}
              </span>
              <span className={`font-medium ml-1 text-xs ${marketData.change24h >= 0 ? 'text-[hsl(var(--trading-success))]' : 'text-[hsl(var(--trading-error))]'}`}>
                {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h}%
              </span>
            </div>
            <div className="bg-[hsl(var(--trading-bg-tertiary))]/50 px-2 py-1 rounded border border-[hsl(var(--trading-border))]">
              <span className="text-[hsl(var(--trading-text-muted))] text-xs">High: </span>
              <span className="font-mono text-[hsl(var(--trading-text))] text-xs">${marketData.high24h.toFixed(2)}</span>
            </div>
            <div className="bg-[hsl(var(--trading-bg-tertiary))]/50 px-2 py-1 rounded border border-[hsl(var(--trading-border))]">
              <span className="text-[hsl(var(--trading-text-muted))] text-xs">Low: </span>
              <span className="font-mono text-[hsl(var(--trading-text))] text-xs">${marketData.low24h.toFixed(2)}</span>
            </div>
            <div className="bg-[hsl(var(--trading-bg-tertiary))]/50 px-2 py-1 rounded border border-[hsl(var(--trading-border))]">
              <span className="text-[hsl(var(--trading-text-muted))] text-xs">Vol: </span>
              <span className="font-mono text-[hsl(var(--trading-text))] text-xs">{marketData.volume.toFixed(2)} BTC</span>
            </div>
          </div>
        </div>

        {/* Right Section - Timeframe Selector */}
        <div className="flex items-center gap-1">
          <div className="flex border border-[hsl(var(--trading-border))] rounded bg-[hsl(var(--trading-bg-tertiary))] overflow-hidden shadow-lg">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`h-6 px-2 text-xs font-medium border-r border-[hsl(var(--trading-border))] last:border-r-0 transition-all duration-200 hover:scale-105 ${
                  selectedTimeframe === tf.value 
                    ? 'bg-[hsl(var(--trading-accent))] text-black hover:bg-[hsl(var(--trading-accent-secondary))] shadow-inner' 
                    : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-secondary))] hover:shadow-md'
                }`}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area - Fixed positioning and proper sizing */}
      <div 
        className="absolute inset-0 left-10 top-12 bottom-0 bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] chart-area" 
        ref={chartContainerRef}
      />
    </div>
  );
});

TradingViewChart.displayName = 'TradingViewChart';

// Mock data generation with memoization
const generateMockData = (timeframe: string = '1h', theme: 'light' | 'dark' = 'dark') => {
  const candlesticks = [];
  const volumes = [];
  const basePrice = 43250.50;
  let currentPrice = basePrice;
  
  // Calculate interval in seconds based on timeframe
  const getIntervalSeconds = (tf: string) => {
    switch (tf) {
      case '1m': return 60;
      case '5m': return 300;
      case '15m': return 900;
      case '30m': return 1800;
      case '1h': return 3600;
      case '4h': return 14400;
      case '1d': return 86400;
      case '1w': return 604800;
      default: return 3600;
    }
  };
  
  const intervalSeconds = getIntervalSeconds(timeframe);
  const dataPoints = timeframe === '1w' ? 52 : timeframe === '1d' ? 365 : 200;
  
  for (let i = 0; i < dataPoints; i++) {
    const time = Math.floor(Date.now() / 1000) - (dataPoints - i) * intervalSeconds;
    const volatility = timeframe === '1m' ? 0.005 : 
                      timeframe === '5m' ? 0.008 : 
                      timeframe === '15m' ? 0.01 : 
                      timeframe === '30m' ? 0.012 : 
                      timeframe === '1h' ? 0.015 : 
                      timeframe === '4h' ? 0.02 : 
                      timeframe === '1d' ? 0.03 : 0.05;
    
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;
    const volume = Math.random() * 50 + 10;
    
    candlesticks.push({
      time: time as any,
      open,
      high,
      low,
      close,
    });
    
    volumes.push({
      time: time as any,
      value: volume,
      color: close >= open ? (theme === 'dark' ? '#00ff88' : '#10b981') : (theme === 'dark' ? '#ff4444' : '#ef4444'),
    });
    
    currentPrice = close;
  }
  
  return { candlesticks, volumes };
};