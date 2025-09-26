import React, { useState, useEffect } from 'react';
import { MagicWandIcon } from './icons';

const loadingMessages = [
  "Analyzing your features...",
  "Applying artistic styles...",
  "Warming up the AI's creativity...",
  "Mixing digital paints...",
  "Finding the perfect light...",
  "This might take a moment...",
  "Almost there, crafting your masterpiece...",
  "Generating multiple variations...",
  "Creating unique compositions...",
  "Fine-tuning details...",
];

const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-24 h-24 rounded-full border-t-2 border-b-2 border-indigo-400 animate-spin"></div>
            <MagicWandIcon className="w-12 h-12 text-indigo-400"/>
        </div>
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Generating your photos...</h2>
      <p className="text-slate-400 transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingScreen;
