import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllEntries, getSettings } from '../services/storage';
import { DailyEntry, UserSettings, Quote } from '../types';
import { TrendingUp, Award, Calendar, Sun, Moon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

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

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:scale-105">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-stone-500 text-sm font-medium">Discipline Score</p>
              <h3 className="text-2xl font-bold text-stone-900">{getAverageScore('disciplineScore')} / 5</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg transition-all duration-300 hover:scale-110">
              <Award size={20} />
            </div>
          </div>
          <div className="h-10">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 hover:shadow-lg hover:border-orange-200 transition-all duration-300 transform hover:scale-105">
           <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-stone-500 text-sm font-medium">Avg Chanting</p>
              <h3 className="text-2xl font-bold text-stone-900">{getAverageScore('chantingRounds')} Rnds</h3>
            </div>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg transition-all duration-300 hover:scale-110">
              <Sun size={20} />
            </div>
          </div>
           <p className="text-xs text-stone-500">Target: 16 Rounds daily</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 transform hover:scale-105">
           <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-stone-500 text-sm font-medium">Sleep Avg</p>
              <h3 className="text-2xl font-bold text-stone-900">{getAverageScore('totalSleep')} Hrs</h3>
            </div>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg transition-all duration-300 hover:scale-110">
              <Moon size={20} />
            </div>
          </div>
           <p className="text-xs text-stone-500">Consistent rest is vital</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
           <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-stone-500 text-sm font-medium">Today's Goals</p>
              <h3 className="text-2xl font-bold text-stone-900">{completedCommitments} / 5</h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(completedCommitments / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-lg font-bold font-serif text-stone-800">Recent Logs</h2>
          <Link to="/history" className="text-orange-600 text-sm font-medium hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-stone-100">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              No entries yet. Start your journey today!
            </div>
          ) : (
            entries.slice(0, 5).map(entry => (
              <div key={entry.id} className="p-4 hover:bg-stone-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-stone-100 p-2 rounded-lg text-stone-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">{entry.date}</p>
                    <p className="text-xs text-stone-500">
                      Discipline: {entry.metrics.disciplineScore}/5 • Mood: {entry.metrics.mood}/10
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.metrics.overallPerformance >= 8 ? 'bg-green-100 text-green-800' :
                    entry.metrics.overallPerformance >= 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
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