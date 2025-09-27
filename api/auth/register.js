import express from 'express';
import { createUser, getUserByEmail } from '../../server/database-config.js';
import { generateToken } from '../../server/auth.js';

const app = express();
app.use(express.json());

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📝 Registration attempt:', { email: req.body.email, name: req.body.name });
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const userId = await createUser(name, email, password);
    
    // Generate JWT token
    const token = generateToken(userId);
    
    const response = { 
      success: true, 
      token, 
      user: { id: userId, name, email, credits: 0 } 
    };
    
    console.log('✅ Registration successful for user:', userId);
    res.json(response);
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
}
