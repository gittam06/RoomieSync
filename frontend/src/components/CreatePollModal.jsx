import { useState } from 'react';
import { X, BarChart2, Plus, Trash } from 'lucide-react';
import api from '../api';

const CreatePollModal = ({ isOpen, onClose, household, user, onAdd }) => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index) => {
     if (options.length <= 2) return;
     setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || options.some(o => !o.trim())) return;

    setLoading(true);
    try {
      await api.post(`/polls/${user.id}/${household.id}`, { 
          title, 
          options: options.filter(o => o.trim()),
          poll_type: 'general'
      });
      
      // ✅ Log Activity
      await api.post('/activity/', {
          household_id: household.id,
          user: user.username,
          action: `created a poll: ${title}`,
          emoji: '🗳️',
          time: 'Just now'
       });

      onAdd(); onClose();
      setTitle(''); setOptions(['', '']);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex gap-2"><BarChart2 className="text-purple-400" /> Create Poll</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Question</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none mt-1" placeholder="e.g. Pizza or Sushi?" />
          </div>

          <div>
             <label className="text-xs font-bold text-slate-500 uppercase">Options</label>
             <div className="space-y-2 mt-1">
                {options.map((opt, i) => (
                   <div key={i} className="flex gap-2">
                      <input type="text" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} className="flex-1 bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-purple-500 focus:outline-none" placeholder={`Option ${i+1}`} />
                      {options.length > 2 && <button type="button" onClick={() => removeOption(i)} className="text-slate-600 hover:text-red-400 px-2"><Trash size={16} /></button>}
                   </div>
                ))}
             </div>
             <button type="button" onClick={addOption} className="mt-2 text-xs font-bold text-purple-400 flex items-center gap-1 hover:text-purple-300"><Plus size={14} /> Add Option</button>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-lg transition-all mt-4">
            {loading ? "Creating..." : "Launch Poll"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;