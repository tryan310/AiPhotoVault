#!/usr/bin/env node

/**
 * Test Direct Bucket Access
 */

import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

async function testBucketAccess() {
  try {
    console.log('🧪 Testing Direct Bucket Access...');
    console.log('==========================================');
    
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });
    
    const bucketName = process.env.GCS_BUCKET_NAME;
    console.log(`\n🪣 Testing bucket: ${bucketName}`);
    
    const bucket = storage.bucket(bucketName);
    
    // Test 1: Check if bucket exists
    console.log('\n📊 Checking if bucket exists...');
    try {
      const [exists] = await bucket.exists();
      if (exists) {
        console.log('✅ Bucket exists and is accessible');
      } else {
        console.log('❌ Bucket does not exist');
        return;
      }
    } catch (error) {
      console.log('❌ Failed to check bucket existence:', error.message);
      console.log('\n🔧 This means your service account needs:');
      console.log('1. Go to Google Cloud Console → IAM & Admin → IAM');
      console.log('2. Find your service account: aiphotovault@aiphotovault2.iam.gserviceaccount.com');
      console.log('3. Add these roles:');
      console.log('   - Storage Admin (or Storage Object Admin)');
      console.log('   - Storage Legacy Bucket Reader');
      return;
    }
    
    // Test 2: Try to upload a test file
    console.log('\n📤 Testing file upload...');
    try {
      const testFileName = `test-${Date.now()}.txt`;
      const file = bucket.file(testFileName);
      
      await file.save('Hello from AI Photo Booth!', {
        metadata: {
          contentType: 'text/plain',
        },
      });
      
      console.log('✅ Test file uploaded successfully');
      
      // Test 3: Try to delete the test file
      console.log('\n🗑️  Testing file deletion...');
      try {
        await file.delete();
        console.log('✅ Test file deleted successfully');
      } catch (deleteError) {
        console.log('⚠️  Test file uploaded but could not be deleted:', deleteError.message);
      }
      
    } catch (uploadError) {
      console.log('❌ Failed to upload test file:', uploadError.message);
      console.log('\n🔧 This means your service account needs:');
      console.log('1. Go to Google Cloud Console → IAM & Admin → IAM');
      console.log('2. Find your service account: aiphotovault@aiphotovault2.iam.gserviceaccount.com');
      console.log('3. Add these roles:');
      console.log('   - Storage Admin (or Storage Object Admin)');
      console.log('   - Storage Legacy Bucket Reader');
    }
    
    console.log('\n🎉 Google Cloud Storage setup is working!');
    console.log('Your AI Photo Booth can now store photos in Google Cloud Storage.');
    
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

testBucketAccess();
