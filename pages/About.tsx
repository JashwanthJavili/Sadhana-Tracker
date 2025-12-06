import React from 'react';
import { Heart, Code, Sparkles, ExternalLink, Book } from 'lucide-react';

// @ts-ignore
import guruMaharajImage from '../utils/Images/Guru_Maharaj_Feet.jpg';
// @ts-ignore
import guruImage from '../utils/Images/OIP.webp';

const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 rounded-2xl p-10 text-white shadow-2xl border-2 border-orange-400">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-4 rounded-xl">
            <Sparkles size={40} className="text-yellow-200" />
          </div>
          <h1 className="text-5xl font-serif font-bold">About Sadhana Lifeforce</h1>
        </div>
        <p className="text-orange-100 text-xl font-medium leading-relaxed">
          A humble attempt to serve devotees in their spiritual journey, created by the causeless mercy of my spiritual masters.
        </p>
      </div>

      {/* App Description */}
      <section className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl border-3 border-blue-300 p-10">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <Book className="text-white" size={32} />
          </div>
          About the App
        </h2>
        <div className="space-y-6 text-stone-700 text-lg leading-relaxed">
          <p>
            <strong className="text-stone-900 font-bold">Sadhana Lifeforce</strong> is a humble service offering, 
            created with the hope of assisting fellow devotees in their spiritual practice. This simple platform 
            is the result of the infinite mercy and guidance of my spiritual masters.
          </p>
          <p>
            By Their grace alone, this tool attempts to help devotees plan their day, track their chanting rounds, 
            study hours, and spiritual activities. Any usefulness in this application is entirely due to Their blessings, 
            and all shortcomings are solely my own.
          </p>
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-6 rounded-2xl border-l-4 border-orange-600 shadow-lg">
            <p className="text-orange-900 italic font-serif font-semibold text-lg leading-relaxed">
              "By the mercy of the spiritual master one receives the benediction of Krishna. 
              Without the grace of the spiritual master, one cannot make any advancement." 
              <span className="block mt-2 text-base text-orange-800">— Caitanya Caritamrita</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-2xl border-3 border-green-300 p-10">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Daily Planning & Commitments',
            'Timeline Management',
            'Spiritual Metrics Tracking',
            'Analytics & Progress Insights',
            'Personal Reflections & Journal',
            'Goal Setting & Tracking',
            'Cloud Synchronization',
            'Customizable Interface',
            'Inspirational Quotes',
            'Multi-language Support'
          ].map((feature, idx) => (
            <div key={idx} className="group flex items-center gap-4 p-5 bg-white rounded-xl border-2 border-green-200 hover:border-green-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105">
              <div className="w-3 h-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full group-hover:scale-125 transition-transform shadow-md"></div>
              <span className="text-stone-800 text-base font-semibold">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Section */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
          <Heart className="text-orange-600" size={24} />
          An Insignificant Servant's Offering
        </h2>
        <div className="space-y-6">
          {/* Spiritual Masters - Most Important */}
          <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-300 shadow-lg">
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-orange-800 tracking-wide mb-2">
                ఓం శ్రీ గురవే నమః
              </p>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto"></div>
            </div>
            
            <div className="flex items-center justify-center gap-10 mb-8">
              <div className="group relative text-center transform transition-all duration-500 hover:scale-105">
                <div className="absolute -inset-3 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative bg-white rounded-2xl p-5 shadow-2xl ring-4 ring-orange-300 group-hover:ring-orange-400 transition-all">
                  <img 
                    src={guruMaharajImage}
                    alt="HH Radhanath Swamy Maharaj's Divine Lotus Feet" 
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                  <div className="mt-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-base font-bold py-3 px-4 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    HH Radhanath Swamy
                  </div>
                  <p className="text-sm text-orange-800 mt-2 font-bold">Param Gurumaharaj</p>
                </div>
              </div>

              <div className="group relative text-center transform transition-all duration-500 hover:scale-105">
                <div className="absolute -inset-3 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative bg-white rounded-2xl p-5 shadow-2xl ring-4 ring-orange-300 group-hover:ring-orange-400 transition-all">
                  <img 
                    src={guruImage}
                    alt="HG Pranavananda Das Prabhuji" 
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                  <div className="mt-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-base font-bold py-3 px-4 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    HG Pranavananda Das
                  </div>
                  <p className="text-sm text-orange-800 mt-2 font-bold">Guru Maharaj</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-center px-4">
              <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
              
              <p className="text-orange-900 font-serif italic text-base leading-relaxed">
                "Whatever I am today - every breath, every thought, every ability - is solely by the causeless mercy 
                of my most beloved spiritual masters. I am nothing but an insignificant servant, forever indebted to Their divine grace."
              </p>
              
              <p className="text-amber-800 text-sm font-bold bg-amber-100 inline-block px-4 py-2 rounded-full shadow-sm">
                🙏 All glories to Sri Guru and Sri Gauranga 🙏
              </p>
              
              <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
            </div>
          </div>

          {/* Developer Info - Humble servant */}
          <div className="bg-stone-50 p-5 rounded-lg border border-stone-200">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Code className="text-orange-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Javili Jashwanth</h3>
                <p className="text-stone-600 text-sm mt-1">An aspiring servant of the servants of my Guru</p>
                <p className="text-sm text-stone-500 mt-3 italic leading-relaxed">
                  "I am the most fallen and unqualified soul, attempting to serve the devotee community 
                  through this humble offering. Any service rendered is purely by the mercy of my spiritual masters. 
                  I pray at Their lotus feet for the strength to remain a sincere servant in Their divine mission."
                </p>
              </div>
            </div>
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
      <section className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-600 rounded-2xl p-8 text-white shadow-2xl border-2 border-orange-400">
        <h2 className="text-3xl font-serif font-bold mb-4">Share Your Feedback</h2>
        <p className="text-orange-100 mb-6 text-lg leading-relaxed">
          Your feedback helps us improve Sadhana Lifeforce for the entire community. 
          Please share your thoughts, suggestions, or report any issues.
        </p>
        <a
          href="https://forms.zohopublic.in/jashwanthjashu684gm1/form/SadhanaTracerFeedbackForm/formperma/KOoeajQ20c3B6YQ6Bmmy76hxc3xkOC9-BAc-Lu7GEjU"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white text-orange-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
        >
          <span>Submit Feedback</span>
          <ExternalLink size={22} />
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
