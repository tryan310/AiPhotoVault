// Test database connection
import { authenticateUser } from '../server/database.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('Testing database connection...');
    
    // Try to authenticate a test user (this will fail, but we'll see the error)
    const result = await authenticateUser('test@example.com', 'testpassword');
    
    res.json({
      status: 'Database connection successful',
      result: result ? 'User found' : 'User not found (expected)'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      status: 'Database connection failed',
      error: error.message,
      stack: error.stack
    });
  }
}
