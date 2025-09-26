# 🔑 Gemini API Key Fix

## Problem
Your current Gemini API key is invalid. The error "API Key not found. Please pass a valid API key." indicates the key is not working.

## Solution

### 1. Get a New Gemini API Key

1. **Go to Google AI Studio**: https://aistudio.google.com/
2. **Sign in** with your Google account
3. **Click "Get API Key"** in the left sidebar
4. **Create a new API key**:
   - Click "Create API Key"
   - Select "Create API key in new project" (recommended)
   - Copy the new API key

### 2. Update Your .env File

Replace the current API key in your `.env` file:

```bash
# Open your .env file
nano .env

# Replace this line:
GEMINI_API_KEY=AIzaSyDIfnbYmLlsLH18mG86HQYxnvfSWfVwKs8

# With your new API key:
GEMINI_API_KEY=your_new_api_key_here
```

### 3. Restart Your Server

```bash
# Stop the current server
pkill -f "node server/index.js"

# Start the server again
npm run dev:full
```

### 4. Test the Fix

1. **Go to your app**: http://localhost:5173
2. **Login to your account**
3. **Try generating photos** - it should work now!

## Alternative: Use a Different API Key

If you have another Gemini API key, you can use that instead. Just make sure it's valid and has the necessary permissions for image generation.

## Troubleshooting

- **Make sure the API key is correct** - no extra spaces or characters
- **Check the API key has image generation permissions**
- **Verify the key is from Google AI Studio** (not Google Cloud)
- **Restart the server** after changing the .env file

## Current Status

❌ **Current API Key**: Invalid  
✅ **Fix Required**: Get new API key from Google AI Studio  
✅ **Next Step**: Update .env file and restart server  

Once you get a new API key, your AI photo generation will work perfectly! 🎉
