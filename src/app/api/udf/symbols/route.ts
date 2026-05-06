import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const limit = parseInt(searchParams.get('limit') || '30');

  // Mock symbols data
  const symbols = [
    { symbol: 'BTCUSD', full_name: 'Bitcoin/USD', description: 'Bitcoin', exchange: 'ORBITEX', type: 'crypto' },
    { symbol: 'ETHUSD', full_name: 'Ethereum/USD', description: 'Ethereum', exchange: 'ORBITEX', type: 'crypto' },
    { symbol: 'BTCEUR', full_name: 'Bitcoin/EUR', description: 'Bitcoin', exchange: 'ORBITEX', type: 'crypto' },
    { symbol: 'ETHEUR', full_name: 'Ethereum/EUR', description: 'Ethereum', exchange: 'ORBITEX', type: 'crypto' },
    { symbol: 'USDTUSD', full_name: 'Tether/USD', description: 'Tether', exchange: 'ORBITEX', type: 'crypto' },
    { symbol: 'BTCUSDT', full_name: 'Bitcoin/USDT', description: 'Bitcoin', exchange: 'ORBITEX', type: 'crypto' },
    { symbol: 'ETHUSDT', full_name: 'Ethereum/USDT', description: 'Ethereum', exchange: 'ORBITEX', type: 'crypto' }
  ];

  // Filter symbols based on query
  const filteredSymbols = symbols.filter(symbol => 
    symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
    symbol.full_name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, limit);

  return NextResponse.json(filteredSymbols);
}
