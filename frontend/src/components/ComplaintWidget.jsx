import { AlertTriangle, Ghost, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../api';

const ComplaintWidget = ({ complaints, onAddClick, onRefresh, household, user }) => {

   const handleResolve = async (id) => {
      try {
         await api.put(`/complaints/${id}/resolve`);

         // ✅ Log Activity
         await api.post('/activity/', {
            household_id: household.id,
            user: user.username,
            action: `resolved a complaint`,
            emoji: '🏳️',
            time: 'Just now'
         });

         onRefresh();
      } catch (e) { console.error(e); }
   };

   const activeItems = complaints.filter(c => !c.is_resolved);

   return (
      <div className="p-5 h-full flex flex-col">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <AlertTriangle size={15} className="text-white" />
               </div>
               <div>
                  <h3 className="text-sm font-bold text-white">Complaints</h3>
                  {activeItems.length > 0 && (
                     <p className="text-[10px] text-slate-500">{activeItems.length} open</p>
                  )}
               </div>
            </div>
            <button onClick={onAddClick} className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-all hover:scale-105 active:scale-95 border border-red-500/20">
               + File
            </button>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
            {activeItems.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="relative mb-3">
                     <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 size={24} className="text-emerald-400/50" />
                     </div>
                  </div>
                  <p className="text-slate-400 font-semibold text-xs">Zero Complaints!</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Everyone is happy (for now)</p>
               </div>
            ) : (
               activeItems.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 group">
                     <div className="flex items-start gap-2">
                        <div className="mt-0.5 min-w-[20px]">
                           {c.is_anonymous ? <Ghost size={16} className="text-slate-500" /> : <div className="w-5 h-5 rounded-full bg-slate-700 text-[9px] flex items-center justify-center">{c.author?.avatar || '😎'}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs text-slate-300 leading-snug line-clamp-2">{c.message}</p>
                           <p className="text-[9px] text-slate-500 mt-1 font-bold uppercase tracking-wider">
                              {c.is_anonymous ? "Anonymous" : c.author?.username}
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={() => handleResolve(c.id)}
                        className="w-full mt-2 py-1.5 rounded-lg bg-slate-900 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors border border-white/5"
                     >
                        Mark Resolved
                     </button>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};

export default ComplaintWidget;