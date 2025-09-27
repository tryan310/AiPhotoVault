import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from './icons';

interface SuccessPageProps {
  onContinue: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onContinue }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSafariRedirect, setIsSafariRedirect] = useState(false);

  useEffect(() => {
    // Get session ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    const redirect = urlParams.get('redirect');
    setSessionId(id);
    setIsSafariRedirect(redirect === 'true');

    if (id) {
      // Verify payment with backend
      verifyPayment(id);
    } else {
      setIsVerifying(false);
    }
  }, []);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/subscription/${sessionId}`);
      const data = await response.json();

      if (data.status === 'success') {
        console.log('Payment verified successfully');
        // Auto-redirect to dashboard after successful verification
        setTimeout(() => {
          onContinue();
        }, 2000);
      } else {
        console.log('Payment still pending');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="w-full py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-gray-300 mb-8">
          Welcome to AI Photo Booth! Your subscription is now active and you can start creating amazing AI photos.
        </p>
        
        {isSafariRedirect && (
          <div className="bg-blue-900/50 border border-blue-700 text-blue-300 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">
              <strong>Safari Users:</strong> If you encountered a navigation error, your payment was still successful! 
              Click the button below to continue to your dashboard.
            </p>
          </div>
        )}
        
        <button
          onClick={onContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
