/**
 * Database Configuration
 * Uses Google Cloud Storage for photo storage with SQLite for user data
 */

import dotenv from 'dotenv';
dotenv.config();

// Check if Google Cloud Storage is configured
const useGCS = process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GCS_BUCKET_NAME;

if (!useGCS) {
  throw new Error('Google Cloud Storage configuration required. Please set GOOGLE_CLOUD_PROJECT_ID and GCS_BUCKET_NAME environment variables.');
}

console.log(`🗄️  Database: Google Cloud Storage`);
console.log(`📦 Project: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
console.log(`🪣 Bucket: ${process.env.GCS_BUCKET_NAME}`);

// Import GCS database module
console.log('📦 Using Google Cloud Storage for photo storage.');
const dbModule = await import('./database-gcs.js');

// Re-export all functions from the selected database module
export const initDatabase = dbModule.initDatabase;
export const createUser = dbModule.createUser;
export const getUserByEmail = dbModule.getUserByEmail;
export const getUserById = dbModule.getUserById;
export const getUserByGoogleId = dbModule.getUserByGoogleId;
export const updateUserCredits = dbModule.updateUserCredits;
export const addCredits = dbModule.addCredits;
export const spendCredits = dbModule.spendCredits;
export const recordUsage = dbModule.recordUsage;
export const getUserUsageHistory = dbModule.getUserUsageHistory;
export const getUserCreditTransactions = dbModule.getUserCreditTransactions;
export const updateUserSubscription = dbModule.updateUserSubscription;

// Photo-specific functions might be overridden by database-gcs.js
export const savePhotos = dbModule.savePhotos;
export const getUserPhotos = dbModule.getUserPhotos;
export const getPhotoById = dbModule.getPhotoById;
export const deletePhoto = dbModule.deletePhoto;

export const db = dbModule.db; // Export the database instance if needed