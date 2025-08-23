'use client';

import { useState } from 'react';
import { useWallets } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function WalletsPage() {
  const [showBalances, setShowBalances] = useState(true);
  const { toast } = useToast();
  const { authToken, isAuthenticated } = useAuth();

  // Use real API hooks with auth token from context
  const { data: wallets, isLoading, error, refetch } = useWallets(authToken || '');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.01) return num.toFixed(8);
    if (num < 1) return num.toFixed(4);
    return num.toFixed(2);
  };

  const getTotalValue = () => {
    if (!wallets) return 0;
    return wallets.reduce((total, wallet) => {
      const balance = parseFloat(wallet.balance) + parseFloat(wallet.locked);
      // Mock USD values for demonstration (in real app, this would come from price API)
      const mockPrices: { [key: string]: number } = {
        'BTC': 45000,
        'ETH': 3000,
        'USDT': 1,
        'USDC': 1,
        'SOL': 100,
        'ADA': 0.5,
        'DOT': 7,
        'LINK': 15,
        'UNI': 8,
        'MATIC': 0.8,
      };
      const price = mockPrices[wallet.currency] || 1;
      return total + (balance * price);
    }, 0);
  };

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
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
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Wallets</h1>
          <p className="text-gray-300">Manage your cryptocurrency balances</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalances(!showBalances)}
            className="flex items-center gap-2"
          >
            {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showBalances ? 'Hide' : 'Show'} Balances
          </Button>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-500 bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-red-300">Error loading wallets: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Total Portfolio Value */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-white">
                ${getTotalValue().toLocaleString()}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-400 mb-4" />
          <p className="text-gray-300">Loading wallets...</p>
        </div>
      )}

      {/* Wallets Grid */}
      {wallets && wallets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wallets.map((wallet) => {
            const totalBalance = parseFloat(wallet.balance) + parseFloat(wallet.locked);
            const isPositive = totalBalance > 0;
            
            return (
              <Card 
                key={wallet.currency}
                className={`transition-all hover:shadow-lg ${
                  isPositive ? 'border-green-500/30 bg-green-900/10' : 'border-gray-600'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">{wallet.currency}</CardTitle>
                    <Badge variant={isPositive ? "default" : "secondary"}>
                      {isPositive ? 'Active' : 'Empty'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {showBalances ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Available</span>
                          <span className="font-mono text-white">
                            {formatBalance(wallet.balance)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Locked</span>
                          <span className="font-mono text-gray-400">
                            {formatBalance(wallet.locked)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-600 pt-2">
                          <span className="text-sm font-medium text-gray-200">Total</span>
                          <span className="font-mono font-bold text-white">
                            {formatBalance(totalBalance.toString())}
                          </span>
                        </div>
                      </div>
                      
                      {wallet.deposit_address && (
                        <div className="pt-2 border-t border-gray-600">
                          <p className="text-xs text-gray-400 mb-1">Deposit Address</p>
                          <div className="flex items-center gap-1">
                            <code className="flex-1 text-xs bg-gray-800 p-1 rounded text-green-300 truncate">
                              {wallet.deposit_address}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(wallet.deposit_address!)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <EyeOff className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">Balances hidden</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {wallets && wallets.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Wallets Found</h3>
            <p className="text-gray-400 mb-4">
              You don't have any cryptocurrency wallets yet.
            </p>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-300">
            Common wallet operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Deposit
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Withdraw
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Transfer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
