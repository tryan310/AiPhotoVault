#!/usr/bin/env node

/**
 * List Google Cloud Storage Buckets
 */

import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

async function listBuckets() {
  try {
    console.log('🪣 Listing your Google Cloud Storage buckets...');
    
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });
    
    const [buckets] = await storage.getBuckets();
    
    console.log(`\n📦 Found ${buckets.length} bucket(s):`);
    buckets.forEach((bucket, index) => {
      console.log(`${index + 1}. ${bucket.name}`);
    });
    
    if (buckets.length > 0) {
      console.log('\n✅ Copy one of these bucket names to your .env file');
      console.log('Example: GCS_BUCKET_NAME=your-bucket-name');
    } else {
      console.log('\n❌ No buckets found. Please create a bucket first.');
    }
    
  } catch (error) {
    console.error('❌ Error listing buckets:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your service account has Storage Admin permissions');
    console.log('2. Check that your project ID is correct');
    console.log('3. Verify your service account key file is valid');
  }
}

listBuckets();
