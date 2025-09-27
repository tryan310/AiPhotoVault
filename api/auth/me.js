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
    
    return res.status(200).json({
      id: decoded.userId,
      email: decoded.email,
      credits: 10,
      subscription_status: 'active'
    });
  } catch (error) {
    console.error('❌ Auth me error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
