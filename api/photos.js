import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // For now, return mock photos for testing
    // TODO: Add proper database integration
    const photos = [
      {
        id: 1,
        theme: 'test',
        generated_images: [
          'https://storage.googleapis.com/aiphotovault/users/1/photos/1758842908094/image_1.png',
          'https://storage.googleapis.com/aiphotovault/users/1/photos/1758842908094/image_2.png'
        ],
        credits_used: 2,
        created_at: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({ photos });
  } catch (error) {
    console.error('❌ Photos error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
