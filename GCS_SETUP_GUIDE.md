# 🗄️ Google Cloud Storage Setup Guide

## Why Google Cloud Storage?

### ✅ **Advantages over AWS S3:**
- **Better pricing** for small to medium usage
- **Free tier**: 5GB storage + 1GB egress per month
- **Integrated** with Google services (if using GCP)
- **Global CDN** with Cloud CDN
- **Better performance** in some regions

### 💰 **Cost Comparison:**
| Service | Storage (per GB/month) | Egress (per GB) | Free Tier |
|---------|----------------------|-----------------|-----------|
| **GCS** | $0.020 | $0.12 | 5GB + 1GB egress |
| **AWS S3** | $0.023 | $0.09 | 5GB + 1GB egress |
| **Azure** | $0.018 | $0.087 | 5GB + 1GB egress |

## 🔧 Setup Steps

### 1. Create Google Cloud Project
```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login and create project
gcloud auth login
gcloud projects create ai-photo-booth-$(date +%s)
gcloud config set project ai-photo-booth-$(date +%s)
```

### 2. Enable Required APIs
```bash
# Enable Cloud Storage API
gcloud services enable storage.googleapis.com

# Enable Cloud CDN (optional but recommended)
gcloud services enable compute.googleapis.com
```

### 3. Create Storage Bucket
```bash
# Create bucket with public access
gsutil mb gs://ai-photo-booth-images-$(date +%s)

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://ai-photo-booth-images-$(date +%s)

# Set CORS for web access
gsutil cors set cors.json gs://ai-photo-booth-images-$(date +%s)
```

### 4. Create Service Account
```bash
# Create service account
gcloud iam service-accounts create ai-photo-booth-service \
    --display-name="AI Photo Booth Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member="serviceAccount:ai-photo-booth-service@$(gcloud config get-value project).iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create ./gcs-key.json \
    --iam-account=ai-photo-booth-service@$(gcloud config get-value project).iam.gserviceaccount.com
```

## 🔒 Security & User Isolation

### **Folder Structure:**
```
ai-photo-booth-images/
├── users/
│   ├── 1/                    # User ID 1
│   │   └── photos/
│   │       ├── 1234567890/   # Photo set ID
│   │       │   ├── image_1.jpg
│   │       │   ├── image_2.jpg
│   │       │   └── ...
│   │       └── 1234567891/
│   │           └── ...
│   ├── 2/                    # User ID 2
│   │   └── photos/
│   │       └── ...
│   └── ...
```

### **Security Features:**

1. **User Isolation**: Each user's photos are in separate folders
2. **Database Verification**: Every request checks `user_id` in database
3. **No Direct Access**: Users can't access other users' folders
4. **Public URLs**: Images are publicly accessible via CDN
5. **CORS Protection**: Configured for your domain only

### **Access Control:**
```javascript
// ✅ SECURE: User can only access their own photos
const photos = await getUserPhotos(userId); // Only returns user's photos

// ❌ INSECURE: This would be dangerous
// const photos = await getAllPhotos(); // Would return all users' photos
```

## 📁 CORS Configuration

Create `cors.json`:
```json
[
  {
    "origin": ["https://your-domain.com", "https://www.your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
```

## 🔧 Environment Variables

Add to your `.env`:
```bash
# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=./gcs-key.json
GCS_BUCKET_NAME=ai-photo-booth-images-your-unique-id

# OR use environment variables instead of key file:
GOOGLE_CLOUD_CLIENT_EMAIL=ai-photo-booth-service@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 🚀 GCS Integration Complete

The application is now configured to use Google Cloud Storage for all photo storage. No migration is needed as the system is designed to work with GCS from the start.

## 📊 Performance Benefits

### **CDN Integration:**
```javascript
// Images are served from global CDN
const imageUrl = `https://storage.googleapis.com/your-bucket/users/1/photos/123/image_1.jpg`;

// With Cloud CDN (even faster):
const cdnUrl = `https://cdn.your-domain.com/users/1/photos/123/image_1.jpg`;
```

### **Caching:**
- **Browser Cache**: 1 year (configured in upload)
- **CDN Cache**: Global edge locations
- **Database**: Only stores URLs, not image data

## 💡 Best Practices

### 1. **Image Optimization:**
```javascript
// Resize images before upload
import sharp from 'sharp';

const optimizedBuffer = await sharp(buffer)
  .resize(1024, 1024, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer();
```

### 2. **Cleanup Old Images:**
```javascript
// Delete old photos automatically
export const cleanupOldPhotos = async (userId, daysOld = 30) => {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  const { data: oldPhotos } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .lt('created_at', cutoffDate.toISOString());
  
  for (const photo of oldPhotos) {
    await deletePhoto(photo.id, userId);
  }
};
```

### 3. **Monitoring:**
```javascript
// Track storage usage
export const getStorageUsage = async (userId) => {
  const bucket = storage.bucket(BUCKET_NAME);
  const [files] = await bucket.getFiles({ prefix: `users/${userId}/` });
  
  let totalSize = 0;
  for (const file of files) {
    const [metadata] = await file.getMetadata();
    totalSize += parseInt(metadata.size);
  }
  
  return {
    fileCount: files.length,
    totalSizeBytes: totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
  };
};
```

## 🎯 Summary

**Google Cloud Storage provides:**
- ✅ **User isolation** through folder structure
- ✅ **Security** through database verification
- ✅ **Performance** through global CDN
- ✅ **Cost efficiency** with competitive pricing
- ✅ **Scalability** for growing user base
- ✅ **Integration** with other Google services

**Your photos are completely secure** - users can only access their own photos through the database queries that verify ownership! 🔒
