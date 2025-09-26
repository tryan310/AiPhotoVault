# 🛒 Quick Stripe Products Setup

## Create These Products in Your Stripe Dashboard

Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products) and create:

### 1. Starter Plan
- **Name**: AI Photo Booth - Starter
- **Price**: $19.00
- **Billing**: Monthly
- **Copy the Price ID** and replace `price_starter_placeholder` in `constants.ts`

### 2. Pro Plan  
- **Name**: AI Photo Booth - Pro
- **Price**: $49.00
- **Billing**: Monthly
- **Copy the Price ID** and replace `price_pro_placeholder` in `constants.ts`

### 3. Premium Plan
- **Name**: AI Photo Booth - Premium  
- **Price**: $99.00
- **Billing**: Monthly
- **Copy the Price ID** and replace `price_premium_placeholder` in `constants.ts`

### 4. Ultra Plan
- **Name**: AI Photo Booth - Ultra
- **Price**: $199.00
- **Billing**: Monthly
- **Copy the Price ID** and replace `price_ultra_placeholder` in `constants.ts`

## 🔄 After Creating Products

1. Copy each Price ID (starts with `price_`)
2. Update `constants.ts` with the real Price IDs
3. Restart your servers: `npm run dev:full`

## 🧪 Test Without Stripe (Temporary)

For now, you can test the AI photo generation without payments by:
1. Going to http://localhost:5173
2. Clicking "Create Account" 
3. Skipping the pricing page (the app will simulate payment)
4. Testing AI photo generation
