import React from 'react';
import { Heart, Code, Sparkles, ExternalLink, Book, Shield, Lock, Calendar, ChevronDown } from 'lucide-react';

// @ts-ignore
import versionData from '../version.json';
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight">About Sadhana Sang</h1>
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

      {/* About the App & Features - Collapsible */}
      <section className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-3 border-blue-300 overflow-hidden">
        <details className="group" open>
          <summary className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8 cursor-pointer hover:bg-blue-100/50 transition-colors list-none">
            <h2 className="text-base sm:text-lg md:text-xl font-serif font-bold text-stone-900 flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl shadow-lg">
                <Book className="text-white" size={20} />
              </div>
              What is Sadhana Sanga?
            </h2>
            <ChevronDown className="text-blue-600 flex-shrink-0 transition-transform group-open:rotate-180" size={24} />
          </summary>
          <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 space-y-3 sm:space-y-4">
            <p className="text-stone-700 text-xs sm:text-sm md:text-base leading-relaxed">
              <strong className="text-stone-900 font-bold">Sadhana Sanga</strong> is a comprehensive spiritual practice tracker designed to help devotees maintain consistency in their daily sadhana, set goals, and track progress.
            </p>
            <p className="text-stone-600 text-[11px] sm:text-xs md:text-sm italic leading-relaxed">
              This platform serves as a daily companion for devotees, offering tools for chanting rounds, setting spiritual goals, tracking progress, and connecting with the community.
            </p>
          </div>
        </details>
      </section>

      {/* Features - Collapsible */}
      <section className="bg-gradient-to-br from-white to-green-50 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-3 border-green-300 overflow-hidden">
        <details className="group" open>
          <summary className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8 cursor-pointer hover:bg-green-100/50 transition-colors list-none">
            <h2 className="text-base sm:text-lg md:text-xl font-serif font-bold text-stone-900">Key Features</h2>
            <ChevronDown className="text-green-600 flex-shrink-0 transition-transform group-open:rotate-180" size={24} />
          </summary>
          <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
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
          </div>
        </details>
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5 md:p-6 rounded-xl border-2 border-blue-300 shadow-lg">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                <Code className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-stone-900">Developed by</h3>
                <p className="text-blue-900 text-base sm:text-lg font-semibold mt-1">Javili Jashwanth</p>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">Aspiring servant of my Guru</p>
                <p className="text-xs sm:text-sm text-stone-500 mt-2 italic leading-relaxed">
                  "Any service rendered is purely by the mercy of my spiritual masters."
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-stone-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                Get in Touch
              </h4>

              <div className="space-y-2.5">
                {/* Mobile */}
                <div className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-lg transition-colors">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Mobile</p>
                    <a href="tel:+919160125245" className="text-sm font-semibold text-stone-900 hover:text-blue-600 transition-colors">
                      +91 9160125245
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-lg transition-colors">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Email</p>
                    <a href="mailto:jashwanthjavili7@gmail.com" className="text-sm font-semibold text-stone-900 hover:text-blue-600 transition-colors break-all">
                      jashwanthjavili7@gmail.com
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center gap-3 p-2.5 hover:bg-green-50 rounded-lg transition-colors">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">WhatsApp</p>
                    <a href="https://wa.me/919160125245" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-stone-900 hover:text-green-600 transition-colors flex items-center gap-1">
                      +91 9160125245
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-lg transition-colors">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500">LinkedIn</p>
                    <a href="https://www.linkedin.com/in/javili-jashwanth-0936ab268/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-stone-900 hover:text-blue-700 transition-colors flex items-center gap-1 truncate">
                      <span className="truncate">Javili Jashwanth</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>
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

      {/* Privacy & Security Section - Collapsible */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-3 border-green-400 overflow-hidden">
        <details className="group">
          <summary className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8 cursor-pointer hover:bg-green-100/50 transition-colors list-none">
            <h2 className="text-base sm:text-lg md:text-xl font-serif font-bold text-stone-900 flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl shadow-lg">
                <Shield className="text-white" size={20} />
              </div>
              Privacy & Security
            </h2>
            <ChevronDown className="text-green-600 flex-shrink-0 transition-transform group-open:rotate-180" size={24} />
          </summary>
          <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 space-y-3 sm:space-y-4">
            <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-2 border-green-300 shadow-lg">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="bg-green-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                  <Lock className="text-green-700" size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 mb-1.5 sm:mb-2">End-to-End Encryption</h3>
                  <p className="text-stone-700 text-[11px] sm:text-xs md:text-sm leading-relaxed">
                    All messages are protected with AES-256-GCM encryption. Only you and your recipient can read them.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 border-green-200 shadow-md">
                <h4 className="font-bold text-stone-900 mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                  Secure Data Storage
                </h4>
                <p className="text-stone-600 text-[10px] sm:text-xs leading-relaxed">
                  Your data is stored in Firebase's encrypted cloud with automatic backups.
                </p>
              </div>

              <div className="bg-white p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 border-green-200 shadow-md">
                <h4 className="font-bold text-stone-900 mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                  Privacy First
                </h4>
                <p className="text-stone-600 text-[10px] sm:text-xs leading-relaxed">
                  We never sell your data. Your spiritual journey is sacred and confidential.
                </p>
              </div>

              <div className="bg-white p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 border-green-200 shadow-md">
                <h4 className="font-bold text-stone-900 mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                  GDPR Compliant
                </h4>
                <p className="text-stone-600 text-[10px] sm:text-xs leading-relaxed">
                  Full compliance with international privacy regulations.
                </p>
              </div>

              <div className="bg-white p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 border-green-200 shadow-md">
                <h4 className="font-bold text-stone-900 mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                  Your Control
                </h4>
                <p className="text-stone-600 text-[10px] sm:text-xs leading-relaxed">
                  Export or delete your data anytime. Complete control over your information.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl text-white shadow-lg">
              <p className="text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2">🔒 Your data is protected with enterprise-grade security</p>
              <p className="text-green-100 text-[10px] sm:text-xs">
                Read our complete <a href="/PRIVACY_POLICY.md" className="underline font-bold hover:text-white">Privacy Policy</a> for detailed information.
              </p>
            </div>
          </div>
        </details>
      </section>

      {/* Frequently Asked Questions - Collapsible */}
      <section className="bg-gradient-to-br from-white to-purple-50 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-3 border-purple-300 p-4 sm:p-6 md:p-8 lg:p-10">
        <h2 className="text-base sm:text-lg md:text-xl font-serif font-bold text-stone-900 mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl shadow-lg">
            <Book className="text-white" size={20} />
          </div>
          Frequently Asked Questions
        </h2>

        <div className="space-y-2 sm:space-y-3">
          {[
            {
              question: 'Can I use this app offline?',
              answer: 'Yes! Once installed, Sadhana Sang works offline for most features. Your data syncs automatically when you\'re back online. Perfect for traveling or areas with limited connectivity.'
            },
            {
              question: 'How do I track my progress over time?',
              answer: 'Visit the Analytics page to see detailed graphs, trends, and insights about your sadhana. Track chanting rounds, study hours, discipline scores, and mood patterns over days, weeks, or months.'
            },
            {
              question: 'Is my spiritual data private?',
              answer: 'Absolutely! Your daily planner, journal, chanting counter, and analytics are completely private. Only your community profile and posts are visible to others. See Settings → Privacy & Data Control for details.'
            },
            {
              question: 'How do I use the Daily Planner?',
              answer: 'Set your daily commitments (chanting, reading, service) at the start of the day, track them throughout, and reflect in the evening. The app calculates your discipline score and shows your progress.'
            },
            {
              question: 'Can I export my data?',
              answer: 'Yes! Go to Settings → Privacy & Data Control and click "Can I export my data?" to download all your data as a JSON file. You have complete ownership.'
            },
            {
              question: 'How do I ask questions to the community?',
              answer: 'Navigate to Community → Q&A section, click "Ask Question", provide a title and details, then submit. Devotees worldwide can answer and discuss.'
            },
            {
              question: 'What is the Devotional Journal for?',
              answer: 'A private space to record your spiritual insights, realizations, prayers, and reflections. Write about your journey, challenges, and Krishna\'s mercy. Completely confidential.'
            },
            {
              question: 'Does the app work on multiple devices?',
              answer: 'Yes! Sign in with your Google account on any device (phone, tablet, computer) and your data automatically syncs across all devices through Firebase cloud.'
            },
            {
              question: 'What are the festival features?',
              answer: 'Browse a community-maintained calendar of Vaishnava festivals, appearance days, and ekadashis. View dates, significance, how to observe, and even contribute new festivals.'
            },
            {
              question: 'How do I install the app on my phone?',
              answer: 'Visit Settings → "Install App on Your Mobile" for detailed step-by-step instructions for Android, iOS, and Desktop. Or tap the Install button in the navigation menu.'
            },
            {
              question: 'Will I get reminders for my sadhana?',
              answer: 'Push notifications are coming soon! You\'ll be able to set custom reminders for chanting, reading, temple programs, and more. Stay tuned!'
            },
            {
              question: 'Is the app available in multiple languages?',
              answer: 'Currently, the app supports English with Telugu mantras. We\'re working on adding more languages including Hindi, Bengali, and others based on community feedback.'
            },
            {
              question: 'Can I contribute or suggest features?',
              answer: 'Absolutely! We\'d love your feedback. Click "Submit Feedback" below or email us at jashwanthjavili7@gmail.com. Your ideas help serve the devotee community better.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-lg sm:rounded-xl border-2 border-purple-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <details className="group">
                <summary className="flex items-center justify-between gap-3 p-3 sm:p-4 md:p-5 cursor-pointer hover:bg-purple-50 transition-colors list-none">
                  <span className="font-bold text-purple-900 text-xs sm:text-sm md:text-base flex-1">{faq.question}</span>
                  <ChevronDown className="text-purple-600 flex-shrink-0 transition-transform group-open:rotate-180" size={18} />
                </summary>
                <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 pt-0">
                  <p className="text-stone-700 text-[11px] sm:text-xs md:text-sm leading-relaxed">
                    {faq.answer.includes('jashwanthjavili7@gmail.com') ? (
                      <>
                        {faq.answer.split('jashwanthjavili7@gmail.com')[0]}
                        <a href="mailto:jashwanthjavili7@gmail.com" className="text-blue-600 hover:text-blue-800 font-bold underline">
                          jashwanthjavili7@gmail.com
                        </a>
                        {faq.answer.split('jashwanthjavili7@gmail.com')[1]}
                      </>
                    ) : faq.answer.includes('completely private') ? (
                      <>
                        {faq.answer.split('completely private')[0]}
                        <strong className="text-green-700">completely private</strong>
                        {faq.answer.split('completely private')[1]}
                      </>
                    ) : (
                      faq.answer
                    )}
                  </p>
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-600 rounded-xl sm:rounded-2xl p-6 sm:p-7 md:p-8 text-white shadow-2xl border-2 border-orange-400">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-3 sm:mb-4">Share Your Feedback</h2>
        <p className="text-orange-50 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg leading-relaxed">
          Your feedback helps us improve Sadhana Sang for the community.
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
        <p className="font-bold text-base">Sadhana Sang v{versionData.version}</p>
        <p className="text-xs text-stone-400">Build Date: {versionData.buildDate}</p>
        <p>Made with ❤️ for the ISKCON community</p>
        <p className="italic text-xs">Hare Krishna Hare Krishna Krishna Krishna Hare Hare</p>
        <p className="italic text-xs">Hare Rama Hare Rama Rama Rama Hare Hare</p>
      </div>
    </div>
  );
};

export default About;
