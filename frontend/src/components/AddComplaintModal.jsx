// frontend/src/components/AddComplaintModal.jsx

import { useState } from 'react';
import { X, AlertTriangle, Ghost } from 'lucide-react';
import api from '../api';

const AddComplaintModal = ({ isOpen, onClose, household, user, onAdd }) => {
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;
    setLoading(true);
    try {
      // 1. Create the Complaint
      await api.post(`/complaints/${user.id}/${household.id}`, { 
          message, 
          is_anonymous: isAnonymous 
      });

      // 2. ✅ Log Activity (This ensures it appears on the Home Page)
      await api.post('/activity/', {
        household_id: household.id,
        user: isAnonymous ? "Anonymous" : user.username,
        action: `filed a complaint`,
        emoji: '😤',
        time: 'Just now'
      });

      onAdd(); onClose(); setMessage(''); setIsAnonymous(false);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex gap-2"><AlertTriangle className="text-red-400" /> File Complaint</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-red-500 focus:outline-none min-h-[120px]" placeholder="What's bothering you?" />
          <div onClick={() => setIsAnonymous(!isAnonymous)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isAnonymous ? 'bg-slate-800 border-white/20' : 'border-transparent hover:bg-slate-800/50'}`}>
             <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isAnonymous ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-500'}`}><Ghost size={20} /></div>
             <div><p className="text-sm font-bold text-white">Go Anonymous</p><p className="text-xs text-slate-400">Hide your identity</p></div>
             <div className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center ${isAnonymous ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>{isAnonymous && <div className="w-2 h-2 bg-white rounded-full" />}</div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-lg transition-all mt-4">{loading ? "Submitting..." : "Submit Complaint"}</button>
        </form>
      </div>
    </div>
  );
};

export default AddComplaintModal;