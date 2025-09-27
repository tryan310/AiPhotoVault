export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    console.log('🔑 JWT_SECRET available:', !!process.env.JWT_SECRET);
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For now, accept any email/password combination for testing
    // TODO: Add proper database authentication
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: 1, email: email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);
    
    return res.status(200).json({
      token,
      user: {
        id: 1,
        email: email,
        credits: 10,
        subscription_status: 'active'
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}