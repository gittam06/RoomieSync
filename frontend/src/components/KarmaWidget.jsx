import { Trophy, Star, Crown } from 'lucide-react';

const KarmaWidget = ({ data = [] }) => {
  // Data comes from the backend sorted by points already
  
  return (
    <div className="p-6 h-full flex flex-col">
       <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Trophy className="text-yellow-400" /> Karma Board
       </h3>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {data.length === 0 ? (
             <p className="text-slate-500 text-center mt-10">No chores done yet!</p>
          ) : (
             data.map((member, index) => {
                const isFirst = index === 0;
                return (
                   <div key={member.user_id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isFirst ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : 'bg-slate-800/40 border-white/5'}`}>
                      <div className="flex items-center gap-4">
                         <div className={`text-lg font-black w-6 text-center ${isFirst ? 'text-yellow-400' : 'text-slate-500'}`}>
                            #{index + 1}
                         </div>
                         <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl shadow-lg border border-white/10">
                               {member.avatar || '😎'}
                            </div>
                            {isFirst && <Crown size={14} className="absolute -top-2 -right-1 text-yellow-400 fill-yellow-400 animate-bounce" />}
                         </div>
                         <div>
                            <p className={`font-bold ${isFirst ? 'text-white' : 'text-slate-300'}`}>
                               {member.username} {member.is_current_user && '(You)'}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                               {member.chores_done} chores done
                            </p>
                         </div>
                      </div>
                      
                      <div className="text-right">
                         <p className={`text-2xl font-black ${isFirst ? 'text-yellow-400' : 'text-white'}`}>
                            {member.total_points}
                         </p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PTS</p>
                      </div>
                   </div>
                );
             })
          )}
       </div>
    </div>
  );
};

export default KarmaWidget;