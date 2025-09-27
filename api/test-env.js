// Test endpoint to check environment variables
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.json({
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
    GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME ? 'Set' : 'Not set',
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'Set' : 'Not set',
    GCS_KEY_B64: process.env.GCS_KEY_B64 ? 'Set' : 'Not set',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV
  });
}
