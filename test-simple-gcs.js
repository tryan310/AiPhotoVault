#!/usr/bin/env node

/**
 * Simple Google Cloud Storage Test
 */

import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

async function testSimpleGCS() {
  try {
    console.log('🧪 Testing Simple Google Cloud Storage Connection...');
    console.log('==========================================');
    
    console.log('\n📋 Environment Variables:');
    console.log(`GOOGLE_CLOUD_PROJECT_ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID ? '✅ Set' : '❌ Not set'}`);
    console.log(`GCS_BUCKET_NAME: ${process.env.GCS_BUCKET_NAME ? '✅ Set' : '❌ Not set'}`);
    console.log(`GOOGLE_CLOUD_KEY_FILE: ${process.env.GOOGLE_CLOUD_KEY_FILE ? '✅ Set' : '❌ Not set'}`);
    
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_KEY_FILE) {
      console.log('\n❌ Missing required environment variables');
      return;
    }
    
    console.log('\n🔧 Initializing Google Cloud Storage...');
    
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });
    
    console.log('✅ Google Cloud Storage client initialized');
    
    // Test 1: Try to get project info
    console.log('\n📊 Testing project access...');
    try {
      const [serviceAccount] = await storage.authClient.getAccessToken();
      console.log('✅ Service account authentication successful');
    } catch (error) {
      console.log('❌ Service account authentication failed:', error.message);
    }
    
    // Test 2: Try to list buckets (this might fail due to permissions)
    console.log('\n🪣 Testing bucket listing...');
    try {
      const [buckets] = await storage.getBuckets();
      console.log(`✅ Successfully listed ${buckets.length} bucket(s):`);
      buckets.forEach((bucket, index) => {
        console.log(`  ${index + 1}. ${bucket.name}`);
      });
    } catch (error) {
      console.log('❌ Failed to list buckets:', error.message);
      console.log('\n🔧 This is likely a permissions issue. You need to:');
      console.log('1. Go to Google Cloud Console → IAM & Admin → IAM');
      console.log('2. Find your service account: aiphotovault@aiphotovault2.iam.gserviceaccount.com');
      console.log('3. Add these roles:');
      console.log('   - Storage Admin');
      console.log('   - Storage Legacy Bucket Reader');
    }
    
    // Test 3: If we have a bucket name, try to access it
    if (process.env.GCS_BUCKET_NAME && process.env.GCS_BUCKET_NAME !== 'your-bucket-name-here') {
      console.log(`\n🪣 Testing bucket access: ${process.env.GCS_BUCKET_NAME}`);
      try {
        const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
        const [exists] = await bucket.exists();
        if (exists) {
          console.log('✅ Bucket exists and is accessible');
        } else {
          console.log('❌ Bucket does not exist or is not accessible');
        }
      } catch (error) {
        console.log('❌ Failed to access bucket:', error.message);
      }
    } else {
      console.log('\n⚠️  No valid bucket name provided. Please update GCS_BUCKET_NAME in your .env file');
    }
    
  } catch (error) {
    console.error('❌ Google Cloud Storage setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you have created a service account');
    console.log('2. Download the service account key JSON file');
    console.log('3. Place it in your project root as "gcs-key.json"');
    console.log('4. Update your .env file with the correct project ID and bucket name');
    console.log('5. Make sure the service account has Storage Admin permissions');
  }
}

testSimpleGCS();
