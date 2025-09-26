# 🔐 Authentication & Credit System Setup Guide

This guide will help you set up the complete user authentication and credit tracking system for your AI Photo Booth application.

## 🚀 **What's New**

### ✅ **Features Added:**
- **User Registration & Login** (email/password + Google OAuth)
- **Credit Tracking System** (earn, spend, view history)
- **User Dashboard** (credits, usage, transactions)
- **Protected Routes** (authentication required)
- **Stripe Integration** (user-specific payments)
- **Database** (SQLite for development)

## 📋 **Setup Steps**

### 1. **Install New Dependencies**
```bash
npm install jsonwebtoken bcryptjs sqlite3 passport passport-google-oauth20 passport-jwt express-session
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/passport @types/passport-google-oauth20 @types/passport-jwt @types/express-session
```

### 2. **Update Environment Variables**

Add these to your `.env` file:

```env
# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-session-secret-change-in-production

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. **Google OAuth Setup (Optional)**

To enable Google login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Copy Client ID and Secret to your `.env` file

### 4. **Start the Application**

```bash
npm run dev:full
```

## 🎯 **How It Works**

### **User Flow:**
1. **Login/Register** → User creates account or signs in
2. **Dashboard** → View credits, usage history, start generating
3. **Generate Photos** → Spend credits to create AI photos
4. **Purchase Credits** → Subscribe to plans for more credits

### **Credit System:**
- **Starter Plan**: 50 credits
- **Pro Plan**: 200 credits  
- **Premium Plan**: 500 credits
- **Ultra Plan**: 1000 credits
- **1 credit = 1 photo generation**

### **Database Tables:**
- `users` - User accounts and credits
- `usage_history` - Photo generation logs
- `credit_transactions` - Credit purchases/spending

## 🔧 **API Endpoints**

### **Authentication:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### **User Management:**
- `GET /api/user/credits` - Get user credits
- `GET /api/user/usage` - Get usage history
- `GET /api/user/transactions` - Get credit transactions

### **Photo Generation:**
- `POST /api/generate-photos` - Generate AI photos (requires auth)

### **Payments:**
- `POST /api/create-checkout-session` - Create Stripe checkout (requires auth)

## 🎨 **Frontend Components**

### **New Components:**
- `LoginForm` - Email/password login
- `RegisterForm` - Account creation
- `UserDashboard` - User dashboard with credits
- `OAuthCallback` - Google OAuth callback handler

### **Updated Components:**
- `App.tsx` - Authentication flow integration
- `stripeService.ts` - Requires authentication
- `geminiService.ts` - Backend API integration

## 🛡️ **Security Features**

- **JWT Tokens** - Secure authentication
- **Password Hashing** - bcryptjs with salt rounds
- **Protected Routes** - Authentication required
- **Credit Validation** - Prevents overspending
- **Session Management** - Secure user sessions

## 📊 **User Dashboard Features**

- **Credit Display** - Current available credits
- **Usage History** - Recent photo generations
- **Transaction Log** - Credit purchases and spending
- **Quick Actions** - Start generating, buy credits
- **Account Status** - Subscription information

## 🔄 **Credit Flow**

1. **User subscribes** → Credits added via Stripe webhook
2. **User generates photos** → Credits deducted
3. **User views dashboard** → Real-time credit balance
4. **User runs out** → Prompted to purchase more

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Authentication required" error**
   - User needs to log in first
   - Check if token is stored in localStorage

2. **"Insufficient credits" error**
   - User needs to purchase a subscription
   - Check credit balance in dashboard

3. **Google OAuth not working**
   - Verify Google Client ID/Secret
   - Check redirect URI configuration

4. **Database errors**
   - Ensure SQLite database is created
   - Check file permissions

## 🎉 **Ready to Use!**

Your AI Photo Booth now has:
- ✅ Complete user authentication
- ✅ Credit tracking system
- ✅ User dashboard
- ✅ Protected photo generation
- ✅ Stripe payment integration
- ✅ Google OAuth support

Users can now:
1. Create accounts and log in
2. View their credit balance
3. Generate AI photos (spending credits)
4. Purchase subscription plans
5. Track their usage history

The system is fully functional and ready for production! 🚀
