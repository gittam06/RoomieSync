import { VolumeX, Moon, BookOpen, Circle, Shield } from 'lucide-react';

const MemberSidebar = ({ members, currentUser }) => {
  
  // Helper to get status configuration with EXPLICIT background classes for the dot
  const getStatusConfig = (status) => {
    switch(status) {
      case 'Busy': 
        return { 
            color: 'text-red-400', 
            bg: 'bg-red-500/10', 
            icon: Circle, 
            dot: 'bg-red-500' // ✅ Explicit color class
        };
      case 'Studying': 
        return { 
            color: 'text-amber-400', 
            bg: 'bg-amber-500/10', 
            icon: BookOpen, 
            dot: 'bg-amber-500' 
        };
      case 'Sleeping': 
        return { 
            color: 'text-indigo-400', 
            bg: 'bg-indigo-500/10', 
            icon: Moon, 
            dot: 'bg-indigo-500' 
        };
      default: 
        return { 
            color: 'text-emerald-400', 
            bg: 'bg-emerald-500/10', 
            icon: Circle, 
            dot: 'bg-emerald-500' 
        };
    }
  };

  return (
    <div className="w-64 hidden xl:flex flex-col border-l border-white/5 bg-slate-900/30 p-4 h-[calc(100vh-80px)] sticky top-[80px]">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Shield size={12} /> Housemates ({members.length})
      </h3>

      <div className="space-y-3 overflow-y-auto custom-scrollbar">
         {members.map((member) => {
            const config = getStatusConfig(member.status);
            const StatusIcon = config.icon;
            const isMe = member.id === currentUser?.id;

            return (
              <div key={member.id} className={`p-3 rounded-xl border transition-all ${isMe ? 'bg-slate-800/80 border-slate-700' : 'bg-transparent border-transparent hover:bg-slate-800/30'}`}>
                 <div className="flex items-center gap-3">
                    <div className="relative">
                       {/* Avatar */}
                       <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl shadow-lg border border-white/10">
                          {member.avatar || '😎'}
                       </div>
                       
                       {/* Quiet Mode Badge (Top Right) */}
                       {member.quiet_mode && (
                          <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-1 border-2 border-slate-950 shadow-sm z-10" title="Quiet Mode ON">
                             <VolumeX size={10} className="text-white" />
                          </div>
                       )}
                       
                       {/* Status Dot (Bottom Right) - Now with working colors */}
                       <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${config.dot}`}></div>
                    </div>
                    
                    <div className="min-w-0">
                       <p className={`font-bold text-sm truncate ${isMe ? 'text-white' : 'text-slate-300'}`}>
                          {member.username} {isMe && <span className="opacity-50 text-xs">(You)</span>}
                       </p>
                       <div className="flex items-center gap-1.5 mt-0.5">
                          <p className={`text-[10px] font-bold uppercase tracking-wide ${config.color}`}>
                             {member.status || 'Online'}
                          </p>
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

export default MemberSidebar;