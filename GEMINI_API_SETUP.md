# 🔑 Gemini API Key Setup

## ❌ Current Issue
Your API key `AIzaSyDIfnbYmLlsLH18mG86HQYxnvfSWfVwKs8` is **INVALID**.

## ✅ Solution: Get a Valid API Key

### Step 1: Go to Google AI Studio
1. Open [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the new API key (starts with `AIza...`)

### Step 2: Update Your .env File
Replace the invalid key in your `.env` file:

```bash
# Current (INVALID):
GEMINI_API_KEY=AIzaSyDIfnbYmLlsLH18mG86HQYxnvfSWfVwKs8

# Replace with your new valid key:
GEMINI_API_KEY=your_new_valid_api_key_here
```

### Step 3: Quick Update Command
If you get a new API key, run this command:
```bash
# Replace YOUR_NEW_KEY_HERE with your actual new API key
sed -i '' 's/GEMINI_API_KEY=.*/GEMINI_API_KEY=YOUR_NEW_KEY_HERE/' .env
```

### Step 4: Restart Servers
After updating the key:
```bash
# Stop current servers (Ctrl+C)
# Then restart:
npm run dev:full
```

## 🧪 Test the Fix
1. Go to http://localhost:5173
2. Upload a photo and try AI generation
3. Check browser console for:
   - ✅ `Gemini API Key available: true`
   - ✅ No more "API key not valid" errors

## 🔍 Troubleshooting
- **Still getting errors?** Make sure you copied the entire API key
- **Key not working?** Try creating a new API key
- **Need help?** Check the [Google AI Studio documentation](https://ai.google.dev/docs)

Your AI photo generation will work once you have a valid API key! 🎨
