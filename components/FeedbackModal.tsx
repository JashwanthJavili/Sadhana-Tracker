import React, { useState } from 'react';
import { X, MessageCircle, Send, Star, Heart, ThumbsUp, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ref, push, set } from 'firebase/database';
import { db } from '../services/firebase';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const lang = language as 'en' | 'hi' | 'te';

  const content = {
    en: {
      title: 'Share Your Experience',
      subtitle: 'Your feedback helps us serve devotees better',
      ratingLabel: 'How would you rate your experience?',
      categoryLabel: 'What would you like to share about?',
      categories: {
        feature: 'Feature Request',
        bug: 'Report a Bug',
        general: 'General Feedback',
        spiritual: 'Spiritual Journey',
        usability: 'App Usability',
        other: 'Other'
      },
      messageLabel: 'Share your thoughts with us',
      messagePlaceholder: 'Tell us more about your experience, suggestions, or how Sadhana Tracker has helped your spiritual journey...',
      submitButton: 'Submit Feedback',
      laterButton: 'Maybe Later',
      thankYou: 'Thank you for your valuable feedback!',
      thankYouMessage: 'Your input helps us improve and serve the devotee community better.',
      submitAgain: 'Found a bug or issue? Feel free to submit feedback again anytime!',
      ratingDescriptions: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    },
    hi: {
      title: 'अपना अनुभव साझा करें',
      subtitle: 'आपकी प्रतिक्रिया हमें भक्तों की बेहतर सेवा करने में मदद करती है',
      ratingLabel: 'आप अपने अनुभव को कैसे रेट करेंगे?',
      categoryLabel: 'आप किस बारे में साझा करना चाहेंगे?',
      categories: {
        feature: 'फीचर अनुरोध',
        bug: 'बग रिपोर्ट करें',
        general: 'सामान्य प्रतिक्रिया',
        spiritual: 'आध्यात्मिक यात्रा',
        usability: 'ऐप उपयोगिता',
        other: 'अन्य'
      },
      messageLabel: 'हमारे साथ अपने विचार साझा करें',
      messagePlaceholder: 'अपने अनुभव, सुझाव या साधना ट्रैकर ने आपकी आध्यात्मिक यात्रा में कैसे मदद की, इसके बारे में और बताएं...',
      submitButton: 'प्रतिक्रिया सबमिट करें',
      laterButton: 'बाद में शायद',
      thankYou: 'आपकी मूल्यवान प्रतिक्रिया के लिए धन्यवाद!',
      thankYouMessage: 'आपका इनपुट हमें सुधारने और भक्त समुदाय की बेहतर सेवा करने में मदद करता है।',
      submitAgain: 'कोई बग या समस्या मिली? कभी भी फिर से प्रतिक्रिया सबमिट करें!',
      ratingDescriptions: ['खराब', 'ठीक', 'अच्छा', 'बहुत अच्छा', 'उत्कृष्ट']
    },
    te: {
      title: 'మీ అనుభవాన్ని పంచుకోండి',
      subtitle: 'మీ అభిప్రాయం భక్తులకు మెరుగైన సేవ చేయడంలో మాకు సహాయపడుతుంది',
      ratingLabel: 'మీ అనుభవాన్ని ఎలా రేట్ చేస్తారు?',
      categoryLabel: 'మీరు దేని గురించి పంచుకోవాలనుకుంటున్నారు?',
      categories: {
        feature: 'ఫీచర్ అభ్యర్థన',
        bug: 'బగ్ నివేదించండి',
        general: 'సాధారణ అభిప్రాయం',
        spiritual: 'ఆధ్యాత్మిక ప్రయాణం',
        usability: 'యాప్ వినియోగం',
        other: 'ఇతర'
      },
      messageLabel: 'మీ ఆలోచనలను మాతో పంచుకోండి',
      messagePlaceholder: 'మీ అనుభవం, సూచనలు లేదా సాధన ట్రాకర్ మీ ఆధ్యాత్మిక ప్రయాణానికి ఎలా సహాయపడింది అనే దాని గురించి మరింత చెప్పండి...',
      submitButton: 'అభిప్రాయం సమర్పించండి',
      laterButton: 'తర్వాత చూద్దాం',
      thankYou: 'మీ విలువైన అభిప్రాయానికి ధన్యవాదాలు!',
      thankYouMessage: 'మీ ఇన్‌పుట్ మాకు మెరుగుపరచడానికి మరియు భక్త సమాజానికి మెరుగైన సేవ చేయడానికి సహాయపడుతుంది।',
      submitAgain: 'బగ్ లేదా సమస్య దొరికిందా? ఎప్పుడైనా మళ్లీ అభిప్రాయం సమర్పించండి!',
      ratingDescriptions: ['పేద', 'సరైన', 'మంచి', 'చాలా మంచి', 'అద్భుతమైన']
    }
  };

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      showError('Please provide a rating');
      return;
    }

    if (!category) {
      showError('Please select a category');
      return;
    }

    setSubmitting(true);

    try {
      const feedbackData = {
        userName: user.displayName || 'Anonymous',
        userEmail: user.email || '',
        rating,
        category,
        message: message.trim(),
        timestamp: Date.now(),
        status: 'new', // new, reviewed, resolved
        language: lang
      };

      // Save to Firebase under /users/{userId}/feedback
      const userFeedbacksRef = ref(db, `users/${user.uid}/feedbacks`);
      const newFeedbackRef = push(userFeedbacksRef);
      await set(newFeedbackRef, feedbackData);

      // Also update user's last feedback timestamp
      const lastFeedbackRef = ref(db, `users/${user.uid}/lastFeedback`);
      await set(lastFeedbackRef, {
        timestamp: Date.now(),
        rating,
        feedbackId: newFeedbackRef.key
      });

      setSubmitted(true);
      showSuccess('Feedback Submitted!', 'Thank you for helping us improve Sadhana Tracker');

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      showError('Failed to Submit', 'Please try again later');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4 animate-fadeIn">
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 border-3 border-orange-200">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Heart className="text-green-600 w-12 h-12 fill-green-600 animate-bounce-soft" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {content[lang].thankYou}
            </h2>
            <p className="text-stone-700 text-lg leading-relaxed">
              {content[lang].thankYouMessage}
            </p>
            <p className="text-blue-600 text-sm font-semibold mt-4">
              {content[lang].submitAgain}
            </p>
            <p className="text-orange-600 font-bold">Hare Krishna! 🙏</p>
          </div>

          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-7 h-7 transition-all ${
                  i < rating 
                    ? 'text-yellow-400 fill-yellow-400 scale-110' 
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-3 border-orange-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 p-6 rounded-t-3xl border-b-3 border-orange-700">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <MessageCircle className="text-white w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{content[lang].title}</h2>
                <p className="text-orange-100 text-sm mt-1">{content[lang].subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="text-white w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-stone-900">
              {content[lang].ratingLabel}
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-125 active:scale-110"
                >
                  <Star
                    className={`w-12 h-12 transition-all ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              {(hoveredRating || rating) > 0 && (
                <span className="ml-2 text-sm font-bold text-orange-600 animate-fadeIn">
                  {content[lang].ratingDescriptions[(hoveredRating || rating) - 1]}
                </span>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-stone-900">
              {content[lang].categoryLabel}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(content[lang].categories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                    category === key
                      ? 'bg-orange-600 text-white border-orange-700 shadow-lg'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-orange-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-stone-900">
              {content[lang].messageLabel}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={content[lang].messagePlaceholder}
              className="w-full p-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none text-base resize-none shadow-md hover:border-orange-300 transition-all"
              rows={5}
            />
            <p className="text-sm text-stone-500">{message.length} characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95"
            >
              {content[lang].laterButton}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0 || !category}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  {content[lang].submitButton}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
