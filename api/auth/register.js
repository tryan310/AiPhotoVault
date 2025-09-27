import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createUser } from '../../server/database-config.js';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = await createUser(email, password);
    if (!user) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        subscription_status: user.subscription_status
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
