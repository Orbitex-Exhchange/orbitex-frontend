"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// Replaced Input/Badge with standard HTML to avoid potential circular deps
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/layout/Navigation';
import {
  Wallet,
  TrendingUp,
  Search,
  RefreshCw,
  Plus,
  Minus,
  MoreHorizontal,
  ChevronRight,
  ArrowUpDown,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
// Internal imports
import { useAuth } from '@/contexts/AuthContext';
import { useAccountBalances } from '@/lib/api/services/account';
import { usePublicTickers as useTickers } from '@/lib/api/services/public';

interface WalletData {
  currency: string;
  balance: string;
  locked: string;
  available: string;
  icon?: string;
  name?: string;
  type?: 'crypto' | 'fiat';
  deposit_enabled?: boolean;
  withdrawal_enabled?: boolean;
  change24h?: number;
  value?: number;
  deposit_address?: string;
}

export default function WalletsPage() {
  const { authToken, isAuthenticated, user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'crypto' | 'fiat'>('all');
  const [sortBy, setSortBy] = useState<'currency' | 'balance' | 'value' | 'change24h'>('currency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showBalances, setShowBalances] = useState(true);

  // Use React Query hooks (same as dashboard and trade pages)
  const { data: balances = [], isLoading: balancesLoading, error: balancesError, refetch: refetchBalances } = useAccountBalances();
  const { data: tickersData = [], isLoading: tickersLoading, error: tickersError, refetch: refetchTickers } = useTickers();

  const isLoading = balancesLoading || tickersLoading;
  const error = balancesError || tickersError;

  // Extract error message for better display
  const errorMessage = error instanceof Error
    ? error.message
    : (error as any)?.message || (error as any)?.code || 'Failed to load wallet data';

  // Refetch function for refresh button
  const refetch = () => {
    if (isAuthenticated && authToken) {
      refetchBalances();
      refetchTickers();
    } else {
      console.log("Action:", {
        title: "Authentication Required",
        description: "Please log in to view your wallet balances.",
      });
    }
  };

  // Transform API data to match our interface
  const wallets: WalletData[] = balances && balances.length > 0 ? balances.map((balance: any) => {
    const balanceAmount = parseFloat(balance.balance);
    const lockedAmount = parseFloat(balance.locked);
    const availableAmount = balanceAmount + lockedAmount;

    // Get real price data from tickers
    let price = 1;
    let change24h = 0;

    if (tickersData && tickersData.length > 0) {
      // Find ticker for this currency (look for markets like BTCUSDT, ETHUSDT, etc.)
      const ticker = tickersData.find((t: any) => {
        const market = t.market || t.id;
        return market?.endsWith('USDT') &&
          market?.startsWith(balance.currency.toUpperCase());
      });

      if (ticker) {
        const tickerData = ticker.ticker || ticker;
        price = parseFloat(tickerData?.last || tickerData?.last || '0') || 1;
        change24h = parseFloat(tickerData?.price_change_percent || tickerData?.change_percent || '0') || 0;
      } else {
        // Fallback to USD pairs or other quote currencies
        const fallbackTicker = tickersData.find((t: any) => {
          const market = t.market || t.id;
          return market?.includes(balance.currency.toUpperCase());
        });
        if (fallbackTicker) {
          const tickerData = fallbackTicker.ticker || fallbackTicker;
          price = parseFloat(tickerData?.last || tickerData?.last || '0') || 1;
          change24h = parseFloat(tickerData?.price_change_percent || tickerData?.change_percent || '0') || 0;
        }
      }
    }

    const value = availableAmount * price;

    return {
      currency: balance.currency,
      balance: balance.balance,
      locked: balance.locked,
      available: availableAmount.toString(),
      name: getCurrencyName(balance.currency),
      type: balance.currency === 'ZAR' ? 'fiat' : 'crypto',
      deposit_enabled: true,
      withdrawal_enabled: true,
      change24h: change24h,
      value: value,
    };
  }) : [];

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || wallet.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedWallets = [...filteredWallets].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    if (sortBy === 'balance' || sortBy === 'value') {
      aValue = parseFloat(aValue || '0');
      bValue = parseFloat(bValue || '0');
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalValue = wallets.reduce((sum, wallet) => sum + (wallet.value || 0), 0);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDeposit = (wallet: WalletData) => {
    console.log("Action:", {
      title: "Deposit",
      description: `Deposit ${wallet.currency} feature coming soon!`,
    });
  };

  const handleWithdraw = (wallet: WalletData) => {
    console.log("Action:", {
      title: "Withdraw",
      description: `Withdraw ${wallet.currency} feature coming soon!`,
    });
  };

  const handleTrade = (wallet: WalletData) => {
    console.log("Action:", {
      title: "Trade",
      description: `Trade ${wallet.currency} feature coming soon!`,
    });
  };

  const getCurrencyIcon = (currency: string) => {
    // Simplify icons to avoid huge import list and potential TDZ
    return Wallet;
  };

  const getCurrencyName = (currency: string) => {
    const names: { [key: string]: string } = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'ZAR': 'Rand',
      'TRX': 'TRON',
      'ONDO': 'Ondo',
      'BONK': 'Bonk',
      'BNB': 'Binance Coin',
      'SOL': 'Solana',
      'OP': 'Optimism',
      'USDT': 'Tether',
      'USDC': 'USD Coin',
      'ADA': 'Cardano',
      'DOT': 'Polkadot',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'MATIC': 'Polygon'
    };
    return names[currency] || currency;
  };

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
        <Navigation user={user} />
        <div className="container mx-auto p-6">
          <Card className="border-yellow-500 bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <Wallet className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Authentication Required</h3>
                <p className="text-yellow-200 mb-4">
                  Please sign in to view your wallet balances and manage your funds.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/auth/signin'}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] trading-font">
      {/* Navigation */}
      <Navigation user={user} />

      {/* Enhanced Page Header */}
      <div
        className="bg-gradient-to-r from-[hsl(var(--trading-bg))] to-[hsl(var(--trading-bg-secondary))] border-b border-[hsl(var(--trading-border))] glass"



      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gradient-primary">Wallets</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-tertiary))] hover:border-[hsl(var(--trading-accent))] transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-tertiary))] hover:border-[hsl(var(--trading-accent))] transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Add new address
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full px-4 sm:px-6 lg:px-8 py-8"



      >
        {/* Enhanced Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-gradient-primary">Wallets</span>
          </h1>
          <p className="text-xl text-[#d1d5db]">Manage your cryptocurrency and fiat balances</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <Card className="border-red-500 bg-red-900/20">
              <CardContent className="pt-6">
                <div className="text-red-300">
                  <p className="font-semibold mb-2">Error loading wallets:</p>
                  <p className="text-sm">{errorMessage}</p>
                  {errorMessage.includes('not_permitted') && (
                    <p className="text-xs text-red-400 mt-2">
                      This may be an authentication issue. Please try logging out and logging back in.
                    </p>
                  )}
                  {isAuthenticated && !authToken && (
                    <p className="text-xs text-red-400 mt-2">
                      No authentication token found. Please log in again.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Portfolio Summary Card */}
        <div className="mb-8">
          <Card className="card-gradient-primary shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wallet className="h-6 w-6 mr-2 text-gradient-primary" />
                Portfolio Overview
              </CardTitle>
              <CardDescription className="text-[#d1d5db]">
                Total value of all your assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">
                    {showBalances ? formatCurrency(totalValue) : '****'}
                  </p>
                  <div className="flex items-center text-gradient-primary mt-2">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+2.45% today</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalances(!showBalances)}
                    className="text-[#888888] hover:text-white transition-colors duration-300"
                  >
                    {showBalances ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="mb-6">
          <Card className="card-gradient-primary shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      placeholder="Search wallets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className={filterType === 'all' ? 'btn-gradient-primary' : 'border-[#2a2a2a] text-[#d1d5db] hover:bg-[#1a1a1a] hover:border-[#00ff88]/50 transition-all duration-300'}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterType === 'crypto' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('crypto')}
                    className={filterType === 'crypto' ? 'btn-gradient-primary' : 'border-[#2a2a2a] text-[#d1d5db] hover:bg-[#1a1a1a] hover:border-[#00ff88]/50 transition-all duration-300'}
                  >
                    Crypto
                  </Button>
                  <Button
                    variant={filterType === 'fiat' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('fiat')}
                    className={filterType === 'fiat' ? 'btn-gradient-primary' : 'border-[#2a2a2a] text-[#d1d5db] hover:bg-[#1a1a1a] hover:border-[#00ff88]/50 transition-all duration-300'}
                  >
                    Fiat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-400 mb-4" />
            <p className="text-gray-300">Loading wallets...</p>
          </div>
        )}

        {/* Enhanced Wallets List */}
        {!isLoading && (
          <div
            className="card-gradient-primary overflow-hidden shadow-2xl"

          >
            <div className="px-6 py-4 border-b border-[#2a2a2a] bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gradient-primary">Your Assets</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors duration-300">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors duration-300">
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors duration-300">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2a2a2a]">
                <thead className="bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">
                      Asset
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-300"
                      onClick={() => handleSort('change24h')}
                    >
                      <div className="flex items-center">
                        24hr Change
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-300"
                      onClick={() => handleSort('balance')}
                    >
                      <div className="flex items-center">
                        Balance
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-300"
                      onClick={() => handleSort('value')}
                    >
                      <div className="flex items-center">
                        Value
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] divide-y divide-[#2a2a2a]">
                  {sortedWallets.map((wallet, index) => {
                    const IconComponent = getCurrencyIcon(wallet.currency);
                    return (
                      <tr
                        key={wallet.currency}
                        className="hover:bg-[#2a2a2a]/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/wallets/${wallet.currency}`} className="flex items-center group">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full flex items-center justify-center group-hover:from-[#00ff88] group-hover:to-[#00cc6a] transition-all duration-300 shadow-lg">
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white group-hover:text-gradient-primary transition-colors duration-300">
                                {wallet.name}
                              </div>
                              <div className="text-sm text-[#888888]">
                                {wallet.currency}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {wallet.change24h !== undefined ? (
                            <div className={`flex items-center text-sm ${wallet.change24h >= 0 ? 'text-gradient-primary' : 'text-[#ff4444]'}`}>
                              <TrendingUp className={`h-4 w-4 mr-1 ${wallet.change24h >= 0 ? 'rotate-0' : 'rotate-180'}`} />
                              {wallet.change24h >= 0 ? '+' : ''}{wallet.change24h}%
                            </div>
                          ) : (
                            <span className="text-sm text-[#888888]">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-medium">
                            {showBalances ? formatNumber(parseFloat(wallet.balance), 8) : '****'}
                          </div>
                          {parseFloat(wallet.locked) > 0 && (
                            <div className="text-sm text-[#888888]">
                              Locked: {showBalances ? formatNumber(parseFloat(wallet.locked), 8) : '****'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-medium">
                            {showBalances ? formatCurrency(wallet.value || 0) : '****'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeposit(wallet)}
                              disabled={!wallet.deposit_enabled}
                              className="border-[#2a2a2a] text-[#d1d5db] hover:bg-green-600 hover:border-green-600 hover:text-white transition-all duration-300"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Deposit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWithdraw(wallet)}
                              disabled={!wallet.withdrawal_enabled}
                              className="border-[#2a2a2a] text-[#d1d5db] hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300"
                            >
                              <Minus className="h-3 w-3 mr-1" />
                              Withdraw
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTrade(wallet)}
                              className="border-[#2a2a2a] text-[#d1d5db] hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300"
                            >
                              Trade
                            </Button>
                            <Button variant="ghost" size="sm" className="text-[#888888] hover:text-white transition-colors duration-300">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedWallets.length === 0 && (
          <div className="text-center py-12">
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
              <CardContent className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Wallets Found</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || filterType !== 'all'
                    ? 'No wallets match your current search or filter criteria.'
                    : 'You don\'t have any cryptocurrency wallets yet.'
                  }
                </p>
                <Button variant="outline" className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]">
                  <Plus className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
