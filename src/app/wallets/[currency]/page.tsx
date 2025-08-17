"use client";

import { useState, useEffect, use } from 'react';
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
  ArrowLeft,
  Copy,
  QrCode,
  AlertTriangle,
  CheckCircle,
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
  ExternalLink,
  Shield,
  Globe,
  Users
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface WalletPageProps {
  params: Promise<{
    currency: string;
  }>;
}

const mockWalletData = {
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    balance: '0.00214719',
    value: 178.92,
    change24h: 2.47,
    lastPrice: 83185.00,
    depositAddress: '0xf6b87DD8b45573d7634cd290a842BFbDfA5504bd',
    network: 'Ethereum',
    depositEnabled: true,
    withdrawalEnabled: true,
    minWithdrawal: '0.00050000',
    withdrawalFee: '0.00014000',
    icon: Activity
  }
};

export default function WalletPage(props: WalletPageProps) {
  const params = use(props.params);
  const { currency } = params;
  const [showBalances, setShowBalances] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');
  const [copied, setCopied] = useState(false);

  const walletData = mockWalletData[currency as keyof typeof mockWalletData];

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

  if (!walletData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-white mb-4">Wallet Not Found</h1>
          <p className="text-gray-300 mb-6">The requested wallet could not be found.</p>
          <Link href="/wallets">
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">
              Back to Wallets
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderOverview = () => (
    <motion.div className="space-y-6" variants={itemVariants}>
      {/* Price Chart Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Price Chart</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">1 Day</Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">1 Week</Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">1 Month</Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">3 Months</Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">6 Months</Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">1 Year</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">
              {walletData.change24h}% in the past 24 hours
            </div>
            <div className="text-sm text-gray-400">
              Price in ZAR ▼
            </div>
          </div>

          {/* Mock Chart */}
          <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300">Price Chart</p>
              <p className="text-sm text-gray-500">Chart component would be integrated here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance and Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Balance & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {showBalances ? `${walletData.balance} ${walletData.symbol}` : '****'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Value</p>
                  <p className="text-xl font-semibold text-white">
                    {showBalances ? formatCurrency(walletData.value) : '****'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-3">
                <Button className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a]" onClick={() => setActiveTab('deposit')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-gray-300 hover:bg-slate-700" onClick={() => setActiveTab('withdraw')}>
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-gray-300 hover:bg-slate-700">
                  <Wallet className="h-4 w-4 mr-2" />
                  Lend
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buy/Sell Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Buy & Sell {walletData.symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Buy {walletData.symbol}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">With</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input placeholder="Select currency" className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">Buy</Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Sell {walletData.symbol}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Get</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input placeholder="Select currency" className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                    <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">Sell</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Data */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Market Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Last traded price</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(walletData.lastPrice)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">24hr change</p>
              <p className={`text-lg font-semibold ${walletData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ▲{walletData.change24h}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderDeposit = () => (
    <motion.div className="space-y-6" variants={itemVariants}>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Deposit {walletData.symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Available balance:</p>
              <p className="text-lg font-semibold text-white">
                {showBalances ? `${walletData.balance} ${walletData.symbol}` : '****'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deposit network</label>
              <Input value={walletData.network} readOnly className="bg-slate-700 border-slate-600 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* QR Code */}
            <div className="mx-auto w-48 h-48 bg-slate-700 rounded-lg flex items-center justify-center">
              <QrCode className="h-24 w-24 text-gray-400" />
            </div>

            {/* Warning */}
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-300">
                  Do not send coins on any chain except {walletData.network} to this address.
                </p>
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Your {walletData.network} {walletData.symbol} address</p>
              <div className="flex items-center space-x-2">
                <Input 
                  value={walletData.depositAddress} 
                  readOnly 
                  className="font-mono text-sm bg-slate-700 border-slate-600 text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(walletData.depositAddress)}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-sm font-medium text-white mb-2">Please note:</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Send only {walletData.symbol} ({walletData.network} chain) to this address.
                </li>
                <li className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
                  Sending any other coins or tokens to this address may result in a loss.
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderWithdraw = () => (
    <motion.div className="space-y-6" variants={itemVariants}>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Withdraw {walletData.symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {walletData.network} wallet address
              </label>
              <div className="flex items-center space-x-2">
                <Input placeholder="Enter wallet address" className="bg-slate-700 border-slate-600 text-white" />
                <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">Manage</Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Withdrawal network</label>
              <Input value={walletData.network} readOnly className="bg-slate-700 border-slate-600 text-white" />
            </div>

            <div className="flex items-start space-x-2">
              <input type="checkbox" className="mt-1" />
              <div>
                <p className="text-sm font-medium text-white">Borrow with Crypto Loans</p>
                <p className="text-sm text-gray-400">
                  If you would like to borrow, please change to a margin enabled Subaccount.
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Available to withdraw:</p>
              <p className="text-lg font-semibold text-white">
                {showBalances ? `${walletData.balance} ${walletData.symbol}` : '****'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
              <div className="flex items-center space-x-2">
                <Input placeholder="0" className="bg-slate-700 border-slate-600 text-white" />
                <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">{walletData.symbol} Max</Button>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-full mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Withdrawal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Withdrawal Network:</span>
              <span className="text-white">{walletData.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Min amount:</span>
              <span className="text-white">{walletData.minWithdrawal} {walletData.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction fee:</span>
              <span className="text-white">{walletData.withdrawalFee} {walletData.symbol}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div 
        className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div className="flex items-center" variants={itemVariants}>
              <Link href="/wallets" className="flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to wallets
              </Link>
            </motion.div>
            <motion.div className="flex items-center space-x-4" variants={itemVariants}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="text-gray-400 hover:text-white"
              >
                {showBalances ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
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
        {/* Page Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full flex items-center justify-center">
              <walletData.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {walletData.name} {walletData.symbol} Wallet
              </h1>
              <p className="text-gray-300">
                {walletData.change24h}% in the past 24 hours
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div className="mb-6" variants={itemVariants}>
          <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-[#00ff88] text-[#00ff88]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('deposit')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'deposit'
                    ? 'border-[#00ff88] text-[#00ff88]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'withdraw'
                    ? 'border-[#00ff88] text-[#00ff88]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Withdraw
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'deposit' && renderDeposit()}
        {activeTab === 'withdraw' && renderWithdraw()}
      </motion.div>
    </div>
  );
}
