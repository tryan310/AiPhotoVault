import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { generateImage } from '../../services/geminiService.js';
import { spendCredits, recordUsage } from '../../server/database-config.js';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    const { prompt, count = 1 } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check if user has enough credits
    const requiredCredits = count * 1; // 1 credit per image
    const user = await getUserById(decoded.userId);
    if (user.credits < requiredCredits) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Generate images
    const images = await generateImage(prompt, count);
    
    // Spend credits
    await spendCredits(decoded.userId, requiredCredits);
    
    // Record usage
    await recordUsage(decoded.userId, 'image_generation', requiredCredits, { prompt, count });

    return NextResponse.json({ images });
  } catch (error) {
    console.error('❌ Generate error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
