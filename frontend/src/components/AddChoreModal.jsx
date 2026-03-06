import { useState } from 'react';
import { X, Check, Star } from 'lucide-react';
import api from '../api';

const AddChoreModal = ({ isOpen, onClose, household, onAdd }) => {
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState(50);
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      await api.post(`/chores/${household.id}`, {
        title,
        points: parseInt(points),
        assignee_id: assigneeId ? parseInt(assigneeId) : null,
        due_date: dueDate
      });

      // Log it
      await api.post('/activity/', {
        household_id: household.id,
        user: "House System",
        action: `added chore: ${title} (${points} pts)`,
        emoji: '🧹',
        time: 'Just now'
      });

      onAdd();
      onClose();
      setTitle(''); setPoints(50); setAssigneeId(''); setDueDate('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add New Chore</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Chore Name</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none mt-1" placeholder="e.g. Wash Dishes" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Points Reward</label>
                <div className="relative mt-1">
                    <Star size={16} className="absolute left-3 top-3.5 text-yellow-400" fill="currentColor" />
                    <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-9 text-white focus:border-purple-500 focus:outline-none" />
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none mt-1" />
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Assign To (Optional)</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none mt-1">
                <option value="">Anyone</option>
                {household?.members?.map(m => (
                    <option key={m.id} value={m.id}>{m.username}</option>
                ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-purple-900/20">
            {loading ? "Adding..." : <>Create Chore <Check size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddChoreModal;