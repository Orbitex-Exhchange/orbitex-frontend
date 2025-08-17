import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
    supports_group_request: false,
    supports_marks: false,
    supports_search: true,
    supports_timescale_marks: false,
    exchanges: [
      { value: 'BINANCE', name: 'Binance', desc: 'Binance Exchange' },
      { value: 'COINBASE', name: 'Coinbase', desc: 'Coinbase Exchange' },
      { value: 'KRAKEN', name: 'Kraken', desc: 'Kraken Exchange' }
    ],
    symbols_types: [
      { name: 'crypto', value: 'crypto' }
    ]
  });
}
