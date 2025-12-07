import React from 'react';
import { Heart, Code, Sparkles, ExternalLink, Book, Shield, Lock, Calendar } from 'lucide-react';

// @ts-ignore
import guruMaharajImage from '../utils/Images/Guru_Maharaj_Feet.jpg';
// @ts-ignore
import guruImage from '../utils/Images/OIP.webp';
// @ts-ignore
import iskconLogo from '../utils/Images/Iscon_LOgo-removebg-preview.png';

const About: React.FC = () => {
  return (
    <div className="min-h-full max-w-5xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 animate-fadeIn pb-12 px-4 sm:px-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-2xl border-2 border-orange-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl">
              <Sparkles size={28} className="text-yellow-200 sm:w-10 sm:h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight">About Sadhana Sanga</h1>
          </div>
          {/* ISKCON Logo */}
          <div className="bg-white/95 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl">
            <img 
              src={iskconLogo} 
              alt="ISKCON Logo" 
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
            />
          </div>
        </div>
        <p className="text-orange-50 text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed">
          A humble attempt to serve devotees in their spiritual journey, created by the causeless mercy of my spiritual masters.
        </p>
      </div>

      {/* Humble Offering at Lotus Feet */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-3 border-orange-400 p-6 sm:p-8 md:p-10">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-800 tracking-wide mb-3">
            🙏 ఓం శ్రీ గురవే నమః 🙏
          </p>
          <div className="h-0.5 w-24 sm:w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto mb-4 sm:mb-6"></div>
        </div>

        <div className="space-y-4 sm:space-y-6 text-stone-800 text-sm sm:text-base md:text-lg leading-relaxed">
          <div className="bg-white/70 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-orange-300 shadow-lg">
            <p className="italic font-serif text-base sm:text-lg md:text-xl text-center leading-relaxed text-orange-900">
              "This entire website, in whatever small form it exists, is placed with trembling heart at the divine, 
              dust-like lotus feet of my most worshipable spiritual masters."
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4 bg-white/50 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl">
            <p className="text-sm sm:text-base text-stone-700">
              I have no qualification, no purity, and no ability of my own. Whatever little service appears here is not mine—it is 
              <strong className="text-orange-800"> solely and completely Their causeless mercy</strong> flowing through an unworthy instrument.
            </p>
            
            <p className="text-sm sm:text-base text-stone-700">
              If even a single soul receives the slightest spiritual benefit, the credit belongs <strong className="text-green-700">only to Them</strong>. 
              And if there are countless faults, errors, and shortcomings—as surely there are—they belong <strong className="text-red-700">only to me</strong>, 
              the most fallen and insignificant.
            </p>

            <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-l-4 border-orange-600 my-4 sm:my-6">
              <p className="text-sm sm:text-base text-orange-900 font-semibold">
                I offer this work not with pride, but with deep gratitude, praying only that I may remain forever a speck of dust at Their lotus feet, 
                serving in whatever small way They allow.
              </p>
            </div>

            <p className="text-center text-orange-800 font-bold text-base sm:text-lg md:text-xl mt-4 sm:mt-6">
              🙏 Your most insignificant servant 🙏
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-l-4 border-orange-600 shadow-lg">
            <p className="text-orange-900 italic font-serif font-semibold text-sm sm:text-base md:text-lg leading-relaxed">
              "By the mercy of the spiritual master one receives the benediction of Krishna. Without the grace of the spiritual master, one cannot make any advancement." 
              <span className="block mt-2 text-xs sm:text-sm md:text-base text-orange-800">— Sri Caitanya Caritamrita</span>
            </p>
          </div>
        </div>
      </section>

      {/* About the App */}
      <section className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-3 border-blue-300 p-6 sm:p-8 md:p-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
            <Book className="text-white" size={24} />
          </div>
          What is Included
        </h2>
        <div className="space-y-4 sm:space-y-6 text-stone-700 text-sm sm:text-base md:text-lg leading-relaxed">
          <p>
            <strong className="text-stone-900 font-bold">Sadhana Sanga</strong> is a comprehensive spiritual practice tracker designed to help devotees maintain consistency in their daily sadhana, set goals, and track progress.
          </p>
          <p className="text-stone-600 text-xs sm:text-sm md:text-base italic">
            This platform serves as a daily companion for devotees, offering tools for chanting rounds, setting spiritual goals, tracking progress, and connecting with the community.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-br from-white to-green-50 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-3 border-green-300 p-6 sm:p-8 md:p-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 sm:mb-8">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            'Multi-language Support',
            'Vaishnava Festivals Calendar',
            'Community Slokas Library',
            'Japa Mala Counter (108 Beads)',
            'Q&A Community Forum'
          ].map((feature, idx) => (
            <div key={idx} className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 bg-white rounded-lg sm:rounded-xl border-2 border-green-200 hover:border-green-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full group-hover:scale-125 transition-transform shadow-md flex-shrink-0"></div>
              <span className="text-stone-800 text-xs sm:text-sm md:text-base font-semibold">{feature}</span>
            </div>
          ))}
        </div>

        {/* Special Feature Highlight - Festivals */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-purple-300 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Calendar className="text-purple-600" size={20} />
                Vaishnava Festivals Calendar
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-purple-800">
                Discover and contribute to a community-maintained calendar of sacred festivals, appearance days, and holy occasions.
              </p>
            </div>
            <a
              href="/festivals"
              className="w-full sm:w-auto sm:ml-6 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl text-center whitespace-nowrap"
            >
              Explore Festivals →
            </a>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-stone-200 p-4 sm:p-5 md:p-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-stone-900 mb-4 sm:mb-6 flex items-center gap-2">
          <Heart className="text-orange-600" size={20} />
          An Insignificant Servant's Offering
        </h2>
        <div className="space-y-4 sm:space-y-6">
          {/* Spiritual Masters - Most Important */}
          <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-xl sm:rounded-2xl p-6 sm:p-7 md:p-8 border-2 sm:border-3 border-orange-400 shadow-2xl">
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-800 tracking-wide mb-3">
                🙏 ఓం శ్రీ గురవే నమః 🙏
              </p>
              <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto mb-4"></div>
              <p className="text-orange-700 font-semibold text-xl italic">
                "All glories to Sri Guru and Sri Gauranga"
              </p>
            </div>
            
            {/* Param Gurumaharaj - HH Radhanath Swamy */}
            <div className="mb-8 sm:mb-10 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl border-2 border-orange-300">
              <div className="flex items-center justify-center gap-6 sm:gap-8 mb-4 sm:mb-6">
                <div className="group relative text-center transform transition-all duration-500 hover:scale-105">
                  <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-xl sm:rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl ring-2 sm:ring-4 ring-orange-400 group-hover:ring-orange-500 transition-all">
                    <img 
                      src={guruMaharajImage}
                      alt="HH Radhanath Swamy Maharaj's Divine Lotus Feet" 
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain rounded-lg sm:rounded-xl mx-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl shadow-lg inline-block mb-2">
                  HH Radhanath Swamy Maharaj
                </h3>
                <p className="text-orange-800 font-bold text-sm sm:text-base md:text-lg">Param Gurumaharaj</p>
              </div>

              <div className="space-y-3 sm:space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
                <div className="bg-orange-50 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-l-4 border-orange-500">
                  <p className="font-semibold text-orange-900 mb-2">
                    A Divine Soul who embodies compassion, humility, and pure devotion to Sri Sri Radha-Gopinath.
                  </p>
                  <p className="text-stone-700 text-xs sm:text-sm md:text-base">
                    Through his teachings and example, Maharaj has touched millions worldwide, showing the path of bhakti with grace and wisdom.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl">
                  <p className="text-stone-800 text-xs sm:text-sm md:text-base italic">
                    "His teachings on devotion, service, and surrender to Krishna are like nectar for fallen souls. 
                    Every word from his lotus mouth is a treasure, every instruction a divine benediction."
                  </p>
                </div>

                <div className="bg-yellow-50 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-2 border-yellow-300">
                  <p className="text-yellow-900 font-bold text-center text-xs sm:text-sm md:text-base">
                    By his causeless mercy alone, countless souls have found shelter at the lotus feet of Sri Krishna.
                  </p>
                </div>
              </div>
            </div>

            {/* Gurudev - HG Pranavananda Dasa Prabhuji */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl border-2 border-orange-300">
              <div className="flex items-center justify-center gap-6 sm:gap-8 mb-4 sm:mb-6">
                <div className="group relative text-center transform transition-all duration-500 hover:scale-105">
                  <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-xl sm:rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl ring-2 sm:ring-4 ring-orange-400 group-hover:ring-orange-500 transition-all">
                    <img 
                      src={guruImage}
                      alt="HG Pranavananda Das Prabhuji" 
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain rounded-lg sm:rounded-xl mx-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl shadow-lg inline-block mb-2">
                  HG Pranavananda Dasa Prabhuji
                </h3>
                <p className="text-orange-800 font-bold text-sm sm:text-base md:text-lg">My Spiritual Master</p>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  Appearance Day: November 21, 1995 (Currently 30 years young in devotional service)
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
                <div className="bg-orange-50 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-l-4 border-orange-500">
                  <p className="font-semibold text-orange-900 mb-2">
                    A Living Example of Pure Devotion and Selfless Service
                  </p>
                  <p className="text-stone-700 text-xs sm:text-sm md:text-base">
                    Prabhuji embodies humility, dedication, and unwavering faith. His spiritual maturity inspires everyone.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl">
                  <p className="text-stone-800 text-xs sm:text-sm md:text-base italic">
                    "I am infinitely indebted to Pranavananda Prabhuji for his patience, guidance, and causeless mercy."
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-2 border-yellow-300">
                  <p className="text-yellow-900 font-bold mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">His Divine Qualities:</p>
                  <ul className="space-y-1.5 sm:space-y-2 text-stone-700 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                      <span><strong>Unwavering Faith:</strong> Complete surrender to HH Radhanath Swamy Maharaj</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                      <span><strong>Selfless Service:</strong> Serving devotees with a smile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                      <span><strong>Scriptural Wisdom:</strong> Deep understanding of Gita and Bhagavatam</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                      <span><strong>Compassionate Heart:</strong> Guiding souls with love</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                      <span><strong>Exemplary Character:</strong> Living the teachings</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-100 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl text-center border-2 border-orange-400">
                  <p className="text-orange-900 font-bold text-xs sm:text-sm md:text-base lg:text-lg italic">
                    "Every good quality is his mercy, every fault is mine alone."
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 text-center px-2 sm:px-4">
              <div className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
              
              <p className="text-orange-900 font-serif italic text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed bg-white/70 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl">
                "I am nothing but an insignificant servant, forever indebted to Their divine grace."
              </p>
              
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-3 sm:p-4 rounded-full inline-block shadow-lg">
                <p className="text-amber-900 text-sm sm:text-base md:text-lg font-bold">
                  🙏 All Glories to Sri Guru and Sri Gauranga 🙏
                </p>
                <p className="text-orange-700 text-xs sm:text-sm mt-1">
                  Jaya Sri Sri Radha-Gopinath!
                </p>
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
            </div>
          </div>

          {/* Developer Info - Humble servant */}
          <div className="bg-stone-50 p-3 sm:p-4 md:p-5 rounded-lg border border-stone-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                <Code className="text-orange-600" size={18} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-stone-900">Javili Jashwanth</h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">Aspiring servant of my Guru</p>
                <p className="text-xs sm:text-sm text-stone-500 mt-2 sm:mt-3 italic leading-relaxed">
                  "Any service rendered is purely by the mercy of my spiritual masters."
                </p>
              </div>
            </div>
          </div>

          {/* Technical Stack */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-2 sm:mb-3 text-sm sm:text-base">Built With</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {['React', 'TypeScript', 'Firebase', 'Vite', 'Tailwind CSS', 'Recharts'].map((tech) => (
                <span
                  key={tech}
                  className="px-2 sm:px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-xs sm:text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-3 border-green-400 p-6 sm:p-8 md:p-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
            <Shield className="text-white" size={24} />
          </div>
          Privacy & Security
        </h2>
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 border-green-300 shadow-lg">
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                <Lock className="text-green-700" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 mb-2">End-to-End Encryption</h3>
                <p className="text-stone-700 text-xs sm:text-sm md:text-base leading-relaxed">
                  All messages are protected with AES-256-GCM encryption. Only you and your recipient can read them.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-2 border-green-200 shadow-md">
              <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                Secure Data Storage
              </h4>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Your data is stored in Firebase's encrypted cloud with automatic backups.
              </p>
            </div>

            <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-2 border-green-200 shadow-md">
              <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                Privacy First
              </h4>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                We never sell your data. Your spiritual journey is sacred and confidential.
              </p>
            </div>

            <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-2 border-green-200 shadow-md">
              <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                GDPR Compliant
              </h4>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Full compliance with international privacy regulations.
              </p>
            </div>

            <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-2 border-green-200 shadow-md">
              <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                Your Control
              </h4>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Export or delete your data anytime. Complete control over your information.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl text-white shadow-lg">
            <p className="text-sm sm:text-base md:text-lg font-semibold mb-2">🔒 Your data is protected with enterprise-grade security</p>
            <p className="text-green-100 text-xs sm:text-sm">
              Read our complete <a href="/PRIVACY_POLICY.md" className="underline font-bold hover:text-white">Privacy Policy</a> for detailed information.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-600 rounded-xl sm:rounded-2xl p-6 sm:p-7 md:p-8 text-white shadow-2xl border-2 border-orange-400">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-3 sm:mb-4">Share Your Feedback</h2>
        <p className="text-orange-50 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg leading-relaxed">
          Your feedback helps us improve Sadhana Sanga for the community.
        </p>
        <a
          href="https://forms.zohopublic.in/jashwanthjashu684gm1/form/SadhanaTracerFeedbackForm/formperma/KOoeajQ20c3B6YQ6Bmmy76hxc3xkOC9-BAc-Lu7GEjU"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 sm:gap-3 bg-white text-orange-700 px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg hover:bg-orange-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
        >
          <span>Submit Feedback</span>
          <ExternalLink size={20} />
        </a>
      </section>

      {/* Version & Credits */}
      <div className="text-center text-stone-500 text-xs sm:text-sm space-y-1 pb-6 sm:pb-8 px-4">
        <p>Sadhana Sanga v1.0.0</p>
        <p>Made with ❤️ for the ISKCON community</p>
        <p className="italic text-xs">Hare Krishna Hare Krishna Krishna Krishna Hare Hare</p>
        <p className="italic text-xs">Hare Rama Hare Rama Rama Rama Hare Hare</p>
      </div>
    </div>
  );
};

export default About;
