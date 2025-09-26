# 🔑 Step-by-Step Gemini API Key Fix

## The Problem
Your current API key `AIzaSyDIfnbYmLlsLH18mG86HQYxnvfSWfVwKs8` is **invalid** and not working with the Gemini API.

## Step-by-Step Solution

### Step 1: Go to Google AI Studio
1. **Open**: https://aistudio.google.com/
2. **Sign in** with your Google account
3. **Make sure you're on the correct site** (not Google Cloud Console)

### Step 2: Get a New API Key
1. **Click "Get API Key"** in the left sidebar
2. **Click "Create API Key"**
3. **Select "Create API key in new project"** (recommended)
4. **Copy the entire key** (it should start with `AIzaSy` and be about 39 characters long)

### Step 3: Test the New Key
Before updating your `.env` file, test the key:

```bash
# Replace YOUR_NEW_KEY with your actual key
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_NEW_KEY"
```

**Expected result**: Should return a JSON list of models, not an error.

### Step 4: Update Your .env File
```bash
# Open your .env file
nano .env

# Replace the GEMINI_API_KEY line with your new key:
GEMINI_API_KEY=your_new_key_here
```

### Step 5: Restart Your Server
```bash
# Stop current server
pkill -f "node server/index.js"

# Start server again
npm run dev:full
```

## Common Issues

### ❌ Wrong API Key Type
- **Google Cloud API Key** - Won't work with Gemini
- **Google AI Studio API Key** - ✅ This is what you need

### ❌ Incorrect Format
- **Too short** - Should be ~39 characters
- **Wrong prefix** - Should start with `AIzaSy`
- **Extra spaces** - No spaces in the key

### ❌ Wrong Permissions
- **No image generation** - Make sure the key has image generation permissions
- **Restricted access** - Check if the key is restricted to specific domains

## Verification

After updating your key, you should see:
```
🔑 Gemini API Key loaded: Yes
🔑 API Key length: 39
```

And when you try to generate photos, it should work without the "API Key not found" error.

## Alternative: Use a Different Account

If you're still having issues:
1. **Try a different Google account**
2. **Make sure the account has access to Gemini**
3. **Check if there are any billing restrictions**

## Current Status
- ❌ **Current Key**: Invalid
- ✅ **Next Step**: Get new key from Google AI Studio
- ✅ **Test**: Verify key works before updating .env

Once you get a valid key, your AI photo generation will work perfectly! 🎉
