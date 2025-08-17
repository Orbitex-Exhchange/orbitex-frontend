import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ currency: string }> }) {
  const params = await props.params;
  try {
    const { currency } = params;
    
    // Simple mock response
    const mockAddress = {
      address: `mock-address-for-${currency}`,
      tag: null,
      network: currency === 'BTC' ? 'Bitcoin' : 'Ethereum',
      currency: currency
    };

    return NextResponse.json(mockAddress);
  } catch (error) {
    console.error('Deposit address API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
