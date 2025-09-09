'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from '@/components/layout/Navigation';
import { 
  Wallet, 
  ArrowUpRight,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWallets } from '@/lib/api';

interface WithdrawForm {
  currency: string;
  amount: string;
  address: string;
  memo?: string;
}

export default function WithdrawPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { authToken, isAuthenticated, user } = useAuth();
  
  const [form, setForm] = useState<WithdrawForm>({
    currency: '',
    amount: '',
    address: '',
    memo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAmount, setShowAmount] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawFee, setWithdrawFee] = useState(0);
  const [minWithdraw, setMinWithdraw] = useState(0);
  const [maxWithdraw, setMaxWithdraw] = useState(0);

  // Use real API hooks
  const { data: wallets, isLoading: walletsLoading, error: walletsError } = useWallets();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (form.currency && wallets) {
      const wallet = wallets.find(w => w.currency === form.currency);
      if (wallet) {
        setAvailableBalance(parseFloat(wallet.balance));
        // Mock values - in real app these would come from API
        setWithdrawFee(0.001);
        setMinWithdraw(0.01);
        setMaxWithdraw(parseFloat(wallet.balance));
      }
    }
  }, [form.currency, wallets]);

  const handleCurrencyChange = (currency: string) => {
    setForm(prev => ({ ...prev, currency, amount: '' }));
  };

  const handleAmountChange = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= maxWithdraw) {
      setForm(prev => ({ ...prev, amount }));
    }
  };

  const handleMaxAmount = () => {
    setForm(prev => ({ ...prev, amount: maxWithdraw.toString() }));
  };

  const handleWithdraw = async () => {
    if (!form.currency || !form.amount || !form.address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const amount = parseFloat(form.amount);
    if (amount < minWithdraw) {
      toast({
        title: "Amount Too Low",
        description: `Minimum withdrawal amount is ${minWithdraw} ${form.currency}`,
      });
      return;
    }

    if (amount > maxWithdraw) {
      toast({
        title: "Amount Too High",
        description: `Maximum withdrawal amount is ${maxWithdraw} ${form.currency}`,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock withdrawal - in real app this would call the API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Withdrawal Submitted",
        description: `Your withdrawal of ${form.amount} ${form.currency} has been submitted for processing`,
      });
      
      // Reset form
      setForm({
        currency: '',
        amount: '',
        address: '',
        memo: ''
      });
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to submit withdrawal. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                  Please sign in to access withdrawal features.
                </p>
                <Button variant="outline" onClick={() => router.push('/auth/signin')}>
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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
      <Navigation user={user} />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Withdraw</h1>
            <p className="text-gray-300">Withdraw your cryptocurrency to external wallets</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/wallets')}
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            View Wallets
          </Button>
        </div>

        {/* Error State */}
        {walletsError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading wallets: {walletsError.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Withdrawal Form</CardTitle>
                <CardDescription className="text-gray-300">
                  Enter withdrawal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Currency Selection */}
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-white">Currency</Label>
                  <Select value={form.currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets?.map((wallet) => {
                        const balance = parseFloat(wallet.balance);
                        return (
                          <SelectItem key={wallet.currency} value={wallet.currency}>
                            <div className="flex items-center justify-between w-full">
                              <span>{wallet.currency}</span>
                              <span className="text-sm text-gray-400">
                                {formatBalance(wallet.balance)} available
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">Amount</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type={showAmount ? "number" : "password"}
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAmount(!showAmount)}
                        className="h-6 w-6 p-0"
                      >
                        {showAmount ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleMaxAmount}
                        className="h-6 px-2 text-xs"
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
                  {form.currency && (
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Available: {formatBalance(availableBalance.toString())} {form.currency}</span>
                      <span>Fee: {withdrawFee} {form.currency}</span>
                    </div>
                  )}
                </div>

                {/* Address Input */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Withdrawal Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter wallet address"
                    value={form.address}
                    onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                {/* Memo Input (for currencies that need it) */}
                <div className="space-y-2">
                  <Label htmlFor="memo" className="text-white">
                    Memo/Tag <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Input
                    id="memo"
                    placeholder="Enter memo or tag if required"
                    value={form.memo}
                    onChange={(e) => setForm(prev => ({ ...prev, memo: e.target.value }))}
                  />
                </div>

                {/* Withdrawal Button */}
                <Button
                  onClick={handleWithdraw}
                  disabled={isLoading || !form.currency || !form.amount || !form.address}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Withdraw {form.amount} {form.currency}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal Info */}
          <div className="space-y-6">
            {/* Limits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Withdrawal Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Minimum</span>
                  <span className="text-white font-mono">{minWithdraw} {form.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Maximum</span>
                  <span className="text-white font-mono">{maxWithdraw} {form.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Fee</span>
                  <span className="text-white font-mono">{withdrawFee} {form.currency}</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-yellow-500/50 bg-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-yellow-200">
                <p>• Double-check the withdrawal address before confirming</p>
                <p>• Withdrawals are irreversible once processed</p>
                <p>• Processing time varies by network conditions</p>
                <p>• Contact support if you need assistance</p>
              </CardContent>
            </Card>

            {/* Recent Withdrawals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Recent Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-400 py-4">
                  <ArrowUpRight className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent withdrawals</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
