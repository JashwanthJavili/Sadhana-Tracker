import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

interface TourStep {
  target: string;
  title: { en: string; hi: string; te: string };
  content: { en: string; hi: string; te: string };
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: 'dashboard',
    title: { 
      en: 'Welcome to Sadhana Lifeforce!', 
      hi: 'साधना लाइफफोर्स में आपका स्वागत है!',
      te: 'సాధన లైఫ్‌ఫోర్స్‌కు స్వాగతం!'
    },
    content: { 
      en: 'Track your spiritual journey with daily entries, metrics, and reflections.',
      hi: 'दैनिक प्रविष्टियों, मेट्रिक्स और प्रतिबिंबों के साथ अपनी आध्यात्मिक यात्रा को ट्रैक करें।',
      te: 'రోజువారీ ఎంట్రీలు, మెట్రిక్స్ మరియు ప్రతిబింబాలతో మీ ఆధ్యాత్మిక ప్రయాణాన్ని ట్రాక్ చేయండి.'
    }
  },
  {
    target: 'daily-planner',
    title: { 
      en: 'Daily Planner', 
      hi: 'दैनिक योजनाकार',
      te: 'దినచర్య ప్లానర్'
    },
    content: { 
      en: 'Plan your day with commitments, timeline, metrics, and reflections.',
      hi: 'प्रतिबद्धताओं, समयरेखा, मेट्रिक्स और प्रतिबिंबों के साथ अपने दिन की योजना बनाएं।',
      te: 'నిబద్ధతలు, టైమ్‌లైన్, మెట్రిక్స్ మరియు ప్రతిబింబాలతో మీ రోజును ప్లాన్ చేసుకోండి.'
    }
  },
  {
    target: 'history',
    title: { 
      en: 'History & Progress', 
      hi: 'इतिहास और प्रगति',
      te: 'చరిత్ర & పురోగతి'
    },
    content: { 
      en: 'View your past entries and track your spiritual progress over time.',
      hi: 'अपनी पिछली प्रविष्टियों को देखें और समय के साथ अपनी आध्यात्मिक प्रगति को ट्रैक करें।',
      te: 'మీ గత ఎంట్రీలను చూడండి మరియు కాలక్రమేణా మీ ఆధ్యాత్మిక పురోగతిని ట్రాక్ చేయండి.'
    }
  },
  {
    target: 'analytics',
    title: { 
      en: 'Analytics & Insights', 
      hi: 'विश्लेषण और अंतर्दृष्टि',
      te: 'విశ్లేషణ & అంతర్దృష్టులు'
    },
    content: { 
      en: 'Get detailed insights and trends about your sadhana practice.',
      hi: 'अपनी साधना अभ्यास के बारे में विस्तृत जानकारी और रुझान प्राप्त करें।',
      te: 'మీ సాధన అభ్యాసం గురించి వివరమైన అంతర్దృష్టులు మరియు ట్రెండ్‌లను పొందండి.'
    }
  },
  {
    target: 'settings',
    title: { 
      en: 'Customize Your Experience', 
      hi: 'अपने अनुभव को अनुकूलित करें',
      te: 'మీ అనుభవాన్ని అనుకూలీకరించండి'
    },
    content: { 
      en: 'Personalize your name, spiritual guide, center, and add custom quotes.',
      hi: 'अपना नाम, आध्यात्मिक मार्गदर्शक, केंद्र और कस्टम उद्धरण जोड़ें।',
      te: 'మీ పేరు, ఆధ్యాత్మిక మార్గదర్శి, కేంద్రం మరియు కస్టమ్ కోట్స్ జోడించండి.'
    }
  }
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'hi' | 'te';
}

const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, language = 'en' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const nextStep = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  const labels = {
    next: { en: 'Next', hi: 'अगला', te: 'తదుపరి' },
    previous: { en: 'Previous', hi: 'पिछला', te: 'మునుపటి' },
    skip: { en: 'Skip Tour', hi: 'टूर छोड़ें', te: 'టూర్ దాటవేయండి' },
    finish: { en: 'Got it!', hi: 'समझ गया!', te: 'అర్థమైంది!' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-orange-600 text-sm font-semibold mb-2">
              <CheckCircle size={16} />
              Step {currentStep + 1} of {tourSteps.length}
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              {step.title[language]}
            </h3>
          </div>
          <button
            onClick={skipTour}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="py-4">
          <p className="text-stone-600 text-lg leading-relaxed">
            {step.content[language]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-200 rounded-full h-2">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            {labels.previous[language]}
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            {isLastStep ? labels.finish[language] : labels.next[language]}
            {!isLastStep && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
