# Vercel Deployment Guide for AI Photo Booth

This guide will help you deploy your AI Photo Booth application to Vercel as a live website.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub (already done ✅)
3. **Environment Variables**: You'll need API keys and credentials

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

## Step 2: Prepare Environment Variables

You'll need to set up these environment variables in Vercel:

### Required Environment Variables:

1. **GEMINI_API_KEY** - Your Google Gemini API key
2. **STRIPE_SECRET_KEY** - Your Stripe secret key (starts with `sk_`)
3. **STRIPE_WEBHOOK_SECRET** - Your Stripe webhook secret
4. **JWT_SECRET** - A random string for JWT token signing
5. **SESSION_SECRET** - A random string for session management
6. **GOOGLE_CLOUD_PROJECT_ID** - Your GCP project ID (aiphotovault2)
7. **GCS_BUCKET_NAME** - Your GCS bucket name (aiphotovault)
8. **GCS_KEY_B64** - Your GCS service account key (base64 encoded)
9. **FRONTEND_URL** - Will be set automatically by Vercel

### Optional Environment Variables:
- **NODE_ENV** - Set to "production" (automatically set by Vercel)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com) and sign in**
2. **Click "New Project"**
3. **Import your GitHub repository**:
   - Select your `AiPhotoVault` repository
   - Click "Import"
4. **Configure the project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Add Environment Variables**:
   - Click "Environment Variables" tab
   - Add each variable from the list above
   - Make sure to mark them as "Production" environment
6. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# In your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name: ai-photo-booth (or your preferred name)
# - Directory: ./
# - Override settings? No
```

## Step 4: Configure Environment Variables in Vercel Dashboard

1. **Go to your project dashboard**
2. **Click "Settings" tab**
3. **Click "Environment Variables"**
4. **Add each variable**:

```
GEMINI_API_KEY = your_gemini_api_key_here
STRIPE_SECRET_KEY = sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET = whsec_your_webhook_secret_here
JWT_SECRET = your_random_jwt_secret_here
SESSION_SECRET = your_random_session_secret_here
GOOGLE_CLOUD_PROJECT_ID = aiphotovault2
GCS_BUCKET_NAME = aiphotovault
GCS_KEY_B64 = your_base64_encoded_gcs_key_here
```

## Step 5: Set Up Stripe Webhook

1. **Go to your Stripe Dashboard**
2. **Navigate to Webhooks**
3. **Click "Add endpoint"**
4. **Endpoint URL**: `https://your-app-name.vercel.app/api/stripe/webhook`
5. **Select events**: `payment_intent.succeeded`
6. **Copy the webhook secret** and add it to Vercel environment variables

## Step 6: Update Frontend URL

After deployment, Vercel will give you a URL like `https://your-app-name.vercel.app`. Update your environment variables:

1. **Go to Vercel Dashboard → Settings → Environment Variables**
2. **Add/Update**: `FRONTEND_URL = https://your-app-name.vercel.app`

## Step 7: Test Your Deployment

1. **Visit your Vercel URL**
2. **Test the registration flow**
3. **Test photo generation**
4. **Test payment flow** (if configured)

## Step 8: Custom Domain (Optional)

1. **Go to Vercel Dashboard → Settings → Domains**
2. **Add your custom domain**
3. **Update DNS records** as instructed
4. **Update FRONTEND_URL** environment variable

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is 18+ in `package.json`

2. **API Errors**:
   - Verify all environment variables are set
   - Check Vercel function logs in the dashboard

3. **CORS Issues**:
   - Ensure `FRONTEND_URL` is set correctly
   - Check that the URL matches your Vercel domain

4. **Database Issues**:
   - Verify GCS credentials are correct
   - Check that the bucket exists and is accessible

### Checking Logs:

1. **Go to Vercel Dashboard**
2. **Click "Functions" tab**
3. **Click on any function to see logs**

## Security Notes

- Never commit `.env` files to Git
- Use strong, random secrets for JWT_SECRET and SESSION_SECRET
- Keep your Stripe keys secure
- Regularly rotate your API keys

## Performance Optimization

- Vercel automatically handles CDN and caching
- Images are served from Google Cloud Storage
- API responses are optimized for serverless functions

## Monitoring

- Use Vercel Analytics for performance monitoring
- Set up Stripe webhook monitoring
- Monitor API usage and costs

---

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Stripe webhook set up
- [ ] Domain configured (if using custom domain)
- [ ] Test registration flow
- [ ] Test photo generation
- [ ] Test payment flow
- [ ] Monitor logs for errors

Your AI Photo Booth should now be live and accessible to users worldwide! 🚀
