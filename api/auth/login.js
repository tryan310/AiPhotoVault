import { Storage } from '@google-cloud/storage';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GCS_KEY_B64 ? Buffer.from(process.env.GCS_KEY_B64, 'base64').toString() : undefined,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Helper functions
async function getUserByEmail(email) {
  try {
    const file = bucket.file(`users/${email}/user.json`);
    const [exists] = await file.exists();
    if (!exists) return null;
    
    const [data] = await file.download();
    return JSON.parse(data.toString());
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
}

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
    console.log('🔐 Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id);
    
    const response = { 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        credits: user.credits 
      } 
    };
    
    console.log('✅ Login successful for user:', user.id);
    res.json(response);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
}
