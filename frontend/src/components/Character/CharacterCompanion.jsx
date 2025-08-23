import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const CharacterCompanion = ({ 
  characterState,
  onClose,
  onNext,
  onPrevious
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = () => {
    setIsAnimating(false);
    onClose && onClose();
  };

  useEffect(() => {
    if (characterState.isVisible) {
      // Show with smooth animation
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [characterState.isVisible]);

  const isFirstMessage = characterState.currentIndex === 0;
  const isLastMessage = characterState.currentIndex === characterState.messages.length - 1;
  const hasMultipleMessages = characterState.messages.length > 1;

  if (!characterState.isVisible) return null;

  const getPositionClasses = () => {
    switch (characterState.position) {
      case 'bottom-center':
        return 'fixed bottom-0 left-1/2 -translate-x-1/2 z-50';
      case 'center-right':
        return 'fixed right-1/4 top-1/2 -translate-y-1/2 z-50';
      case 'bottom-right':
        return 'fixed bottom-0 right-8 z-50';
      case 'bottom-right-left':
        return 'fixed bottom-0 right-16 z-50';
      case 'top-left':
        return 'fixed top-4 left-4 z-50';
      case 'center':
        return 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50';
      default:
        return 'fixed bottom-0 left-1/2 -translate-x-1/2 z-50';
    }
  };

  return (
    <div className={getPositionClasses()}>
      {/* Character Container */}
      <div 
        className={`transform transition-all duration-500 ease-out ${
          isAnimating 
            ? 'translate-x-0 opacity-100' 
            : 'translate-x-full opacity-0'
        }`}
      >
        {/* Professional Speech Bubble */}
        <div className="relative mb-6">
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-5 shadow-xl relative max-w-sm backdrop-blur-sm">
            {/* Subtle accent border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <p className="text-slate-700 text-sm leading-relaxed font-medium">
                {characterState.message}
              </p>
            </div>
            
            {/* Navigation and Close buttons */}
            <div className="absolute -top-3 -right-3 flex gap-1">
              {/* Previous button */}
              {hasMultipleMessages && !isFirstMessage && (
                <button
                  onClick={onPrevious}
                  className="bg-slate-600 hover:bg-slate-700 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              
              {/* Next button */}
              {hasMultipleMessages && !isLastMessage && (
                <button
                  onClick={onNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ChevronRight size={14} />
                </button>
              )}
              
              {/* Close button - always visible */}
              <button
                onClick={handleClose}
                className="bg-slate-400 hover:bg-slate-500 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Centered speech tail pointing down to character */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[14px] border-l-transparent border-r-transparent border-t-slate-200"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-[-2px] w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-slate-50"></div>
            </div>
          </div>
        </div>

        {/* Character Image - Dynamic Size */}
        <div className="flex justify-center">
          <img
            src={`/avatar/${characterState.pose}.png`}
            alt="WealthWise Assistant"
            className={`object-contain ${
              characterState.size === 'large' ? 'w-96 h-96' : 'w-80 h-80'
            }`}
            style={{
              filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterCompanion;
