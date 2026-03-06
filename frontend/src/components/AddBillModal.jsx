import { useState } from 'react';
import { X, Check, Calendar } from 'lucide-react';
import api from '../api';

const AddBillModal = ({ isOpen, onClose, household, onAdd }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !title) return;

    setLoading(true);
    try {
      await api.post(`/bills/${household.id}`, {
        title: title,
        amount: parseFloat(amount),
        due_date: dueDate,
        is_recurring: true,
        frequency: "monthly"
      });

      // Log Activity
      await api.post('/activity/', {
        household_id: household.id,
        user: "House System",
        action: `added a new bill: ${title} (₹${amount})`,
        emoji: '🧾',
        time: 'Just now'
      });

      onAdd();
      onClose();
      setTitle(''); setAmount(''); setDueDate('');
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
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-emerald-400" /> Add Bill
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Bill Name</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none mt-1" placeholder="e.g. Electricity" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none mt-1" placeholder="0" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none mt-1" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-900/20">
            {loading ? "Saving..." : <>Save Bill <Check size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBillModal;