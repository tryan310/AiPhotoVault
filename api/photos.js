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
    const { Storage } = require('@google-cloud/storage');
    
    // Initialize GCS with environment variables
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: JSON.parse(Buffer.from(process.env.GCS_KEY_B64, 'base64').toString())
    });
    
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
    
    // Generate signed URLs for actual images
    const imagePaths = [
      'users/1/photos/1758842908094/image_1.png',
      'users/1/photos/1758842908094/image_2.png'
    ];
    
    const signedUrls = await Promise.all(
      imagePaths.map(async (path) => {
        try {
          const file = bucket.file(path);
          const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          });
          return signedUrl;
        } catch (error) {
          console.error('Error generating signed URL for', path, ':', error);
          return null;
        }
      })
    );
    
    const photos = [
      {
        id: 1,
        theme: 'test',
        generated_images: signedUrls.filter(url => url !== null),
        credits_used: 2,
        created_at: new Date().toISOString()
      }
    ];
    
    return res.status(200).json({ photos });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}