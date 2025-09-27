import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export async function GET(request, { params }) {
  try {
    const { sessionId } = params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Update user subscription status
      // This would typically update your database
      return NextResponse.json({
        status: 'success',
        message: 'Payment verified successfully'
      });
    } else {
      return NextResponse.json({
        status: 'pending',
        message: 'Payment not yet completed'
      });
    }
  } catch (error) {
    console.error('❌ Subscription verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
