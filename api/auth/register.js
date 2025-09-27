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

async function createUser(name, email, password) {
  try {
    const userId = Date.now(); // Simple ID generation
    const passwordHash = await bcrypt.hash(password, 10);
    
    const userData = {
      id: userId,
      name,
      email,
      password_hash: passwordHash,
      credits: 0,
      created_at: new Date().toISOString()
    };
    
    // Save user to GCS
    const file = bucket.file(`users/${email}/user.json`);
    await file.save(JSON.stringify(userData, null, 2));
    
    // Update user index
    await updateUserIndex(userId, email);
    
    return userId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function updateUserIndex(userId, email) {
  try {
    const indexFile = bucket.file('users/index.json');
    let index = {};
    
    // Try to get existing index
    try {
      const [exists] = await indexFile.exists();
      if (exists) {
        const [data] = await indexFile.download();
        index = JSON.parse(data.toString());
      }
    } catch (error) {
      console.log('Creating new user index');
    }
    
    // Add new user to index
    index[userId] = email;
    
    // Save updated index
    await indexFile.save(JSON.stringify(index, null, 2));
  } catch (error) {
    console.error('Error updating user index:', error);
    // Don't throw here, as the user was already created
  }
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
