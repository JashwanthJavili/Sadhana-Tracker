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

  if (loading) return <div className="p-8 text-center text-stone-500">Loading history...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-stone-900">Journal History</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 font-semibold text-stone-600">Date</th>
              <th className="p-4 font-semibold text-stone-600 hidden md:table-cell">Commitments</th>
              <th className="p-4 font-semibold text-stone-600">Discipline</th>
              <th className="p-4 font-semibold text-stone-600 hidden sm:table-cell">Chanting</th>
              <th className="p-4 font-semibold text-stone-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-stone-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded text-orange-700">
                      <Calendar size={18} />
                    </div>
                    <span className="font-medium text-stone-900">{entry.date}</span>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div className="flex items-center gap-2 text-stone-500">
                    <CheckSquare size={16} />
                    <span>{entry.commitments.filter(c => c.done).length} / 5</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <span className={`font-bold ${
                      entry.metrics.disciplineScore >= 4 ? 'text-green-600' : 
                      entry.metrics.disciplineScore >= 2 ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                      {entry.metrics.disciplineScore}
                    </span>
                    <span className="text-stone-400 text-sm">/ 5</span>
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell">
                   <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-sm font-mono">
                     {entry.metrics.chantingRounds} Rnds
                   </span>
                </td>
                <td className="p-4 text-right">
                   <Link to={`/planner`} className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600">
                     <ChevronRight size={20} />
                   </Link>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-stone-400">
                  No records found. Start your first entry in the Planner.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;