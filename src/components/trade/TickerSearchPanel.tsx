"use client";

import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { usePublicMarkets, usePublicTickers } from '@/lib/api';
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

export default function TickerSearchPanel({ 
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

  // Get real data from V2 API
  const { data: marketsData, isLoading: marketsLoading } = usePublicMarkets();
  const { data: tickersData, isLoading: tickersLoading } = usePublicTickers();

  const markets: MarketData[] = useMemo(() => {
    if (!marketsData || !tickersData) return [];

    return marketsData.map(market => {
      const ticker = tickersData.find(t => t.market === market.id);
      
      if (!ticker) {
        return {
          symbol: market.id,
          baseAsset: market.base_unit,
          quoteAsset: market.quote_unit,
          lastPrice: 0,
          priceChange24h: 0,
          priceChangePercent24h: 0,
          volume24h: 0,
          quoteVolume24h: 0,
          high24h: 0,
          low24h: 0,
          isFavorite: favorites.has(market.id),
          category: 'spot',
          tags: []
        };
      }

      return {
        symbol: market.id,
        baseAsset: market.base_unit,
        quoteAsset: market.quote_unit,
        lastPrice: parseFloat(ticker.ticker.last),
        priceChange24h: parseFloat(ticker.ticker.last) - parseFloat(ticker.ticker.open),
        priceChangePercent24h: parseFloat(ticker.ticker.price_change_percent),
        volume24h: parseFloat(ticker.ticker.volume),
        quoteVolume24h: parseFloat(ticker.ticker.amount),
        high24h: parseFloat(ticker.ticker.high),
        low24h: parseFloat(ticker.ticker.low),
        isFavorite: favorites.has(market.id),
        category: 'spot',
        tags: []
      };
    });
  }, [marketsData, tickersData, favorites]);

  const loading = marketsLoading || tickersLoading;
  const error = null; // Could be enhanced to handle API errors

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    let filtered = markets.filter(market => {
      const matchesSearch = market.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           market.baseAsset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           market.quoteAsset.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort markets
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'price':
          aValue = a.lastPrice;
          bValue = b.lastPrice;
          break;
        case 'change':
          aValue = a.priceChangePercent24h;
          bValue = b.priceChangePercent24h;
          break;
        case 'volume':
        default:
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
      }

      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    });

    return filtered;
  }, [markets, searchTerm, selectedCategory, sortBy, sortDirection, favorites]);

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

  const handleMarketClick = (market: MarketData) => {
    onMarketSelect(market.symbol);
  };

  const categories = [
    { id: 'all', label: 'All', count: markets.length },
    { id: 'spot', label: 'Spot', count: markets.filter(m => m.category === 'spot').length },
    { id: 'futures', label: 'Futures', count: markets.filter(m => m.category === 'futures').length },
    { id: 'favorites', label: 'Favorites', count: markets.filter(m => m.isFavorite).length },
  ];

  const sortOptions = [
    { id: 'volume', label: 'Volume' },
    { id: 'price', label: 'Price' },
    { id: 'change', label: 'Change' },
  ];

  if (compact) {
    return (
      <div className="bg-[hsl(var(--trading-background))] border border-[hsl(var(--trading-border))] rounded-lg">
        <div className="p-3 border-b border-[hsl(var(--trading-border))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--trading-text-muted))]" />
            <Input
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8 text-xs"
            />
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-[hsl(var(--trading-text-muted))]">
              <div className="text-center">
                <BarChart3 className="h-4 w-4 mx-auto mb-1 animate-pulse" />
                <div className="text-xs">Loading...</div>
              </div>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredMarkets.slice(0, 10).map((market) => (
                <div
                  key={market.symbol}
                  onClick={() => handleMarketClick(market)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                    selectedMarket === market.symbol
                      ? "bg-[hsl(var(--trading-accent))] text-[hsl(var(--trading-accent-foreground))]"
                      : "hover:bg-[hsl(var(--trading-muted))]"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(market.symbol);
                      }}
                      className="p-1 hover:bg-[hsl(var(--trading-muted))] rounded"
                    >
                      <Star
                        className={cn(
                          "h-3 w-3",
                          market.isFavorite
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-[hsl(var(--trading-text-muted))]"
                        )}
                      />
                    </button>
                    <div>
                      <div className="text-xs font-medium">{market.symbol}</div>
                      <div className="text-xs text-[hsl(var(--trading-text-muted))]">
                        {market.baseAsset}/{market.quoteAsset}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">
                      {formatNumber(market.lastPrice, 4)}
                    </div>
                    <div className={cn(
                      "text-xs",
                      market.priceChangePercent24h >= 0 
                        ? "text-[hsl(var(--trading-success))]" 
                        : "text-[hsl(var(--trading-error))]"
                    )}>
                      {market.priceChangePercent24h >= 0 ? '+' : ''}{market.priceChangePercent24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--trading-background))] border border-[hsl(var(--trading-border))] rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--trading-border))]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[hsl(var(--trading-foreground))]">
            Markets
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-foreground))]"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--trading-text-muted))]" />
          <Input
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
            >
              {category.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Sort Options */}
        {showFilters && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[hsl(var(--trading-foreground))] mb-2 block">
                Sort by
              </label>
              <div className="flex space-x-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={sortBy === option.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy(option.id)}
                    className="text-xs"
                  >
                    {option.label}
                    {sortBy === option.id && (
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="text-xs"
              >
                {sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Markets List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-6 text-[hsl(var(--trading-text-muted))]">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 animate-pulse" />
              <div className="text-sm">Loading markets...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-6 text-[hsl(var(--trading-text-muted))]">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <div className="text-xs text-red-400">Error loading markets</div>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredMarkets.map((market) => {
              const priceChange = market.priceChangePercent24h;
              const isPositive = priceChange >= 0;
              
              return (
                <div
                  key={market.symbol}
                  onClick={() => handleMarketClick(market)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 group",
                    selectedMarket === market.symbol
                      ? "bg-[hsl(var(--trading-accent))] text-[hsl(var(--trading-accent-foreground))] shadow-sm"
                      : "hover:bg-[hsl(var(--trading-muted))] hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(market.symbol);
                      }}
                      className="p-1 hover:bg-[hsl(var(--trading-muted))] rounded transition-colors"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 transition-colors",
                          market.isFavorite
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-[hsl(var(--trading-text-muted))] group-hover:text-yellow-400"
                        )}
                      />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-[hsl(var(--trading-foreground))]">
                          {market.symbol}
                        </div>
                        {market.tags.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {market.tags[0]}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-[hsl(var(--trading-text-muted))]">
                        {market.baseAsset}/{market.quoteAsset}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-[hsl(var(--trading-foreground))]">
                      {formatNumber(market.lastPrice, 4)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "text-sm font-medium",
                        isPositive ? "text-[hsl(var(--trading-success))]" : "text-[hsl(var(--trading-error))]"
                      )}>
                        {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                      </div>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 text-[hsl(var(--trading-success))]" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-[hsl(var(--trading-error))]" />
                      )}
                    </div>
                    <div className="text-xs text-[hsl(var(--trading-text-muted))] flex items-center space-x-1">
                      <Volume2 className="h-3 w-3" />
                      <span>{formatNumber(market.volume24h, 0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-muted))]">
        <div className="flex items-center justify-between text-xs text-[hsl(var(--trading-text-muted))]">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{filteredMarkets.length} markets</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Live</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>Real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
}