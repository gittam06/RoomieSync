import { CheckSquare, Plus, Calendar, Star, Check, Coffee, Sparkles } from 'lucide-react';
import api from '../api';
import { useState } from 'react';

const ChoreWidget = ({ chores, user, onAddClick, onRefresh }) => {
  const [loadingId, setLoadingId] = useState(null);

  const handleToggle = async (chore) => {
    setLoadingId(chore.id);
    try {
      await api.put(`/chores/${chore.id}/toggle`, null, { params: { user_id: user.id } });
      if (!chore.is_completed) {
         await api.post('/activity/', {
            household_id: chore.household_id,
            user: user.username,
            action: `completed chore: ${chore.title}`,
            emoji: '✅',
            time: 'Just now'
         });
      }
      onRefresh();
    } catch (err) { console.error(err); } 
    finally { setLoadingId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this chore?")) return;
    try {
        await api.delete(`/chores/${id}`);
        onRefresh();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <CheckSquare className="text-purple-400" /> Chore Wars
          </h3>
          <button onClick={onAddClick} className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-lg shadow-purple-900/20">
             <Plus size={18} />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 flex flex-col">
          {chores.length === 0 ? (
             // ✅ COOL EMPTY STATE
             <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5 p-8 text-center group">
                <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Coffee size={40} className="text-purple-400 opacity-50" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">All Caught Up!</h4>
                <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed">
                   House is clean. Enjoy your free time or start a new mission.
                </p>
                <button 
                   onClick={onAddClick}
                   className="mt-6 text-xs font-bold bg-slate-800 hover:bg-purple-600 text-purple-400 hover:text-white px-4 py-2 rounded-lg transition-all border border-purple-500/20"
                >
                   Assign New Mission
                </button>
             </div>
          ) : (
             chores.map((chore) => (
                <div key={chore.id} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${chore.is_completed ? 'bg-slate-900/30 border-white/5 opacity-50' : 'bg-slate-800/40 border-white/10 hover:border-purple-500/30'}`}>
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleToggle(chore)}
                        disabled={loadingId === chore.id}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${chore.is_completed ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-500 hover:border-purple-400'}`}
                      >
                         {chore.is_completed && <Check size={14} />}
                      </button>
                      <div>
                         <p className={`text-sm font-bold ${chore.is_completed ? 'text-slate-500 line-through' : 'text-white'}`}>{chore.title}</p>
                         <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 text-yellow-400 font-bold"><Star size={10} fill="currentColor"/> {chore.points}</span>
                            {chore.assignee ? (
                                <span className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">For: {chore.assignee.username}</span>
                            ) : <span>Anyone</span>}
                         </div>
                      </div>
                   </div>
                   {!chore.is_completed && (
                     // Delete button (Only for active chores)
                     <button onClick={() => handleDelete(chore.id)} className="text-slate-600 hover:text-red-400 p-2 transition-colors">
                        {/* We use a subtle text/icon here if you prefer, or just the Trash icon */}
                     </button>
                   )}
                </div>
             ))
          )}
       </div>
    </div>
  );
};

export default ChoreWidget;