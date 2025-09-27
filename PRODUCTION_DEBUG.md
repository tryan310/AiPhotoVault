# 🔧 Production Debug Guide

## 403 Error in PhotoVault - Troubleshooting

### What Was Fixed
The 403 error in PhotoVault was caused by failed signed URL generation in production. The fix includes:

1. **Environment Variable Support**: Added support for both `GOOGLE_CLOUD_KEY_FILE` and `GOOGLE_APPLICATION_CREDENTIALS`
2. **Bucket Name Support**: Added support for both `GCS_BUCKET_NAME` and `GOOGLE_CLOUD_BUCKET_NAME`
3. **Better Error Logging**: Enhanced logging to help debug production issues
4. **File Existence Check**: Added check to ensure files exist before generating signed URLs

### Required Production Environment Variables

Make sure these are set in your production environment (Railway/Heroku/etc.):

```bash
# Google Cloud Storage (Required)
GOOGLE_CLOUD_PROJECT_ID=aiphotovault2
GCS_BUCKET_NAME=aiphotovault
GOOGLE_APPLICATION_CREDENTIALS=/app/gcs-key.json

# Alternative bucket name variable (also supported)
# GOOGLE_CLOUD_BUCKET_NAME=aiphotovault

# Alternative key file variable (also supported)
# GOOGLE_CLOUD_KEY_FILE=/app/gcs-key.json

# GCS Key (Base64 encoded - for Railway)
GCS_KEY_B64=your_base64_encoded_gcs_key_here

# Other required variables
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

### Railway-Specific Configuration

Railway uses a special setup where the GCS key is provided as a base64-encoded environment variable:

1. **GCS_KEY_B64**: Base64-encoded content of your `gcs-key.json` file
2. **Railway Start Command**: `bash -lc "echo \"$GCS_KEY_B64\" | base64 -d > /app/gcs-key.json && sleep 2 && node server/index.js"`

### How to Check Production Logs

1. **Railway Dashboard**: Go to your project → Deployments → View logs
2. **Look for these log messages**:
   ```
   🔧 GCS Environment Variables:
   GCS_BUCKET_NAME: aiphotovault
   GOOGLE_CLOUD_PROJECT_ID: aiphotovault2
   GOOGLE_CLOUD_KEY_FILE: /app/gcs-key.json
   ✅ Google Cloud Storage initialized for bucket: aiphotovault
   ```

3. **If you see errors**, check:
   - Missing environment variables
   - Incorrect bucket name
   - GCS key file issues
   - File not found errors

### Testing the Fix

1. **Deploy the latest code** (already done)
2. **Check production logs** for GCS initialization
3. **Test PhotoVault** in production
4. **Look for signed URL generation** in logs:
   ```
   🔗 Generating signed URL for: users/1/photos/1758846582952/image_3.png
   ✅ Generated signed URL: https://storage.googleapis.com/...
   ```

### Common Issues and Solutions

#### Issue: "GCS bucket not available"
**Solution**: Check that `GCS_BUCKET_NAME` and `GOOGLE_CLOUD_PROJECT_ID` are set correctly

#### Issue: "File does not exist"
**Solution**: The photo file might have been deleted or moved. Check GCS bucket directly.

#### Issue: "Failed to initialize Google Cloud Storage"
**Solution**: Check that `GOOGLE_APPLICATION_CREDENTIALS` points to a valid key file

#### Issue: "Environment variables not fully configured"
**Solution**: Ensure all required environment variables are set in production

### Verification Steps

1. ✅ **Code deployed** to production
2. ✅ **Environment variables** set correctly
3. ✅ **GCS initialization** successful in logs
4. ✅ **Signed URLs** being generated
5. ✅ **PhotoVault** loads without 403 errors

### Next Steps

If the issue persists after deployment:

1. Check production logs for specific error messages
2. Verify all environment variables are set
3. Test GCS access directly
4. Check if the GCS key file is being created correctly in production

The fix should resolve the 403 errors in PhotoVault! 🎉
