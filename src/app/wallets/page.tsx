"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/layout/Navigation';
import { 
  Wallet, 
  TrendingUp, 
  Eye, 
  EyeOff,
  Plus,
  Minus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  ArrowLeft,
  Bitcoin,
  DollarSign,
  Percent,
  Clock,
  Target,
  Rocket,
  Star,
  Award,
  Lock,
  RefreshCw,
  ChevronRight,
  Download,
  Upload,
  Settings,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Users,
  Globe,
  Cpu,
  Database
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWallets } from '@/lib/api';
import { usePublicTickers } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Wallet {
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
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'crypto' | 'fiat'>('all');
  const [sortBy, setSortBy] = useState<'currency' | 'balance' | 'value' | 'change24h'>('currency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showBalances, setShowBalances] = useState(true);

  // Use real API hooks
  const { data: apiWallets, isLoading, error, refetch } = useWallets();
  const { data: tickersData } = usePublicTickers();

  // Transform API data to match our interface
  const wallets: Wallet[] = apiWallets ? apiWallets.map(wallet => {
    const balance = parseFloat(wallet.balance);
    const locked = parseFloat(wallet.locked);
    const available = balance + locked;
    
    // Get real price data from tickers
    let price = 1;
    let change24h = 0;
    
    if (tickersData) {
      // Find ticker for this currency (look for markets like BTCUSDT, ETHUSDT, etc.)
      const ticker = tickersData.find(t => 
        t.market.endsWith('USDT') && 
        t.market.startsWith(wallet.currency.toUpperCase())
      );
      
      if (ticker) {
        price = parseFloat(ticker.ticker.last);
        change24h = parseFloat(ticker.ticker.price_change_percent);
      } else {
        // Fallback to USD pairs or other quote currencies
        const fallbackTicker = tickersData.find(t => 
          t.market.includes(wallet.currency.toUpperCase())
        );
        if (fallbackTicker) {
          price = parseFloat(fallbackTicker.ticker.last);
          change24h = parseFloat(fallbackTicker.ticker.price_change_percent);
        }
      }
    }
    
    const value = available * price;
    
    return {
      currency: wallet.currency,
      balance: wallet.balance,
      locked: wallet.locked,
      available: available.toString(),
      name: getCurrencyName(wallet.currency),
      type: wallet.currency === 'ZAR' ? 'fiat' : 'crypto',
      deposit_enabled: true,
      withdrawal_enabled: true,
      change24h: change24h,
      value: value,
    };
  }) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

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

  const handleDeposit = (wallet: Wallet) => {
    toast({
      title: "Deposit",
      description: `Deposit ${wallet.currency} feature coming soon!`,
    });
  };

  const handleWithdraw = (wallet: Wallet) => {
    toast({
      title: "Withdraw",
      description: `Withdraw ${wallet.currency} feature coming soon!`,
    });
  };

  const handleTrade = (wallet: Wallet) => {
    toast({
      title: "Trade",
      description: `Trade ${wallet.currency} feature coming soon!`,
    });
  };

  const getCurrencyIcon = (currency: string) => {
    const icons: { [key: string]: any } = {
      'BTC': Bitcoin,
      'ETH': Activity,
      'ZAR': DollarSign,
      'TRX': Zap,
      'ONDO': Star,
      'BONK': Award,
      'BNB': BarChart3,
      'SOL': Rocket,
      'OP': Target,
      'USDT': DollarSign,
      'USDC': DollarSign,
      'ADA': Shield,
      'DOT': Globe,
      'LINK': Cpu,
      'UNI': Users,
      'MATIC': Database
    };
    return icons[currency] || Wallet;
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
      <motion.div 
        className="bg-gradient-to-r from-[hsl(var(--trading-bg))] to-[hsl(var(--trading-bg-secondary))] border-b border-[hsl(var(--trading-border))] glass"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div className="flex items-center" variants={itemVariants}>
              <h1 className="text-xl font-bold text-gradient-primary">Wallets</h1>
            </motion.div>
            <motion.div className="flex items-center space-x-4" variants={itemVariants}>
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
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="w-full px-4 sm:px-6 lg:px-8 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Enhanced Page Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-gradient-primary">Wallets</span>
          </h1>
          <p className="text-xl text-[#d1d5db]">Manage your cryptocurrency and fiat balances</p>
        </motion.div>

      {/* Error State */}
      {error && (
          <motion.div className="mb-6" variants={itemVariants}>
        <Card className="border-red-500 bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-red-300">Error loading wallets: {error.message}</p>
          </CardContent>
        </Card>
          </motion.div>
        )}

        {/* Enhanced Portfolio Summary Card */}
        <motion.div className="mb-8" variants={itemVariants}>
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
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div className="mb-6" variants={itemVariants}>
          <Card className="card-gradient-primary shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search wallets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 trading-input focus-ring"
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
        </motion.div>

      {/* Loading State */}
      {isLoading && (
          <motion.div className="text-center py-8" variants={itemVariants}>
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-400 mb-4" />
          <p className="text-gray-300">Loading wallets...</p>
          </motion.div>
        )}

        {/* Enhanced Wallets List */}
        {!isLoading && (
          <motion.div 
            className="card-gradient-primary overflow-hidden shadow-2xl"
            variants={itemVariants}
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
                      <motion.tr 
                        key={wallet.currency} 
                        className="hover:bg-[#2a2a2a]/50 transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
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
                      </motion.tr>
            );
          })}
                </tbody>
              </table>
        </div>
          </motion.div>
      )}

      {/* Empty State */}
        {!isLoading && sortedWallets.length === 0 && (
          <motion.div className="text-center py-12" variants={itemVariants}>
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
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
