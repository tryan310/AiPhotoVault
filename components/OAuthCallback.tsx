import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { SpinnerIcon } from './icons';

interface OAuthCallbackProps {
  onAuthSuccess: (user: any) => void;
  onAuthError: (error: string) => void;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onAuthSuccess, onAuthError }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
        setError('OAuth authentication failed');
        setStatus('error');
        onAuthError('OAuth authentication failed');
        return;
      }

      if (!token) {
        setError('No authentication token received');
        setStatus('error');
        onAuthError('No authentication token received');
        return;
      }

      // Get user data with the token
      const user = await authService.getCurrentUser();
      if (user) {
        setStatus('success');
        onAuthSuccess(user);
      } else {
        setError('Failed to get user data');
        setStatus('error');
        onAuthError('Failed to get user data');
      }
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError('Authentication failed');
      setStatus('error');
      onAuthError('Authentication failed');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-[#131313] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800 text-center">
          <SpinnerIcon className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Completing Authentication</h2>
          <p className="text-gray-400">Please wait while we sign you in...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-[#131313] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Authentication Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="bg-[#131313] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">Authentication Successful</h2>
        <p className="text-gray-400">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
