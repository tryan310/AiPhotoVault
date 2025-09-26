# Backend Server Setup

This backend server handles Stripe payments for your AI Photo Booth application.

## Environment Setup

1. Create a `.env` file in the root directory with your Stripe keys:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:5173
```

## Getting Your Stripe Keys

1. **Secret Key**: Go to your [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy your "Secret key" (starts with `sk_test_` for test mode)
   - Add it to your `.env` file as `STRIPE_SECRET_KEY`

2. **Webhook Secret**: Go to [Webhooks](https://dashboard.stripe.com/webhooks) in your Stripe dashboard
   - Click "Add endpoint"
   - Set URL to: `http://localhost:3001/api/webhook` (for development)
   - Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the "Signing secret" (starts with `whsec_`)
   - Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Creating Stripe Products and Prices

You need to create products and prices in your Stripe dashboard that match your pricing plans:

1. Go to [Products](https://dashboard.stripe.com/products) in your Stripe dashboard
2. Create products for each plan (Starter, Pro, Premium, Ultra)
3. For each product, create a recurring price with the amounts:
   - Starter: $19/month
   - Pro: $49/month  
   - Premium: $99/month
   - Ultra: $199/month
4. Copy the price IDs and update your `constants.ts` file

## Running the Server

```bash
# Install dependencies
npm install

# Run backend only
npm run server

# Run both frontend and backend
npm run dev:full
```

## API Endpoints

- `POST /api/create-checkout-session` - Creates a Stripe checkout session
- `POST /api/webhook` - Handles Stripe webhooks
- `GET /api/subscription/:sessionId` - Get subscription status
- `GET /health` - Health check

## Security Notes

- Never commit your `.env` file to version control
- Use test keys during development
- Switch to live keys only when ready for production
- Always verify webhook signatures in production
