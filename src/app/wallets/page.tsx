"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
}

const mockWallets: Wallet[] = [
  { 
    currency: 'ZAR', 
    balance: '0.00', 
    locked: '0.00', 
    available: '0.00',
    name: 'Rand',
    type: 'fiat',
    deposit_enabled: true,
    withdrawal_enabled: true,
    change24h: 0,
    value: 0
  },
  { 
    currency: 'ETH', 
    balance: '0.00214719', 
    locked: '0.00000000', 
    available: '0.00214719',
    name: 'Ethereum',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
    change24h: 2.83,
    value: 179.71
  },
  { 
    currency: 'TRX', 
    balance: '0.727139', 
    locked: '0.00000000', 
    available: '0.727139',
    name: 'TRON',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
    change24h: 2.24,
    value: 4.63
  },
  { 
    currency: 'ONDO', 
    balance: '0.20800000', 
    locked: '0.00000000', 
    available: '0.20800000',
    name: 'Ondo',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
    change24h: 2.05,
    value: 3.93
  },
  { 
    currency: 'BONK', 
    balance: '0.39240', 
    locked: '0.00000000', 
    available: '0.39240',
    name: 'Bonk',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
    change24h: 6.14,
    value: 0.01
  },
  { 
    currency: 'BNB', 
    balance: '0.00000000', 
    locked: '0.00000000', 
    available: '0.00000000',
    name: 'Binance Coin',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
    change24h: 0.2,
    value: 0.01
  },
  { 
    currency: 'SOL', 
    balance: '0.00000000', 
    locked: '0.00000000', 
    available: '0.00000000',
    name: 'Solana',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
    change24h: 3.8,
    value: 0.01
  },
  { 
    currency: 'OP', 
    balance: '0.00000000', 
    locked: '0.00000000', 
    available: '0.00000000',
    name: 'Optimism',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
    change24h: 7.02,
    value: 0.01
  }
];

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>(mockWallets);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'crypto' | 'fiat'>('all');
  const [sortBy, setSortBy] = useState<'currency' | 'balance' | 'value' | 'change24h'>('currency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showBalances, setShowBalances] = useState(true);

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
    console.log('Deposit', wallet.currency);
  };

  const handleWithdraw = (wallet: Wallet) => {
    console.log('Withdraw', wallet.currency);
  };

  const handleTrade = (wallet: Wallet) => {
    console.log('Trade', wallet.currency);
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
      'OP': Target
    };
    return icons[currency] || Wallet;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] trading-font">
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
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors duration-300">
                    <RefreshCw className="h-4 w-4" />
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

        {/* Enhanced Wallets List */}
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
      </motion.div>
    </div>
  );
}
