import React from 'react';

interface PhotoCountSelectorProps {
  selectedCount: number;
  onCountChange: (count: number) => void;
  disabled: boolean;
  userCredits: number;
}

const PHOTO_COUNT_OPTIONS = [
  { count: 5, label: '5 Photos', credits: 5, description: 'Quick generation' },
  { count: 10, label: '10 Photos', credits: 10, description: 'Standard (recommended)' },
  { count: 15, label: '15 Photos', credits: 15, description: 'More variety' },
  { count: 20, label: '20 Photos', credits: 20, description: 'Maximum variety' },
];

const PhotoCountSelector: React.FC<PhotoCountSelectorProps> = ({
  selectedCount,
  onCountChange,
  disabled,
  userCredits
}) => {
  return (
    <div className="w-full text-center mb-8">
      <h3 className="text-xl font-bold text-slate-100 mb-4">How many photos would you like?</h3>
      <p className="text-slate-400 mb-6">
        Choose the number of AI photos to generate. Each photo costs 1 credit.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
        {PHOTO_COUNT_OPTIONS.map((option) => {
          const canAfford = userCredits >= option.credits;
          const isSelected = selectedCount === option.count;
          const isDisabled = disabled || !canAfford;
          
          return (
            <div
              key={option.count}
              onClick={() => !isDisabled && onCountChange(option.count)}
              className={`group p-4 rounded-lg border-2 transition-all duration-200 ${
                isDisabled
                  ? 'border-slate-700 opacity-50 cursor-not-allowed bg-slate-800'
                  : isSelected
                  ? 'border-indigo-500 bg-indigo-900/30 cursor-pointer'
                  : 'border-slate-600 hover:border-indigo-400 hover:scale-105 cursor-pointer bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`text-lg font-bold ${
                  isSelected ? 'text-indigo-300' : isDisabled ? 'text-slate-500' : 'text-slate-200'
                }`}>
                  {option.count}
                </div>
                <div className={`text-sm font-medium ${
                  isSelected ? 'text-indigo-200' : isDisabled ? 'text-slate-500' : 'text-slate-300'
                }`}>
                  {option.label}
                </div>
                <div className={`text-xs ${
                  isSelected ? 'text-indigo-200' : isDisabled ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {option.description}
                </div>
                <div className={`text-xs font-semibold ${
                  canAfford ? 'text-green-400' : 'text-red-400'
                }`}>
                  {option.credits} credits
                </div>
                {!canAfford && (
                  <div className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
                    Need {option.credits - userCredits} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Credit cost summary */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Total cost:</span>
          <span className={`font-bold text-lg ${
            userCredits >= selectedCount ? 'text-green-400' : 'text-red-400'
          }`}>
            {selectedCount} credits
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-slate-400">Your credits:</span>
          <span className={`font-semibold ${
            userCredits >= selectedCount ? 'text-green-400' : 'text-red-400'
          }`}>
            {userCredits}
          </span>
        </div>
        {userCredits < selectedCount && (
          <div className="mt-2 text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
            ⚠️ You need {selectedCount - userCredits} more credits to generate {selectedCount} photos
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCountSelector;
