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
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">Daily Sadhana</h2>
          <p className="text-stone-500 text-sm">Guided by the teachings of HG Pranavanand Das Prabhu</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-stone-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              saveStatus === 'saved' 
                ? 'bg-green-600 text-white' 
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            <Save size={18} />
            {saveStatus === 'saved' ? 'Saved!' : 'Save Entry'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Commitments & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Commitments Section */}
          <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-bold text-lg">Today's Commitments</h3>
              <span className="text-sm font-medium bg-stone-100 px-3 py-1 rounded-full">
                {completedCommitmentsCount} / 5 Completed
              </span>
            </div>
            <div className="space-y-3">
              {entry.commitments.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-stone-400 font-mono w-4">{idx + 1}</span>
                  <input
                    type="text"
                    value={c.text}
                    onChange={(e) => updateCommitmentText(idx, e.target.value)}
                    placeholder="Enter commitment..."
                    className="flex-1 border-b border-stone-200 focus:border-orange-500 outline-none py-1 bg-transparent"
                  />
                  <button onClick={() => toggleCommitment(idx)} className="text-stone-400 hover:text-green-600 transition-colors">
                    {c.done ? <CheckCircle className="text-green-600" /> : <Circle />}
                  </button>
                </div>
              ))}
            </div>
            {completedCommitmentsCount < 5 && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <label className="text-xs font-bold uppercase text-stone-500">Why not completed?</label>
                <input 
                  type="text"
                  value={entry.reasonNotCompleted}
                  onChange={(e) => setEntry({...entry, reasonNotCompleted: e.target.value})}
                  className="w-full mt-1 p-2 bg-stone-50 rounded border border-stone-200 text-sm"
                  placeholder="Reason for missing commitments..."
                />
              </div>
            )}
          </section>

          {/* Timeline Section */}
          <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
             <h3 className="font-serif font-bold text-lg mb-4">Sadhana & Duty Timeline</h3>
             <div className="max-h-[600px] overflow-y-auto timeline-scroll pr-2">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10 shadow-sm">
                    <tr className="text-left text-stone-500 border-b border-stone-200">
                      <th className="pb-2 pl-2 w-32 font-medium">Time</th>
                      <th className="pb-2 font-medium">Activity / Notes</th>
                      <th className="pb-2 w-20 font-medium text-right">Focus %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {entry.timeline.map((slot, idx) => (
                      <tr key={idx} className="group hover:bg-stone-50 transition-colors">
                        <td className="py-2 pl-2 text-stone-600 font-mono text-xs">{slot.time}</td>
                        <td className="py-2">
                          <input
                            type="text"
                            value={slot.activity}
                            onChange={(e) => updateTimeline(idx, 'activity', e.target.value)}
                            className="w-full bg-transparent outline-none text-stone-800 placeholder-stone-300"
                            placeholder="..."
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={slot.focus || ''}
                            onChange={(e) => updateTimeline(idx, 'focus', parseInt(e.target.value) || 0)}
                            className="w-full text-right bg-transparent outline-none text-stone-800"
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
          <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="font-serif font-bold text-lg mb-4">Daily Reflection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'didWell', label: '1. What I did well today' },
                { key: 'heldBack', label: '2. What held me back today' },
                { key: 'improveTomorrow', label: '3. What I will improve tomorrow' },
                { key: 'avoidTomorrow', label: '4. One thing I will avoid tomorrow' },
                { key: 'victory', label: '5. Biggest victory of today' },
                { key: 'lostControl', label: '6. Where I lost control' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">{field.label}</label>
                  <textarea
                    rows={3}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none resize-none"
                    value={(entry.reflections as any)[field.key]}
                    onChange={(e) => updateReflection(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Metrics */}
        <div className="space-y-8">
           <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 sticky top-8">
             <h3 className="font-serif font-bold text-lg mb-6 border-b border-stone-100 pb-2">Daily Metrics</h3>
             
             <div className="space-y-6">
               
               {/* Time Stats */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs text-stone-500 block mb-1">Wake Up</label>
                   <input type="time" value={entry.metrics.wakeUpTime} onChange={(e) => updateMetric('wakeUpTime', e.target.value)} className="w-full p-2 border rounded bg-stone-50 text-sm"/>
                 </div>
                 <div>
                   <label className="text-xs text-stone-500 block mb-1">Sleep Time</label>
                   <input type="time" value={entry.metrics.sleepTime} onChange={(e) => updateMetric('sleepTime', e.target.value)} className="w-full p-2 border rounded bg-stone-50 text-sm"/>
                 </div>
               </div>

               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-stone-700">
                     <Clock size={16} /> <span className="text-sm">Total Sleep (hrs)</span>
                   </div>
                   <input type="number" step="0.5" value={entry.metrics.totalSleep} onChange={(e) => updateMetric('totalSleep', parseFloat(e.target.value))} className="w-20 p-1 text-right border rounded bg-stone-50"/>
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-stone-700">
                     <Droplets size={16} /> <span className="text-sm">Water Intake (L)</span>
                   </div>
                   <input type="number" step="0.5" value={entry.metrics.waterIntake} onChange={(e) => updateMetric('waterIntake', parseFloat(e.target.value))} className="w-20 p-1 text-right border rounded bg-stone-50"/>
                 </div>

                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-stone-700">
                     <Smartphone size={16} /> <span className="text-sm">Phone Usage (min)</span>
                   </div>
                   <input type="number" value={entry.metrics.phoneUsage} onChange={(e) => updateMetric('phoneUsage', parseInt(e.target.value))} className="w-20 p-1 text-right border rounded bg-stone-50"/>
                 </div>
               </div>

               <div className="border-t border-stone-100 pt-4 space-y-4">
                  <h4 className="text-sm font-bold text-orange-800 uppercase">Spiritual</h4>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Chanting Rounds</span>
                      <span className="font-bold">{entry.metrics.chantingRounds}</span>
                    </div>
                    <input 
                      type="range" min="0" max="64" 
                      value={entry.metrics.chantingRounds} 
                      onChange={(e) => updateMetric('chantingRounds', parseInt(e.target.value))}
                      className="w-full accent-orange-600"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-stone-50 p-3 rounded-lg">
                    <span className="text-sm text-stone-700">Gita Reading</span>
                    <button 
                      onClick={() => updateMetric('gitaReading', !entry.metrics.gitaReading)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${entry.metrics.gitaReading ? 'bg-orange-500' : 'bg-stone-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${entry.metrics.gitaReading ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                  
                  <div>
                    <label className="text-xs text-stone-500 block mb-1">Seva Performed</label>
                    <input type="text" value={entry.metrics.sevaPerformed} onChange={(e) => updateMetric('sevaPerformed', e.target.value)} className="w-full p-2 border rounded bg-stone-50 text-sm"/>
                  </div>
               </div>

               <div className="border-t border-stone-100 pt-4 space-y-4">
                  <h4 className="text-sm font-bold text-blue-800 uppercase">Ratings (1-10)</h4>
                  
                  {[
                    { key: 'disciplineScore', label: 'Discipline', max: 5 },
                    { key: 'emotionalStability', label: 'Stability', max: 10 },
                    { key: 'energyLevel', label: 'Energy', max: 10 },
                    { key: 'mood', label: 'Mood', max: 10 },
                    { key: 'overallPerformance', label: 'Overall Perf', max: 10 },
                  ].map((m) => (
                    <div key={m.key} className="flex items-center justify-between">
                       <span className="text-sm text-stone-600">{m.label}</span>
                       <div className="flex gap-1">
                         <input 
                           type="number" 
                           min="1" 
                           max={m.max} 
                           value={(entry.metrics as any)[m.key]}
                           onChange={(e) => updateMetric(m.key, parseInt(e.target.value))}
                           className="w-16 p-1 text-center border rounded text-sm font-bold"
                         />
                         <span className="text-xs text-stone-400 self-center">/{m.max}</span>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="bg-orange-50 p-4 rounded-lg text-center mt-6">
                 <p className="font-serif italic text-orange-900 text-sm">"The soul does not act, nor cause action, nor enjoy the results."</p>
               </div>

             </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;