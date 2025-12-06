import React from 'react';
import { Heart, Code, Sparkles, ExternalLink, Book } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 to-orange-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={32} />
          <h1 className="text-3xl font-serif font-bold">About Sadhana Lifeforce</h1>
        </div>
        <p className="text-orange-100 text-lg">
          A spiritual productivity app designed to help devotees track and improve their daily sadhana practice.
        </p>
      </div>

      {/* App Description */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Book className="text-orange-600" size={24} />
          About the App
        </h2>
        <div className="space-y-4 text-stone-600">
          <p>
            <strong className="text-stone-900">Sadhana Lifeforce</strong> is a comprehensive spiritual tracking application 
            that helps ISKCON devotees maintain consistency in their spiritual practice and personal development.
          </p>
          <p>
            The app provides tools to plan your day, track important metrics like chanting rounds, 
            study hours, sleep patterns, and emotional well-being. It also offers insightful analytics 
            to help you understand your spiritual progress over time.
          </p>
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
            <p className="text-orange-900 italic">
              "The soul can be purified by glorification of the Supreme Personality of Godhead. 
              One should therefore constantly glorify the Lord." - Srimad Bhagavatam
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            '📅 Daily Planning & Commitments',
            '⏰ Timeline Management',
            '📊 Spiritual Metrics Tracking',
            '📈 Analytics & Insights',
            '📝 Personal Reflections',
            '🎯 Goal Setting',
            '☁️ Cloud Sync with Firebase',
            '🎨 Customizable Interface',
            '💬 Custom Quotes',
            '🌐 Multi-language Support'
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-stone-50">
              <span className="text-lg">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Section */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
          <Code className="text-orange-600" size={24} />
          Developed By
        </h2>
        <div className="space-y-6">
          {/* Developer Info */}
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Heart className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">Javili Jashwanth</h3>
              <p className="text-stone-600 mt-1">Full Stack Developer & Aspiring Devotee</p>
              <p className="text-sm text-stone-500 mt-2">
                Dedicated to creating tools that help devotees in their spiritual journey.
              </p>
            </div>
          </div>

          {/* Spiritual Guide */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-stone-700 mb-1">Guided By</p>
            <p className="text-lg font-semibold text-orange-900">
              🙏 HG Pranavananda Das Prabhuji
            </p>
          </div>

          {/* Technical Stack */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-3">Built With</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Firebase', 'Vite', 'Tailwind CSS', 'Recharts'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-serif font-bold mb-3">Share Your Feedback</h2>
        <p className="text-orange-100 mb-4">
          Your feedback helps us improve Sadhana Lifeforce for the entire community. 
          Please share your thoughts, suggestions, or report any issues.
        </p>
        <a
          href="https://forms.zohopublic.in/jashwanthjashu684gm1/form/SadhanaTracerFeedbackForm/formperma/KOoeajQ20c3B6YQ6Bmmy76hxc3xkOC9-BAc-Lu7GEjU"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-orange-700 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors shadow-md"
        >
          <span>Submit Feedback</span>
          <ExternalLink size={18} />
        </a>
      </section>

      {/* Version & Credits */}
      <div className="text-center text-stone-500 text-sm space-y-1 pb-8">
        <p>Sadhana Lifeforce v1.0.0</p>
        <p>Made with ❤️ for the ISKCON community</p>
        <p className="italic text-xs">Hare Krishna Hare Krishna Krishna Krishna Hare Hare</p>
        <p className="italic text-xs">Hare Rama Hare Rama Rama Rama Hare Hare</p>
      </div>
    </div>
  );
};

export default About;
