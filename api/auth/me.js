import { Storage } from '@google-cloud/storage';
import jwt from 'jsonwebtoken';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GCS_KEY_B64 ? Buffer.from(process.env.GCS_KEY_B64, 'base64').toString() : undefined,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Helper functions
async function getUserById(userId) {
  try {
    // We need to find the user by ID, which requires scanning
    // For now, we'll use a simple approach with a users index
    const indexFile = bucket.file('users/index.json');
    const [exists] = await indexFile.exists();
    if (!exists) return null;
    
    const [data] = await indexFile.download();
    const index = JSON.parse(data.toString());
    const userEmail = index[userId];
    if (!userEmail) return null;
    
    const userFile = bucket.file(`users/${userEmail}/user.json`);
    const [userData] = await userFile.download();
    return JSON.parse(userData.toString());
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

function authenticateToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false };
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return { success: true, user: { id: decoded.userId } };
  } catch (error) {
    console.error('Token verification error:', error);
    return { success: false };
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate token
    const authResult = authenticateToken(req);
    if (!authResult.success) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserById(authResult.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      credits: user.credits
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
}
