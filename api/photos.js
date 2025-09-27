import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserPhotos } from '../../server/database-gcs.js';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    const photos = await getUserPhotos(decoded.userId);
    
    return NextResponse.json({ photos });
  } catch (error) {
    console.error('❌ Photos error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
