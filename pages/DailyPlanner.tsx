import React, { useState, useEffect } from 'react';
import { getEntry, saveEntry } from '../services/storage';
import { DailyEntry, TimelineSlot } from '../types';
import { Save, CheckCircle, Circle, Clock, Battery, Droplets, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DailyPlanner: React.FC = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const fetchEntry = async () => {
      if (user) {
        const data = await getEntry(user.uid, date);
        setEntry(data);
      }
    };
    fetchEntry();
  }, [date, user]);

  const handleSave = async () => {
    if (entry && user) {
      setSaveStatus('saving');
      await saveEntry(user.uid, entry);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const updateMetric = (key: string, value: any) => {
    if (!entry) return;
    setEntry({
      ...entry,
      metrics: { ...entry.metrics, [key]: value }
    });
  };

  const updateReflection = (key: string, value: string) => {
    if (!entry) return;
    setEntry({
      ...entry,
      reflections: { ...entry.reflections, [key]: value }
    });
  };

  const updateTimeline = (index: number, field: keyof TimelineSlot, value: any) => {
    if (!entry) return;
    const newTimeline = [...entry.timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setEntry({ ...entry, timeline: newTimeline });
  };

  const toggleCommitment = (index: number) => {
    if (!entry) return;
    const newCommitments = [...entry.commitments];
    newCommitments[index].done = !newCommitments[index].done;
    setEntry({ ...entry, commitments: newCommitments });
  };

  const updateCommitmentText = (index: number, text: string) => {
    if (!entry) return;
    const newCommitments = [...entry.commitments];
    newCommitments[index].text = text;
    setEntry({ ...entry, commitments: newCommitments });
  };

  if (!entry) return <div className="p-4 sm:p-6 text-center text-stone-500 text-sm sm:text-base">Loading planner...</div>;

  const completedCommitmentsCount = entry.commitments.filter(c => c.done).length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-3 sm:px-4">
      {/* Header & Date Picker */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-orange-400">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mb-1">Daily Sadhana</h2>
            <p className="text-orange-100 text-xs sm:text-sm md:text-base font-medium">Guided by HG Pranavanand Das Prabhu</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-2 border-orange-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-semibold focus:ring-4 focus:ring-orange-200 outline-none shadow-md bg-white"
            />
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                saveStatus === 'saved' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-stone-900 to-stone-800 text-white hover:from-stone-800 hover:to-stone-700'
              }`}
            >
              <Save size={18} />
              <span>{saveStatus === 'saved' ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Commitments & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Commitments Section */}
          <section className="bg-white rounded-xl border border-green-200 shadow-md hover:shadow-xl transition-all overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  Today's Commitments
                </h3>
                <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md">
                  {completedCommitmentsCount} / 5
                </span>
              </div>
              <div className="space-y-3">
                {entry.commitments.map((c, idx) => (
                  <div key={c.id} className="group flex items-center gap-3 bg-gradient-to-r from-stone-50 to-green-50 p-3 sm:p-4 rounded-lg border border-stone-200 hover:border-green-300 transition-all">
                    <span className="text-stone-500 font-bold text-sm sm:text-base w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white rounded-lg group-hover:bg-green-100 group-hover:text-green-700 transition-colors flex-shrink-0">{idx + 1}</span>
                    <input
                      type="text"
                      value={c.text}
                      onChange={(e) => updateCommitmentText(idx, e.target.value)}
                      placeholder="Enter commitment..."
                      className="flex-1 border-b border-stone-300 focus:border-green-500 outline-none py-1.5 sm:py-2 bg-transparent text-sm sm:text-base font-medium text-stone-800 placeholder-stone-400"
                    />
                    <button onClick={() => toggleCommitment(idx)} className="text-stone-400 hover:text-green-600 transition-all duration-300 transform hover:scale-110 active:scale-95 p-1 flex-shrink-0">
                      {c.done ? <CheckCircle className="text-green-600" size={22} /> : <Circle size={22} />}
                    </button>
                  </div>
                ))}
              </div>
              {completedCommitmentsCount < 5 && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-stone-200">
                  <label className="text-xs sm:text-sm font-bold uppercase text-stone-700 mb-2 block">Why not completed?</label>
                  <input 
                    type="text"
                    value={entry.reasonNotCompleted}
                    onChange={(e) => setEntry({...entry, reasonNotCompleted: e.target.value})}
                    className="w-full p-3 sm:p-4 bg-stone-50 rounded-lg border border-stone-300 text-sm sm:text-base focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none"
                    placeholder="Reason for missing commitments..."
                  />
                </div>
              )}
            </div>
          </section>

          {/* Timeline Section */}
          <section className="bg-white rounded-xl border border-blue-200 shadow-md hover:shadow-xl transition-all overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="font-serif font-bold text-lg sm:text-xl mb-4 sm:mb-6 text-stone-900 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                Sadhana & Duty Timeline
              </h3>
              <div className="max-h-[500px] sm:max-h-[600px] overflow-y-auto rounded-lg border border-stone-200">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-gradient-to-r from-blue-100 to-indigo-100 z-10">
                    <tr className="text-left text-stone-700">
                      <th className="py-2 sm:py-3 pl-3 sm:pl-4 w-20 sm:w-32 font-bold text-xs sm:text-sm">Time</th>
                      <th className="py-2 sm:py-3 font-bold text-xs sm:text-sm">Activity / Notes</th>
                      <th className="py-2 sm:py-3 w-16 sm:w-20 font-bold text-xs sm:text-sm text-right pr-3 sm:pr-4">Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {entry.timeline.map((slot, idx) => (
                      <tr key={idx} className="group hover:bg-blue-50 transition-all">
                        <td className="py-2 sm:py-3 pl-3 sm:pl-4 text-stone-700 font-semibold text-xs sm:text-sm">{slot.time}</td>
                        <td className="py-2 sm:py-3">
                          <input
                            type="text"
                            value={slot.activity}
                            onChange={(e) => updateTimeline(idx, 'activity', e.target.value)}
                            className="w-full bg-transparent outline-none text-stone-800 placeholder-stone-300 font-medium text-xs sm:text-sm focus:text-blue-700"
                            placeholder="..."
                          />
                        </td>
                        <td className="py-2 sm:py-3 pr-3 sm:pr-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={slot.focus || ''}
                            onChange={(e) => updateTimeline(idx, 'focus', parseInt(e.target.value) || 0)}
                            className="w-full text-right bg-transparent outline-none text-stone-800 font-semibold text-xs sm:text-sm focus:text-blue-700"
                            placeholder="-"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Reflection Section */}
          <section className="bg-white rounded-xl border border-purple-200 shadow-md hover:shadow-xl transition-all overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="font-serif font-bold text-lg sm:text-xl mb-4 sm:mb-6 text-stone-900">Daily Reflection</h3>
              <div className="grid grid-cols-1 gap-4">
              {[
                { key: 'didWell', label: '1. What I did well today' },
                { key: 'heldBack', label: '2. What held me back today' },
                { key: 'improveTomorrow', label: '3. What I will improve tomorrow' },
                { key: 'avoidTomorrow', label: '4. One thing I will avoid tomorrow' },
                { key: 'victory', label: '5. Biggest victory of today' },
                { key: 'lostControl', label: '6. Where I lost control' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase mb-2">{field.label}</label>
                  <textarea
                    rows={2}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none resize-none"
                    value={(entry.reflections as any)[field.key]}
                    onChange={(e) => updateReflection(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            </div>
          </section>
        </div>

        {/* Right Column: Metrics */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-amber-300 shadow-md hover:shadow-xl transition-all sticky top-8 overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="font-serif font-bold text-lg sm:text-xl mb-4 sm:mb-6 border-b border-amber-200 pb-3 text-stone-900 flex items-center gap-2">
                <Battery className="text-amber-600" size={20} />
                Daily Metrics
              </h3>
              
              <div className="space-y-4 sm:space-y-5">
                
                {/* Time Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm text-stone-700 font-semibold block mb-1.5 sm:mb-2">Wake Up</label>
                    <input type="time" value={entry.metrics.wakeUpTime} onChange={(e) => updateMetric('wakeUpTime', e.target.value)} className="w-full p-2 sm:p-2.5 border border-stone-300 rounded-lg bg-white text-sm sm:text-base font-semibold focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"/>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-stone-700 font-semibold block mb-1.5 sm:mb-2">Sleep Time</label>
                    <input type="time" value={entry.metrics.sleepTime} onChange={(e) => updateMetric('sleepTime', e.target.value)} className="w-full p-2 sm:p-2.5 border border-stone-300 rounded-lg bg-white text-sm sm:text-base font-semibold focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"/>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-stone-800">
                      <div className="bg-blue-100 p-1.5 rounded">
                        <Clock size={16} className="text-blue-700" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">Sleep (hrs)</span>
                    </div>
                    <input type="number" step="0.5" value={entry.metrics.totalSleep} onChange={(e) => updateMetric('totalSleep', parseFloat(e.target.value))} className="w-16 sm:w-20 p-1.5 sm:p-2 text-right border border-stone-300 rounded bg-white text-sm sm:text-base font-bold focus:ring-2 focus:ring-blue-300 outline-none"/>
                  </div>
                  
                  <div className="flex items-center justify-between bg-gradient-to-r from-cyan-50 to-white p-3 rounded-lg border border-cyan-200">
                    <div className="flex items-center gap-2 text-stone-800">
                      <div className="bg-cyan-100 p-1.5 rounded">
                        <Droplets size={16} className="text-cyan-700" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">Water (L)</span>
                    </div>
                    <input type="number" step="0.5" value={entry.metrics.waterIntake} onChange={(e) => updateMetric('waterIntake', parseFloat(e.target.value))} className="w-16 sm:w-20 p-1.5 sm:p-2 text-right border border-stone-300 rounded bg-white text-sm sm:text-base font-bold focus:ring-2 focus:ring-cyan-300 outline-none"/>
                  </div>

                  <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-white p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 text-stone-800">
                      <div className="bg-purple-100 p-1.5 rounded">
                        <Smartphone size={16} className="text-purple-700" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">Phone (min)</span>
                    </div>
                    <input type="number" value={entry.metrics.phoneUsage} onChange={(e) => updateMetric('phoneUsage', parseInt(e.target.value))} className="w-16 sm:w-20 p-1.5 sm:p-2 text-right border border-stone-300 rounded bg-white text-sm sm:text-base font-bold focus:ring-2 focus:ring-purple-300 outline-none"/>
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-bold text-orange-800 uppercase flex items-center gap-2">
                    <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-orange-600 rounded-full"></span>
                    Spiritual Practice
                  </h4>
                  
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="font-semibold text-stone-800">Chanting Rounds</span>
                      <span className="font-bold text-lg sm:text-xl text-orange-700">{entry.metrics.chantingRounds}</span>
                    </div>
                    <input 
                      type="range" min="0" max="64" 
                      value={entry.metrics.chantingRounds} 
                      onChange={(e) => updateMetric('chantingRounds', parseInt(e.target.value))}
                      className="w-full h-2 sm:h-3 accent-orange-600 rounded-full"
                    />
                    <div className="flex justify-between text-xs text-stone-500 mt-1">
                      <span>0</span>
                      <span>16 (Target)</span>
                      <span>64</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-white p-3 rounded-lg border border-orange-200">
                    <span className="text-xs sm:text-sm font-semibold text-stone-800">Gita Reading</span>
                    <button 
                      onClick={() => updateMetric('gitaReading', !entry.metrics.gitaReading)}
                      className={`w-12 sm:w-16 h-6 sm:h-8 rounded-full transition-all duration-300 relative shadow-inner ${entry.metrics.gitaReading ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-stone-300'}`}
                    >
                      <div className={`absolute top-0.5 sm:top-1 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white transition-all duration-300 shadow-md ${entry.metrics.gitaReading ? 'left-6 sm:left-9' : 'left-0.5 sm:left-1'}`}></div>
                    </button>
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm text-stone-700 font-semibold block mb-1.5 sm:mb-2">Seva Performed</label>
                    <input type="text" value={entry.metrics.sevaPerformed} onChange={(e) => updateMetric('sevaPerformed', e.target.value)} className="w-full p-2 sm:p-2.5 border border-stone-300 rounded-lg bg-white text-sm sm:text-base focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"/>
                  </div>
               </div>

               <div className="border-t border-amber-200 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-bold text-blue-800 uppercase flex items-center gap-2">
                    <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full"></span>
                    Performance Ratings
                  </h4>
                  
                  {[
                    { key: 'disciplineScore', label: 'Discipline', max: 5, color: 'blue' },
                    { key: 'emotionalStability', label: 'Stability', max: 10, color: 'indigo' },
                    { key: 'energyLevel', label: 'Energy', max: 10, color: 'green' },
                    { key: 'mood', label: 'Mood', max: 10, color: 'purple' },
                    { key: 'overallPerformance', label: 'Overall Perf', max: 10, color: 'orange' },
                  ].map((m) => (
                    <div key={m.key} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg border border-stone-200">
                       <span className="text-xs sm:text-sm font-semibold text-stone-800">{m.label}</span>
                       <div className="flex gap-2 items-center">
                         <input 
                           type="number" 
                           min="1" 
                           max={m.max} 
                           value={(entry.metrics as any)[m.key]}
                           onChange={(e) => updateMetric(m.key, parseInt(e.target.value))}
                           className="w-16 sm:w-20 p-1.5 sm:p-2 text-center border border-stone-300 rounded text-sm sm:text-base font-bold focus:ring-2 focus:ring-blue-300 outline-none"
                         />
                         <span className="text-xs sm:text-sm text-stone-500 font-semibold">/ {m.max}</span>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 sm:p-6 rounded-xl text-center mt-6 sm:mt-8 border border-orange-300">
                 <p className="font-serif italic text-orange-900 text-sm sm:text-base font-semibold leading-relaxed">"The soul does not act, nor cause action, nor enjoy the results."</p>
                 <p className="text-xs sm:text-sm text-orange-700 mt-2 font-medium">— Bhagavad Gita</p>
               </div>

              </div>
            </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;