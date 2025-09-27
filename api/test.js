import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
        GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME ? 'Set' : 'Not set',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Not set'
      }
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
