import React from 'react';
import { ArrowRightIcon, StarIcon } from './icons';

interface LoginPageProps {
  onAccountCreate: () => void;
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

const LoginPage: React.FC<LoginPageProps> = ({ onAccountCreate }) => {
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
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
          Create Your Perfect AI Headshots
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-300 mb-10">
          Get professional-quality studio photos, dating profile pictures, and creative portraits in any style imaginable.
        </p>
        <button 
            onClick={onAccountCreate}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all transform hover:scale-105"
        >
            Create your photos
            <ArrowRightIcon className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="relative z-20 w-full max-w-5xl mt-24">
        <h2 className="text-3xl font-bold text-white mb-8">Loved by professionals and creatives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Testimonial quote="This is a game-changer for my LinkedIn profile. I got a dozen amazing headshots in minutes." author="Sarah L." />
          <Testimonial quote="I finally have dating app photos I'm actually confident about. The quality is incredible!" author="Mike R." />
          <Testimonial quote="As an artist, I love experimenting with the different creative styles. The fantasy and anime packs are my favorite." author="Jenna K." />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;