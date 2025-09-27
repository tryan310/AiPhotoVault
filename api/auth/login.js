import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔐 Login attempt for:', email);
    console.log('🔑 JWT_SECRET available:', !!process.env.JWT_SECRET);
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // For now, accept any email/password combination for testing
    // TODO: Add proper database authentication
    const token = jwt.sign(
      { userId: 1, email: email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);
    
    return NextResponse.json({
      token,
      user: {
        id: 1,
        email: email,
        credits: 10,
        subscription_status: 'active'
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
