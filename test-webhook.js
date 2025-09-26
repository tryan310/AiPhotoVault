#!/usr/bin/env node

/**
 * Test script to verify webhook endpoint is working
 * Run this after setting up ngrok to test your webhook
 */

const https = require('https');
const http = require('http');

const WEBHOOK_URL = process.argv[2];

if (!WEBHOOK_URL) {
  console.log('Usage: node test-webhook.js <webhook-url>');
  console.log('Example: node test-webhook.js https://abc123.ngrok.io/api/webhook');
  process.exit(1);
}

// Test webhook endpoint
const testData = {
  id: 'evt_test_webhook',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123',
      object: 'checkout.session',
      payment_status: 'paid',
      metadata: {
        userId: '1',
        priceId: 'price_starter_placeholder'
      }
    }
  }
};

const postData = JSON.stringify(testData);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const client = WEBHOOK_URL.startsWith('https') ? https : http;

const req = client.request(WEBHOOK_URL, options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 200) {
      console.log('✅ Webhook endpoint is working!');
    } else {
      console.log('❌ Webhook endpoint returned an error');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
