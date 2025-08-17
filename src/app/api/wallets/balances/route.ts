import { NextRequest, NextResponse } from 'next/server';

// Mock wallet balances data
const mockBalances = [
  {
    currency: 'BTC',
    balance: '0.25000000',
    locked: '0.05000000',
    available: '0.20000000',
    name: 'Bitcoin',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
  },
  {
    currency: 'ETH',
    balance: '2.50000000',
    locked: '0.50000000',
    available: '2.00000000',
    name: 'Ethereum',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
  },
  {
    currency: 'USDT',
    balance: '12500.50',
    locked: '500.50',
    available: '12000.00',
    name: 'Tether USD',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
  },
  {
    currency: 'SOL',
    balance: '50.00000000',
    locked: '5.00000000',
    available: '45.00000000',
    name: 'Solana',
    type: 'crypto',
    deposit_enabled: true,
    withdrawal_enabled: true,
  },
  {
    currency: 'USD',
    balance: '1000.00',
    locked: '0.00',
    available: '1000.00',
    name: 'US Dollar',
    type: 'fiat',
    deposit_enabled: true,
    withdrawal_enabled: true,
  },
  {
    currency: 'EUR',
    balance: '850.00',
    locked: '0.00',
    available: '850.00',
    name: 'Euro',
    type: 'fiat',
    deposit_enabled: true,
    withdrawal_enabled: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // TODO: Add real database query
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(mockBalances, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet balances' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
