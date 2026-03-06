// frontend/src/components/PollWidget.jsx

import { BarChart2, Plus, Check, Trash2, Loader2, Vote } from 'lucide-react';
import api from '../api';
import { useState } from 'react';

const PollWidget = ({ polls, user, household, onAddClick, onRefresh }) => {
   const [loadingVote, setLoadingVote] = useState(null);

   const handleVote = async (poll, optionId) => {
      if (loadingVote) return;
      setLoadingVote(optionId);
      try {
         await api.post(`/polls/vote/${poll.id}`, {
            option_id: optionId,
            voter_id: user.id
         });

         onRefresh();
      } catch (e) { console.error(e); }
      finally { setLoadingVote(null); }
   };

   const handleDeletePoll = async (poll) => {
      if (!window.confirm("End and delete this poll?")) return;
      try {
         await api.put(`/polls/${poll.id}/close`);

         await api.post('/activity/', {
            household_id: household.id,
            user: user.username,
            action: `closed poll: "${poll.title}"`,
            emoji: '🛑',
            time: 'Just now'
         });

         onRefresh();
      } catch (e) { console.error(e); }
   };

   const activePolls = polls.filter(p => p.is_active);

   return (
      <div className="p-5 h-full flex flex-col">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <BarChart2 size={15} className="text-white" />
               </div>
               <div>
                  <h3 className="text-sm font-bold text-white">Active Polls</h3>
                  {activePolls.length > 0 && (
                     <p className="text-[10px] text-slate-500">{activePolls.length} active</p>
                  )}
               </div>
            </div>
            <button onClick={onAddClick} className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-purple-900/20">
               <Plus size={16} />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
            {activePolls.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="relative mb-3">
                     <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/10 flex items-center justify-center">
                        <Vote size={24} className="text-purple-400/50" />
                     </div>
                     <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                        <Plus size={10} className="text-purple-400" />
                     </div>
                  </div>
                  <p className="text-slate-400 font-semibold text-xs">No Active Polls</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Create one to get votes!</p>
                  <button
                     onClick={onAddClick}
                     className="mt-3 text-[11px] font-bold text-purple-400 bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                     Create Poll
                  </button>
               </div>
            ) : (
               activePolls.map((poll) => {
                  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);

                  return (
                     <div key={poll.id} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 relative group">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-white text-xs max-w-[85%] leading-snug">{poll.title}</h4>
                           <button
                              onClick={() => handleDeletePoll(poll)}
                              className="text-slate-600 hover:text-red-400 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
                              title="End Poll"
                           >
                              <Trash2 size={12} />
                           </button>
                        </div>

                        <div className="space-y-1.5">
                           {poll.options.map((opt) => {
                              const votes = opt.votes.length;
                              const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
                              const hasVoted = opt.votes.some(v => v.voter_id === user.id);

                              return (
                                 <div
                                    key={opt.id}
                                    onClick={() => handleVote(poll, opt.id)}
                                    className={`relative cursor-pointer p-2 rounded-lg border transition-all ${hasVoted
                                       ? 'border-purple-500/50 bg-purple-500/10'
                                       : 'border-white/5 hover:bg-slate-700/50 hover:border-white/10'
                                       }`}
                                 >
                                    <div className="absolute inset-0 rounded-lg overflow-hidden opacity-15 pointer-events-none">
                                       <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <div className="relative flex justify-between items-center z-10 pointer-events-none">
                                       <span className={`text-xs font-medium ${hasVoted ? 'text-purple-300' : 'text-slate-300'}`}>{opt.option_text}</span>
                                       <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] font-bold text-slate-400">{percentage}%</span>
                                          {loadingVote === opt.id ? <Loader2 size={11} className="animate-spin text-purple-400" /> : (hasVoted && <Check size={11} className="text-purple-400" />)}
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                        <p className="text-[9px] text-slate-500 mt-2 text-right">{totalVotes} votes • {poll.created_by?.username}</p>
                     </div>
                  );
               })
            )}
         </div>
      </div>
   );
};

export default PollWidget;