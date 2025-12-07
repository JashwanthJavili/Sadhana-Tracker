import React, { useEffect, useState } from 'react';
import { getAllEntries } from '../services/storage';
import { DailyEntry } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, ComposedChart 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        const all = await getAllEntries(user.uid);
        setEntries(all.reverse()); // Oldest first for charts
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-stone-500">Loading analytics...</div>;

  const chartData = entries.map(e => ({
    date: e.date.substring(5), // MM-DD
    discipline: e.metrics.disciplineScore,
    mood: e.metrics.mood,
    chanting: e.metrics.chantingRounds,
    sleep: e.metrics.totalSleep,
    phone: e.metrics.phoneUsage,
    energy: e.metrics.energyLevel
  }));

  return (
    <div className="min-h-full space-y-4 sm:space-y-6 md:space-y-8 px-3 sm:px-4">
      <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 shadow-lg sm:shadow-xl md:shadow-2xl border-2 border-orange-400">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-2">Performance Analytics</h2>
        <p className="text-orange-100 text-sm sm:text-base md:text-lg font-medium">Visualize your spiritual progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        
        {/* Discipline vs Mood */}
        <div className="group bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border-2 sm:border-3 border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="font-bold text-base sm:text-lg md:text-xl text-stone-900 mb-4 sm:mb-6 flex items-center gap-2">
            <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full"></span>
            Discipline vs. Mood
          </h3>
          <div className="h-60 sm:h-72 md:h-80 bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="date" tick={{fontSize: 13, fontWeight: 600}} />
                <YAxis yAxisId="left" domain={[0, 5]} orientation="left" stroke="#2563eb" label={{ value: 'Discipline', angle: -90, position: 'insideLeft', style: {fontWeight: 'bold'} }}/>
                <YAxis yAxisId="right" domain={[0, 10]} orientation="right" stroke="#ea580c" label={{ value: 'Mood', angle: 90, position: 'insideRight', style: {fontWeight: 'bold'} }}/>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', padding: '12px', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{fontWeight: 600}} />
                <Line yAxisId="left" type="monotone" dataKey="discipline" stroke="#2563eb" strokeWidth={4} dot={{r: 5, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 8}} />
                <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#ea580c" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chanting Consistency */}
        <div className="group bg-gradient-to-br from-white to-orange-50 p-8 rounded-2xl shadow-xl border-3 border-orange-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="font-bold text-xl text-stone-900 mb-6 flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-orange-600 rounded-full"></span>
            Chanting Consistency (Rounds)
          </h3>
          <div className="h-80 bg-white rounded-xl p-4 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef3c7" />
                <XAxis dataKey="date" tick={{fontSize: 13, fontWeight: 600}} />
                <YAxis domain={[0, 25]} tick={{fontWeight: 600}} />
                <Tooltip cursor={{fill: '#fff7ed'}} contentStyle={{borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', fontWeight: 600}} />
                <Legend wrapperStyle={{fontWeight: 600}} />
                <Bar dataKey="chanting" fill="url(#orangeGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#fdba74" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep vs Energy */}
        <div className="group bg-gradient-to-br from-white to-indigo-50 p-8 rounded-2xl shadow-xl border-3 border-indigo-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="font-bold text-xl text-stone-900 mb-6 flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-indigo-600 rounded-full"></span>
            Sleep Duration & Energy Levels
          </h3>
          <div className="h-80 bg-white rounded-xl p-4 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="date" tick={{fontSize: 13, fontWeight: 600}} />
                <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: {fontWeight: 'bold'} }} tick={{fontWeight: 600}} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} label={{ value: 'Energy', angle: 90, position: 'insideRight', style: {fontWeight: 'bold'} }} tick={{fontWeight: 600}} />
                <Tooltip contentStyle={{borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', fontWeight: 600}} />
                <Legend wrapperStyle={{fontWeight: 600}} />
                <Area yAxisId="left" type="monotone" dataKey="sleep" fill="#c7d2fe" stroke="#818cf8" fillOpacity={0.5} strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="energy" stroke="#4f46e5" strokeWidth={4} dot={{r: 5, fill: '#fff', strokeWidth: 2}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phone Usage */}
        <div className="group bg-gradient-to-br from-white to-red-50 p-8 rounded-2xl shadow-xl border-3 border-red-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="font-bold text-xl text-stone-900 mb-6 flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-red-600 rounded-full"></span>
            Phone Usage (Minutes)
          </h3>
          <div className="h-80 bg-white rounded-xl p-4 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fee2e2" />
                <XAxis dataKey="date" tick={{fontSize: 13, fontWeight: 600}} />
                <YAxis tick={{fontWeight: 600}} />
                <Tooltip contentStyle={{borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', fontWeight: 600}} />
                <Area type="monotone" dataKey="phone" stroke="#ef4444" fill="#fee2e2" strokeWidth={3} fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;