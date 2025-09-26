import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Theme } from './types';
import { generateAiPhotos } from './services/geminiService';
import { authService, User } from './services/authService';
import { PhotoIcon } from './components/icons';
import ImageUploader from './components/ImageUploader';
import ThemeSelector from './components/ThemeSelector';
import LoadingScreen from './components/LoadingScreen';
import GeneratedImages from './components/GeneratedImage';
import LoginPage from './components/LoginPage';
import EmailCollection from './components/EmailCollection';
import PricingPage from './components/PricingPage';
import SuccessPage from './components/SuccessPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import UserDashboard from './components/UserDashboard';
import OAuthCallback from './components/OAuthCallback';
import SafariSuccessPage from './components/SafariSuccessPage';
import PhotoGallery from './components/PhotoGallery';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check for authentication and success page on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Listen for user updates from child components
    const handleUserUpdate = (event: CustomEvent) => {
      setUser(event.detail);
    };
    
    window.addEventListener('userUpdated', handleUserUpdate as EventListener);
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener);
    };
  }, []);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for OAuth callback
    if (window.location.pathname === '/auth/callback') {
      setAppState(AppState.OAUTH_CALLBACK);
      return;
    }
    
    // Check for Safari success page (standalone)
    if (window.location.pathname === '/safari-success') {
      setAppState(AppState.SAFARI_SUCCESS);
      return;
    }
    
    // Check for payment success - redirect to dashboard if authenticated, otherwise show success page
    if (urlParams.get('session_id') && urlParams.get('payment_success')) {
      // Check authentication first
      checkAuthentication().then(() => {
        if (isAuthenticated && user) {
          setAppState(AppState.DASHBOARD);
        } else {
          setAppState(AppState.SUCCESS);
        }
      });
      return;
    }
    
    // Check for success page (legacy)
    if (urlParams.get('session_id')) {
      setAppState(AppState.SUCCESS);
      return;
    }
    
    // Check if user is already authenticated
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setAppState(AppState.DASHBOARD);
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
    }
  };

  const handleFilesChanged = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleGenerate = useCallback(async (theme: Theme, photoCount: number = 10, userPrompt: string = '') => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one photo to generate images.");
      return;
    }

    setAppState(AppState.GENERATING);
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const images = await generateAiPhotos(uploadedFiles[0], theme.prompt, photoCount, theme.title, userPrompt);
      if (images.length > 0) {
        setGeneratedImages(images);
        setAppState(AppState.RESULT);
        setIsGenerating(false);
        
        // Refresh user data to show updated credits
        if (isAuthenticated) {
          try {
            const updatedUser = await authService.getCurrentUser();
            if (updatedUser) {
              setUser(updatedUser);
              // Dispatch event to update other components
              window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
            }
          } catch (error) {
            console.error('Error refreshing user data:', error);
          }
        }
      } else {
        throw new Error("The AI model did not return any images. Please try again or use a different photo.");
      }
    } catch (err) {
      console.error(err);
      
      // Check if user needs to purchase credits
      if (err instanceof Error && (err as any).redirectToPricing) {
        setError(`You need at least ${photoCount} credits to generate photos. You have ${(err as any).availableCredits || 0} credits remaining.`);
        setAppState(AppState.PRICING);
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate images: ${errorMessage}`);
      setAppState(AppState.SETUP);
      setIsGenerating(false); 
    }
  }, [uploadedFiles, isAuthenticated]);
  
  const handleStartOver = () => {
    setAppState(AppState.SETUP);
    setUploadedFiles([]);
    setGeneratedImages([]);
    setError(null);
  };
  
  const handleAccountCreate = () => {
    setAppState(AppState.EMAIL);
  };

  const handleShowLoginForm = () => {
    setAppState(AppState.LOGIN_FORM);
  };

  const handleShowRegisterForm = () => {
    setAppState(AppState.REGISTER_FORM);
  };

  const handleBackToMain = () => {
    setAppState(AppState.LOGIN);
  };

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    setAppState(AppState.PRICING);
  };

  const handlePlanSelect = () => {
    // If user is authenticated, go to dashboard, otherwise to setup
    if (isAuthenticated && user) {
      setAppState(AppState.DASHBOARD);
    } else {
      setAppState(AppState.SETUP);
    }
  };

  // Authentication handlers
  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAppState(AppState.DASHBOARD);
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAppState(AppState.DASHBOARD);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setAppState(AppState.LOGIN);
    setShowLoginForm(true);
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAppState(AppState.DASHBOARD);
  };

  const handleAuthError = (error: string) => {
    setError(error);
    setAppState(AppState.LOGIN);
  };

  const handleStartGenerating = () => {
    setAppState(AppState.SETUP);
  };

  const handleNavigateToPricing = () => {
    setAppState(AppState.PRICING);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.LOGIN:
        return <LoginPage onAccountCreate={handleAccountCreate} onShowLogin={handleShowLoginForm} onShowRegister={handleShowRegisterForm} />;
      case AppState.LOGIN_FORM:
        return (
          <LoginForm 
            onLogin={handleLogin} 
            onSwitchToRegister={handleShowRegisterForm}
            onBack={handleBackToMain}
          />
        );
      case AppState.REGISTER_FORM:
        return (
          <RegisterForm 
            onRegister={handleRegister} 
            onSwitchToLogin={handleShowLoginForm}
            onBack={handleBackToMain}
          />
        );
      case AppState.OAUTH_CALLBACK:
        return <OAuthCallback onAuthSuccess={handleAuthSuccess} onAuthError={handleAuthError} />;
      case AppState.DASHBOARD:
        return user ? (
          <UserDashboard 
            user={user} 
            onLogout={handleLogout} 
            onStartGenerating={handleStartGenerating}
            onNavigateToPricing={handleNavigateToPricing}
            onNavigateToGallery={() => setAppState(AppState.GALLERY)}
          />
        ) : null;
      case AppState.EMAIL:
        return <EmailCollection onEmailSubmit={handleEmailSubmit} />;
      case AppState.PRICING:
        return <PricingPage onPlanSelect={handlePlanSelect} userEmail={user?.email || userEmail} />;
      case AppState.SUCCESS:
        return <SuccessPage onContinue={handlePlanSelect} />;
      case AppState.SAFARI_SUCCESS:
        return <SafariSuccessPage />;
      case AppState.SETUP:
        return (
          <>
            <ImageUploader onFilesChanged={handleFilesChanged} />
            <ThemeSelector 
              onGenerate={handleGenerate}
              disabled={uploadedFiles.length === 0}
              uploadedFileCount={uploadedFiles.length}
              userCredits={user?.credits || 0}
            />
          </>
        );
      case AppState.GENERATING:
        return <LoadingScreen />;
      case AppState.RESULT:
        return generatedImages.length > 0 ? (
          <GeneratedImages images={generatedImages} onStartOver={handleStartOver} />
        ) : (
          <div className="text-center text-red-400">
            <p>Something went wrong. No images were generated.</p>
            <button onClick={handleStartOver} className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
              Try Again
            </button>
          </div>
        );
      case AppState.GALLERY:
        return <PhotoGallery 
          onBack={() => setAppState(AppState.DASHBOARD)} 
          onGenerateMore={() => setAppState(AppState.SETUP)}
        />;
      default:
        return null;
    }
  };

  const showHeaderFooter = ![AppState.LOGIN, AppState.LOGIN_FORM, AppState.REGISTER_FORM, AppState.OAUTH_CALLBACK, AppState.EMAIL, AppState.PRICING, AppState.SUCCESS, AppState.SAFARI_SUCCESS, AppState.GALLERY].includes(appState);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* AI Photo Vault Header */}
      {showHeaderFooter && (
        <div className="w-full max-w-4xl mx-auto mb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/Generated Image September 25, 2025 - 7_23PM.png" 
              alt="AI Photo Vault Logo" 
              className="w-16 h-16 object-contain rounded-lg"
              style={{
                backgroundColor: 'transparent',
                filter: 'brightness(1.1) contrast(1.1)',
                mixBlendMode: 'screen'
              }}
            />
            <h1 className="text-5xl font-black tracking-wide bg-gradient-to-r from-cyan-300 via-white to-blue-300 bg-clip-text text-transparent hover:from-cyan-200 hover:via-white hover:to-purple-300 transition-all duration-500 hover:scale-105 hover:drop-shadow-2xl">
              AI Photo Vault
            </h1>
          </div>
        </div>
      )}

      {/* Credits Display and Navigation */}
      {isAuthenticated && user && (
        <div className="w-full max-w-7xl mx-auto mb-4">
          <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-300">
                Credits: <span className={`font-semibold ${user.credits >= 10 ? 'text-blue-400' : 'text-red-400'}`}>
                  {isGenerating ? 'Deducting...' : user.credits}
                </span>
              </div>
              {user.credits < 5 && !isGenerating && (
                <div className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
                  ⚠️ Need 5+ credits to generate
                </div>
              )}
              {isGenerating && (
                <div className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                  🔄 Credits being deducted...
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAppState(AppState.DASHBOARD)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition duration-300"
              >
                Account
              </button>
              <button
                onClick={() => setAppState(AppState.GALLERY)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition duration-300"
              >
                PhotoVault
              </button>
              <button
                onClick={handleNavigateToPricing}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition duration-300"
              >
                Buy Credits
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col justify-start pt-4">
        {error && showHeaderFooter && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {renderContent()}
      </main>
      {showHeaderFooter && (
        <footer className="w-full max-w-4xl mx-auto text-center py-2 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AI Photo Booth. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
};

export default App;