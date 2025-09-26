#!/usr/bin/env node

/**
 * Test script to verify Gemini API key
 * Usage: node test-gemini-key.js YOUR_API_KEY
 */

import https from 'https';

const API_KEY = process.argv[2];

if (!API_KEY) {
  console.log('❌ Usage: node test-gemini-key.js YOUR_API_KEY');
  console.log('Example: node test-gemini-key.js AIzaSy...');
  process.exit(1);
}

console.log('🔍 Testing Gemini API key...');
console.log('🔍 Key length:', API_KEY.length);
console.log('🔍 Key starts with:', API_KEY.substring(0, 10));

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1beta/models?key=${API_KEY}`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.error) {
        console.log('❌ API Key Error:', response.error.message);
        console.log('❌ Status:', response.error.status);
        console.log('❌ Your API key is invalid or has no permissions');
      } else if (response.models) {
        console.log('✅ API Key is valid!');
        console.log('✅ Found', response.models.length, 'models');
        console.log('✅ Your key has the correct permissions');
      } else {
        console.log('⚠️  Unexpected response:', data);
      }
    } catch (error) {
      console.log('❌ Failed to parse response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.end();
