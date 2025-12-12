"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/layout/Navigation';
import { Wallet, RefreshCw, Loader2 } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountBalances } from '@/lib/api/services/account';
import { usePublicTickers as useTickers } from '@/lib/api/services/public';

// Simple test version without framer-motion to isolate TDZ issue
export default function WalletsTestPage() {
    const { authToken, isAuthenticated, user } = useAuth();
    const { data: balances = [], isLoading: balancesLoading, error: balancesError, refetch: refetchBalances } = useAccountBalances();
    const { data: tickersData = [], isLoading: tickersLoading, error: tickersError } = useTickers();

    const isLoading = balancesLoading || tickersLoading;
    const error = balancesError || tickersError;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Card className="p-6">
                    <CardContent>
                        <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
                        <p className="text-gray-400 mb-4">Please sign in to view your wallets.</p>
                        <Link href="/auth/signin">
                            <Button>Sign In</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Card className="p-6">
                    <CardContent>
                        <h2 className="text-xl font-bold text-red-500 mb-4">Error Loading Wallets</h2>
                        <p className="text-gray-400">{error instanceof Error ? error.message : 'Unknown error'}</p>
                        <Button onClick={() => refetchBalances()} className="mt-4">
                            <RefreshCw className="h-4 w-4 mr-2" /> Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navigation user={user} />
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Wallet className="h-6 w-6 mr-2" />
                    Wallets (Test Page)
                </h1>

                <div className="grid gap-4">
                    {balances.map((balance: any, index: number) => (
                        <Card key={index} className="bg-gray-800 border-gray-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white">{balance.currency?.toUpperCase()}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-white">{formatNumber(balance.balance)}</p>
                                <p className="text-sm text-gray-400">Locked: {formatNumber(balance.locked)}</p>
                            </CardContent>
                        </Card>
                    ))}

                    {balances.length === 0 && (
                        <Card className="bg-gray-800 border-gray-700 p-6">
                            <CardContent>
                                <p className="text-gray-400">No wallets found</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
