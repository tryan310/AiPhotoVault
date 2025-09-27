import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { deletePhoto } from '../../server/database-config.js';

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    const { id } = params;
    
    await deletePhoto(parseInt(id), decoded.userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Delete photo error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
