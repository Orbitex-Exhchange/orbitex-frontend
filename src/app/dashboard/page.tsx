"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navigation } from '@/components/layout/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { useAccountBalances, useAccountStats } from '@/lib/api/services/account';
import { usePublicTickers } from '@/lib/api/services/public';
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Settings,
  Key,
  Calendar,
  TrendingUp,
  Wallet,
  Activity,
  BarChart3,
  DollarSign,
  Target,
  Clock,
  Star,
  Award,
  Zap,
  Globe,
  Cpu,
  Database,
  RefreshCw,
  Eye,
  EyeOff,
  Bitcoin
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    console.log('Dashboard auth check:', { isAuthenticated, user, isLoading });

    // Add delay to allow auth state to initialize after redirect
    const checkAuth = () => {
      // Check localStorage directly as well, in case context hasn't updated
      const token = localStorage.getItem('access_token');
      const currentUser = authService.getUser();

      if (!isAuthenticated && !token && !currentUser) {
        // DEBUG: Show why we would redirect instead of redirecting
        const debugInfo = `
            Auth State: ${isAuthenticated}
            Token in LS: ${!!token} (${token ? token.substring(0, 10) + '...' : 'none'})
            User in Service: ${!!currentUser}
            Time: ${new Date().toISOString()}
          `;
        console.error('Would redirect to signin:', debugInfo);
        setError('Authentication check failed but redirect disabled for debugging. ' + debugInfo);

        /* 
        // Only redirect if we're sure there's no auth after a delay
        setTimeout(() => {
          const finalToken = localStorage.getItem('access_token');
          const finalUser = authService.getUser();
          if (!finalToken && !finalUser) {
            console.log('Not authenticated after delay, redirecting to signin...');
            router.push('/auth/signin');
          } else {
            setIsLoading(false);
          }
        }, 500);
        */
        setIsLoading(false);
        return;
      }

      console.log('Authenticated, setting loading to false');
      setIsLoading(false);
    };

    // Wait a moment for auth state to initialize
    const timeout = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, router, user, isLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getKycLevelBadge = (level: number) => {
    const levels = {
      0: { label: 'Level 0', color: 'bg-gray-500 text-white' },
      1: { label: 'Level 1', color: 'bg-blue-500 text-white' },
      2: { label: 'Level 2', color: 'bg-green-500 text-white' },
      3: { label: 'Level 3', color: 'bg-purple-500 text-white' }
    };

    const levelInfo = levels[level as keyof typeof levels] || levels[0];
    return <Badge className={levelInfo.color}>{levelInfo.label}</Badge>;
  };

  // Get real data from V2 API
  const { data: balances, error: balancesError, isLoading: balancesLoading } = useAccountBalances();
  const { data: stats, error: statsError } = useAccountStats();
  const { data: tickersData, error: tickersError } = usePublicTickers();

  // Check for errors
  const hasError = balancesError || statsError || tickersError;

  // Calculate portfolio data from real balances and tickers
  const portfolioData = React.useMemo(() => {
    if (!balances || !tickersData) {
      return {
        totalValue: 0,
        change24h: 0,
        change7d: 0,
        assets: []
      };
    }

    let totalValue = 0;
    const assets = balances.map(balance => {
      const balanceAmount = parseFloat(balance.balance) + parseFloat(balance.locked);

      // Find ticker for this currency
      let price = 1;
      let change24h = 0;

      const ticker = tickersData.find(t =>
        t.market.endsWith('USDT') &&
        t.market.startsWith(balance.currency.toUpperCase())
      );

      if (ticker) {
        price = parseFloat(ticker.ticker.last);
        change24h = parseFloat(ticker.ticker.price_change_percent);
      }

      const value = balanceAmount * price;
      totalValue += value;

      return {
        currency: balance.currency,
        balance: balanceAmount,
        value: value,
        change24h: change24h
      };
    });

    return {
      totalValue,
      change24h: 0, // Would need historical data to calculate
      change7d: 0, // Would need historical data to calculate
      assets
    };
  }, [balances, tickersData]);

  // Mock recent activity (would come from transactions API in real implementation)
  const recentActivity = [
    { type: 'trade', description: 'Bought 0.5 BTC', amount: '+0.5 BTC', time: '2 hours ago', status: 'completed' },
    { type: 'withdrawal', description: 'Withdrew 1000 USDT', amount: '-1000 USDT', time: '1 day ago', status: 'completed' },
    { type: 'deposit', description: 'Deposited 5000 USDT', amount: '+5000 USDT', time: '2 days ago', status: 'completed' },
  ];

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[hsl(var(--trading-accent))]" />
          <p className="text-[hsl(var(--trading-text-secondary))]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Alert variant="destructive" className="border-red-500 bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300 whitespace-pre-wrap font-mono text-xs">
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => router.push('/auth/signin')} variant="outline">Back to Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <p className="text-[hsl(var(--trading-text-secondary))] mb-4">Authentication required</p>
          <Button onClick={() => router.push('/auth/signin')} className="btn-gradient-primary">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
      <Navigation user={user} />

      <motion.div
        className="container mx-auto p-6 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="flex items-center justify-between" variants={itemVariants}>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-[hsl(var(--trading-text-secondary))]">Welcome back, {user.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
              className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
            >
              {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div variants={itemVariants}>
          <Card className="card-gradient-primary shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-gradient-primary" />
                Portfolio Overview
              </CardTitle>
              <CardDescription className="text-[hsl(var(--trading-text-secondary))]">
                Your total portfolio value and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {showBalances ? formatCurrency(portfolioData.totalValue) : '****'}
                  </p>
                  <p className="text-[hsl(var(--trading-text-secondary))] text-sm">Total Value</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${portfolioData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {portfolioData.change24h >= 0 ? '+' : ''}{portfolioData.change24h}%
                  </p>
                  <p className="text-[hsl(var(--trading-text-secondary))] text-sm">24h Change</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${portfolioData.change7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {portfolioData.change7d >= 0 ? '+' : ''}{portfolioData.change7d}%
                  </p>
                  <p className="text-[hsl(var(--trading-text-secondary))] text-sm">7d Change</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-[hsl(var(--trading-text-secondary))] text-sm">Member since {new Date().getFullYear()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--trading-text-secondary))]">Email</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--trading-text-secondary))]">KYC Level</span>
                    {getKycLevelBadge(user.kyc_level || 0)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--trading-text-secondary))]">Status</span>
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-[hsl(var(--trading-border))]">
                  <Link href="/profile">
                    <Button variant="outline" className="w-full border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/trade">
                  <Button className="w-full btn-gradient-primary">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Start Trading
                  </Button>
                </Link>
                <Link href="/wallets">
                  <Button variant="outline" className="w-full border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]">
                    <Wallet className="h-4 w-4 mr-2" />
                    View Wallets
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Link href="/security">
                  <Button variant="outline" className="w-full border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-[hsl(var(--trading-border))] rounded-lg">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.type === 'trade' ? 'bg-blue-500' :
                        activity.type === 'deposit' ? 'bg-green-500' : 'bg-orange-500'
                        }`}>
                        {activity.type === 'trade' ? <TrendingUp className="h-4 w-4 text-white" /> :
                          activity.type === 'deposit' ? <CheckCircle className="h-4 w-4 text-white" /> :
                            <AlertCircle className="h-4 w-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{activity.description}</p>
                        <p className="text-[hsl(var(--trading-text-secondary))] text-xs">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${activity.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'
                          }`}>
                          {activity.amount}
                        </p>
                        <Badge className="bg-green-500 text-white text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-[hsl(var(--trading-border))]">
                  <Link href="/history">
                    <Button variant="outline" className="w-full border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]">
                      <Clock className="h-4 w-4 mr-2" />
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Assets */}
        <motion.div variants={itemVariants}>
          <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Top Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[hsl(var(--trading-border))]">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--trading-text-secondary))] uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--trading-text-secondary))] uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--trading-text-secondary))] uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--trading-text-secondary))] uppercase tracking-wider">
                        24h Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--trading-border))]">
                    {portfolioData.assets.map((asset, index) => (
                      <tr key={index} className="hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full flex items-center justify-center">
                              {asset.currency === 'BTC' ? <Bitcoin className="h-4 w-4 text-white" /> :
                                asset.currency === 'ETH' ? <Activity className="h-4 w-4 text-white" /> :
                                  <DollarSign className="h-4 w-4 text-white" />}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{asset.currency}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {showBalances ? formatNumber(asset.balance, 8) : '****'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {showBalances ? formatCurrency(asset.value) : '****'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
