import { Zap } from 'lucide-react';

const ActivityWidget = ({ activity = [] }) => {
  if (!activity || activity.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[200px] p-6 text-center">
        <Zap size={32} className="mb-2 opacity-20" />
        <p className="text-sm font-medium">No recent activity</p>
        <p className="text-xs text-slate-600 mt-1">Updates will appear here</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
       <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" /> Recent Activity
       </h3>
       
       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {activity.map((item, i) => (
             <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-lg flex-shrink-0">
                    {item.emoji || '⚡'}
                </div>
                <div className="min-w-0">
                   <p className="text-slate-300 text-sm leading-snug">
                       {item.text}
                   </p>
                   {item.time && <p className="text-[10px] text-slate-500 mt-1 font-mono">{item.time}</p>}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default ActivityWidget;