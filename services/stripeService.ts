// Dynamic import to prevent immediate Stripe CDN loading
type Stripe = any;

// Get the publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_publishable_key_here';

console.log('Stripe publishable key loaded:', STRIPE_PUBLISHABLE_KEY ? 'Yes' : 'No');
console.log('Stripe key length:', STRIPE_PUBLISHABLE_KEY ? STRIPE_PUBLISHABLE_KEY.length : 0);
console.log('Stripe key value:', STRIPE_PUBLISHABLE_KEY);
console.log('Is default key:', STRIPE_PUBLISHABLE_KEY === 'pk_test_your_test_publishable_key_here');

let stripePromise: Promise<Stripe | null> | null = null;

// Initialize Stripe with proper error handling (lazy loading)
const initializeStripe = async (): Promise<Stripe | null> => {
  try {
    if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('your_test_publishable_key_here') || STRIPE_PUBLISHABLE_KEY === 'pk_test_your_test_publishable_key_here') {
      throw new Error('Stripe publishable key is not configured');
    }
    
    // Dynamic import to prevent immediate Stripe CDN loading
    const { loadStripe } = await import('@stripe/stripe-js');
    const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }
    
    console.log('Stripe initialized successfully');
    return stripe;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    throw error;
  }
};

// Lazy initialization - only initialize when first needed
const getStripePromise = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = initializeStripe();
  }
  return stripePromise;
};

/**
 * Redirects the user to Stripe Checkout.
 * This function communicates with a backend endpoint to create a secure checkout session.
 * @param priceId The ID of the Stripe Price object the user wants to purchase.
 */
export const redirectToCheckout = async (priceId: string): Promise<void> => {
  console.log(`Initiating checkout for price ID: ${priceId}`);

  try {
    const stripe = await getStripePromise();
    
    if (!stripe) {
      throw new Error('Stripe is not available. Please refresh the page and try again.');
    }

    // Get authentication token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required. Please log in first.');
    }

    // ===========================================================================
    // BACKEND INTEGRATION POINT
    // ===========================================================================
    // In a real-world application, you must not create the Checkout Session on the
    // client-side. This would expose your secret API key. Instead, this function
    // calls a backend endpoint that you need to create.
    //
    // 1. The client sends the `priceId` to your server.
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
        // If the server response is not ok, throw an error to be caught by the calling component.
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to create checkout session.');
    }
    
    // 2. Your backend creates a Stripe Checkout Session using your SECRET key
    //    and returns the session's ID to the client.
    const { sessionId } = await response.json();

    // 3. The client uses the received `sessionId` to redirect to Stripe's
    //    hosted checkout page. This is secure because the sensitive operations
    //    happened on your server.
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
  
    // If `redirectToCheckout` fails due to a browser issue or misconfiguration,
    // it will return an error here, which we can show to the user.
    if (error) {
      console.error('Stripe redirection error:', error);
      throw new Error(error.message);
    }

  } catch (error) {
    console.error("Error during checkout process:", error);
    
    // Handle specific Stripe loading errors
    if (error instanceof Error && error.message.includes("Cannot find module")) {
      throw new Error("Stripe payment system is temporarily unavailable. Please try again in a moment.");
    }
    
    // Re-throw the error so the PricingPage can handle it properly
    throw error;
  }
};