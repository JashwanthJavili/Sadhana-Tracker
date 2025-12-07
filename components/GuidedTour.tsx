import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, Sparkles, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';

interface TourStep {
  target: string;
  title: { en: string; hi: string; te: string };
  content: { en: string; hi: string; te: string };
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
  arrowDirection?: 'up' | 'down' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: 'dashboard',
    title: { 
      en: '🎯 Welcome to Sadhana Lifeforce!', 
      hi: '🎯 साधना लाइफफोर्स में आपका स्वागत है!',
      te: '🎯 సాధన లైఫ్‌ఫోర్స్‌కు స్వాగతం!'
    },
    content: { 
      en: 'Your spiritual journey companion! Track daily sadhana, get insights, and connect with devotees worldwide. Let me show you around! 🙏',
      hi: 'आपकी आध्यात्मिक यात्रा का साथी! दैनिक साधना ट्रैक करें, अंतर्दृष्टि प्राप्त करें और दुनिया भर के भक्तों से जुड़ें। आइए मैं आपको घुमाता हूँ! 🙏',
      te: 'మీ ఆధ్యాత్మిక ప్రయాణ సహచరుడు! రోజువారీ సాధనను ట్రాక్ చేయండి, అంతర్దృష్టులను పొందండి మరియు ప్రపంచవ్యాప్తంగా భక్తులతో కనెక్ట్ అవ్వండి! నేను మిమ్మల్ని చూపిస్తాను! 🙏'
    },
    highlight: true,
    arrowDirection: 'down'
  },
  {
    target: 'planner',
    title: { 
      en: '📅 Daily Planner - Your Sadhana Hub', 
      hi: '📅 दैनिक योजनाकार - आपकी साधना केंद्र',
      te: '📅 దినచర్య ప్లానర్ - మీ సాధన కేంద్రం'
    },
    content: { 
      en: 'Set daily commitments, track hour-by-hour activities, record chanting rounds, study hours, mood, and reflections. Your complete spiritual dashboard!',
      hi: 'दैनिक प्रतिबद्धताएं सेट करें, घंटे-दर-घंटे गतिविधियों को ट्रैक करें, जप राउंड, अध्ययन घंटे, मूड और प्रतिबिंब रिकॉर्ड करें। आपका संपूर्ण आध्यात्मिक डैशबोर्ड!',
      te: 'రోజువారీ నిబద్ధతలను సెట్ చేయండి, గంటవారీ కార్యకలాపాలను ట్రాక్ చేయండి, జపం రౌండ్లు, అధ్యయన గంటలు, మానసిక స్థితి మరియు ప్రతిబింబాలను రికార్డ్ చేయండి। మీ పూర్తి ఆధ్యాత్మిక డాష్‌బోర్డ్!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'chanting',
    title: { 
      en: '📿 Japa Mala Counter - 108 Beads', 
      hi: '📿 जप माला काउंटर - 108 मनके',
      te: '📿 జపమాల కౌంటర్ - 108 పూసలు'
    },
    content: { 
      en: 'Digital japa mala with 108 beads visualization. Track each round, see completion percentage, and maintain focus during chanting sessions!',
      hi: '108 मनकों के दृश्य के साथ डिजिटल जप माला। प्रत्येक राउंड को ट्रैक करें, पूर्णता प्रतिशत देखें और जप सत्र के दौरान ध्यान बनाए रखें!',
      te: '108 పూసల దృశ్యీకరణతో డిజిటల్ జపమాల। ప్రతి రౌండ్‌ను ట్రాక్ చేయండి, పూర్తి శాతాన్ని చూడండి మరియు జపం సెషన్ల సమయంలో ఏకాగ్రత కలిగి ఉండండి!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'journal',
    title: { 
      en: '💝 Devotional Journal - Your Sacred Diary', 
      hi: '💝 भक्ति डायरी - आपकी पवित्र डायरी',
      te: '💝 భక్తి డైరీ - మీ పవిత్ర డైరీ'
    },
    content: { 
      en: 'Private space to record spiritual realizations, krishna-katha, darshan experiences, and daily gratitude. Fully encrypted and synced to cloud!',
      hi: 'आध्यात्मिक अनुभूतियों, कृष्ण-कथा, दर्शन अनुभवों और दैनिक कृतज्ञता को रिकॉर्ड करने के लिए निजी स्थान। पूरी तरह से एन्क्रिप्टेड और क्लाउड पर सिंक!',
      te: 'ఆధ్యాత్మిక సాక్షాత్కారాలు, కృష్ణ-కథ, దర్శన అనుభవాలు మరియు రోజువారీ కృతజ్ఞతను రికార్డ్ చేయడానికి ప్రైవేట్ స్థలం। పూర్తిగా ఎన్‌క్రిప్టెడ్ మరియు క్లౌడ్‌కు సింక్ చేయబడింది!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'slokas',
    title: { 
      en: '🎵 Mantras & Kirtans Library', 
      hi: '🎵 मंत्र और कीर्तन पुस्तकालय',
      te: '🎵 మంత్రాలు & కీర్తనాల లైబ్రరీ'
    },
    content: { 
      en: 'Access Bhagavad Gita verses, daily prayers, mangala-arati, guru-vandana, and popular kirtans. Learn pronunciation and meanings!',
      hi: 'भगवद गीता श्लोक, दैनिक प्रार्थनाएं, मंगल-आरती, गुरु-वंदना और लोकप्रिय कीर्तन तक पहुंचें। उच्चारण और अर्थ सीखें!',
      te: 'భగవద్గీత శ్లోకాలు, రోజువారీ ప్రార్థనలు, మంగళ-ఆరతి, గురు-వందన మరియు ప్రసిద్ధ కీర్తనాలను యాక్సెస్ చేయండి। ఉచ్ఛారణ మరియు అర్థాలను నేర్చుకోండి!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'festivals',
    title: { 
      en: '🗓️ Vaishnava Calendar - Sacred Days', 
      hi: '🗓️ वैष्णव कैलेंडर - पवित्र दिन',
      te: '🗓️ వైష్ణవ క్యాలెండర్ - పవిత్ర దినాలు'
    },
    content: { 
      en: 'Never miss Ekadashi, Janmashtami, Gaura Purnima, or any appearance/disappearance days. Get detailed festival information and observance guidelines!',
      hi: 'एकादशी, जन्माष्टमी, गौर पूर्णिमा या किसी भी प्रकटन/तिरोभाव दिन को न चूकें। विस्तृत त्योहार जानकारी और पालन दिशानिर्देश प्राप्त करें!',
      te: 'ఏకాదశి, జన్మాష్టమి, గౌర పూర్ణిమ, లేదా ఏదైనా ఆవిర్భావ/తిరోభావ దినాలను కోల్పోకండి। వివరణాత్మక పండుగ సమాచారం మరియు పాటించే మార్గదర్శకాలను పొందండి!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'questions',
    title: { 
      en: '❓ Spiritual Q&A Forum - Ask & Learn', 
      hi: '❓ आध्यात्मिक प्रश्नोत्तर मंच - पूछें और सीखें',
      te: '❓ ఆధ్యాత్మిక ప్రశ్నోత్తర ఫోరమ్ - అడగండి & నేర్చుకోండి'
    },
    content: { 
      en: 'Ask spiritual questions, get answers from senior devotees, browse FAQs on philosophy, sadhana, and vaishnava etiquette. Community wisdom!',
      hi: 'आध्यात्मिक प्रश्न पूछें, वरिष्ठ भक्तों से उत्तर प्राप्त करें, दर्शन, साधना और वैष्णव शिष्टाचार पर FAQ ब्राउज़ करें। सामुदायिक ज्ञान!',
      te: 'ఆధ్యాత్మిక ప్రశ్నలు అడగండి, సీనియర్ భక్తుల నుండి సమాధానాలను పొందండి, తత్వశాస్త్రం, సాధన మరియు వైష్ణవ ఆచారంపై FAQలను బ్రౌజ్ చేయండి। కమ్యూనిటీ జ్ఞానం!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'community',
    title: { 
      en: '👥 Devotee Community - Connect Globally', 
      hi: '👥 भक्त समुदाय - वैश्विक रूप से जुड़ें',
      te: '👥 భక్తుల సంఘం - ప్రపంచవ్యాప్తంగా కనెక్ట్ అవ్వండి'
    },
    content: { 
      en: 'Find devotees by ISKCON center, chat privately, share experiences, and build meaningful friendships. Sanga is essential for bhakti!',
      hi: 'इस्कॉन केंद्र द्वारा भक्तों को खोजें, निजी रूप से चैट करें, अनुभव साझा करें और सार्थक मित्रता बनाएं। भक्ति के लिए संग आवश्यक है!',
      te: 'ఇస్కాన్ కేంద్రం ద్వారా భక్తులను కనుగొనండి, ప్రైవేట్‌గా చాట్ చేయండి, అనుభవాలను పంచుకోండి మరియు అర్థవంతమైన స్నేహాలను ఏర్పరచుకోండి। భక్తి కోసం సంగం అవసరం!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'messages',
    title: { 
      en: '💬 Private Messages - Devotee Communication', 
      hi: '💬 निजी संदेश - भक्त संचार',
      te: '💬 ప్రైవేట్ సందేశాలు - భక్త కమ్యూనికేషన్'
    },
    content: { 
      en: 'Send and receive private messages, create group discussions, share sadhana tips, and collaborate on community projects securely!',
      hi: 'निजी संदेश भेजें और प्राप्त करें, समूह चर्चा बनाएं, साधना सुझाव साझा करें और सामुदायिक परियोजनाओं पर सुरक्षित रूप से सहयोग करें!',
      te: 'ప్రైవేట్ సందేశాలను పంపండి మరియు స్వీకరించండి, గ్రూప్ చర్చలను సృష్టించండి, సాధన చిట్కాలను పంచుకోండి మరియు కమ్యూనిటీ ప్రాజెక్ట్‌లలో సురక్షితంగా సహకరించండి!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'analytics',
    title: { 
      en: '📊 Analytics - Track Your Growth', 
      hi: '📊 विश्లेषण - अपनी वृद्धि को ट्रैक करें',
      te: '📊 విశ్లేషణ - మీ పెరుగుదలను ట్రాక్ చేయండి'
    },
    content: { 
      en: 'Beautiful charts showing chanting trends, discipline scores, mood patterns, sleep quality, and overall spiritual progress. Data-driven bhakti!',
      hi: 'जप रुझान, अनुशासन स्कोर, मूड पैटर्न, नींद की गुणवत्ता और समग्र आध्यात्मिक प्रगति दिखाने वाले सुंदर चार्ट। डेटा-संचालित भक्ति!',
      te: 'జపం ట్రెండ్‌లు, క్రమశిక్షణ స్కోర్‌లు, మానసిక నమూనాలు, నిద్ర నాణ్యత మరియు మొత్తం ఆధ్యాత్మిక పురోగతిని చూపే అందమైన చార్ట్‌లు। డేటా-ఆధారిత భక్తి!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'history',
    title: { 
      en: '📖 History - Your Spiritual Timeline', 
      hi: '📖 इतिहास - आपकी आध्यात्मिक समयरेखा',
      te: '📖 చరిత్ర - మీ ఆధ్యాత్మిక కాలక్రమం'
    },
    content: { 
      en: 'View all past entries, search by date, filter by metrics, export data as CSV, and see your complete sadhana journey unfold!',
      hi: 'सभी पिछली प्रविष्टियों को देखें, तिथि के अनुसार खोजें, मेट्रिक्स के अनुसार फ़िल्टर करें, CSV के रूप में डेटा निर्यात करें और अपनी संपूर्ण साधना यात्रा को प्रकट होते देखें!',
      te: 'అన్ని గత ఎంట్రీలను చూడండి, తేదీ ద్వారా శోధించండి, మెట్రిక్స్ ద్వారా ఫిల్టర్ చేయండి, CSV గా డేటాను ఎగుమతి చేయండి మరియు మీ పూర్తి సాధన ప్రయాణాన్ని చూడండి!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'settings',
    title: { 
      en: '⚙️ Settings - Personalize Your Experience', 
      hi: '⚙️ सेटिंग्स - अपने अनुभव को वैयक्तिकृत करें',
      te: '⚙️ సెట్టింగ్‌లు - మీ అనుభవాన్ని వ్యక్తిగతీకరించండి'
    },
    content: { 
      en: 'Set your name, ISKCON center, spiritual guide, add custom inspirational quotes, choose language (English/Hindi/Telugu), and manage account!',
      hi: 'अपना नाम, इस्कॉन केंद्र, आध्यात्मिक मार्गदर्शक सेट करें, कस्टम प्रेरक उद्धरण जोड़ें, भाषा चुनें (अंग्रेज़ी/हिंदी/तेलुगु) और खाता प्रबंधित करें!',
      te: 'మీ పేరు, ఇస్కాన్ కేంద్రం, ఆధ్యాత్మిక మార్గదర్శిని సెట్ చేయండి, కస్టమ్ స్ఫూర్తిదాయక కోట్స్ జోడించండి, భాష ఎంచుకోండి (ఇంగ్లీష్/హిందీ/తెలుగు) మరియు ఖాతాను నిర్వహించండి!'
    },
    highlight: true,
    arrowDirection: 'left'
  },
  {
    target: 'dashboard',
    title: { 
      en: '✨ You\'re All Set! Start Your Journey', 
      hi: '✨ आप तैयार हैं! अपनी यात्रा शुरू करें',
      te: '✨ మీరు సిద్ధంగా ఉన్నారు! మీ ప్రయాణాన్ని ప్రారంభించండి'
    },
    content: { 
      en: 'Now dive into Daily Planner to record today\'s sadhana! Remember: Consistency is the key to spiritual growth. Hare Krishna! 🙏✨',
      hi: 'अब आज की साधना रिकॉर्ड करने के लिए दैनिक योजनाकार में उतरें! याद रखें: निरंतरता आध्यात्मिक विकास की कुंजी है। हरे कृष्ण! 🙏✨',
      te: 'ఇప్పుడు నేటి సాధనను రికార్డ్ చేయడానికి దినచర్య ప్లానర్‌లోకి వెళ్లండి! గుర్తుంచుకోండి: స్థిరత్వం ఆధ్యాత్మిక పెరుగుదలకు కీలకం. హరే కృష్ణ! 🙏✨'
    },
    highlight: true,
    arrowDirection: 'down'
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
    next: { en: 'Next Step →', hi: 'अगला →', te: 'తదుపరి →' },
    previous: { en: '← Previous', hi: '← पिछला', te: '← మునుపటి' },
    skip: { en: 'Skip Tour', hi: 'टूर छोड़ें', te: 'టూర్ దాటవేయండి' },
    finish: { en: "Let's Start! ✨", hi: 'शुरू करें! ✨', te: 'ప్రారంభిద్దాం! ✨' }
  };

  const getArrowIcon = () => {
    switch (step.arrowDirection) {
      case 'up': return <ArrowUp className="text-orange-500 animate-bounce" size={32} />;
      case 'down': return <ArrowDown className="text-orange-500 animate-bounce" size={32} />;
      case 'left': return <ArrowLeft className="text-orange-500 animate-pulse" size={32} />;
      case 'right': return <ArrowRight className="text-orange-500 animate-pulse" size={32} />;
      default: return null;
    }
  };

  return (
    <>
      {/* Full-screen dark overlay */}
      <div className="fixed inset-0 z-[9998] bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300" />
      
      {/* Spotlight highlight effect */}
      {step.highlight && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />
        </div>
      )}

      {/* Arrow pointer */}
      {step.arrowDirection && (
        <div className="fixed z-[10000] flex items-center justify-center" 
          style={{
            top: step.arrowDirection === 'down' ? '20%' : step.arrowDirection === 'up' ? '80%' : '50%',
            left: step.arrowDirection === 'left' ? '85%' : step.arrowDirection === 'right' ? '15%' : '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {getArrowIcon()}
        </div>
      )}

      {/* Tour modal */}
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-white via-orange-50 to-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 space-y-6 animate-scale-in border-4 border-orange-200">
          {/* Header with sparkles */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-orange-600 text-sm font-bold mb-3 animate-pulse">
                <Sparkles size={20} className="text-orange-500" />
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Step {currentStep + 1} of {tourSteps.length}
                </span>
              </div>
              <h3 className="text-3xl font-serif font-bold bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 bg-clip-text text-transparent mb-2">
                {step.title[language]}
              </h3>
            </div>
            <button
              onClick={skipTour}
              className="text-stone-400 hover:text-stone-700 transition-all hover:rotate-90 duration-300"
              aria-label="Close tour"
            >
              <X size={28} strokeWidth={2.5} />
            </button>
          </div>

          {/* Content with better typography */}
          <div className="py-6 px-2">
            <p className="text-stone-700 text-lg leading-relaxed font-medium">
              {step.content[language]}
            </p>
          </div>

          {/* Enhanced progress bar */}
          <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            >
              <div className="h-full w-full bg-white/30 animate-shimmer" />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 py-2">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-8 bg-gradient-to-r from-orange-500 to-amber-500' 
                    : idx < currentStep
                    ? 'w-2 bg-orange-300'
                    : 'w-2 bg-stone-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation with premium styling */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={20} />
              {labels.previous[language]}
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:via-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
            >
              {isLastStep ? labels.finish[language] : labels.next[language]}
              {!isLastStep && <ChevronRight size={22} />}
            </button>
          </div>

          {/* Fun fact or tip */}
          {currentStep === 0 && (
            <div className="text-center text-sm text-stone-500 italic pt-2 border-t border-stone-200">
              💡 Tip: Use the Daily Planner every morning to set your spiritual goals!
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
};

export default GuidedTour;
