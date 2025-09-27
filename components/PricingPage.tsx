import React, { useState } from 'react';
import { PRICING_PLANS } from '../constants';
import type { PricingPlan } from '../types';
import { redirectToCheckout } from '../services/stripeService';
import { CheckCircleIcon, ArrowRightIcon, SpinnerIcon } from './icons';

interface PricingPageProps {
  onPlanSelect: () => void;
  userEmail?: string;
}

const highlightClasses = {
  bad: 'bg-red-500/20 text-red-300',
  medium: 'bg-yellow-500/20 text-yellow-300',
  good: 'bg-green-500/20 text-green-300',
};

const Feature: React.FC<{ text: string; highlight?: 'bad' | 'medium' | 'good' }> = ({ text, highlight }) => (
  <li className="flex items-start gap-3">
    <CheckCircleIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
    <span className={`text-gray-300 ${highlight ? `px-2 py-0.5 rounded-md ${highlightClasses[highlight]}` : ''}`}>
      {text}
    </span>
  </li>
);

const PricingCard: React.FC<{ plan: PricingPlan; onSelect: (priceId: string) => Promise<void>; isLoading: boolean }> = ({ plan, onSelect, isLoading }) => (
  <div className={`bg-[#131313] p-6 rounded-2xl border flex flex-col relative ${plan.isPopular ? 'border-gray-500' : 'border-gray-800'}`}>
    {plan.isPopular && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
        Most popular
      </div>
    )}
    
    <div className="flex-grow">
      <h3 className="text-3xl font-bold text-white">{plan.name}</h3>
      <div className="flex items-end gap-2 mt-4">
        <p className="text-6xl font-extrabold text-white">${plan.price}</p>
      </div>
      <p className="text-gray-400 mt-4 h-20">{plan.description}</p>
      
      <button 
        onClick={() => onSelect(plan.stripePriceId)}
        disabled={isLoading}
        className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-transform transform hover:scale-105 mt-6 disabled:opacity-50 disabled:cursor-wait ${plan.isPopular ? 'bg-red-500 text-white' : 'bg-red-600/80 text-white'}`}
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="w-5 h-5" />
            Processing...
          </>
        ) : (
          <>
            {plan.cta} <ArrowRightIcon className="w-5 h-5"/>
          </>
        )}
      </button>

      <div className="border-t border-gray-800 my-6"></div>

      <ul className="space-y-3">
        {plan.mainFeatures.map(feature => <Feature key={feature} text={feature} highlight={feature.includes('HD') ? 'good' : undefined} />)}
      </ul>

    </div>
  </div>
);

const PricingPage: React.FC<PricingPageProps> = ({ onPlanSelect, userEmail }) => {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // Check for existing subscription on component mount
  React.useEffect(() => {
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/subscription`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasActiveSubscription(data.hasSubscription);
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSelectPlan = async (priceId: string) => {
    const planId = PRICING_PLANS.find(p => p.stripePriceId === priceId)?.id;
    if (!planId) return;

    setLoadingPlanId(planId);
    setError(null);
    try {
      await redirectToCheckout(priceId);
      // redirectToCheckout will redirect the user to Stripe Checkout
      // They will only return to the app after completing payment
      // No need to call onPlanSelect() here
    } catch (err) {
      console.error("Stripe checkout failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during checkout.";
      setError(errorMessage);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/create-portal-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to open customer portal');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      setError('Failed to open customer portal');
    }
  };

  return (
    <div className="w-full py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Make a Selection</h1>
        <p className="text-gray-300 text-lg mb-2">Select the perfect pack for your AI photo generation needs</p>
        {userEmail && (
          <p className="text-gray-400 text-sm">
            Welcome, <span className="text-blue-400">{userEmail}</span>
          </p>
        )}
        
        {hasActiveSubscription && (
          <div className="bg-blue-900/20 border border-blue-700 text-blue-300 px-6 py-4 rounded-lg mb-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">You have an active subscription</h3>
            <p className="text-sm mb-4">
              Current plan: {PRICING_PLANS.find(p => p.stripePriceId === currentSubscription?.priceId)?.name || 'Unknown'}
            </p>
            <button
              onClick={handleManageSubscription}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Manage Subscription
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6 max-w-4xl mx-auto" role="alert">
          <strong className="font-bold">Payment Error: </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {PRICING_PLANS.map(plan => (
          <PricingCard 
            key={plan.id} 
            plan={plan} 
            onSelect={handleSelectPlan} 
            isLoading={loadingPlanId === plan.id}
          />
        ))}
      </div>
    </div>
  );
};

export default PricingPage;