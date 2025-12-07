import React, { useState } from 'react';
import { X } from 'lucide-react';

interface GenderSelectionModalProps {
  isOpen: boolean;
  onComplete: (gender: 'male' | 'female') => void;
}

const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({ isOpen, onComplete }) => {
  const [gender, setGender] = useState<'male' | 'female'>('male');

  if (!isOpen) return null;

  const handleComplete = () => {
    onComplete(gender);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🙏</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
            Welcome Back!
          </h2>
          <p className="text-stone-600 text-sm">
            We've added a respectful addressing feature. Please select your gender so we can address you properly as Prabhuji or Mataji.
          </p>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">
            How may we address you?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGender('male')}
              className={`p-4 border-2 rounded-lg transition-all ${
                gender === 'male'
                  ? 'border-orange-600 bg-orange-50 shadow-md'
                  : 'border-stone-300 hover:border-orange-300'
              }`}
            >
              <div className="text-3xl mb-2">👨</div>
              <div className="font-semibold">Male</div>
              <div className="text-xs text-stone-500">Prabhuji</div>
            </button>
            <button
              onClick={() => setGender('female')}
              className={`p-4 border-2 rounded-lg transition-all ${
                gender === 'female'
                  ? 'border-orange-600 bg-orange-50 shadow-md'
                  : 'border-stone-300 hover:border-orange-300'
              }`}
            >
              <div className="text-3xl mb-2">👩</div>
              <div className="font-semibold">Female</div>
              <div className="text-xs text-stone-500">Mataji</div>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleComplete}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          Continue 🚀
        </button>
      </div>
    </div>
  );
};

export default GenderSelectionModal;
