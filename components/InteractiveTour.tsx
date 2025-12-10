import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface TourStep {
  target: string;
  title: { en: string; hi: string; te: string };
  description: { en: string; hi: string; te: string };
  position: 'top' | 'bottom' | 'left' | 'right';
  route?: string;
}

const tourSteps: TourStep[] = [
  {
    target: 'body',
    title: {
      en: 'Welcome to Sadhana Sang! 🙏',
      hi: 'साधना लाइफफोर्स में आपका स्वागत है! 🙏',
      te: 'సాధన లైఫ్‌ఫోర్స్‌కు స్వాగతం! 🙏'
    },
    description: {
      en: 'Let me guide you through all the powerful features designed to elevate your spiritual journey. This tour will take you step-by-step through each component.',
      hi: 'मैं आपको उन सभी शक्तिशाली सुविधाओं के बारे में बताऊंगा जो आपकी आध्यात्मिक यात्रा को उन्नत करने के लिए डिज़ाइन की गई हैं। यह टूर आपको प्रत्येक घटक के माध्यम से चरण-दर-चरण ले जाएगा।',
      te: 'మీ ఆధ్యాత్మిక ప్రయాణాన్ని ఉన్నతీకరించడానికి రూపొందించిన అన్ని శక్తివంతమైన ఫీచర్ల గురించి నేను మిమ్మల్ని మార్గనిర్దేశం చేస్తాను. ఈ టూర్ మిమ్మల్ని ప్రతి భాగం ద్వారా దశలవారీగా తీసుకెళ్తుంది.'
    },
    position: 'bottom'
  },
  {
    target: '[data-tour="dashboard"]',
    route: '/',
    title: {
      en: '📊 Dashboard - Your Spiritual Overview',
      hi: '📊 डैशबोर्ड - आपका आध्यात्मिक अवलोकन',
      te: '📊 డాష్‌బోర్డ్ - మీ ఆధ్యాత్మిక అవలోకనం'
    },
    description: {
      en: 'Your home base! See daily commitments, quick stats like average rounds and study hours, and recent entries. Track your spiritual progress at a glance.',
      hi: 'आपका मुख्य आधार! दैनिक प्रतिबद्धताएं, औसत राउंड और अध्ययन घंटों जैसे त्वरित आंकड़े, और हाल की प्रविष्टियां देखें। एक नज़र में अपनी आध्यात्मिक प्रगति को ट्रैक करें।',
      te: 'మీ హోం బేస్! రోజువారీ కట్టుబాట్లు, సగటు రౌండ్‌లు మరియు చదువు గంటలు వంటి త్వరిత గణాంకాలు, మరియు ఇటీవలి ఎంట్రీలను చూడండి. ఒక చూపులో మీ ఆధ్యాత్మిక పురోగతిని ట్రాక్ చేయండి.'
    },
    position: 'right'
  },
  {
    target: '[data-tour="planner"]',
    route: '/planner',
    title: {
      en: '📝 Daily Planner - Structure Your Sadhana',
      hi: '📝 दैनिक योजनाकार - अपनी साधना की संरचना करें',
      te: '📝 రోజువారీ ప్లానర్ - మీ సాధనను నిర్మాణాత్మకంగా చేయండి'
    },
    description: {
      en: 'Plan your entire day! Set commitments, track chanting rounds, study hours, sleep, mood, and energy levels. Use the timeline to schedule activities hour by hour.',
      hi: 'अपने पूरे दिन की योजना बनाएं! प्रतिबद्धताएं निर्धारित करें, जप राउंड, अध्ययन घंटे, नींद, मनोदशा और ऊर्जा स्तर को ट्रैक करें। गतिविधियों को घंटे-दर-घंटे शेड्यूल करने के लिए टाइमलाइन का उपयोग करें।',
      te: 'మీ రోజంతా ప్లాన్ చేయండి! కట్టుబాట్లు సెట్ చేయండి, జపం రౌండ్లు, చదువు గంటలు, నిద్ర, మూడ్ మరియు శక్తి స్థాయిలను ట్రాక్ చేయండి. గంటకు గంట కార్యకలాపాలను షెడ్యూల్ చేయడానికి టైమ్‌లైన్ ఉపయోగించండి.'
    },
    position: 'right'
  },
  {
    target: '[data-tour="analytics"]',
    route: '/analytics',
    title: {
      en: '📈 Analytics - Data-Driven Insights',
      hi: '📈 विश्लेषण - डेटा-संचालित अंतर्दृष्टि',
      te: '📈 అనలిటిక్స్ - డేటా-ఆధారిత అంతర్దృష్టులు'
    },
    description: {
      en: 'Visualize your growth! Beautiful charts show trends in discipline, mood, chanting, study, and more. Identify patterns and celebrate improvements over time.',
      hi: 'अपने विकास को देखें! सुंदर चार्ट अनुशासन, मनोदशा, जप, अध्ययन और अधिक में रुझान दिखाते हैं। समय के साथ पैटर्न की पहचान करें और सुधारों का जश्न मनाएं।',
      te: 'మీ ఎదుగుదలను దృశ్యమానం చేయండి! అందమైన చార్ట్‌లు క్రమశిక్షణ, మూడ్, జపం, చదువు మరియు మరిన్నింటిలో ట్రెండ్‌లను చూపిస్తాయి. నమూనాలను గుర్తించండి మరియు కాలక్రమేణా మెరుగుదలలను జరుపుకోండి.'
    },
    position: 'right'
  },
  {
    target: '[data-tour="journal"]',
    route: '/journal',
    title: {
      en: '💭 Devotional Journal - Express Your Heart',
      hi: '💭 भक्ति डायरी - अपने दिल को व्यक्त करें',
      te: '💭 భక్తి జర్నల్ - మీ హృదయాన్ని వ్యక్తపరచండి'
    },
    description: {
      en: 'Record your devotional feelings and spiritual realizations. Add mood tags (peaceful, joyful, contemplative), write detailed entries, and reflect on your inner journey.',
      hi: 'अपनी भक्ति भावनाओं और आध्यात्मिक अनुभूतियों को रिकॉर्ड करें। मनोदशा टैग जोड़ें (शांतिपूर्ण, आनंदपूर्ण, चिंतनशील), विस्तृत प्रविष्टियां लिखें, और अपनी आंतरिक यात्रा पर विचार करें।',
      te: 'మీ భక్తి భావాలు మరియు ఆధ్యాత్మిక సాక్షాత్కారాలను రికార్డ్ చేయండి. మూడ్ ట్యాగ్‌లను జోడించండి (ప్రశాంతత, ఆనందం, ధ్యానం), వివరణాత్మక ఎంట్రీలను వ్రాయండి, మరియు మీ అంతర్గత ప్రయాణాన్ని ప్రతిబింబించండి.'
    },
    position: 'right'
  },
  {
    target: '[data-tour="history"]',
    route: '/history',
    title: {
      en: '📅 History - Review Your Journey',
      hi: '📅 इतिहास - अपनी यात्रा की समीक्षा करें',
      te: '📅 చరిత్ర - మీ ప్రయాణాన్ని సమీక్షించండి'
    },
    description: {
      en: 'Browse all your past entries month by month. See your consistency, review commitments, and track long-term spiritual development.',
      hi: 'अपनी सभी पिछली प्रविष्टियों को महीने-दर-महीने ब्राउज़ करें। अपनी निरंतरता देखें, प्रतिबद्धताओं की समीक्षा करें, और दीर्घकालिक आध्यात्मिक विकास को ट्रैक करें।',
      te: 'మీ గత ఎంట్రీలన్నింటినీ నెలవారీగా బ్రౌజ్ చేయండి. మీ స్థిరత్వాన్ని చూడండి, కట్టుబాట్లను సమీక్షించండి, మరియు దీర్ఘకాలిక ఆధ్యాత్మిక అభివృద్ధిని ట్రాక్ చేయండి.'
    },
    position: 'right'
  },
  {
    target: '[data-tour="settings"]',
    route: '/settings',
    title: {
      en: '⚙️ Settings - Personalize Your Experience',
      hi: '⚙️ सेटिंग्स - अपने अनुभव को वैयक्तिकृत करें',
      te: '⚙️ సెట్టింగ్‌లు - మీ అనుభవాన్ని వ్యక్తిగతీకరించండి'
    },
    description: {
      en: 'Customize your profile, choose your language (English/Hindi/Telugu), add custom quotes, and set your ISKCON center and Guru name. Make it truly yours!',
      hi: 'अपनी प्रोफ़ाइल को अनुकूलित करें, अपनी भाषा चुनें (अंग्रेज़ी/हिंदी/तेलुगु), कस्टम उद्धरण जोड़ें, और अपने इस्कॉन केंद्र और गुरु का नाम सेट करें। इसे वास्तव में अपना बनाएं!',
      te: 'మీ ప్రొఫైల్‌ను అనుకూలీకరించండి, మీ భాషను ఎంచుకోండి (ఇంగ్లీష్/హిందీ/తెలుగు), కస్టమ్ కోట్స్ జోడించండి, మరియు మీ ఇస్కాన్ సెంటర్ మరియు గురువు పేరును సెట్ చేయండి. దీన్ని నిజంగా మీదిగా చేసుకోండి!'
    },
    position: 'left'
  },
  {
    target: 'body',
    title: {
      en: '🎉 You\'re All Set!',
      hi: '🎉 आप तैयार हैं!',
      te: '🎉 మీరు సిద్ధంగా ఉన్నారు!'
    },
    description: {
      en: 'Start your spiritual journey today! Track your sadhana, analyze progress, and grow closer to Krishna consciousness. Hare Krishna! 🙏',
      hi: 'आज ही अपनी आध्यात्मिक यात्रा शुरू करें! अपनी साधना को ट्रैक करें, प्रगति का विश्लेषण करें, और कृष्ण चेतना के करीब बढ़ें। हरे कृष्णा! 🙏',
      te: 'ఈరోజే మీ ఆధ్యాత్మిక ప్రయాణం ప్రారంభించండి! మీ సాధనను ట్రాక్ చేయండి, పురోగతిని విశ్లేషించండి, మరియు కృష్ణ చైతన్యానికి దగ్గరగా పెరగండి. హరే కృష్ణ! 🙏'
    },
    position: 'bottom'
  }
];

interface InteractiveTourProps {
  onComplete: () => void;
}

const InteractiveTour: React.FC<InteractiveTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const lang = language as 'en' | 'hi' | 'te';
  const step = tourSteps[currentStep];

  useEffect(() => {
    // Navigate to the required route if specified
    if (step.route) {
      navigate(step.route);
    }

    // Wait for navigation and DOM update
    setTimeout(() => {
      if (step.target !== 'body') {
        const element = document.querySelector(step.target) as HTMLElement;
        if (element) {
          setHighlightedElement(element);
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setHighlightedElement(null);
      }
    }, 300);
  }, [currentStep, step.route, step.target, navigate]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Calculate tooltip position with boundary checks
  const getTooltipPosition = () => {
    if (!highlightedElement) {
      return { 
        position: 'fixed' as const,
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        maxWidth: '90vw'
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const tooltipWidth = Math.min(400, window.innerWidth - 40);
    const tooltipHeight = 300;
    const offset = 20;
    const padding = 20;

    let top = 0;
    let left = 0;
    let position: 'top' | 'bottom' | 'left' | 'right' = step.position;

    // Calculate initial position
    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        // If doesn't fit above, show below
        if (top < padding) {
          position = 'bottom';
          top = rect.bottom + offset;
        }
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        // If doesn't fit below, show above
        if (top + tooltipHeight > window.innerHeight - padding) {
          position = 'top';
          top = rect.top - tooltipHeight - offset;
        }
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - offset;
        // If doesn't fit left, show right
        if (left < padding) {
          position = 'right';
          left = rect.right + offset;
        }
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + offset;
        // If doesn't fit right, show left or center
        if (left + tooltipWidth > window.innerWidth - padding) {
          if (rect.left - tooltipWidth - offset > padding) {
            position = 'left';
            left = rect.left - tooltipWidth - offset;
          } else {
            // Center it
            left = window.innerWidth / 2 - tooltipWidth / 2;
            top = rect.bottom + offset;
          }
        }
        break;
    }

    // Boundary checks for left/right
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    // Boundary checks for top/bottom
    if (top < padding) top = padding;
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding;
    }

    return { 
      position: 'fixed' as const,
      top: `${top}px`, 
      left: `${left}px`,
      maxWidth: `${tooltipWidth}px`
    };
  };

  return (
    <>
      {/* Dark Overlay - No blur to keep text readable */}
      <div className="fixed inset-0 bg-black/60 z-[100000] transition-all duration-300" onClick={handleSkip}>
        {/* Spotlight effect on highlighted element */}
        {highlightedElement && (
          <div
            className="absolute rounded-xl transition-all duration-500 pointer-events-none ring-4 ring-orange-400"
            style={{
              top: highlightedElement.getBoundingClientRect().top - 8,
              left: highlightedElement.getBoundingClientRect().left - 8,
              width: highlightedElement.getBoundingClientRect().width + 16,
              height: highlightedElement.getBoundingClientRect().height + 16,
              boxShadow: '0 0 0 4px rgba(251, 146, 60, 1), 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 80px 30px rgba(251, 146, 60, 0.8)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              zIndex: 100001
            }}
          />
        )}

        {/* Tooltip - Always visible with higher z-index */}
        <div
          className="bg-white rounded-2xl shadow-2xl p-6 w-full sm:w-auto transition-all duration-300 z-[100002]"
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-lg shrink-0">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-orange-900 leading-tight">{step.title[lang]}</h3>
            </div>
            <button
              onClick={handleSkip}
              className="text-stone-400 hover:text-stone-600 transition-colors shrink-0 p-1"
              aria-label="Close tour"
            >
              <X size={24} />
            </button>
          </div>

          {/* Description */}
          <p className="text-stone-700 leading-relaxed mb-6 text-sm sm:text-base">
            {step.description[lang]}
          </p>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-orange-500 to-amber-500'
                    : index < currentStep
                    ? 'w-2 bg-green-400'
                    : 'w-2 bg-stone-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-orange-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-sm"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">{lang === 'en' ? 'Previous' : lang === 'hi' ? 'पिछला' : 'మునుపటి'}</span>
            </button>

            <span className="text-sm text-stone-500 font-medium">
              {currentStep + 1} / {tourSteps.length}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl font-semibold text-sm"
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  <span>{lang === 'en' ? 'Finish' : lang === 'hi' ? 'समाप्त' : 'ముగించు'}</span>
                  <Check size={20} />
                </>
              ) : (
                <>
                  <span>{lang === 'en' ? 'Next' : lang === 'hi' ? 'अगला' : 'తదుపరి'}</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InteractiveTour;