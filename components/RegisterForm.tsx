import React, { useState } from 'react';
import { authService } from '../services/authService';
import { ArrowRightIcon, SpinnerIcon } from './icons';

interface RegisterFormProps {
  onRegister: (user: any) => void;
  onSwitchToLogin: () => void;
  onBack?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register(email, password, name);
      onRegister(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (err) {
      setError('Google login failed');
    }
  };

  return (
    <div className="bg-[#131313] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800">
      {/* Logo and Title */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <img 
          src="/Generated Image September 25, 2025 - 7_23PM.png" 
          alt="AI Photo Vault Logo" 
          className="w-12 h-12 object-contain rounded-lg"
          style={{
            backgroundColor: 'transparent',
            filter: 'brightness(1.1) contrast(1.1)',
            mixBlendMode: 'screen'
          }}
        />
        <h2 className="text-3xl font-bold text-gray-100">Create Account</h2>
      </div>
      <p className="text-center text-gray-400 mb-8">
        Join AI Photo Booth and start creating amazing photos
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="animate-spin h-5 w-5 text-white" />
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#131313] text-gray-400">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mt-4 w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:text-blue-300 font-medium"
            disabled={isLoading}
          >
            Sign in
          </button>
        </p>
      </div>

      {/* Back Button */}
      {onBack && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 w-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to main page
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
