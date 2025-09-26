import React, { useState, useEffect } from 'react';
import { authService, User } from '../services/authService';
import { ArrowRightIcon, SpinnerIcon, CheckCircleIcon } from './icons';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  onStartGenerating: () => void;
  onNavigateToPricing: () => void;
  onNavigateToGallery?: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout, onStartGenerating, onNavigateToPricing, onNavigateToGallery }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user);

  useEffect(() => {
    loadUserData();
    
    // Check if user arrived from successful payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_id') && urlParams.get('payment_success')) {
      setShowPaymentSuccess(true);
      // Clear URL parameters after showing success message
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 5000);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getCurrentUser(); // Refresh user data including credits
      
      // Update the current user with fresh data
      if (userData) {
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-[#131313] p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-800">
          <div className="flex items-center justify-center">
            <SpinnerIcon className="animate-spin h-8 w-8 text-blue-500" />
            <span className="ml-3 text-gray-300">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="bg-[#131313] p-6 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-800">
        {/* Payment Success Message */}
        {showPaymentSuccess && (
          <div className="mb-6 bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Payment Successful!</span>
            </div>
            <p className="text-sm mt-1">Your credits have been added to your account. You can now start generating AI photos!</p>
          </div>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Welcome back, {currentUser?.name || user.name}!</h1>
            <p className="text-gray-400 mt-2">Manage your AI Photo Booth account</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">{currentUser?.credits || user.credits}</div>
              <div className="text-sm text-gray-400">Credits Available</div>
              {(currentUser?.credits || user.credits) === 0 && (
                <div className="text-xs text-red-400 mt-1">⚠️ No credits - purchase a plan to generate photos</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Start Creating</h3>
            <p className="text-gray-400 text-sm mb-4">
              {(currentUser?.credits || user.credits) >= 5 
                ? `Generate AI photos with your ${currentUser?.credits || user.credits} credits (1 credit per photo)`
                : 'You need at least 5 credits to generate photos'
              }
            </p>
            <button
              onClick={(currentUser?.credits || user.credits) >= 5 ? onStartGenerating : onNavigateToPricing}
              className={`w-full font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2 ${
                (currentUser?.credits || user.credits) >= 5 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {(currentUser?.credits || user.credits) >= 5 ? (
                <>
                  Generate Photos
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              ) : (
                'Get Credits First'
              )}
            </button>
          </div>

          {onNavigateToGallery && (
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">PhotoVault</h3>
              <p className="text-gray-400 text-sm mb-4">View all your AI-generated photos</p>
              <button
                onClick={onNavigateToGallery}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
              >
                Enter
              </button>
            </div>
          )}

          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Get More Credits</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to a plan for more credits</p>
            <button
              onClick={onNavigateToPricing}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
            >
              Buy Credits
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
