import React from 'react';
import { PhotoIcon } from './icons';

interface HeaderProps {
    onStartOver: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStartOver }) => {
  return (
    <header className="w-full max-w-4xl mx-auto flex justify-between items-center py-2">
      <div 
        className="flex items-center gap-3 cursor-pointer"
        onClick={onStartOver}
        title="Start Over"
      >
        <PhotoIcon className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-black tracking-wide bg-gradient-to-r from-slate-200 via-white to-indigo-200 bg-clip-text text-transparent hover:from-white hover:via-indigo-200 hover:to-purple-200 transition-all duration-500 hover:scale-105 hover:drop-shadow-2xl">
          AI Photo Vault
        </h1>
      </div>
    </header>
  );
};

export default Header;
