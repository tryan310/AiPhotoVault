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
} from '../server/database-config.js';
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  authenticateToken, 
  getUserFromToken,
  passport 
} from '../server/auth.js';

// Load environment variables
dotenv.config();

// Initialize database with error handling
try {
  await initDatabase();
  console.log('✅ Database initialized successfully');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
}

const app = express();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const userId = await createUser(name, email, password);
    
    // Generate JWT token
    const token = generateToken(userId);
    
    res.json({ 
      success: true, 
      token, 
      user: { id: userId, name, email, credits: 0 } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id);
    
    const response = { 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        credits: user.credits 
      } 
    };
    
    console.log('✅ Login successful for user:', user.id);
    res.json(response);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      credits: user.credits
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Photo generation endpoint
app.post('/api/generate-photos', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const { theme, prompt, userPrompt, imageData, photoCount = 10 } = req.body;
    const creditsPerGeneration = photoCount; // 1 credit per photo

    // Record usage for analytics (but don't deduct credits)
    await recordUsage(req.user.id, 'ai_generation', creditsPerGeneration, `Theme: ${theme}`);

    // Import Gemini API dynamically
    const { GoogleGenerativeAI } = await import('@google/genai');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const fullPrompt = `${theme}: ${prompt}${userPrompt ? ` Additional guidance: ${userPrompt}` : ''}`;
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: "image/jpeg"
        }
      },
      {
        text: fullPrompt
      }
    ]);

    const response = await result.response;
    const generatedImages = response.candidates?.[0]?.content?.parts?.filter(part => part.inlineData) || [];

    if (generatedImages.length === 0) {
      throw new Error('No images generated');
    }

    // Save photos to GCS
    const photoId = await savePhotos(req.user.id, generatedImages);
    
    res.json({
      success: true,
      images: generatedImages,
      photoId: photoId
    });
  } catch (geminiError) {
    console.error('Gemini API error:', geminiError);
    console.error('Error details:', {
      message: geminiError.message,
      stack: geminiError.stack,
      name: geminiError.name
    });
    res.status(500).json({ 
      error: 'AI generation service temporarily unavailable',
      details: geminiError.message 
    });
    return;
  } catch (error) {
    console.error('Generate photos error:', error);
    res.status(500).json({ error: 'Failed to generate photos' });
  }
});

// Get user photos
app.get('/api/photos', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const photos = await getUserPhotos(req.user.id);
    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to get photos' });
  }
});

// Get specific photo
app.get('/api/photos/:id', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const photo = await getPhotoById(req.params.id, req.user.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json(photo);
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: 'Failed to get photo' });
  }
});

// Delete photo
app.delete('/api/photos/:id', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    await deletePhoto(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Stripe routes
app.post('/api/stripe/create-payment-intent', authenticateToken, getUserFromToken, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        userId: req.user.id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Webhook endpoint for Stripe
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100; // Convert from cents
    
    if (userId) {
      await addCredits(parseInt(userId), amount);
      console.log(`Added ${amount} credits to user ${userId}`);
    }
  }

  res.json({received: true});
});

export default app;
