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

  if (!entry) return <div className="p-8 text-center text-stone-500">Loading planner...</div>;

  const completedCommitmentsCount = entry.commitments.filter(c => c.done).length;

  return (
    <div className="space-y-8">
      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 bg-gradient-to-r from-white to-orange-50 p-7 rounded-2xl shadow-xl border-2 border-orange-200">
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-1">Daily Sadhana</h2>
          <p className="text-stone-600 text-base font-medium">Guided by the teachings of HG Pranavanand Das Prabhu</p>
        </div>
        <div className="flex items-center gap-5">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-2 border-orange-300 rounded-xl px-5 py-3 text-base font-semibold focus:ring-4 focus:ring-orange-200 outline-none shadow-md hover:shadow-lg transition-shadow"
          />
          <button
            onClick={handleSave}
            className={`flex items-center gap-3 px-7 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-h-[52px] ${
              saveStatus === 'saved' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-stone-900 to-stone-800 text-white hover:from-stone-800 hover:to-stone-700'
            }`}
          >
            <Save size={20} />
            {saveStatus === 'saved' ? 'Saved!' : 'Save Entry'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Commitments & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Commitments Section */}
          <section className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-200 p-7">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-2xl text-stone-900 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={28} />
                Today's Commitments
              </h3>
              <span className="text-base font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-md">
                {completedCommitmentsCount} / 5 Completed
              </span>
            </div>
            <div className="space-y-4">
              {entry.commitments.map((c, idx) => (
                <div key={c.id} className="group flex items-center gap-4 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-stone-100 hover:border-green-300">
                  <span className="text-stone-500 font-bold text-lg w-8 h-8 flex items-center justify-center bg-stone-100 rounded-lg group-hover:bg-green-100 group-hover:text-green-700 transition-colors">{idx + 1}</span>
                  <input
                    type="text"
                    value={c.text}
                    onChange={(e) => updateCommitmentText(idx, e.target.value)}
                    placeholder="Enter commitment..."
                    className="flex-1 border-b-2 border-stone-200 focus:border-green-500 outline-none py-2 bg-transparent text-base font-medium text-stone-800 placeholder-stone-400"
                  />
                  <button onClick={() => toggleCommitment(idx)} className="text-stone-400 hover:text-green-600 transition-all duration-300 transform hover:scale-125 active:scale-95 p-2">
                    {c.done ? <CheckCircle className="text-green-600" size={28} /> : <Circle size={28} />}
                  </button>
                </div>
              ))}
            </div>
            {completedCommitmentsCount < 5 && (
              <div className="mt-6 pt-6 border-t-2 border-stone-200">
                <label className="text-sm font-bold uppercase text-stone-700 mb-2 block">Why not completed?</label>
                <input 
                  type="text"
                  value={entry.reasonNotCompleted}
                  onChange={(e) => setEntry({...entry, reasonNotCompleted: e.target.value})}
                  className="w-full p-4 bg-stone-50 rounded-xl border-2 border-stone-200 text-base focus:ring-4 focus:ring-orange-200 outline-none shadow-inner"
                  placeholder="Reason for missing commitments..."
                />
              </div>
            )}
          </section>

          {/* Timeline Section */}
          <section className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 p-7">
             <h3 className="font-serif font-bold text-2xl mb-6 text-stone-900 flex items-center gap-2">
               <Clock className="text-blue-600" size={28} />
               Sadhana & Duty Timeline
             </h3>
             <div className="max-h-[600px] overflow-y-auto timeline-scroll pr-2 rounded-xl border-2 border-stone-100 shadow-inner">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gradient-to-r from-blue-100 to-indigo-100 z-10 shadow-md">
                    <tr className="text-left text-stone-700">
                      <th className="py-3 pl-4 w-32 font-bold text-base">Time</th>
                      <th className="py-3 font-bold text-base">Activity / Notes</th>
                      <th className="py-3 w-20 font-bold text-base text-right pr-4">Focus %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-stone-100">
                    {entry.timeline.map((slot, idx) => (
                      <tr key={idx} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="py-3 pl-4 text-stone-700 font-bold text-base">{slot.time}</td>
                        <td className="py-3">
                          <input
                            type="text"
                            value={slot.activity}
                            onChange={(e) => updateTimeline(idx, 'activity', e.target.value)}
                            className="w-full bg-transparent outline-none text-stone-800 placeholder-stone-300 font-medium text-base focus:text-blue-700"
                            placeholder="..."
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={slot.focus || ''}
                            onChange={(e) => updateTimeline(idx, 'focus', parseInt(e.target.value) || 0)}
                            className="w-full text-right bg-transparent outline-none text-stone-800 font-bold text-base focus:text-blue-700"
                            placeholder="-"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </section>

          {/* Reflection Section */}
          <section className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-200 p-7">
            <h3 className="font-serif font-bold text-2xl mb-6 text-stone-900">Daily Reflection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'didWell', label: '1. What I did well today' },
                { key: 'heldBack', label: '2. What held me back today' },
                { key: 'improveTomorrow', label: '3. What I will improve tomorrow' },
                { key: 'avoidTomorrow', label: '4. One thing I will avoid tomorrow' },
                { key: 'victory', label: '5. Biggest victory of today' },
                { key: 'lostControl', label: '6. Where I lost control' },
              ].map((field) => (
                <div key={field.key} className="group">
                  <label className="block text-sm font-bold text-stone-700 uppercase mb-2">{field.label}</label>
                  <textarea
                    rows={3}
                    className="w-full p-4 bg-white border-2 border-stone-200 rounded-xl text-base focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none resize-none shadow-md hover:shadow-lg transition-all group-hover:border-purple-300"
                    value={(entry.reflections as any)[field.key]}
                    onChange={(e) => updateReflection(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
            </div>
          </section>
        </div>

        {/* Right Column: Metrics */}
        <div className="space-y-8">
           <section className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl border-3 border-amber-300 p-7 sticky top-8">
             <h3 className="font-serif font-bold text-2xl mb-6 border-b-2 border-amber-200 pb-3 text-stone-900 flex items-center gap-2">
               <Battery className="text-amber-600" size={28} />
               Daily Metrics
             </h3>
             
             <div className="space-y-7">
               
               {/* Time Stats */}
               <div className="grid grid-cols-2 gap-5">
                 <div>
                   <label className="text-sm text-stone-700 font-semibold block mb-2">Wake Up</label>
                   <input type="time" value={entry.metrics.wakeUpTime} onChange={(e) => updateMetric('wakeUpTime', e.target.value)} className="w-full p-3 border-2 border-stone-300 rounded-xl bg-white text-base font-bold focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none shadow-md"/>
                 </div>
                 <div>
                   <label className="text-sm text-stone-700 font-semibold block mb-2">Sleep Time</label>
                   <input type="time" value={entry.metrics.sleepTime} onChange={(e) => updateMetric('sleepTime', e.target.value)} className="w-full p-3 border-2 border-stone-300 rounded-xl bg-white text-base font-bold focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none shadow-md"/>
                 </div>
               </div>

               <div className="space-y-5">
                 <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md border-2 border-stone-200 hover:border-blue-300 transition-all">
                   <div className="flex items-center gap-3 text-stone-800">
                     <div className="bg-blue-100 p-2 rounded-lg">
                       <Clock size={20} className="text-blue-700" />
                     </div>
                     <span className="text-base font-semibold">Total Sleep (hrs)</span>
                   </div>
                   <input type="number" step="0.5" value={entry.metrics.totalSleep} onChange={(e) => updateMetric('totalSleep', parseFloat(e.target.value))} className="w-24 p-2 text-right border-2 border-stone-300 rounded-lg bg-stone-50 text-base font-bold focus:ring-2 focus:ring-blue-300 outline-none"/>
                 </div>
                 
                 <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md border-2 border-stone-200 hover:border-cyan-300 transition-all">
                   <div className="flex items-center gap-3 text-stone-800">
                     <div className="bg-cyan-100 p-2 rounded-lg">
                       <Droplets size={20} className="text-cyan-700" />
                     </div>
                     <span className="text-base font-semibold">Water Intake (L)</span>
                   </div>
                   <input type="number" step="0.5" value={entry.metrics.waterIntake} onChange={(e) => updateMetric('waterIntake', parseFloat(e.target.value))} className="w-24 p-2 text-right border-2 border-stone-300 rounded-lg bg-stone-50 text-base font-bold focus:ring-2 focus:ring-cyan-300 outline-none"/>
                 </div>

                 <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md border-2 border-stone-200 hover:border-purple-300 transition-all">
                   <div className="flex items-center gap-3 text-stone-800">
                     <div className="bg-purple-100 p-2 rounded-lg">
                       <Smartphone size={20} className="text-purple-700" />
                     </div>
                     <span className="text-base font-semibold">Phone Usage (min)</span>
                   </div>
                   <input type="number" value={entry.metrics.phoneUsage} onChange={(e) => updateMetric('phoneUsage', parseInt(e.target.value))} className="w-24 p-2 text-right border-2 border-stone-300 rounded-lg bg-stone-50 text-base font-bold focus:ring-2 focus:ring-purple-300 outline-none"/>
                 </div>
               </div>

               <div className="border-t-2 border-amber-200 pt-6 space-y-5 bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl shadow-inner">
                  <h4 className="text-base font-bold text-orange-800 uppercase flex items-center gap-2">
                    <span className="inline-block w-3 h-3 bg-orange-600 rounded-full"></span>
                    Spiritual Practice
                  </h4>
                  
                  <div>
                    <div className="flex justify-between text-base mb-2">
                      <span className="font-semibold text-stone-800">Chanting Rounds</span>
                      <span className="font-bold text-2xl text-orange-700">{entry.metrics.chantingRounds}</span>
                    </div>
                    <input 
                      type="range" min="0" max="64" 
                      value={entry.metrics.chantingRounds} 
                      onChange={(e) => updateMetric('chantingRounds', parseInt(e.target.value))}
                      className="w-full h-3 accent-orange-600 rounded-full"
                    />
                    <div className="flex justify-between text-xs text-stone-500 mt-1">
                      <span>0</span>
                      <span>16 (Target)</span>
                      <span>64</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md border-2 border-orange-200">
                    <span className="text-base font-semibold text-stone-800">Gita Reading</span>
                    <button 
                      onClick={() => updateMetric('gitaReading', !entry.metrics.gitaReading)}
                      className={`w-16 h-8 rounded-full transition-all duration-300 relative shadow-inner ${entry.metrics.gitaReading ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-stone-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-md ${entry.metrics.gitaReading ? 'left-9' : 'left-1'}`}></div>
                    </button>
                  </div>
                  
                  <div>
                    <label className="text-sm text-stone-700 font-semibold block mb-2">Seva Performed</label>
                    <input type="text" value={entry.metrics.sevaPerformed} onChange={(e) => updateMetric('sevaPerformed', e.target.value)} className="w-full p-3 border-2 border-stone-300 rounded-xl bg-white text-base focus:ring-4 focus:ring-orange-200 focus:border-orange-400 outline-none shadow-md"/>
                  </div>
               </div>

               <div className="border-t-2 border-amber-200 pt-6 space-y-5 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl shadow-inner">
                  <h4 className="text-base font-bold text-blue-800 uppercase flex items-center gap-2">
                    <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
                    Performance Ratings
                  </h4>
                  
                  {[
                    { key: 'disciplineScore', label: 'Discipline', max: 5, color: 'blue' },
                    { key: 'emotionalStability', label: 'Stability', max: 10, color: 'indigo' },
                    { key: 'energyLevel', label: 'Energy', max: 10, color: 'green' },
                    { key: 'mood', label: 'Mood', max: 10, color: 'purple' },
                    { key: 'overallPerformance', label: 'Overall Perf', max: 10, color: 'orange' },
                  ].map((m) => (
                    <div key={m.key} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md border-2 border-stone-200 hover:border-${m.color}-300 transition-all">
                       <span className="text-base font-semibold text-stone-800">{m.label}</span>
                       <div className="flex gap-2 items-center">
                         <input 
                           type="number" 
                           min="1" 
                           max={m.max} 
                           value={(entry.metrics as any)[m.key]}
                           onChange={(e) => updateMetric(m.key, parseInt(e.target.value))}
                           className="w-20 p-2 text-center border-2 border-stone-300 rounded-lg text-lg font-bold focus:ring-4 focus:ring-${m.color}-200 outline-none shadow-inner"
                         />
                         <span className="text-sm text-stone-500 font-semibold">/ {m.max}</span>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-6 rounded-2xl text-center mt-8 shadow-lg border-2 border-orange-300">
                 <p className="font-serif italic text-orange-900 text-base font-semibold leading-relaxed">"The soul does not act, nor cause action, nor enjoy the results."</p>
                 <p className="text-sm text-orange-700 mt-2 font-medium">— Bhagavad Gita</p>
               </div>

             </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;