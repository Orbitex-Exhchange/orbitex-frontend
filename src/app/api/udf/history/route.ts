import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const resolution = searchParams.get('resolution') || '1D';
  const from = parseInt(searchParams.get('from') || '0');
  const to = parseInt(searchParams.get('to') || '0');

  // Mock historical data
  const mockData = {
    s: 'ok',
    t: [from, from + 86400, from + 172800, from + 259200, from + 345600],
    o: [50000, 51000, 52000, 53000, 54000],
    h: [51000, 52000, 53000, 54000, 55000],
    l: [49000, 50000, 51000, 52000, 53000],
    c: [51000, 52000, 53000, 54000, 55000],
    v: [1000, 1100, 1200, 1300, 1400]
  };

  return NextResponse.json(mockData);
}
