import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ 
    message: `Test endpoint with ID: ${params.id}`,
    id: params.id,
    status: 'success',
    timestamp: new Date().toISOString()
  });
} 