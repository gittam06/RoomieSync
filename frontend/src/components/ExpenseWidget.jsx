// frontend/src/components/ExpenseWidget.jsx
import { useState, useEffect } from 'react';
import api from '../api';

const ExpenseWidget = ({ user, household }) => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const fetchExpenses = async () => {
    try {
        const res = await api.get(`/expenses/${household.id}`);
        setExpenses(res.data);
    } catch (err) {
        console.error("Failed to load expenses");
    }
  };

  useEffect(() => {
    if (household?.id) {
        fetchExpenses();
        const interval = setInterval(fetchExpenses, 2000);
        return () => clearInterval(interval);
    }
  }, [household]);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
        const res = await api.post(`/expenses/${user.id}/${household.id}`, {
            title: title,
            amount: parseFloat(amount)
        });
        setExpenses([...expenses, { ...res.data, payer: user }]);
        setTitle('');
        setAmount('');
    } catch (err) {
        alert("Failed to add expense");
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-full flex flex-col min-h-[400px]">
      <h3 className="text-xl font-bold mb-4 text-emerald-400">💰 Shared Expenses</h3>
      
      {/* RESPONSIVE FORM: Stacks on mobile, Row on tablet+ */}
      <form onSubmit={addExpense} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input 
          type="text" placeholder="Item (e.g. Milk)" 
          value={title} onChange={(e) => setTitle(e.target.value)}
          className="bg-slate-900 border border-slate-600 rounded p-3 flex-grow text-white focus:border-emerald-500 outline-none transition"
        />
        <div className="flex gap-2">
            <input 
              type="number" placeholder="₹" 
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded p-3 w-full sm:w-24 text-white focus:border-emerald-500 outline-none transition"
            />
            <button type="submit" className="bg-emerald-600 px-6 py-3 rounded font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20">+</button>
        </div>
      </form>

      {/* Expense List */}
      <div className="space-y-3 overflow-y-auto flex-grow custom-scrollbar max-h-60 sm:max-h-80 pr-1">
        {expenses.length === 0 && <p className="text-slate-500 text-center py-4">No expenses yet.</p>}
        
        {[...expenses].reverse().map((exp) => (
            <div key={exp.id} className="flex justify-between items-center bg-slate-700/30 border border-slate-700 p-3 rounded hover:bg-slate-700/50 transition">
                <div>
                    <p className="font-bold text-white text-sm sm:text-base">{exp.title}</p>
                    <p className="text-xs text-slate-400">
                        Paid by {exp.payer_id === user.id ? "You" : (exp.payer ? exp.payer.username : "Unknown")}
                    </p>
                </div>
                <span className="text-emerald-400 font-mono font-bold">₹{exp.amount}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseWidget;