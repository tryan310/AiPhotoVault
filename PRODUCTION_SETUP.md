# 🚀 Production Setup Guide

## Webhook Configuration for Stripe

### For Local Development (Testing Webhooks):

1. **Install ngrok** (if not already installed):
   ```bash
   brew install ngrok/ngrok/ngrok
   ```

2. **Start ngrok tunnel**:
   ```bash
   ngrok http 3001
   ```

3. **Copy the HTTPS URL** from ngrok output (looks like `https://abc123.ngrok.io`)

4. **In Stripe Dashboard**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - **Endpoint URL**: `https://your-ngrok-url.ngrok.io/api/webhook`
   - **Events to send**: Select `checkout.session.completed`
   - Click "Add endpoint"

5. **Copy the webhook secret** from Stripe and add to your `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### For Production Deployment:

When you deploy your app to a server (Heroku, Vercel, Railway, etc.):

1. **Deploy your app** to get a production URL like:
   - `https://your-app.herokuapp.com`
   - `https://your-app.vercel.app`
   - `https://yourdomain.com`

2. **In Stripe Dashboard**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - **Endpoint URL**: `https://your-production-url.com/api/webhook`
   - **Events to send**: Select `checkout.session.completed`
   - Click "Add endpoint"

3. **Copy the webhook secret** and add to your production environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## Environment Variables for Production

Create a `.env.production` file with:

```env
# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend
PORT=3001
FRONTEND_URL=https://your-production-url.com
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Storage (Required)
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=ai-photo-booth-images
GOOGLE_CLOUD_KEY_FILE=path/to/your/gcs-key.json

# Authentication
JWT_SECRET=your-super-secret-jwt-key-for-production
SESSION_SECRET=your-session-secret-for-production

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Stripe Webhook (Required for production)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### Option 2: Railway
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Option 3: Heroku
1. Create a Heroku app
2. Set environment variables: `heroku config:set KEY=value`
3. Deploy: `git push heroku main`

## Testing the Complete Flow

1. **Start your servers**:
   ```bash
   npm run dev:full
   ```

2. **Test the complete flow**:
   - Register a new user
   - Go to pricing page
   - Select a plan
   - Complete payment
   - Verify credits are added
   - Generate AI photos

## Webhook Verification

Your webhook endpoint is already set up at `/api/webhook` and will:
- ✅ Verify Stripe signatures (if `STRIPE_WEBHOOK_SECRET` is set)
- ✅ Add credits automatically when payment completes
- ✅ Handle all subscription events
- ✅ Log all webhook events for debugging

## Security Notes

- 🔒 Use HTTPS in production
- 🔒 Set strong JWT and session secrets
- 🔒 Use live Stripe keys only in production
- 🔒 Keep webhook secrets secure
- 🔒 Enable CORS for your production domain only

## Monitoring

Check your webhook logs in Stripe Dashboard:
- Go to Developers → Webhooks
- Click on your webhook
- View "Recent deliveries" to see webhook events

Your system is production-ready! 🎉
