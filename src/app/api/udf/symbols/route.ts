import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const exchange = searchParams.get('exchange') || '';
  const symbolType = searchParams.get('type') || '';

  // Mock symbols data
  const symbols = [
    {
      symbol: 'BTCUSDT',
      description: 'Bitcoin/USDT',
      exchange: 'BINANCE',
      ticker: 'BTCUSDT',
      type: 'crypto'
    },
    {
      symbol: 'ETHUSDT',
      description: 'Ethereum/USDT',
      exchange: 'BINANCE',
      ticker: 'ETHUSDT',
      type: 'crypto'
    },
    {
      symbol: 'ADAUSDT',
      description: 'Cardano/USDT',
      exchange: 'BINANCE',
      ticker: 'ADAUSDT',
      type: 'crypto'
    },
    {
      symbol: 'DOTUSDT',
      description: 'Polkadot/USDT',
      exchange: 'BINANCE',
      ticker: 'DOTUSDT',
      type: 'crypto'
    }
  ];

  // Filter symbols based on query
  const filteredSymbols = symbols.filter(symbol => 
    symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
    symbol.description.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json(filteredSymbols);
}
