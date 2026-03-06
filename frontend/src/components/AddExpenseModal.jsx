import { useState } from 'react';
import { X, Check, Receipt } from 'lucide-react';
import api from '../api';

const AddExpenseModal = ({ isOpen, onClose, user, household, onAdd }) => {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState(''); // Changed from description to title
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !title) return;

    setLoading(true);
    try {
      // 1. Create Expense
      await api.post(`/expenses/${user.id}/${household.id}`, {
        title: title,
        amount: parseFloat(amount),
        is_settlement: false
      });

      // 2. Add Activity Log
      await api.post('/activity/', {
        household_id: household.id,
        user: user.username,
        action: `added expense: ₹${amount} for ${title}`,
        emoji: '💸',
        time: 'Just now'
      });

      onAdd(); // Refresh data
      onClose();
      setAmount('');
      setTitle('');
    } catch (err) {
      console.error("Failed to add expense", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-in">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="text-blue-400" /> New Expense
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Amount (₹)</label>
            <input 
              type="number" 
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-3xl font-black text-white focus:border-blue-500 focus:outline-none mt-1 placeholder:text-slate-800"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">What for?</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-blue-500 focus:outline-none mt-1 placeholder:text-slate-700"
              placeholder="e.g. Pizza, WiFi, Groceries"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
          >
            {loading ? "Adding..." : <>Split It <Check size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;