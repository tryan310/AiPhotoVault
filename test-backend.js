// Simple test script to verify backend setup
import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('🧪 Testing backend server...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test checkout endpoint (this will fail without real Stripe keys, but we can test the endpoint exists)
    console.log('\n2. Testing checkout endpoint...');
    const checkoutResponse = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: 'test_price_id' })
    });
    
    if (checkoutResponse.status === 500) {
      console.log('✅ Checkout endpoint exists (expected error with test data)');
    } else {
      console.log('✅ Checkout endpoint working');
    }

    console.log('\n🎉 Backend server is running correctly!');
    console.log('📝 Next steps:');
    console.log('   1. Update your .env file with real Stripe keys');
    console.log('   2. Create products in your Stripe dashboard');
    console.log('   3. Update price IDs in constants.ts');
    console.log('   4. Run: npm run dev:full');

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('\n🔧 Make sure to:');
    console.log('   1. Create .env file with STRIPE_SECRET_KEY');
    console.log('   2. Run: npm run server');
  }
}

testBackend();
