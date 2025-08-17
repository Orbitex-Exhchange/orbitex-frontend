import { NextResponse } from 'next/server';

export async function GET() {
  // Mock wallet balances data
  const balances = [
    {
      currency: 'BTC',
      name: 'Bitcoin',
      balance: '0.12345678',
      locked: '0.00000000',
      change24h: 2.45
    },
    {
      currency: 'ETH',
      name: 'Ethereum',
      balance: '1.23456789',
      locked: '0.10000000',
      change24h: -1.23
    },
    {
      currency: 'USDT',
      name: 'Tether',
      balance: '10000.00000000',
      locked: '0.00000000',
      change24h: 0.01
    }
  ];

  return NextResponse.json(balances);
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
