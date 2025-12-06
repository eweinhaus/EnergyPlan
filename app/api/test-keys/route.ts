import { NextResponse } from 'next/server';

export async function GET() {
  // Only expose in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const keys = {
    EIA_API_KEY: process.env.EIA_API_KEY ? `${process.env.EIA_API_KEY.substring(0, 8)}...` : 'NOT SET',
    UTILITY_API_KEY: process.env.UTILITY_API_KEY ? `${process.env.UTILITY_API_KEY.substring(0, 8)}...` : 'NOT SET',
    EIA_KEY_LENGTH: process.env.EIA_API_KEY?.length || 0,
    UTILITY_KEY_LENGTH: process.env.UTILITY_API_KEY?.length || 0,
  };

  // Log to console for debugging
  console.log('🔑 Debug API Keys:', {
    EIA: process.env.EIA_API_KEY ? 'SET' : 'NOT SET',
    UTILITY: process.env.UTILITY_API_KEY ? 'SET' : 'NOT SET'
  });

  return NextResponse.json(keys);
}
