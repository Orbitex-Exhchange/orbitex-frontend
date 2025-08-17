import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
    supports_group_request: false,
    supports_marks: false,
    supports_timescale_marks: false,
    supports_time: true,
    exchanges: [
      { value: 'BINANCE', name: 'Binance', desc: 'Binance Exchange' },
      { value: 'COINBASE', name: 'Coinbase', desc: 'Coinbase Exchange' },
      { value: 'KRAKEN', name: 'Kraken', desc: 'Kraken Exchange' }
    ],
    symbols_types: [
      { name: 'Crypto', value: 'crypto' }
    ]
  };

  return NextResponse.json(config);
}
