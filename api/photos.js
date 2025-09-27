// Vercel serverless function for photos API
import { getUserPhotos } from '../server/database-gcs.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token and get user ID
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Get photos
      const photos = await getUserPhotos(user.id);
      res.json({ photos });
    } catch (error) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}