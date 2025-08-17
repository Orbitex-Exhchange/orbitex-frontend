import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const resolution = searchParams.get('resolution') || '60';
  const from = parseInt(searchParams.get('from') || '0');
  const to = parseInt(searchParams.get('to') || '0');
  const countback = parseInt(searchParams.get('countback') || '1000');

  // Generate mock historical data
  const bars = generateMockBars(from, to, resolution, countback);

  return NextResponse.json({
    s: 'ok',
    t: bars.map(bar => bar.time),
    o: bars.map(bar => bar.open),
    h: bars.map(bar => bar.high),
    l: bars.map(bar => bar.low),
    c: bars.map(bar => bar.close),
    v: bars.map(bar => bar.volume)
  });
}

function generateMockBars(from: number, to: number, resolution: string, countback: number) {
  const bars = [];
  const interval = getIntervalInSeconds(resolution);
  let currentTime = from;
  let count = 0;
  
  while (currentTime < to && count < countback) {
    bars.push(generateMockBar(currentTime, resolution));
    currentTime += interval;
    count++;
  }
  
  return bars;
}

function generateMockBar(time: number, resolution: string) {
  const basePrice = 43000;
  const volatility = 0.02;
  const open = basePrice + (Math.random() - 0.5) * volatility * basePrice;
  const close = open + (Math.random() - 0.5) * volatility * basePrice;
  const high = Math.max(open, close) + Math.random() * volatility * basePrice;
  const low = Math.min(open, close) - Math.random() * volatility * basePrice;
  const volume = Math.random() * 1000 + 100;

  return {
    time: time,
    open: parseFloat(open.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    close: parseFloat(close.toFixed(2)),
    volume: parseFloat(volume.toFixed(2))
  };
}

function getIntervalInSeconds(resolution: string): number {
  const mapping: { [key: string]: number } = {
    '1': 60,
    '5': 300,
    '15': 900,
    '30': 1800,
    '60': 3600,
    '240': 14400,
    '1D': 86400,
    '1W': 604800,
    '1M': 2592000
  };
  return mapping[resolution] || 3600;
}
