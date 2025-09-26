# 🚀 Stripe Integration Setup Guide

Your Stripe payment integration is ready! Follow these steps to complete the setup.

## 📋 Quick Setup Checklist

- [ ] Create `.env` file with your Stripe keys
- [ ] Create products in Stripe Dashboard
- [ ] Update price IDs in `constants.ts`
- [ ] Test the payment flow

## 🔑 Step 1: Create Environment Files

### Create base configuration (safe to commit):
1. Copy `env-template.txt` to `.env`:
   ```bash
   cp env-template.txt .env
   ```

### Create personal secrets (never commit):
2. Copy `env.local.template` to `.env.local`:
   ```bash
   cp env.local.template .env.local
   ```

3. Edit `.env.local` and add your actual secret keys:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

> **Why two files?** `.env` contains safe defaults, `.env.local` contains your personal secrets that should never be committed to git.

## 🛒 Step 2: Create Stripe Products

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click "Add product" for each plan:

### Starter Plan ($19/month)
- Product name: "AI Photo Booth - Starter"
- Price: $19.00
- Billing: Monthly
- Copy the price ID (starts with `price_`)

### Pro Plan ($49/month)
- Product name: "AI Photo Booth - Pro"
- Price: $49.00
- Billing: Monthly
- Copy the price ID

### Premium Plan ($99/month)
- Product name: "AI Photo Booth - Premium"
- Price: $99.00
- Billing: Monthly
- Copy the price ID

### Ultra Plan ($199/month)
- Product name: "AI Photo Booth - Ultra"
- Price: $199.00
- Billing: Monthly
- Copy the price ID

## 🔄 Step 3: Update Price IDs

1. Open `constants.ts`
2. Replace the placeholder price IDs with your actual Stripe price IDs:

```typescript
// Replace these with your actual price IDs from Stripe
stripePriceId: 'price_1ABC123DEF456GHI789', // Starter
stripePriceId: 'price_1ABC123DEF456GHI790', // Pro
stripePriceId: 'price_1ABC123DEF456GHI791', // Premium
stripePriceId: 'price_1ABC123DEF456GHI792', // Ultra
```

## 🔗 Step 4: Set Up Webhooks (Optional but Recommended)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL: `http://localhost:3001/api/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the "Signing secret" and add it to your `.env` file

## 🚀 Step 5: Run the Application

```bash
# Run both frontend and backend
npm run dev:full
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🧪 Step 6: Test the Payment Flow

1. Go to http://localhost:5173
2. Click "Create Account" → "Subscribe" on any plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete the payment flow
5. You should be redirected to the success page

## 🔧 Troubleshooting

### Backend won't start
- Check that your `.env` file exists and has the correct keys
- Make sure port 3001 is not in use

### Payment fails
- Verify your Stripe secret key is correct
- Check that the price IDs in `constants.ts` match your Stripe dashboard
- Ensure you're using test keys in development

### CORS errors
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that the backend is running on port 3001

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Use test keys during development
- Switch to live keys only when ready for production
- Always verify webhook signatures in production

## 📞 Need Help?

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- Check the server logs for detailed error messages

Your Stripe integration is now complete! 🎉
