import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle } from 'lucide-react';
import api from '../api';

const MoveOutWidget = ({ user, household }) => {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLeave = async () => {
    setLoading(true);
    try {
      // Calls the backend that settles expenses, bills, logs activity, and removes from house
      await api.put(`/users/${user.id}/leave_household`);
      // Refresh to force redirect to Setup page
      window.location.href = '/setup';
    } catch (err) {
      console.error("Failed to leave house", err);
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className="p-8 bg-red-500/10 h-full flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
        <p className="text-slate-400 text-sm mb-6">
          You will be removed from <span className="text-white font-bold">{household.name}</span>.
          You'll need an invite code to rejoin.
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white transition-colors"
          >
            Stay
          </button>
          <button
            onClick={handleLeave}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white transition-colors"
          >
            {loading ? "Leaving..." : "Yes, Leave"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4">
          <AlertTriangle size={20} /> Danger Zone
        </h3>
        <p className="text-slate-400 leading-relaxed text-sm">
          Moving out? This will remove you from the house, settle your pending karma, and reset your status.
        </p>
      </div>

      <button
        onClick={() => setConfirming(true)}
        className="w-full mt-6 py-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 font-bold transition-all flex items-center justify-center gap-2 group"
      >
        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
        Leave House
      </button>
    </div>
  );
};

export default MoveOutWidget;