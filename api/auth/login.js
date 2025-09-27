// Vercel serverless function for login
import { authenticateUser } from '../../server/database.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Login attempt:', { email: req.body?.email, hasPassword: !!req.body?.password });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate user
    console.log('Attempting to authenticate user:', email);
    const user = await authenticateUser(email, password);
    if (!user) {
      console.log('Authentication failed for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User authenticated successfully:', { id: user.id, email: user.email });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('JWT Secret available:', !!process.env.JWT_SECRET);
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );
    
    console.log('JWT token generated successfully');
    
    res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
