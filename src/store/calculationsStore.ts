import { atom, useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Market, Ticker, OrderBook, Trade, Order, Wallet } from '../types';
import { realTimeStore } from './realTimeStore';
import { useBusinessStore } from './businessStore';

// ===== BASE ATOMS =====

// Market data atoms
export const marketsAtom = atom<Market[]>([]);
export const selectedMarketAtom = atom<string | null>(null);
export const tickersAtom = atom<Record<string, Ticker>>({});
export const orderBooksAtom = atom<Record<string, OrderBook>>({});
export const tradesAtom = atom<Record<string, Trade[]>>({});

// User data atoms
export const userAtom = atom<any>(null);
export const walletsAtom = atom<Wallet[]>([]);
export const ordersAtom = atom<Order[]>([]);

// UI atoms
export const themeAtom = atomWithStorage<'light' | 'dark' | 'system'>('theme', 'dark');
export const sidebarCollapsedAtom = atomWithStorage('sidebar-collapsed', false);
export const notificationsAtom = atomWithStorage('notifications', true);
export const soundEnabledAtom = atomWithStorage('sound-enabled', true);

// ===== DERIVED ATOMS (COMPLEX CALCULATIONS) =====

// ===== MARKET CALCULATIONS =====

// Current market data
export const currentMarketAtom = atom((get) => {
  const markets = get(marketsAtom);
  const selectedMarket = get(selectedMarketAtom);
  return markets.find(market => market.id === selectedMarket) || null;
});

// Current ticker
export const currentTickerAtom = atom((get) => {
  const tickers = get(tickersAtom);
  const selectedMarket = get(selectedMarketAtom);
  return selectedMarket ? tickers[selectedMarket] : null;
});

// Current order book
export const currentOrderBookAtom = atom((get) => {
  const orderBooks = get(orderBooksAtom);
  const selectedMarket = get(selectedMarketAtom);
  return selectedMarket ? orderBooks[selectedMarket] : null;
});

// Current trades
export const currentTradesAtom = atom((get) => {
  const trades = get(tradesAtom);
  const selectedMarket = get(selectedMarketAtom);
  return selectedMarket ? trades[selectedMarket] || [] : [];
});

// ===== PRICE CALCULATIONS =====

// Best bid price
export const bestBidAtom = atom((get) => {
  const orderBook = get(currentOrderBookAtom);
  return orderBook?.bids?.[0]?.[0] || '0';
});

// Best ask price
export const bestAskAtom = atom((get) => {
  const orderBook = get(currentOrderBookAtom);
  return orderBook?.asks?.[0]?.[0] || '0';
});

// Spread calculation
export const spreadAtom = atom((get) => {
  const bestBid = parseFloat(get(bestBidAtom));
  const bestAsk = parseFloat(get(bestAskAtom));
  
  if (bestBid === 0 || bestAsk === 0) return 0;
  
  const spread = bestAsk - bestBid;
  const spreadPercent = (spread / bestBid) * 100;
  
  return {
    absolute: spread,
    percentage: spreadPercent,
    formatted: `${spread.toFixed(8)} (${spreadPercent.toFixed(2)}%)`
  };
});

// Mid price
export const midPriceAtom = atom((get) => {
  const bestBid = parseFloat(get(bestBidAtom));
  const bestAsk = parseFloat(get(bestAskAtom));
  
  if (bestBid === 0 || bestAsk === 0) return 0;
  
  return (bestBid + bestAsk) / 2;
});

// ===== VOLUME CALCULATIONS =====

// Total bid volume
export const totalBidVolumeAtom = atom((get) => {
  const orderBook = get(currentOrderBookAtom);
  if (!orderBook?.bids) return 0;
  
  return orderBook.bids.reduce((total, [price, volume]) => {
    return total + parseFloat(volume);
  }, 0);
});

// Total ask volume
export const totalAskVolumeAtom = atom((get) => {
  const orderBook = get(currentOrderBookAtom);
  if (!orderBook?.asks) return 0;
  
  return orderBook.asks.reduce((total, [price, volume]) => {
    return total + parseFloat(volume);
  }, 0);
});

// Volume imbalance
export const volumeImbalanceAtom = atom((get) => {
  const bidVolume = get(totalBidVolumeAtom);
  const askVolume = get(totalAskVolumeAtom);
  const totalVolume = bidVolume + askVolume;
  
  if (totalVolume === 0) return 0;
  
  return ((bidVolume - askVolume) / totalVolume) * 100;
});

// ===== TRADE CALCULATIONS =====

// Recent trade statistics
export const tradeStatsAtom = atom((get) => {
  const trades = get(currentTradesAtom);
  if (trades.length === 0) return null;
  
  const prices = trades.map(trade => parseFloat(trade.price));
  const volumes = trades.map(trade => parseFloat(trade.amount));
  
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  // Calculate price change
  const firstPrice = prices[prices.length - 1];
  const lastPrice = prices[0];
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;
  
  return {
    high,
    low,
    totalVolume,
    avgPrice,
    priceChange,
    priceChangePercent,
    tradeCount: trades.length,
    lastPrice,
    firstPrice,
  };
});

// ===== ORDER BOOK DEPTH =====

// Order book depth at different levels
export const orderBookDepthAtom = atom((get) => {
  const orderBook = get(currentOrderBookAtom);
  if (!orderBook) return null;
  
  const depthLevels = [0.1, 0.5, 1, 2, 5]; // Percentage levels
  const midPrice = get(midPriceAtom);
  
  if (midPrice === 0) return null;
  
  return depthLevels.map(level => {
    const priceRange = (midPrice * level) / 100;
    const lowerBound = midPrice - priceRange;
    const upperBound = midPrice + priceRange;
    
    const bidVolume = orderBook.bids
      ?.filter(([price]) => parseFloat(price) >= lowerBound)
      ?.reduce((sum, [price, volume]) => sum + parseFloat(volume), 0) || 0;
    
    const askVolume = orderBook.asks
      ?.filter(([price]) => parseFloat(price) <= upperBound)
      ?.reduce((sum, [price, volume]) => sum + parseFloat(volume), 0) || 0;
    
    return {
      level,
      bidVolume,
      askVolume,
      totalVolume: bidVolume + askVolume,
      imbalance: bidVolume - askVolume,
    };
  });
});

// ===== WALLET CALCULATIONS =====

// Total portfolio value
export const portfolioValueAtom = atom((get) => {
  const wallets = get(walletsAtom);
  const tickers = get(tickersAtom);
  
  return wallets.reduce((total, wallet) => {
    const balance = parseFloat(wallet.balance);
    const locked = parseFloat(wallet.locked || '0');
    const totalBalance = balance + locked;
    
    // Try to get USD value from ticker
    const ticker = tickers[`${wallet.currency.toLowerCase()}usdt`];
    const usdPrice = ticker ? parseFloat(ticker.last) : 0;
    
    return total + (totalBalance * usdPrice);
  }, 0);
});

// Available balance for trading
export const availableBalanceAtom = atom((get) => {
  const wallets = get(walletsAtom);
  const selectedMarket = get(currentMarketAtom);
  
  if (!selectedMarket) return {};
  
  const baseCurrency = selectedMarket.base_unit;
  const quoteCurrency = selectedMarket.quote_unit;
  
  const baseWallet = wallets.find(w => w.currency === baseCurrency);
  const quoteWallet = wallets.find(w => w.currency === quoteCurrency);
  
  return {
    base: baseWallet ? parseFloat(baseWallet.balance) : 0,
    quote: quoteWallet ? parseFloat(quoteWallet.balance) : 0,
    baseCurrency,
    quoteCurrency,
  };
});

// ===== ORDER CALCULATIONS =====

// Open orders for current market
export const openOrdersAtom = atom((get) => {
  const orders = get(ordersAtom);
  const selectedMarket = get(selectedMarketAtom);
  
  return orders.filter(order => 
    order.market === selectedMarket && 
    ['pending', 'wait'].includes(order.state)
  );
});

// Order statistics
export const orderStatsAtom = atom((get) => {
  const orders = get(openOrdersAtom);
  
  const buyOrders = orders.filter(order => order.side === 'buy');
  const sellOrders = orders.filter(order => order.side === 'sell');
  
  const totalBuyVolume = buyOrders.reduce((sum, order) => 
    sum + parseFloat(order.remaining), 0
  );
  
  const totalSellVolume = sellOrders.reduce((sum, order) => 
    sum + parseFloat(order.remaining), 0
  );
  
  return {
    total: orders.length,
    buy: buyOrders.length,
    sell: sellOrders.length,
    totalBuyVolume,
    totalSellVolume,
    netVolume: totalBuyVolume - totalSellVolume,
  };
});

// ===== PERFORMANCE CALCULATIONS =====

// P&L calculation
export const pnlAtom = atom((get) => {
  const orders = get(ordersAtom);
  const selectedMarket = get(selectedMarketAtom);
  const currentPrice = get(currentTickerAtom)?.last;
  
  if (!selectedMarket || !currentPrice) return null;
  
  const marketOrders = orders.filter(order => 
    order.market === selectedMarket && 
    order.state === 'done'
  );
  
  let realizedPnL = 0;
  let unrealizedPnL = 0;
  let totalVolume = 0;
  let avgPrice = 0;
  
  marketOrders.forEach(order => {
    const volume = parseFloat(order.executed);
    const price = parseFloat(order.price);
    const side = order.side;
    
    if (side === 'buy') {
      totalVolume += volume;
      avgPrice = ((avgPrice * (totalVolume - volume)) + (price * volume)) / totalVolume;
    } else {
      realizedPnL += volume * (price - avgPrice);
      totalVolume -= volume;
    }
  });
  
  // Calculate unrealized P&L
  if (totalVolume > 0) {
    unrealizedPnL = totalVolume * (parseFloat(currentPrice) - avgPrice);
  }
  
  return {
    realized: realizedPnL,
    unrealized: unrealizedPnL,
    total: realizedPnL + unrealizedPnL,
    avgPrice,
    totalVolume,
  };
});

// ===== CUSTOM HOOKS =====

// Hook for real-time market data
export const useMarketData = () => {
  const [markets, setMarkets] = useAtom(marketsAtom);
  const [selectedMarket, setSelectedMarket] = useAtom(selectedMarketAtom);
  const [tickers, setTickers] = useAtom(tickersAtom);
  const [orderBooks, setOrderBooks] = useAtom(orderBooksAtom);
  const [trades, setTrades] = useAtom(tradesAtom);
  
  return {
    markets,
    setMarkets,
    selectedMarket,
    setSelectedMarket,
    tickers,
    setTickers,
    orderBooks,
    setOrderBooks,
    trades,
    setTrades,
  };
};

// Hook for derived calculations
export const useCalculations = () => {
  const currentMarket = useAtomValue(currentMarketAtom);
  const currentTicker = useAtomValue(currentTickerAtom);
  const currentOrderBook = useAtomValue(currentOrderBookAtom);
  const currentTrades = useAtomValue(currentTradesAtom);
  const spread = useAtomValue(spreadAtom);
  const midPrice = useAtomValue(midPriceAtom);
  const tradeStats = useAtomValue(tradeStatsAtom);
  const orderBookDepth = useAtomValue(orderBookDepthAtom);
  const portfolioValue = useAtomValue(portfolioValueAtom);
  const availableBalance = useAtomValue(availableBalanceAtom);
  const orderStats = useAtomValue(orderStatsAtom);
  const pnl = useAtomValue(pnlAtom);
  
  return {
    currentMarket,
    currentTicker,
    currentOrderBook,
    currentTrades,
    spread,
    midPrice,
    tradeStats,
    orderBookDepth,
    portfolioValue,
    availableBalance,
    orderStats,
    pnl,
  };
};

// Hook for UI state
export const useUIState = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  const [soundEnabled, setSoundEnabled] = useAtom(soundEnabledAtom);
  
  return {
    theme,
    setTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    notifications,
    setNotifications,
    soundEnabled,
    setSoundEnabled,
  };
};
