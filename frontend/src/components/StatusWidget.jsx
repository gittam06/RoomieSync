import { useState } from 'react';
import { Circle, Moon, BookOpen, Coffee } from 'lucide-react';
import api from '../api';

const StatusWidget = ({ user, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const statuses = [
    { id: 'Online', icon: Circle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { id: 'Busy', icon: Circle, color: 'text-red-400', bg: 'bg-red-500/20' },
    { id: 'Studying', icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { id: 'Sleeping', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  ];

  const updateStatus = async (statusId) => {
    if (user.status === statusId) return;
    setLoading(true);
    try {
      // ✅ JUST UPDATE THE USER. The Sidebar will catch the change automatically.
      await api.put(`/users/${user.id}`, { status: statusId });
      
      // Refresh the app so the Sidebar updates instantly
      if (onStatusChange) onStatusChange(); 

    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-6 flex flex-col justify-center">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
        MY STATUS
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {statuses.map((s) => (
          <button
            key={s.id}
            onClick={() => updateStatus(s.id)}
            disabled={loading}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              user.status === s.id 
                ? `${s.bg} border-white/10 shadow-lg scale-105` 
                : 'bg-slate-800/40 border-transparent hover:bg-slate-800 hover:border-white/5 opacity-50 hover:opacity-100'
            }`}
          >
            <s.icon size={16} className={s.color} fill={user.status === s.id && s.id !== 'Studying' ? 'currentColor' : 'none'} />
            <span className={`text-sm font-bold ${user.status === s.id ? 'text-white' : 'text-slate-400'}`}>
              {s.id}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusWidget;