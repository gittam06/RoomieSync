import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useState } from 'react';
import api from '../api';

const QuietModeWidget = ({ user, household, onQuietChange }) => {
  const [loading, setLoading] = useState(false);
  const isQuiet = user.quiet_mode;

  const toggleQuiet = async () => {
    setLoading(true);
    try {
      // ✅ Toggle Status. No log created.
      await api.put(`/users/${user.id}`, { quiet_mode: !isQuiet });
      if (onQuietChange) onQuietChange();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-6 flex flex-col justify-center relative overflow-hidden group">
      <div className={`absolute inset-0 opacity-20 transition-colors duration-500 ${isQuiet ? 'bg-purple-600' : 'bg-transparent'}`}></div>

      <div className="relative z-10 flex items-center justify-between">
         <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
               NOISE MODE
            </h3>
            <p className={`text-2xl font-black transition-colors ${isQuiet ? 'text-purple-400' : 'text-white'}`}>
               {isQuiet ? 'SHHH!' : 'Noise OK'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
               {isQuiet ? 'You are requesting silence.' : 'Tap to request silence.'}
            </p>
         </div>

         <button
            onClick={toggleQuiet}
            disabled={loading}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl cursor-pointer ${
               isQuiet 
               ? 'bg-purple-600 text-white shadow-purple-900/50 scale-105' 
               : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
         >
            {loading ? <Loader2 className="animate-spin" /> : (isQuiet ? <VolumeX size={32} /> : <Volume2 size={32} />)}
         </button>
      </div>
    </div>
  );
};

export default QuietModeWidget;