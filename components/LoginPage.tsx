import React from 'react';
import { ArrowRightIcon, StarIcon } from './icons';
import { THEMES } from '../constants';

interface LoginPageProps {
  onAccountCreate: () => void;
  onShowLogin?: () => void;
  onShowRegister?: () => void;
}

const sampleImages = [
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&h=400&fit=crop",
];

const Testimonial: React.FC<{ quote: string; author: string }> = ({ quote, author }) => (
  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
    <div className="flex text-yellow-400 mb-4">
      {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5" />)}
    </div>
    <p className="text-slate-300 mb-4">"{quote}"</p>
    <p className="font-semibold text-slate-200">- {author}</p>
  </div>
);

const LoginPage: React.FC<LoginPageProps> = ({ onAccountCreate, onShowLogin, onShowRegister }) => {
  const images = [...sampleImages, ...sampleImages]; // Duplicate for seamless scroll

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center text-center overflow-hidden p-4">
      {/* Background Scrolling Gallery */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/80 z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3000px] h-full flex items-center">
              <div className="flex w-full animate-scroll">
                  {images.map((src, index) => (
                      <img key={index} src={src} alt={`Sample photo ${index}`} className="w-[300px] h-[400px] object-cover rounded-xl shadow-2xl mx-4 opacity-50" />
                  ))}
              </div>
          </div>
      </div>
      
      <div className="relative z-20 flex flex-col items-center">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 mb-8">
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
        
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
          Create Your Perfect AI Photos
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-slate-300 mb-10">
          Get professional-quality studio photos, dating profile pictures, and creative portraits in any style imaginable.
        </p>
        <div className="flex flex-col gap-4 items-center">
          <div className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg">
              Create your photos
          </div>
          
          {onShowLogin && onShowRegister && (
            <div className="flex gap-3">
              <button 
                  onClick={onShowLogin}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300"
              >
                  Sign In
              </button>
              <button 
                  onClick={onShowRegister}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                  Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-20 w-full max-w-5xl mt-24">
        <h2 className="text-3xl font-bold text-white mb-8">Loved by professionals and creatives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Testimonial quote="This is a game-changer for my LinkedIn profile. I got a dozen amazing headshots in minutes." author="Sarah L." />
          <Testimonial quote="I finally have dating app photos I'm actually confident about. The quality is incredible!" author="Mike R." />
          <Testimonial quote="As an artist, I love experimenting with the different creative styles. The fantasy and anime packs are my favorite." author="Jenna K." />
        </div>
      </div>

      {/* Available Themes Section */}
      <div className="relative z-20 w-full max-w-6xl mt-24">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Choose Your Style</h2>
        <p className="text-center text-slate-300 mb-12 max-w-2xl mx-auto">
          Transform your photos with our diverse collection of AI-powered themes. From professional headshots to creative fantasy portraits.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {THEMES.map((theme) => {
            const IconComponent = theme.icon;
            return (
              <div key={theme.id} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:bg-slate-800/70 group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 mb-4 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors duration-300">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{theme.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {theme.id === 'linkedin' && 'Professional business headshots for your career'}
                    {theme.id === 'dating' && 'Attractive photos for dating profiles'}
                    {theme.id === 'selfie' && 'Enhanced selfies with professional quality'}
                    {theme.id === 'athlete' && 'Dynamic athletic portraits with power'}
                    {theme.id === 'vintage' && 'Classic 1950s vintage aesthetic'}
                    {theme.id === 'superhero' && 'Comic book superhero transformations'}
                    {theme.id === 'fantasy' && 'Epic fantasy character portraits'}
                    {theme.id === 'anime' && 'Anime-style artistic portraits'}
                    {theme.id === 'cyberpunk' && 'Futuristic cyberpunk aesthetics'}
                    {theme.id === 'royal' && 'Regal royal court portraits'}
                    {theme.id === 'pirate' && 'Swashbuckling pirate adventures'}
                    {theme.id === 'puppy' && 'Playful photos with adorable puppies'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;