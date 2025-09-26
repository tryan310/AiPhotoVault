/**
 * Database with Google Cloud Storage for Photos
 * Uses SQLite for user data and GCS for photo storage
 */

import { Storage } from '@google-cloud/storage';
import { initDatabase } from './database.js';
import dotenv from 'dotenv';
import sharp from 'sharp'; // For image processing

dotenv.config();

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const GOOGLE_CLOUD_KEY_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS || '/app/gcs-key.json';

let storage;
let bucket;

if (GCS_BUCKET_NAME && GOOGLE_CLOUD_PROJECT_ID && GOOGLE_CLOUD_KEY_FILE) {
  storage = new Storage({
    projectId: GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: GOOGLE_CLOUD_KEY_FILE,
  });
  bucket = storage.bucket(GCS_BUCKET_NAME);
  console.log(`✅ Google Cloud Storage initialized for bucket: ${GCS_BUCKET_NAME}`);
} else {
  console.warn('⚠️ Google Cloud Storage environment variables not fully configured. GCS functions will not be available.');
}

// Re-export all functions from database.js for user/credit management
export * from './database.js';

// Helper function to generate signed URLs
const generateSignedUrl = async (fileName, expirationMinutes = 60) => {
  try {
    console.log(`🔗 Generating signed URL for: ${fileName}`);
    const file = bucket.file(fileName);
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationMinutes * 60 * 1000, // Convert minutes to milliseconds
    });
    console.log(`✅ Generated signed URL: ${signedUrl.substring(0, 100)}...`);
    return signedUrl;
  } catch (error) {
    console.error('❌ Error generating signed URL for', fileName, ':', error);
    return null;
  }
};

// Override savePhotos, getUserPhotos, getPhotoById, deletePhoto for GCS
export const savePhotos = async (userId, originalImageUrl, generatedImages, theme, creditsUsed) => {
  if (!bucket) {
    throw new Error('Google Cloud Storage not configured. Cannot save photos.');
  }

  const photoSetId = Date.now(); // Unique ID for this set of photos
  const gcsImageUrls = [];

  for (let i = 0; i < generatedImages.length; i++) {
    const base64Data = generatedImages[i].replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const mimeType = generatedImages[i].match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
    const fileExtension = mimeType.split('/')[1] || 'jpeg';

    // Define GCS path: users/{userId}/photos/{photoSetId}/image_{index}.{ext}
    const gcsFileName = `users/${userId}/photos/${photoSetId}/image_${i + 1}.${fileExtension}`;
    const file = bucket.file(gcsFileName);

    // Optional: Resize/optimize image with sharp before uploading
    let optimizedBuffer = buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true }) // Example: resize to max 800px width
        .jpeg({ quality: 80 }) // Optimize JPEG quality
        .toBuffer();
    } catch (sharpError) {
      console.warn(`⚠️ Sharp optimization failed for image ${i + 1}:`, sharpError.message);
      // Continue with original buffer if optimization fails
    }

    await file.save(optimizedBuffer, {
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
      // Remove public: true since uniform bucket-level access is enabled
    });

    gcsImageUrls.push(file.publicUrl());
  }

  // Save GCS URLs to SQLite database using the original function
  console.log(`📸 Saving ${gcsImageUrls.length} photos to GCS for user ${userId}`);
  console.log(`📸 GCS URLs:`, gcsImageUrls);
  
  const { savePhoto: originalSavePhoto } = await import('./database.js');
  const photoId = await originalSavePhoto(userId, originalImageUrl, gcsImageUrls, theme, creditsUsed);
  
  console.log(`✅ Photos saved to GCS with ID: ${photoId}`);
  return photoId;
};

export const getUserPhotos = async (userId, limit = 50) => {
  const { getUserPhotos: originalGetUserPhotos } = await import('./database.js');
  const photos = await originalGetUserPhotos(userId, limit);
  
  // Process each photo to generate signed URLs
  const processedPhotos = await Promise.all(photos.map(async (photo) => {
    let imageUrls = photo.generated_images;
    
    // Parse if it's a JSON string
    if (typeof photo.generated_images === 'string' && photo.generated_images.startsWith('[')) {
      imageUrls = JSON.parse(photo.generated_images);
    }
    
    // Generate signed URLs for each image
    if (Array.isArray(imageUrls)) {
      const signedUrls = await Promise.all(
        imageUrls.map(async (url) => {
          // Extract the GCS file path from the URL
          const urlObj = new URL(url);
          // Remove the bucket name from the path and decode
          const pathWithoutBucket = urlObj.pathname.replace(`/${bucket.name}/`, '/');
          const fileName = decodeURIComponent(pathWithoutBucket.substring(1)); // Remove leading slash
          
          console.log(`🔗 Processing URL: ${url}`);
          console.log(`📁 Extracted filename: ${fileName}`);
          
          // Generate signed URL (valid for 24 hours)
          const signedUrl = await generateSignedUrl(fileName, 24 * 60);
          return signedUrl || url; // Fallback to original URL if signing fails
        })
      );
      
      return {
        ...photo,
        generated_images: signedUrls
      };
    }
    
    return {
      ...photo,
      generated_images: imageUrls
    };
  }));
  
  return processedPhotos;
};

export const getPhotoById = async (photoId, userId) => {
  const { getPhotoById: originalGetPhotoById } = await import('./database.js');
  const photo = await originalGetPhotoById(photoId, userId);

  if (photo) {
    let imageUrls = photo.generated_images;
    
    // Parse if it's a JSON string
    if (typeof photo.generated_images === 'string' && photo.generated_images.startsWith('[')) {
      imageUrls = JSON.parse(photo.generated_images);
    }
    
    // Generate signed URLs for each image
    if (Array.isArray(imageUrls)) {
      const signedUrls = await Promise.all(
        imageUrls.map(async (url) => {
          // Extract the GCS file path from the URL
          const urlObj = new URL(url);
          // Remove the bucket name from the path and decode
          const pathWithoutBucket = urlObj.pathname.replace(`/${bucket.name}/`, '/');
          const fileName = decodeURIComponent(pathWithoutBucket.substring(1)); // Remove leading slash
          
          console.log(`🔗 Processing URL: ${url}`);
          console.log(`📁 Extracted filename: ${fileName}`);
          
          // Generate signed URL (valid for 24 hours)
          const signedUrl = await generateSignedUrl(fileName, 24 * 60);
          return signedUrl || url; // Fallback to original URL if signing fails
        })
      );
      
      photo.generated_images = signedUrls;
    } else {
      photo.generated_images = imageUrls;
    }
  }

  return photo;
};

export const deletePhoto = async (photoId, userId) => {
  if (!bucket) {
    throw new Error('Google Cloud Storage not configured. Cannot delete photos.');
  }

  const { getPhotoById: originalGetPhotoById, deletePhoto: originalDeletePhoto } = await import('./database.js');
  const photo = await originalGetPhotoById(photoId, userId);
  
  if (!photo) {
    throw new Error('Photo not found or not owned by user.');
  }

  const gcsImageUrls = typeof photo.generated_images === 'string' 
    ? JSON.parse(photo.generated_images) 
    : photo.generated_images;
  const photoSetPath = `users/${userId}/photos/${photoId}/`; // Assuming photoId is used in path

  // Delete all files within the photo set folder in GCS
  try {
    await bucket.deleteFiles({
      prefix: photoSetPath,
    });
  } catch (deleteError) {
    console.warn('⚠️ Could not delete files from GCS:', deleteError.message);
  }

  // Delete entry from SQLite database
  return await originalDeletePhoto(photoId, userId);
};