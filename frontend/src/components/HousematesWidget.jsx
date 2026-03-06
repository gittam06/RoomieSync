import { VolumeX, Moon, BookOpen, Circle } from 'lucide-react';

const HousematesWidget = ({ members }) => {
  // Helper to get status details
  const getStatusConfig = (status) => {
    switch(status) {
      case 'Busy': return { color: 'text-red-400', bg: 'bg-red-500/20', icon: Circle };
      case 'Studying': return { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: BookOpen };
      case 'Sleeping': return { color: 'text-indigo-400', bg: 'bg-indigo-500/20', icon: Moon };
      default: return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: Circle };
    }
  };

  return (
    <div className="h-full p-6 flex flex-col">
       <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          👥 Roommates
       </h3>

       <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
         {members.map((member) => {
            const config = getStatusConfig(member.status);
            const StatusIcon = config.icon;

            return (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-white/5">
                 <div className="flex items-center gap-3">
                    <div className="relative">
                       <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                          {member.avatar || '😎'}
                       </div>
                       {/* Quiet Mode Indicator */}
                       {member.quiet_mode && (
                          <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-1 border border-slate-900 shadow-sm" title="Quiet Mode ON">
                             <VolumeX size={10} className="text-white" />
                          </div>
                       )}
                    </div>
                    
                    <div>
                       <p className="font-bold text-white text-sm">{member.username}</p>
                       <div className="flex items-center gap-1.5 mt-0.5">
                          <StatusIcon size={12} className={config.color} fill="currentColor" />
                          <p className={`text-xs font-medium ${config.color}`}>{member.status || 'Online'}</p>
                       </div>
                    </div>
                 </div>
              </div>
            );
         })}
       </div>
    </div>
  );
};

export default HousematesWidget;