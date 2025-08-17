import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Orbitex API is running',
    status: 'success',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ 
    message: 'Test endpoint received data',
    data: body,
    status: 'success',
    timestamp: new Date().toISOString()
  });
} 