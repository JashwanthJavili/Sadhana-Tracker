import React, { useState } from 'react';
import { X, MessageCircle, Send, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { markFeedbackShown } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackPromptProps {
  onClose: () => void;
}

const FeedbackPrompt: React.FC<FeedbackPromptProps> = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();

  const lang = language as 'en' | 'hi' | 'te';

  const content = {
    en: {
      title: 'Share Your Experience 🙏',
      subtitle: 'Your feedback helps us serve devotees better',
      question: 'How has Sadhana Sanga helped your spiritual journey?',
      ratingLabel: 'Rate your experience:',
      submitButton: 'Share Feedback',
      laterButton: 'Maybe Later',
      thankYou: 'Thank you for your valuable feedback!',
      thankYouMessage: 'Your input helps us improve and serve the devotee community better. Hare Krishna! 🙏'
    },
    hi: {
      title: 'अपना अनुभव साझा करें 🙏',
      subtitle: 'आपकी प्रतिक्रिया हमें भक्तों की बेहतर सेवा करने में मदद करती है',
      question: 'साधना लाइफफोर्स ने आपकी आध्यात्मिक यात्रा में कैसे मदद की है?',
      ratingLabel: 'अपने अनुभव को रेट करें:',
      submitButton: 'प्रतिक्रिया साझा करें',
      laterButton: 'बाद में शायद',
      thankYou: 'आपकी मूल्यवान प्रतिक्रिया के लिए धन्यवाद!',
      thankYouMessage: 'आपका इनपुट हमें सुधारने और भक्त समुदाय की बेहतर सेवा करने में मदद करता है। हरे कृष्णा! 🙏'
    },
    te: {
      title: 'మీ అనుభవాన్ని పంచుకోండి 🙏',
      subtitle: 'మీ అభిప్రాయం భక్తులకు మెరుగైన సేవ చేయడంలో మాకు సహాయపడుతుంది',
      question: 'సాధన లైఫ్‌ఫోర్స్ మీ ఆధ్యాత్మిక ప్రయాణానికి ఎలా సహాయపడింది?',
      ratingLabel: 'మీ అనుభవాన్ని రేట్ చేయండి:',
      submitButton: 'అభిప్రాయం పంచుకోండి',
      laterButton: 'తర్వాత చూద్దాం',
      thankYou: 'మీ విలువైన అభిప్రాయానికి ధన్యవాదాలు!',
      thankYouMessage: 'మీ ఇన్‌పుట్ మాకు మెరుగుపరచడానికి మరియు భక్త సమాజానికి మెరుగైన సేవ చేయడానికి సహాయపడుతుంది. హరే కృష్ణ! 🙏'
    }
  };

  const handleSubmit = async () => {
    if (rating > 0) {
      // Save rating to database
      if (user) {
        await markFeedbackShown(user.id, rating);
      }
      
      // Open Zoho feedback form in new tab with rating pre-filled
      const feedbackUrl = `https://forms.zohopublic.in/jashwanthjashu684gm1/form/SadhanaTracerFeedbackForm/formperma/KOoeajQ20c3B6YQ6Bmmy76hxc3xkOC9-BAc-Lu7GEjU?Rating=${rating}`;
      window.open(feedbackUrl, '_blank');
      
      // Close the modal immediately after opening the form
      onClose();
    }
  };

  const handleLater = () => {
    onClose();
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="text-green-600 w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-green-700">{content[lang].thankYou}</h2>
            <p className="text-stone-600 leading-relaxed">
              {content[lang].thankYouMessage}
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-8 py-6 text-center relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          
          <button
            onClick={handleLater}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="relative z-10">
            <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{content[lang].title}</h2>
            <p className="text-orange-100 text-sm">{content[lang].subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-stone-700 text-center leading-relaxed font-medium">
            {content[lang].question}
          </p>

          {/* Star Rating */}
          <div className="space-y-3">
            <p className="text-sm text-stone-600 font-semibold text-center">{content[lang].ratingLabel}</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transform transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-orange-600 font-semibold animate-fadeIn">
                {rating === 5 ? '🌟 Excellent!' : rating === 4 ? '😊 Great!' : rating === 3 ? '👍 Good' : rating === 2 ? '😐 Fair' : '🙁 Needs Improvement'}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send size={20} />
              {content[lang].submitButton}
            </button>

            <button
              onClick={handleLater}
              className="w-full text-stone-600 hover:text-stone-800 font-semibold py-2 transition-colors"
            >
              {content[lang].laterButton}
            </button>
          </div>

          <p className="text-xs text-center text-stone-500 italic">
            {lang === 'en' && 'Your feedback will open in a new tab for more detailed input'}
            {lang === 'hi' && 'आपकी प्रतिक्रिया अधिक विस्तृत इनपुट के लिए एक नए टैब में खुलेगी'}
            {lang === 'te' && 'మీ అభిప్రాయం మరింత వివరణాత్మక ఇన్‌పుట్ కోసం కొత్త ట్యాబ్‌లో తెరవబడుతుంది'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPrompt;