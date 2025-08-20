"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Filter,
  BarChart3,
  Volume2,
  ArrowUpDown,
  Eye,
  Clock,
  Zap,
  Globe
} from 'lucide-react';
import { cn, formatNumber, formatPercentage } from '../../lib/utils';

interface TickerSearchPanelProps {
  onMarketSelect: (market: string) => void;
  selectedMarket?: string;
  compact?: boolean;
}

interface MarketData {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  quoteVolume24h: number;
  high24h: number;
  low24h: number;
  isFavorite: boolean;
  category: 'spot' | 'futures' | 'options';
  tags: string[];
}

const mockMarkets: MarketData[] = [
  {
    symbol: 'BTCUSDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    lastPrice: 43250.50,
    priceChange24h: 1250.75,
    priceChangePercent24h: 2.97,
    volume24h: 28576.48,
    quoteVolume24h: 1234567890,
    high24h: 44100.00,
    low24h: 42100.00,
    isFavorite: true,
    category: 'spot',
    tags: ['hot', 'trending']
  },
  {
    symbol: 'ETHUSDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    lastPrice: 2547.85,
    priceChange24h: -45.32,
    priceChangePercent24h: -1.75,
    volume24h: 156847.32,
    quoteVolume24h: 987654321,
    high24h: 2595.00,
    low24h: 2480.00,
    isFavorite: true,
    category: 'spot',
    tags: ['defi']
  },
  {
    symbol: 'SOLUSDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    lastPrice: 98.45,
    priceChange24h: 5.67,
    priceChangePercent24h: 6.12,
    volume24h: 89456.78,
    quoteVolume24h: 456789012,
    high24h: 102.50,
    low24h: 95.20,
    isFavorite: false,
    category: 'spot',
    tags: ['trending']
  },
  {
    symbol: 'ADAUSDT',
    baseAsset: 'ADA',
    quoteAsset: 'USDT',
    lastPrice: 0.4825,
    priceChange24h: 0.0145,
    priceChangePercent24h: 3.09,
    volume24h: 234567.89,
    quoteVolume24h: 123456789,
    high24h: 0.4950,
    low24h: 0.4680,
    isFavorite: false,
    category: 'spot',
    tags: []
  },
  {
    symbol: 'BTC-PERP',
    baseAsset: 'BTC',
    quoteAsset: 'USD',
    lastPrice: 43275.80,
    priceChange24h: 1275.90,
    priceChangePercent24h: 3.04,
    volume24h: 45678.90,
    quoteVolume24h: 1976543210,
    high24h: 44150.00,
    low24h: 42050.00,
    isFavorite: true,
    category: 'futures',
    tags: ['hot', 'perp']
  }
];

const categories = [
  { id: 'all', label: 'All', icon: Globe },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'spot', label: 'Spot', icon: BarChart3 },
  { id: 'futures', label: 'Futures', icon: TrendingUp },
  { id: 'options', label: 'Options', icon: Volume2 }
];

const sortOptions = [
  { id: 'symbol', label: 'Symbol' },
  { id: 'price', label: 'Price' },
  { id: 'change', label: '24h Change' },
  { id: 'volume', label: '24h Volume' }
];

export function TickerSearchPanel({ 
  onMarketSelect, 
  selectedMarket,
  compact = false 
}: TickerSearchPanelProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('volume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTCUSDT', 'ETHUSDT', 'BTC-PERP']));
  const [showFilters, setShowFilters] = useState(false);
  const [markets, setMarkets] = useState(mockMarkets);

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    let filtered = markets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(market => 
        market.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.baseAsset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.quoteAsset.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'favorites') {
        filtered = filtered.filter(market => favorites.has(market.symbol));
      } else {
        filtered = filtered.filter(market => market.category === selectedCategory);
      }
    }

    // Sort markets
    filtered = filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'price':
          aValue = a.lastPrice;
          bValue = b.lastPrice;
          break;
        case 'change':
          aValue = a.priceChangePercent24h;
          bValue = b.priceChangePercent24h;
          break;
        case 'volume':
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    return filtered;
  }, [markets, searchTerm, selectedCategory, sortBy, sortDirection, favorites]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(market => ({
        ...market,
        lastPrice: market.lastPrice + (Math.random() - 0.5) * market.lastPrice * 0.001,
        priceChange24h: market.priceChange24h + (Math.random() - 0.5) * 10,
        volume24h: market.volume24h + (Math.random() - 0.5) * market.volume24h * 0.01
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(symbol)) {
        newFavorites.delete(symbol);
      } else {
        newFavorites.add(symbol);
      }
      return newFavorites;
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const MarketRow = ({ market }: { market: MarketData }) => {
    const isSelected = selectedMarket === market.symbol;
    const isFavorite = favorites.has(market.symbol);
    const priceChange = market.priceChangePercent24h;
    
    return (
      <div
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:bg-[hsl(var(--trading-bg-tertiary))]/50",
          isSelected && "bg-[hsl(var(--trading-accent))]/10 border-l-2 border-[hsl(var(--trading-accent))]"
        )}
        onClick={() => onMarketSelect(market.symbol)}
      >
        <div className="p-2 grid grid-cols-12 gap-2 items-center text-xs">
          {/* Symbol & Favorite */}
          <div className="col-span-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(market.symbol);
              }}
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Star 
                className={cn(
                  "h-3 w-3",
                  isFavorite ? "fill-yellow-400 text-yellow-400" : "text-[hsl(var(--trading-text-muted))]"
                )}
              />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-medium text-[hsl(var(--trading-text))] text-xs">{market.baseAsset}</span>
                <span className="text-[hsl(var(--trading-text-muted))] text-xs">/{market.quoteAsset}</span>
              </div>
              <div className="flex items-center gap-1">
                {market.category === 'futures' && (
                  <Badge variant="outline" className="text-xs px-1 py-0 bg-orange-500/20 border-orange-500/30 text-orange-400">
                    PERP
                  </Badge>
                )}
                {market.tags.includes('hot') && (
                  <Badge variant="outline" className="text-xs px-1 py-0 bg-red-500/20 border-red-500/30 text-red-400">
                    HOT
                  </Badge>
                )}
                {market.tags.includes('trending') && (
                  <Badge variant="outline" className="text-xs px-1 py-0 bg-blue-500/20 border-blue-500/30 text-blue-400">
                    📈
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="col-span-3 text-right">
            <div className="font-mono font-medium text-[hsl(var(--trading-text))] text-xs">
              ${formatNumber(market.lastPrice, market.lastPrice > 1 ? 2 : 6)}
            </div>
          </div>

          {/* 24h Change */}
          <div className="col-span-3 text-right">
            <div className={cn(
              "font-medium text-xs",
              priceChange >= 0 ? "text-[hsl(var(--trading-success))]" : "text-[hsl(var(--trading-error))]"
            )}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
            <div className="text-xs text-[hsl(var(--trading-text-muted))]">
              {priceChange >= 0 ? '+' : ''}${formatNumber(market.priceChange24h, 2)}
            </div>
          </div>

          {/* Volume */}
          <div className="col-span-2 text-right">
            <div className="text-[hsl(var(--trading-text))] font-medium text-xs">
              {formatNumber(market.volume24h, 0)}
            </div>
            <div className="text-xs text-[hsl(var(--trading-text-muted))]">
              {market.baseAsset}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "flex flex-col bg-[hsl(var(--trading-bg-secondary))]",
      compact ? "h-full" : "h-full border border-[hsl(var(--trading-border))] rounded-lg shadow-lg"
    )}>
      {/* Header */}
      <div className="p-3 border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))]">
        <div className="flex items-center justify-between mb-2">
          {!compact && <h3 className="text-sm font-semibold text-[hsl(var(--trading-text))]">Markets</h3>}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-6 w-6 p-0",
                showFilters ? "text-[hsl(var(--trading-accent))]" : "text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]"
              )}
            >
              <Filter className="h-3 w-3" />
            </Button>
            <div className="flex items-center gap-1 text-xs text-[hsl(var(--trading-text-muted))]">
              <Zap className="h-3 w-3 text-[hsl(var(--trading-accent))] animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[hsl(var(--trading-text-muted))]" />
          <Input
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-xs bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] placeholder:text-[hsl(var(--trading-text-muted))] focus:border-[hsl(var(--trading-accent))] focus:ring-1 focus:ring-[hsl(var(--trading-accent))]/20"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))] overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex-shrink-0 h-8 px-2 rounded-none border-r border-[hsl(var(--trading-border))] last:border-r-0",
              selectedCategory === category.id
                ? "bg-[hsl(var(--trading-bg-secondary))] text-[hsl(var(--trading-text))] border-b-2 border-[hsl(var(--trading-accent))]"
                : "text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]/50"
            )}
          >
            <category.icon className="h-3 w-3 mr-1" />
            <span className="text-xs">{category.label}</span>
            {category.id === 'favorites' && favorites.size > 0 && (
              <Badge variant="outline" className="ml-1 text-xs bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] px-1 py-0">
                {favorites.size}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-2 border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[hsl(var(--trading-text-muted))]">Sort by:</span>
            <div className="flex gap-1">
              {sortOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort(option.id)}
                  className={cn(
                    "h-5 px-2 text-xs",
                    sortBy === option.id
                      ? "bg-[hsl(var(--trading-accent))] text-black font-medium"
                      : "text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]/50"
                  )}
                >
                  {option.label}
                  {sortBy === option.id && (
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 p-2 text-xs text-[hsl(var(--trading-text-muted))] bg-[hsl(var(--trading-bg))] border-b border-[hsl(var(--trading-border))] font-medium">
        <div className="col-span-4">Market</div>
        <div className="col-span-3 text-right">Price</div>
        <div className="col-span-3 text-right">24h Change</div>
        <div className="col-span-2 text-right">Volume</div>
      </div>

      {/* Markets List */}
      <div className="flex-1 overflow-y-auto">
        {filteredMarkets.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-[hsl(var(--trading-text-muted))]">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <div className="text-xs">No markets found</div>
              <div className="text-xs">Try adjusting your search or filters</div>
            </div>
          </div>
        ) : (
          filteredMarkets.map((market) => (
            <MarketRow key={market.symbol} market={market} />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))] text-xs text-[hsl(var(--trading-text-muted))]">
        <div className="flex items-center justify-between">
          <span>{filteredMarkets.length} markets</span>
          <div className="flex items-center gap-2">
            <span>Updated</span>
            <Clock className="h-3 w-3" />
            <span>few seconds ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}