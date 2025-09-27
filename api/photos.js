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
    
    // Generate signed URLs for actual GCS images
    try {
      // Use fetch to call Google Cloud Storage API directly
      const imagePaths = [
        'users/1/photos/1758842908094/image_1.png',
        'users/1/photos/1758842908094/image_2.png'
      ];
      
      // For now, return the direct GCS URLs (they should work if the bucket is public)
      // TODO: Implement proper signed URL generation
      const photos = [
        {
          id: 1,
          theme: 'test',
          generated_images: imagePaths.map(path => 
            `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${path}`
          ),
          credits_used: 2,
          created_at: new Date().toISOString()
        }
      ];
      
      return res.status(200).json({ photos });
    } catch (error) {
      // Fallback to working images if GCS fails
      const photos = [
        {
          id: 1,
          theme: 'test',
          generated_images: [
            'https://picsum.photos/400/400?random=1',
            'https://picsum.photos/400/400?random=2'
          ],
          credits_used: 2,
          created_at: new Date().toISOString()
        }
      ];
      
      return res.status(200).json({ photos });
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}