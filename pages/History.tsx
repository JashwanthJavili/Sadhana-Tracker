import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllEntries } from '../services/storage';
import { DailyEntry } from '../types';
import { ChevronRight, Calendar, CheckSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const History: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        const data = await getAllEntries(user.uid);
        setEntries(data);
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-center"><div className="inline-block w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div><p className="text-stone-600 font-medium text-lg">Loading history...</p></div></div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 rounded-2xl p-8 shadow-2xl border-2 border-orange-400">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-3 rounded-xl">
            <Calendar className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-serif font-bold text-white">Journal History</h2>
        </div>
        <p className="text-orange-100 text-lg font-medium">Review your spiritual journey and track progress over time</p>
      </div>

      <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-2xl border-3 border-orange-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 border-b-3 border-orange-300">
              <tr>
                <th className="p-5 font-bold text-stone-800 text-base">Date</th>
                <th className="p-5 font-bold text-stone-800 text-base hidden md:table-cell">Commitments</th>
                <th className="p-5 font-bold text-stone-800 text-base">Discipline</th>
                <th className="p-5 font-bold text-stone-800 text-base hidden sm:table-cell">Chanting</th>
                <th className="p-5 font-bold text-stone-800 text-base text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-orange-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="group hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-xl text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                        <Calendar size={22} />
                      </div>
                      <span className="font-bold text-stone-900 text-base">{entry.date}</span>
                    </div>
                  </td>
                  <td className="p-5 hidden md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckSquare size={20} className="text-green-700" />
                      </div>
                      <span className="font-semibold text-stone-800 text-base">{entry.commitments.filter(c => c.done).length} <span className="text-stone-500">/ 5</span></span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md border-2 ${
                      entry.metrics.disciplineScore >= 4 ? 'border-green-300' : 
                      entry.metrics.disciplineScore >= 2 ? 'border-yellow-300' : 'border-red-300'
                    }">
                      <span className={`font-bold text-2xl ${
                        entry.metrics.disciplineScore >= 4 ? 'text-green-600' : 
                        entry.metrics.disciplineScore >= 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {entry.metrics.disciplineScore}
                      </span>
                      <span className="text-stone-500 text-base font-medium">/ 5</span>
                    </div>
                  </td>
                  <td className="p-5 hidden sm:table-cell">
                     <span className="inline-block bg-gradient-to-br from-orange-100 to-amber-100 text-orange-800 px-4 py-2 rounded-xl text-base font-bold shadow-md">
                       {entry.metrics.chantingRounds} Rnds
                     </span>
                  </td>
                  <td className="p-5 text-right">
                     <Link to={`/planner`} className="inline-flex items-center justify-center w-12 h-12 rounded-xl hover:bg-orange-200 bg-orange-100 text-orange-700 hover:text-orange-900 transition-all shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95">
                       <ChevronRight size={24} />
                     </Link>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-100 mb-6">
                      <Calendar className="text-orange-600" size={48} />
                    </div>
                    <p className="text-stone-600 text-lg font-medium mb-4">No records found.</p>
                    <Link to="/planner" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95">
                      Start Your First Entry →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;