/**
 * Test script to check production environment variables
 * This will help debug the production GCS configuration
 */

import dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';

dotenv.config();

console.log('🔧 Production Environment Check');
console.log('================================');

// Check all GCS-related environment variables
console.log('Environment Variables:');
console.log('GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
console.log('GOOGLE_CLOUD_BUCKET_NAME:', process.env.GOOGLE_CLOUD_BUCKET_NAME);
console.log('GOOGLE_CLOUD_PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
console.log('GOOGLE_CLOUD_KEY_FILE:', process.env.GOOGLE_CLOUD_KEY_FILE);
console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log('GCS_KEY_B64:', process.env.GCS_KEY_B64 ? 'Set (base64 encoded)' : 'Not set');

// Determine which variables are being used
const bucketName = process.env.GCS_BUCKET_NAME || process.env.GOOGLE_CLOUD_BUCKET_NAME;
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const keyFile = process.env.GOOGLE_CLOUD_KEY_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS || '/app/gcs-key.json';

console.log('\n📋 Resolved Configuration:');
console.log('Bucket Name:', bucketName);
console.log('Project ID:', projectId);
console.log('Key File:', keyFile);

// Test GCS initialization
if (bucketName && projectId && keyFile) {
  console.log('\n🧪 Testing GCS Initialization...');
  
  try {
    const storage = new Storage({
      projectId: projectId,
      keyFilename: keyFile,
    });
    
    const bucket = storage.bucket(bucketName);
    console.log('✅ GCS Storage initialized successfully');
    
    // Test bucket access
    bucket.exists().then(([exists]) => {
      if (exists) {
        console.log('✅ Bucket exists and is accessible');
      } else {
        console.log('❌ Bucket does not exist or is not accessible');
      }
    }).catch(error => {
      console.error('❌ Error checking bucket:', error.message);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize GCS:', error.message);
    console.error('Error details:', error);
  }
} else {
  console.log('\n❌ Missing required environment variables:');
  if (!bucketName) console.log('  - GCS_BUCKET_NAME or GOOGLE_CLOUD_BUCKET_NAME');
  if (!projectId) console.log('  - GOOGLE_CLOUD_PROJECT_ID');
  if (!keyFile) console.log('  - GOOGLE_CLOUD_KEY_FILE or GOOGLE_APPLICATION_CREDENTIALS');
}
