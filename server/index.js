import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import session from 'express-session';
import { 
  initDatabase, 
  createUser, 
  getUserByEmail, 
  getUserById, 
  addCredits, 
  spendCredits, 
  recordUsage, 
  getUserUsageHistory, 
  getUserCreditTransactions,
  updateUserSubscription,
  savePhotos,
  getUserPhotos,
  getPhotoById,
  deletePhoto,
} from './database-config.js';
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  authenticateToken, 
  getUserFromToken,
  passport 
} from './auth.js';

// Load environment variables
dotenv.config();

// Debug: Check if Gemini API key is loaded
console.log('🔑 Gemini API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
console.log('🔑 API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

// Initialize database
await initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Middleware
// Allow localhost on any port during development, and also allow FRONTEND_URL if provided
app.use(cors({
  origin: (origin, callback) => {
    const allowedFromEnv = process.env.FRONTEND_URL;
    const isLocalhost = !origin || /^http:\/\/localhost:\d+$/.test(origin);
    const isPhotoVault = origin === 'https://photoaivault.com' || origin === 'https://www.photoaivault.com';
    
    if (isLocalhost || (allowedFromEnv && origin === allowedFromEnv) || isPhotoVault) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    status: 'Simple Test Working',
    timestamp: new Date().toISOString(),
    message: 'This is a simple test endpoint',
    server: 'Express.js server is running'
  });
});

// Debug endpoint to check server status
app.get('/debug', (req, res) => {
  res.json({
    status: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      FRONTEND_URL: process.env.FRONTEND_URL
    },
    server: 'Express.js server is running properly'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'Test Endpoint Working',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
      GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID
    }
  });
});

// GCS Debug endpoint (for production debugging)
app.get('/api/debug/gcs', async (req, res) => {
  try {
    // Import the GCS functions to test
    const { getUserPhotos } = await import('./database-gcs.js');
    
    // Test with a small limit to avoid overwhelming the response
    const testPhotos = await getUserPhotos(1, 1);
    
    res.json({
      status: 'GCS Debug',
      timestamp: new Date().toISOString(),
      environment: {
        GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
        GOOGLE_CLOUD_BUCKET_NAME: process.env.GOOGLE_CLOUD_BUCKET_NAME,
        GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
        GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
        GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        GCS_KEY_B64: process.env.GCS_KEY_B64 ? 'Set (base64 encoded)' : 'Not set'
      },
      testPhotos: testPhotos.length,
      samplePhoto: testPhotos.length > 0 ? {
        id: testPhotos[0].id,
        theme: testPhotos[0].theme,
        imageCount: testPhotos[0].generated_images?.length,
        firstImageUrl: testPhotos[0].generated_images?.[0]?.substring(0, 100) + '...',
        hasSignedUrl: testPhotos[0].generated_images?.[0]?.includes('X-Goog-')
      } : null
    });
  } catch (error) {
    res.status(500).json({
      status: 'GCS Debug Error',
      error: error.message,
      stack: error.stack,
      environment: {
        GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
        GOOGLE_CLOUD_BUCKET_NAME: process.env.GOOGLE_CLOUD_BUCKET_NAME,
        GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
        GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
        GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        GCS_KEY_B64: process.env.GCS_KEY_B64 ? 'Set (base64 encoded)' : 'Not set'
      }
    });
  }
});

// GCS Key File Test endpoint
app.get('/api/debug/gcs-key', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const keyFilePaths = [
      '/app/gcs-key.json',
      './gcs-key.json',
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      process.env.GOOGLE_CLOUD_KEY_FILE
    ].filter(Boolean);
    
    const results = {};
    
    for (const keyPath of keyFilePaths) {
      try {
        const exists = fs.existsSync(keyPath);
        results[keyPath] = {
          exists,
          size: exists ? fs.statSync(keyPath).size : 0,
          readable: exists ? fs.accessSync(keyPath, fs.constants.R_OK) === undefined : false
        };
        
        if (exists) {
          const content = fs.readFileSync(keyPath, 'utf8');
          const parsed = JSON.parse(content);
          results[keyPath].valid = !!parsed.private_key && !!parsed.client_email;
          results[keyPath].project_id = parsed.project_id;
          results[keyPath].client_email = parsed.client_email;
        }
      } catch (error) {
        results[keyPath] = {
          exists: false,
          error: error.message
        };
      }
    }
    
    res.json({
      status: 'GCS Key File Test',
      timestamp: new Date().toISOString(),
      environment: {
        GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
        GCS_KEY_B64: process.env.GCS_KEY_B64 ? 'Set (base64 encoded)' : 'Not set'
      },
      keyFiles: results,
      workingDirectory: process.cwd(),
      nodeVersion: process.version
    });
  } catch (error) {
    res.status(500).json({
      status: 'GCS Key File Test Error',
      error: error.message,
      stack: error.stack
    });
  }
});

// ==================== AUTHENTICATION ENDPOINTS ====================

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = await createUser({
      email,
      passwordHash,
      name: name || email.split('@')[0]
    });

    // Get user data
    const user = await getUserById(userId);
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        const user = req.user;
        const token = generateToken(user);
        
        // Redirect to frontend with token
        const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(`${req.headers.origin || 'http://localhost:5173'}/login?error=oauth_failed`);
      }
    }
  );
} else {
  console.log('⚠️  Google OAuth not configured - skipping Google login routes');
}

// Get current user
app.get('/api/auth/me', authenticateToken, getUserFromToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      credits: req.user.credits,
      avatarUrl: req.user.avatar_url,
      subscriptionStatus: req.user.subscription_status
    }
  });
});

// ==================== USER ENDPOINTS ====================

// Get user credits
app.get('/api/user/credits', authenticateToken, getUserFromToken, (req, res) => {
  res.json({
    success: true,
    credits: req.user.credits
  });
});

// Get user usage history
app.get('/api/user/usage', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const usage = await getUserUsageHistory(req.user.id);
    res.json({
      success: true,
      usage
    });
  } catch (error) {
    console.error('Error fetching usage history:', error);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

// Get user credit transactions
app.get('/api/user/transactions', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const transactions = await getUserCreditTransactions(req.user.id);
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ==================== PHOTO ENDPOINTS ====================

// Get user's photos
app.get('/api/photos', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const photos = await getUserPhotos(req.user.id, parseInt(limit));
    res.json({ success: true, photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Get specific photo
app.get('/api/photos/:photoId', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    const photo = await getPhotoById(parseInt(photoId), req.user.id);
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.json({ success: true, photo });
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// Delete photo
app.delete('/api/photos/:photoId', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    await deletePhoto(parseInt(photoId), req.user.id);
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Generate AI photos (protected endpoint)
app.post('/api/generate-photos', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const { theme, prompt, userPrompt, imageData, photoCount = 10 } = req.body;
    const creditsPerGeneration = photoCount; // 1 credit per photo

    // Check if user has enough credits
    if (req.user.credits < creditsPerGeneration) {
      return res.status(400).json({ 
        error: 'Insufficient credits',
        message: 'You need at least 10 credits to generate photos. Please purchase a subscription plan.',
        required: creditsPerGeneration,
        available: req.user.credits,
        redirectToPricing: true
      });
    }

    // Spend credits
    await spendCredits(req.user.id, creditsPerGeneration, `AI photo generation - ${theme}`);
    
    // Record usage
    await recordUsage(req.user.id, 'ai_generation', creditsPerGeneration, `Theme: ${theme}`);

    // Call Gemini API for actual image generation
    try {
      const { GoogleGenAI, Modality } = await import('@google/genai');
      
      console.log('🔍 Checking GEMINI_API_KEY in generate-photos endpoint...');
      console.log('🔍 process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Found' : 'Not found');
      console.log('🔍 API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Generate multiple images
      const generationPromises = [];
      
      for (let i = 0; i < photoCount; i++) {
        generationPromises.push(
          ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: imageData.replace(/^data:image\/[a-z]+;base64,/, ''),
                    mimeType: 'image/jpeg',
                  },
                },
                {
                  text: `${prompt || theme}${userPrompt ? `. Additional guidance: ${userPrompt}` : ''}`, // Combine base prompt with user guidance
                },
              ],
            },
            config: {
              responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
          })
        );
      }

      const responses = await Promise.all(generationPromises);
      const generatedImages = [];

      for (const response of responses) {
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
              break; // Only take the first image from each response
            }
          }
        }
      }

      // Save photos to database
      const photoId = await savePhotos(
        req.user.id,
        null, // original_image_url (we don't store the original for now)
        generatedImages,
        theme,
        creditsPerGeneration
      );

      res.json({
        success: true,
        images: generatedImages,
        creditsUsed: creditsPerGeneration,
        remainingCredits: req.user.credits - creditsPerGeneration,
        photoId: photoId
      });
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      console.error('Error details:', {
        message: geminiError.message,
        stack: geminiError.stack,
        name: geminiError.name
      });
      // Refund credits if Gemini fails
      await addCredits(req.user.id, creditsPerGeneration, 'Refund for failed generation');
      res.status(500).json({ 
        error: 'AI generation service temporarily unavailable',
        details: geminiError.message 
      });
      return;
    }
  } catch (error) {
    console.error('Error generating photos:', error);
    res.status(500).json({ error: 'Failed to generate photos' });
  }
});

// Create Stripe Checkout Session (now with user authentication)
app.post('/api/create-checkout-session', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Check if user already has an active subscription
    const user = await getUserById(req.user.id);
    if (user.subscription_id && user.subscription_status === 'active') {
      return res.status(400).json({ 
        error: 'You already have an active subscription. Use the customer portal to manage your subscription.',
        hasActiveSubscription: true 
      });
    }

    // Determine frontend origin dynamically (falls back to env or default)
    const requestOrigin = req.headers.origin;
    let frontendOrigin = requestOrigin || process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // For Safari HTTPS-Only mode compatibility, use a more flexible approach
    if (frontendOrigin.startsWith('http://localhost')) {
      // Keep localhost as HTTP for development
      frontendOrigin = 'http://localhost:5173';
    }

    // Create the checkout session with customer email
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: req.user.email,
      success_url: `${frontendOrigin}/?session_id={CHECKOUT_SESSION_ID}&payment_success=true`,
      cancel_url: `${frontendOrigin}/pricing`,
      metadata: {
        priceId: priceId,
        userId: req.user.id.toString(),
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Stripe Webhook endpoint for handling payment confirmations
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature (only if webhook secret is configured)
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      console.log('⚠️  STRIPE_WEBHOOK_SECRET not configured - processing webhook without signature verification');
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment succeeded:', session.id);
      
      // Add credits to user based on subscription
      if (session.metadata && session.metadata.userId) {
        const userId = parseInt(session.metadata.userId);
        const priceId = session.metadata.priceId;
        
        console.log(`Processing payment for user ${userId}, priceId: ${priceId}`);
        
        // Determine credits based on price ID
        let creditsToAdd = 0;
        if (priceId === 'price_1SBSSwCnTKaHMCugSFppSsNh') creditsToAdd = 50; // Starter
        else if (priceId === 'price_1SBSSjCnTKaHMCugeN5JgRo3') creditsToAdd = 150; // Pro
        else if (priceId === 'price_1SBSSXCnTKaHMCugVU2R9IW7') creditsToAdd = 500; // Premium
        else if (priceId === 'price_1SBSSFCnTKaHMCugeruD8b6x') creditsToAdd = 2000; // Ultra
        
        console.log(`Determined credits to add: ${creditsToAdd} for priceId: ${priceId}`);
        
        if (creditsToAdd > 0) {
          try {
            const newCredits = await addCredits(userId, creditsToAdd, `Subscription credits for ${priceId}`);
            console.log(`✅ Successfully added ${creditsToAdd} credits to user ${userId}. New total: ${newCredits}`);
          } catch (error) {
            console.error(`❌ Failed to add credits to user ${userId}:`, error);
          }
        } else {
          console.log(`⚠️  No credits determined for priceId: ${priceId}`);
        }
      } else {
        console.log('⚠️  No user metadata found in session:', session.metadata);
      }
      break;
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      
      // Update user subscription status
      if (subscription.metadata && subscription.metadata.userId) {
        const userId = parseInt(subscription.metadata.userId);
        await updateUserSubscription(userId, subscription.id, 'active');
      }
      break;
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id);
      
      // Find user by subscription ID
      const userWithSubscription = await dbGet(
        'SELECT * FROM users WHERE subscription_id = ?',
        [updatedSubscription.id]
      );
      
      if (userWithSubscription) {
        await updateUserSubscription(userWithSubscription.id, updatedSubscription.id, updatedSubscription.status);
        console.log(`✅ Updated subscription status for user ${userWithSubscription.id}: ${updatedSubscription.status}`);
      }
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription cancelled:', deletedSubscription.id);
      
      // Update subscription status to cancelled
      if (deletedSubscription.metadata && deletedSubscription.metadata.userId) {
        const userId = parseInt(deletedSubscription.metadata.userId);
        await updateUserSubscription(userId, deletedSubscription.id, 'cancelled');
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get subscription status
app.get('/api/subscription/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // If payment is successful, add credits manually (in case webhook didn't fire)
      if (session.metadata && session.metadata.userId) {
        const userId = parseInt(session.metadata.userId);
        const priceId = session.metadata.priceId;
        
        console.log(`Manual credit addition for user ${userId}, priceId: ${priceId}`);
        
        // Determine credits based on price ID
        let creditsToAdd = 0;
        if (priceId === 'price_1SBSSwCnTKaHMCugSFppSsNh') creditsToAdd = 50; // Starter
        else if (priceId === 'price_1SBSSjCnTKaHMCugeN5JgRo3') creditsToAdd = 150; // Pro
        else if (priceId === 'price_1SBSSXCnTKaHMCugVU2R9IW7') creditsToAdd = 500; // Premium
        else if (priceId === 'price_1SBSSFCnTKaHMCugeruD8b6x') creditsToAdd = 2000; // Ultra
        
        if (creditsToAdd > 0) {
          try {
            const newCredits = await addCredits(userId, creditsToAdd, `Manual credit addition for ${priceId}`);
            console.log(`✅ Manually added ${creditsToAdd} credits to user ${userId}. New total: ${newCredits}`);
          } catch (error) {
            console.error(`❌ Failed to manually add credits to user ${userId}:`, error);
          }
        }
      }
      
      res.json({ 
        status: 'success', 
        customerId: session.customer,
        subscriptionId: session.subscription 
      });
    } else {
      res.json({ status: 'pending' });
    }
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// Get user's current subscription
app.get('/api/subscription', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    
    if (!user.subscription_id) {
      return res.json({ hasSubscription: false });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
    
    res.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        priceId: subscription.items.data[0].price.id
      }
    });
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ error: 'Failed to retrieve subscription' });
  }
});

// Create customer portal session for subscription management
app.post('/api/create-portal-session', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    
    if (!user.subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Get the customer ID from the subscription
    const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
    const customerId = subscription.customer;

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Upgrade subscription to a different plan
app.post('/api/upgrade-subscription', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const { newPriceId } = req.body;
    const user = await getUserById(req.user.id);
    
    if (!user.subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
    
    // Update subscription to new price
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations', // Prorate the billing
    });

    res.json({ 
      success: true, 
      subscriptionId: updatedSubscription.id,
      message: 'Subscription upgraded successfully'
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

// Add error handling for server startup
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Add startup logging
console.log('🔧 Starting server...');
console.log('🔧 Environment variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT);
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('  GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
console.log('  GOOGLE_CLOUD_PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Stripe integration ready`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'localhost'}`);
  console.log('✅ All routes registered successfully');
});
