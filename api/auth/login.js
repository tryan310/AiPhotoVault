import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getUserByEmail, comparePassword } from '../../server/database-config.js';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔐 Login attempt for:', email);
    console.log('🔑 JWT_SECRET available:', !!process.env.JWT_SECRET);
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);
    
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
    console.error('❌ Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
