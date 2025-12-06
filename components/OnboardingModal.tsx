import React, { useState } from 'react';
import { X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { userName: string; guruName: string; iskconCenter: string }) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [guruName, setGuruName] = useState('');
  const [iskconCenter, setIskconCenter] = useState('');

  console.log('OnboardingModal render - isOpen:', isOpen);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && userName.trim()) {
      setStep(2);
    } else if (step === 2 && guruName.trim()) {
      setStep(3);
    } else if (step === 3 && iskconCenter.trim()) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onComplete({ userName, guruName, iskconCenter });
  };

  const canProceed = () => {
    if (step === 1) return userName.trim().length > 0;
    if (step === 2) return guruName.trim().length > 0;
    if (step === 3) return iskconCenter.trim().length > 0;
    return false;
  };

  const labels = {
    welcome: { 
      en: 'Welcome to Sadhana Lifeforce!', 
      hi: 'साधना लाइफफोर्स में आपका स्वागत है!',
      te: 'సాధన లైఫ్‌ఫోర్స్‌కు స్వాగతం!'
    },
    subtitle: {
      en: "Let's personalize your spiritual journey",
      hi: 'आइए अपनी आध्यात्मिक यात्रा को व्यक्तिगत बनाएं',
      te: 'మీ ఆధ్యాత్మిక ప్రయాణాన్ని వ్యక్తిగతీకరించుకుందాం'
    },
    yourName: {
      en: 'What should we call you?',
      hi: 'हम आपको क्या कहें?',
      te: 'మేము మిమ్మల్ని ఏమని పిలవాలి?'
    },
    namePlaceholder: {
      en: 'Enter your name',
      hi: 'अपना नाम दर्ज करें',
      te: 'మీ పేరు నమోదు చేయండి'
    },
    spiritual: {
      en: 'Who is your spiritual guide?',
      hi: 'आपके आध्यात्मिक मार्गदर्शक कौन हैं?',
      te: 'మీ ఆధ్యాత్మిక మార్గదర్శి ఎవరు?'
    },
    spiritualPlaceholder: {
      en: 'e.g. HG Pranavananda Das Prabhu',
      hi: 'जैसे HG प्रणवानंद दास प्रभु',
      te: 'ఉదా. HG ప్రణవానంద దాస్ ప్రభు'
    },
    center: {
      en: 'Which ISKCON center do you associate with?',
      hi: 'आप किस इस्कॉन केंद्र से जुड़े हैं?',
      te: 'మీరు ఏ ఇస్కాన్ కేంద్రంతో అనుబంధంగా ఉన్నారు?'
    },
    centerPlaceholder: {
      en: 'e.g. ISKCON Hyderabad',
      hi: 'जैसे इस्कॉन हैदराबाद',
      te: 'ఉదా. ఇస్కాన్ హైదరాబాద్'
    },
    languageSelect: {
      en: 'Choose your preferred language',
      hi: 'अपनी पसंदीदा भाषा चुनें',
      te: 'మీ ఇష్టపడే భాషను ఎంచుకోండి'
    },
    next: { en: 'Next', hi: 'अगला', te: 'తదుపరి' },
    finish: { en: 'Get Started!', hi: 'शुरू करें!', te: 'ప్రారంభించండి!' }
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
            {step === 1 && 'Welcome to Sadhana Lifeforce!'}
            {step === 2 && 'Who is your spiritual guide?'}
            {step === 3 && 'Your ISKCON Center'}
          </h2>
          {step === 1 && (
            <p className="text-stone-500">Let's personalize your spiritual journey</p>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                s === step ? 'bg-orange-600' : s < step ? 'bg-orange-300' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                What should we call you?
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-lg"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && canProceed() && handleNext()}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Who is your spiritual guide?
                <span className="block text-xs text-stone-500 font-normal mt-1">
                  (From whom you are learning about God. If none, enter N/A)
                </span>
              </label>
              <input
                type="text"
                value={guruName}
                onChange={(e) => setGuruName(e.target.value)}
                placeholder="e.g. HG Pranavananda Das Prabhu or N/A"
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-lg"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && canProceed() && handleNext()}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Which ISKCON center do you associate with?
                <span className="block text-xs text-stone-500 font-normal mt-1">
                  (Your local ISKCON temple. If not connected, enter N/A)
                </span>
              </label>
              <input
                type="text"
                value={iskconCenter}
                onChange={(e) => setIskconCenter(e.target.value)}
                placeholder="e.g. ISKCON Hyderabad or N/A"
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-lg"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && canProceed() && handleComplete()}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 px-6 py-3 border-2 border-stone-300 text-stone-700 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {step === 3 ? 'Get Started!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
