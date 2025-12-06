import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllEntries, getSettings } from '../services/storage';
import { DailyEntry, UserSettings, Quote } from '../types';
import { TrendingUp, Award, Calendar, Sun, Moon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [randomQuote, setRandomQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const all = await getAllEntries(user.uid);
        setEntries(all);
        const today = new Date().toISOString().split('T')[0];
        setTodayEntry(all.find(e => e.date === today) || null);
        
        const userSettings = await getSettings(user.uid);
        setSettings(userSettings);

        if (userSettings.customQuotes.length > 0) {
          const rand = userSettings.customQuotes[Math.floor(Math.random() * userSettings.customQuotes.length)];
          setRandomQuote(rand);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getAverageScore = (key: keyof typeof entries[0]['metrics']) => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, curr) => acc + (curr.metrics[key] as number), 0);
    return (sum / entries.length).toFixed(1);
  };

  const completedCommitments = todayEntry 
    ? todayEntry.commitments.filter(c => c.done).length 
    : 0;

  const sparklineData = entries
    .slice(0, 7)
    .reverse()
    .map(e => ({ value: e.metrics.disciplineScore }));

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 to-orange-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        {/* Decorative Background Pattern */}
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
             <svg width="200" height="200" viewBox="0 0 24 24" fill="white">
               <path d="M12,2C9,2,2,8,2,12c0,3.5,2.5,8,10,10c7.5-2,10-6.5,10-10C22,8,15,2,12,2z"/>
             </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-serif font-bold mb-2">
            Hare Krishna, {settings?.userName || user?.displayName?.split(' ')[0] || 'Devotee'}
          </h1>
          <p className="text-orange-100 text-sm mb-1">
            {settings?.iskconCenter || 'Local Center'}
          </p>
          {settings?.guruName && (
            <p className="text-orange-200 text-sm italic">
              Guided by {settings.guruName}
            </p>
          )}
          {randomQuote && (
            <figure className="mt-4">
              <blockquote className="text-orange-100 italic text-lg max-w-2xl font-serif">
                "{randomQuote.text}"
              </blockquote>
              <figcaption className="mt-2 text-sm text-orange-200 uppercase tracking-wider font-semibold">
                — {randomQuote.source}
              </figcaption>
            </figure>
          )}
          
          <div className="mt-8 flex gap-4">
            <Link 
              to="/planner" 
              className="bg-white text-orange-900 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105 active:scale-95"
            >
              <span>Go to Today's Planner</span>
              <TrendingUp size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gradient-to-br from-white to-blue-50 p-7 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-2xl hover:border-blue-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-stone-600 text-sm font-semibold uppercase tracking-wide mb-1">Discipline Score</p>
              <h3 className="text-4xl font-bold text-stone-900">{getAverageScore('disciplineScore')} <span className="text-2xl text-stone-500">/ 5</span></h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Award size={24} />
            </div>
          </div>
          <div className="h-12 mb-2">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
                </LineChart>
             </ResponsiveContainer>
          </div>
          <p className="text-xs text-stone-500 font-medium">Last 7 days trend</p>
        </div>

        <div className="group bg-gradient-to-br from-white to-orange-50 p-7 rounded-2xl shadow-lg border-2 border-orange-200 hover:shadow-2xl hover:border-orange-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
           <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-stone-600 text-sm font-semibold uppercase tracking-wide mb-1">Avg Chanting</p>
              <h3 className="text-4xl font-bold text-stone-900">{getAverageScore('chantingRounds')} <span className="text-xl text-stone-500">Rnds</span></h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-200 text-orange-700 rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Sun size={24} />
            </div>
          </div>
           <p className="text-sm text-stone-600 font-medium mt-auto bg-orange-100 px-3 py-2 rounded-lg">Target: 16 Rounds daily</p>
        </div>

        <div className="group bg-gradient-to-br from-white to-indigo-50 p-7 rounded-2xl shadow-lg border-2 border-indigo-200 hover:shadow-2xl hover:border-indigo-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
           <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-stone-600 text-sm font-semibold uppercase tracking-wide mb-1">Sleep Avg</p>
              <h3 className="text-4xl font-bold text-stone-900">{getAverageScore('totalSleep')} <span className="text-xl text-stone-500">Hrs</span></h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-700 rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Moon size={24} />
            </div>
          </div>
           <p className="text-sm text-stone-600 font-medium mt-auto bg-indigo-100 px-3 py-2 rounded-lg">Consistent rest is vital</p>
        </div>

        <div className="group bg-gradient-to-br from-white to-green-50 p-7 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-2xl hover:border-green-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
           <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-stone-600 text-sm font-semibold uppercase tracking-wide mb-1">Today's Goals</p>
              <h3 className="text-4xl font-bold text-stone-900">{completedCommitments} <span className="text-2xl text-stone-500">/ 5</span></h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-200 text-green-700 rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-stone-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-md" 
                style={{ width: `${(completedCommitments / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-stone-600 font-medium text-right">{Math.round((completedCommitments / 5) * 100)}% Complete</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-gradient-to-r from-stone-50 to-stone-100 p-6 border-b-2 border-stone-200 flex justify-between items-center">
          <h2 className="text-xl font-bold font-serif text-stone-800 flex items-center gap-2">
            <Calendar className="text-orange-600" size={24} />
            Recent Logs
          </h2>
          <Link to="/history" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">View All</Link>
        </div>
        <div className="divide-y-2 divide-stone-100">
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
                <Calendar className="text-orange-600" size={36} />
              </div>
              <p className="text-stone-500 text-lg font-medium">No entries yet. Start your journey today!</p>
              <Link to="/planner" className="inline-block mt-4 text-orange-600 font-semibold hover:underline">Create First Entry →</Link>
            </div>
          ) : (
            entries.slice(0, 5).map(entry => (
              <div key={entry.id} className="group p-5 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="bg-gradient-to-br from-stone-100 to-stone-200 p-3 rounded-xl text-stone-600 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-lg mb-1">{entry.date}</p>
                    <p className="text-sm text-stone-600 flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg font-semibold">Discipline: {entry.metrics.disciplineScore}/5</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg font-semibold">Mood: {entry.metrics.mood}/10</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
                    entry.metrics.overallPerformance >= 8 ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                    entry.metrics.overallPerformance >= 5 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
                    'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                  }`}>
                    Perf: {entry.metrics.overallPerformance}/10
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;