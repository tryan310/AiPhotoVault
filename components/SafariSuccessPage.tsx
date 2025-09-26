import React from 'react';
import { CheckCircleIcon } from './icons';

const SafariSuccessPage: React.FC = () => {
  const handleContinue = () => {
    // Redirect to the main app
    window.location.href = 'http://localhost:5173';
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-gray-300 mb-6">
          Your subscription is now active! You can start creating amazing AI photos.
        </p>
        
        <div className="bg-blue-900/50 border border-blue-700 text-blue-300 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">
            <strong>Safari Users:</strong> If you encountered a navigation error, don't worry! 
            Your payment was processed successfully. Click the button below to continue.
          </p>
        </div>
        
        <button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Continue to AI Photo Booth
        </button>
        
        <p className="text-gray-400 text-sm mt-4">
          If the button doesn't work, manually navigate to: <br />
          <code className="bg-gray-800 px-2 py-1 rounded text-xs">http://localhost:5173</code>
        </p>
      </div>
    </div>
  );
};

export default SafariSuccessPage;
