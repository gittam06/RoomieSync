import { Plus, ArrowUpRight, History, CheckCircle2 } from 'lucide-react';
import api from '../api';
import { useState } from 'react';

const ExpenseWidget = ({ expenses, onAddClick, household, user, onRefresh }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const handlePayShare = async (shareId) => {
    setLoadingId(shareId);
    try {
      await api.put(`/expenses/share/${shareId}/pay`);
      onRefresh(); // Refresh list to check if settled
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  // Separate Active vs Settled expenses
  const activeExpenses = expenses.filter(e => !e.is_settlement);
  const historyExpenses = expenses.filter(e => e.is_settlement);

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <ArrowUpRight className="text-pink-500" /> Split Expenses
          </h3>
          <div className="flex gap-2">
             <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                title="View Settled Expenses"
             >
                <History size={16} />
             </button>
             <button 
                onClick={onAddClick}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
             >
                <Plus size={20} />
             </button>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          
          {/* HISTORY VIEW (Settled) */}
          {showHistory ? (
             historyExpenses.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-10">No history yet.</p>
             ) : (
                <>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Settled History</p>
                   {historyExpenses.map((expense) => (
                     <div key={expense.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/40 border border-white/5 opacity-60">
                        <div className="flex items-center gap-3">
                           <CheckCircle2 size={16} className="text-emerald-500" />
                           <div>
                              <p className="text-slate-400 font-bold line-through decoration-slate-600">{expense.title}</p>
                              <p className="text-[10px] text-slate-500">
                                 Paid by <span className="text-slate-400">{expense.payer?.username || 'Unknown'}</span>
                              </p>
                           </div>
                        </div>
                        <p className="text-slate-500 font-bold">₹{expense.amount}</p>
                     </div>
                   ))}
                </>
             )
          ) : (
             /* ACTIVE EXPENSES VIEW */
             activeExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 mt-4">
                   <span className="text-4xl mb-4 opacity-50">💸</span>
                   <p className="text-slate-300 font-medium">All settled up!</p>
                   <p className="text-sm text-slate-500 mt-2">No active debts.</p>
                </div>
             ) : (
                activeExpenses.map((expense) => {
                  const isPayer = expense.payer?.id === user.id;
                  
                  // Find MY share (if I am not the payer)
                  const myShare = expense.shares.find(s => s.user_id === user.id);
                  // Find unpaid shares (to show who hasn't paid yet)
                  const unpaidShares = expense.shares.filter(s => !s.is_paid);
                  
                  return (
                    <div key={expense.id} className="p-4 rounded-xl bg-slate-800/40 border border-white/5 group hover:border-white/10 transition-all">
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg shadow-inner">
                                 {expense.payer?.avatar || '😎'}
                              </div>
                              <div>
                                 <p className="text-white font-bold text-sm">{expense.title}</p>
                                 <p className="text-xs text-slate-400">
                                    Paid by <span className="text-white font-medium">{expense.payer?.username || 'Unknown'}</span>
                                 </p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-sm font-bold text-white">₹{expense.amount}</p>
                          </div>
                       </div>

                       {/* DYNAMIC STATUS AREA */}
                       <div className="mt-3 pt-3 border-t border-white/5">
                          {isPayer ? (
                              // IF YOU ARE THE PAYER: Show who owes you
                              <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-400">
                                      Waiting for: <span className="text-orange-400 font-bold">
                                          {unpaidShares.map(s => s.debtor?.username).join(', ') || "Checking..."}
                                      </span>
                                  </p>
                              </div>
                          ) : (
                              // IF YOU ARE A DEBTOR
                              <div className="flex items-center justify-between">
                                  {myShare?.is_paid ? (
                                      <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                          <CheckCircle2 size={14} /> You paid your share
                                      </p>
                                  ) : (
                                      <>
                                          <p className="text-xs text-red-400 font-bold">You owe ₹{myShare?.amount || 0}</p>
                                          {myShare && (
                                              <button 
                                                onClick={() => handlePayShare(myShare.id)}
                                                disabled={loadingId === myShare.id}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                              >
                                                {loadingId === myShare.id ? "Paying..." : "Mark Paid"}
                                              </button>
                                          )}
                                      </>
                                  )}
                              </div>
                          )}
                       </div>
                    </div>
                  );
                })
             )
          )}
       </div>
    </div>
  );
};

export default ExpenseWidget;