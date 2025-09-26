import React, { useState } from 'react';
import { THEMES } from '../constants';
import { Theme } from '../types';
import PhotoCountSelector from './PhotoCountSelector';

interface ThemeSelectorProps {
  onGenerate: (theme: Theme, photoCount: number, userPrompt?: string) => void;
  disabled: boolean;
  uploadedFileCount: number;
  userCredits: number;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  onGenerate,
  disabled,
  uploadedFileCount,
  userCredits
}) => {
  const [selectedPhotoCount, setSelectedPhotoCount] = useState(10);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  
  const handleThemeSelect = (theme: Theme) => {
    if (!disabled) {
      setSelectedTheme(theme);
    }
  };
  
  const handleGenerate = () => {
    if (selectedTheme && !disabled) {
      onGenerate(selectedTheme, selectedPhotoCount, userPrompt);
    }
  };
  
  return (
    <div className="w-full text-center mt-12">
      <h2 className="text-3xl font-bold text-slate-100 mb-2">Select a Theme</h2>
      <p className="text-slate-400 mb-4">
        {uploadedFileCount > 0 
          ? `${uploadedFileCount} photo${uploadedFileCount > 1 ? 's' : ''} uploaded. Now, choose your style.`
          : 'Upload a photo to enable themes.'
        }
      </p>
      
      {/* Photo Count Selector */}
      {uploadedFileCount > 0 && (
        <PhotoCountSelector
          selectedCount={selectedPhotoCount}
          onCountChange={setSelectedPhotoCount}
          disabled={disabled}
          userCredits={userCredits}
        />
      )}
      
      {/* User Prompt Input */}
      {uploadedFileCount > 0 && (
        <div className="mt-6 max-w-2xl mx-auto">
          <label htmlFor="userPrompt" className="block text-sm font-medium text-slate-300 mb-2">
            Additional Guidance (Optional)
          </label>
          <textarea
            id="userPrompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Add specific details like 'make me look confident', 'add dramatic lighting', 'make it more artistic', etc."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
            disabled={disabled}
          />
          <p className="text-xs text-slate-400 mt-1">
            Provide additional guidance to help the AI create exactly what you want
          </p>
        </div>
      )}
      
      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {THEMES.map((theme) => (
            <div
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              className={`group p-4 md:p-6 bg-slate-800 rounded-xl border-2 transition-all duration-200 ${
                disabled 
                  ? 'border-slate-700 opacity-50 cursor-not-allowed'
                  : selectedTheme?.id === theme.id
                    ? 'border-indigo-500 bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                    : 'border-slate-700 hover:border-indigo-500 hover:scale-105 cursor-pointer shadow-lg hover:shadow-indigo-500/20'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <theme.icon className={`w-10 h-10 transition-colors ${
                  disabled 
                    ? 'text-slate-500' 
                    : selectedTheme?.id === theme.id
                      ? 'text-indigo-400'
                      : 'text-slate-400 group-hover:text-indigo-400'
                }`} />
                <h3 className="text-md md:text-lg font-semibold text-slate-200">{theme.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Generate Button */}
      {selectedTheme && uploadedFileCount > 0 && (
        <div className="mt-8">
          <button
            onClick={handleGenerate}
            disabled={disabled}
            className={`px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {disabled ? 'Generating...' : `Generate ${selectedPhotoCount} Photos`}
          </button>
          <p className="text-slate-400 text-sm mt-2">
            Selected: {selectedTheme.title}
          </p>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
