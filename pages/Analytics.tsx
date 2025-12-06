import React, { useEffect, useState } from 'react';
import { getAllEntries, seedDataIfEmpty } from '../services/storage';
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
        await seedDataIfEmpty(user.uid);
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
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-stone-900">Performance Analytics</h2>
        <p className="text-stone-500">Visualize your spiritual and material progress over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Discipline vs Mood */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-96">
          <h3 className="font-bold text-stone-800 mb-4">Discipline vs. Mood</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis yAxisId="left" domain={[0, 5]} orientation="left" stroke="#2563eb" label={{ value: 'Discipline', angle: -90, position: 'insideLeft' }}/>
              <YAxis yAxisId="right" domain={[0, 10]} orientation="right" stroke="#ea580c" label={{ value: 'Mood', angle: 90, position: 'insideRight' }}/>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="discipline" stroke="#2563eb" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chanting Consistency */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-96">
          <h3 className="font-bold text-stone-800 mb-4">Chanting Consistency (Rounds)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis domain={[0, 25]} />
              <Tooltip cursor={{fill: '#fff7ed'}} />
              <Legend />
              <Bar dataKey="chanting" fill="#fb923c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep vs Energy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-96">
          <h3 className="font-bold text-stone-800 mb-4">Sleep Duration & Energy Levels</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 10]} label={{ value: 'Energy', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="sleep" fill="#c7d2fe" stroke="#818cf8" fillOpacity={0.3} />
              <Line yAxisId="right" type="monotone" dataKey="energy" stroke="#4f46e5" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Phone Usage */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-96">
          <h3 className="font-bold text-stone-800 mb-4">Phone Usage (Minutes)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="phone" stroke="#ef4444" fill="#fee2e2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Analytics;