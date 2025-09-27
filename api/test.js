export default async function handler(req, res) {
  try {
    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
        GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME ? 'Set' : 'Not set',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Not set'
      }
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}