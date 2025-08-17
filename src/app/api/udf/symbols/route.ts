import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const limit = parseInt(searchParams.get('limit') || '30');

  // Mock symbols data
  const symbols = [
    { symbol: 'BTCUSDT', full_name: 'Bitcoin/USDT', description: 'Bitcoin', exchange: 'BINANCE', type: 'crypto' },
    { symbol: 'ETHUSDT', full_name: 'Ethereum/USDT', description: 'Ethereum', exchange: 'BINANCE', type: 'crypto' },
    { symbol: 'ADAUSDT', full_name: 'Cardano/USDT', description: 'Cardano', exchange: 'BINANCE', type: 'crypto' },
    { symbol: 'DOTUSDT', full_name: 'Polkadot/USDT', description: 'Polkadot', exchange: 'BINANCE', type: 'crypto' },
    { symbol: 'LINKUSDT', full_name: 'Chainlink/USDT', description: 'Chainlink', exchange: 'BINANCE', type: 'crypto' },
    { symbol: 'LTCUSDT', full_name: 'Litecoin/USDT', description: 'Litecoin', exchange: 'BINANCE', type: 'crypto' },
    { symbol: 'BCHUSDT', full_name: 'Bitcoin Cash/USDT', description: 'Bitcoin Cash', exchange: 'BINANCE', type: 'crypto' },
    { symbol: 'XRPUSDT', full_name: 'Ripple/USDT', description: 'Ripple', exchange: 'BINANCE', type: 'crypto' },
    { symbol: 'BNBUSDT', full_name: 'Binance Coin/USDT', description: 'Binance Coin', exchange: 'BINANCE', type: 'crypto' },
    { symbol: 'EOSUSDT', full_name: 'EOS/USDT', description: 'EOS', exchange: 'BINANCE', type: 'crypto' }
  ];

  // Filter symbols based on query
  const filteredSymbols = symbols.filter(symbol => 
    symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
    symbol.full_name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, limit);

  return NextResponse.json(filteredSymbols);
}
