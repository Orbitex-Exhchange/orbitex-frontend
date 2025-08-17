import { NextResponse } from 'next/server';

export async function GET() {
  // Mock wallet history data
  const history = [
    {
      id: '1',
      type: 'deposit',
      currency: 'BTC',
      amount: '0.1',
      fee: '0.0001',
      status: 'completed',
      timestamp: new Date().toISOString(),
      txid: 'abc123...'
    },
    {
      id: '2',
      type: 'withdrawal',
      currency: 'ETH',
      amount: '1.0',
      fee: '0.005',
      status: 'pending',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      txid: 'def456...'
    }
  ];

  return NextResponse.json(history);
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
