import React, { useState } from 'react';
import { Theme } from '../types';
import { THEMES } from '../constants';
import ImageUploader from './ImageUploader';
import PhotoCountSelector from './PhotoCountSelector';

interface GenerationPageProps {
  onGenerate: (theme: Theme, photoCount: number, userPrompt: string) => void;
  onFilesChanged: (files: File[]) => void;
  disabled: boolean;
  uploadedFiles: File[];
  userCredits: number;
}

const GenerationPage: React.FC<GenerationPageProps> = ({
  onGenerate,
  onFilesChanged,
  disabled,
  uploadedFiles,
  userCredits
}) => {
  const [selectedPhotoCount, setSelectedPhotoCount] = useState(1);
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
    <div className="flex h-full min-h-screen bg-black">
      {/* Left Sidebar - Controls */}
      <div className="w-96 bg-[#131313] border-r border-gray-800 p-6 overflow-y-auto">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">AI Photo Generator</h1>
            <p className="text-gray-400 text-sm">Create stunning AI-generated photos from your uploads</p>
          </div>

          {/* Photo Upload Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">1. Upload Photos</h2>
            <ImageUploader onFilesChanged={onFilesChanged} />
          </div>

          {/* Photo Count Selection */}
          {uploadedFiles.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">2. Choose Quantity</h2>
              <PhotoCountSelector
                selectedCount={selectedPhotoCount}
                onCountChange={setSelectedPhotoCount}
                disabled={disabled}
                userCredits={userCredits}
              />
            </div>
          )}

          {/* Theme Selection */}
          {uploadedFiles.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">3. Select Style</h2>
              <div className="space-y-3">
                {THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedTheme?.id === theme.id
                        ? 'border-indigo-500 bg-indigo-900/30'
                        : 'border-gray-700 hover:border-indigo-400 hover:bg-gray-800'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <h3 className="font-semibold text-white">{theme.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{theme.prompt.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Prompt */}
          {uploadedFiles.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">4. Additional Guidance</h2>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Add specific details like 'make me look confident', 'add dramatic lighting', etc."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
                disabled={disabled}
              />
              <p className="text-xs text-gray-400 mt-2">
                Provide additional guidance to help the AI create exactly what you want
              </p>
            </div>
          )}

          {/* Generate Button */}
          {selectedTheme && uploadedFiles.length > 0 && (
            <div>
              <button
                onClick={handleGenerate}
                disabled={disabled}
                className={`w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {disabled ? 'Generating...' : `Generate ${selectedPhotoCount} Photos`}
              </button>
              <p className="text-gray-400 text-sm mt-2 text-center">
                Selected: {selectedTheme.title}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Preview/Instructions */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Create AI Photos?</h2>
              <p className="text-gray-400 text-lg mb-8">
                Upload your photos using the controls on the left to get started
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Upload Photos</h3>
                  <p className="text-sm text-gray-400">Upload 1-5 photos to get started</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Choose Style</h3>
                  <p className="text-sm text-gray-400">Select from professional, creative, and more</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Generate</h3>
                  <p className="text-sm text-gray-400">Get your AI-generated photos instantly</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Generate!</h2>
              <p className="text-gray-400 text-lg mb-8">
                Complete the setup on the left to generate your AI photos
              </p>
              <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold text-white mb-4">Upload Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Photos uploaded:</span>
                    <span className="text-white">{uploadedFiles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Selected style:</span>
                    <span className="text-white">{selectedTheme?.title || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Photos to generate:</span>
                    <span className="text-white">{selectedPhotoCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationPage;
