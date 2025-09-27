export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const token = authHeader.substring(7);
    // Simple token verification for testing
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // For now, return mock photos for testing
    // TODO: Add proper database integration
    const photos = [
      {
        id: 1,
        theme: 'test',
        generated_images: [
          'https://storage.googleapis.com/aiphotovault/users/1/photos/1758842908094/image_1.png',
          'https://storage.googleapis.com/aiphotovault/users/1/photos/1758842908094/image_2.png'
        ],
        credits_used: 2,
        created_at: new Date().toISOString()
      }
    ];
    
    return res.status(200).json({ photos });
  } catch (error) {
    console.error('❌ Photos error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}