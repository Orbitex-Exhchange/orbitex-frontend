import { NextRequest, NextResponse } from 'next/server';

// Mock wallet history data
const mockHistory = [
  {
    id: 1,
    currency: 'BTC',
    amount: '0.001',
    fee: '0.0',
    txid: 'abc123def456ghi789',
    created_at: '2024-01-15T10:30:00Z',
    confirmations: 6,
    completed_at: '2024-01-15T10:35:00Z',
    state: 'accepted',
    type: 'deposit',
  },
  {
    id: 2,
    currency: 'ETH',
    amount: '0.1',
    fee: '0.0',
    txid: 'def456ghi789jkl012',
    created_at: '2024-01-14T15:20:00Z',
    confirmations: 12,
    completed_at: '2024-01-14T15:25:00Z',
    state: 'accepted',
    type: 'withdrawal',
  },
  {
    id: 3,
    currency: 'USDT',
    amount: '100.00',
    fee: '1.00',
    txid: 'ghi789jkl012mno345',
    created_at: '2024-01-13T09:15:00Z',
    confirmations: 1,
    completed_at: '2024-01-13T09:16:00Z',
    state: 'accepted',
    type: 'trade',
  },
  {
    id: 4,
    currency: 'SOL',
    amount: '5.0',
    fee: '0.0',
    txid: 'jkl012mno345pqr678',
    created_at: '2024-01-12T14:45:00Z',
    confirmations: 32,
    completed_at: '2024-01-12T14:50:00Z',
    state: 'accepted',
    type: 'deposit',
  },
  {
    id: 5,
    currency: 'USD',
    amount: '500.00',
    fee: '0.00',
    txid: 'mno345pqr678stu901',
    created_at: '2024-01-11T11:30:00Z',
    confirmations: 1,
    completed_at: '2024-01-11T11:31:00Z',
    state: 'accepted',
    type: 'deposit',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency');
    const limit = parseInt(searchParams.get('limit') || '25');
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type');

    // TODO: Add authentication check
    // TODO: Add real database query with filtering
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Filter by currency if specified
    let filteredHistory = mockHistory;
    if (currency) {
      filteredHistory = mockHistory.filter(item => 
        item.currency.toLowerCase() === currency.toLowerCase()
      );
    }

    // Filter by type if specified
    if (type) {
      filteredHistory = filteredHistory.filter(item => 
        item.type === type
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedHistory,
      pagination: {
        page,
        limit,
        total: filteredHistory.length,
        pages: Math.ceil(filteredHistory.length / limit),
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet history' },
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
