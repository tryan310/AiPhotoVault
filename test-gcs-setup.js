#!/usr/bin/env node

/**
 * Test Google Cloud Storage Setup
 * This script will verify your GCS configuration
 */

import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

async function testGCSSetup() {
  console.log('🧪 Testing Google Cloud Storage Setup...');
  console.log('==========================================');
  
  try {
    // Check environment variables
    console.log('\n📋 Environment Variables:');
    console.log(`GOOGLE_CLOUD_PROJECT_ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`GCS_BUCKET_NAME: ${process.env.GCS_BUCKET_NAME ? '✅ Set' : '❌ Missing'}`);
    console.log(`GOOGLE_CLOUD_KEY_FILE: ${process.env.GOOGLE_CLOUD_KEY_FILE ? '✅ Set' : '❌ Missing'}`);
    
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID is required');
    }
    if (!process.env.GCS_BUCKET_NAME) {
      throw new Error('GCS_BUCKET_NAME is required');
    }
    
    // Initialize Storage
    console.log('\n🔧 Initializing Google Cloud Storage...');
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });
    
    // Test bucket access
    console.log(`\n🪣 Testing bucket access: ${process.env.GCS_BUCKET_NAME}`);
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
    const [exists] = await bucket.exists();
    
    if (!exists) {
      throw new Error(`Bucket ${process.env.GCS_BUCKET_NAME} does not exist or is not accessible`);
    }
    
    console.log('✅ Bucket exists and is accessible');
    
    // Test file upload
    console.log('\n📤 Testing file upload...');
    const testFileName = `test/connection-test-${Date.now()}.txt`;
    const testFile = bucket.file(testFileName);
    
    await testFile.save('Hello from AI Photo Booth!', {
      metadata: {
        contentType: 'text/plain',
      },
      // Remove public: true since uniform bucket-level access is enabled
    });
    
    console.log('✅ File upload successful');
    
    // Test file download
    console.log('\n📥 Testing file download...');
    const [contents] = await testFile.download();
    console.log(`✅ File download successful: ${contents.toString()}`);
    
    // Clean up test file
    console.log('\n🧹 Cleaning up test file...');
    try {
      await testFile.delete();
      console.log('✅ Test file deleted');
    } catch (deleteError) {
      console.log('⚠️  Test file uploaded but could not be deleted due to retention policy:', deleteError.message);
      console.log('✅ This is normal for buckets with retention policies');
    }
    
    // Test bucket permissions
    console.log('\n🔐 Testing bucket permissions...');
    const [metadata] = await bucket.getMetadata();
    console.log(`✅ Bucket location: ${metadata.location}`);
    console.log(`✅ Bucket storage class: ${metadata.storageClass}`);
    
    console.log('\n🎉 Google Cloud Storage setup is working perfectly!');
    console.log('\nNext steps:');
    console.log('1. Update your .env file with the correct values');
    console.log('2. Restart your server');
    console.log('3. Test photo generation and storage');
    
  } catch (error) {
    console.error('\n❌ Google Cloud Storage setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you have created a service account');
    console.log('2. Download the service account key JSON file');
    console.log('3. Place it in your project root as "gcs-key.json"');
    console.log('4. Update your .env file with the correct project ID and bucket name');
    console.log('5. Make sure the service account has Storage Admin permissions');
    
    process.exit(1);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testGCSSetup();
}

export { testGCSSetup };
