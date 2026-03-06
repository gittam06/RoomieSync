import { Receipt, Plus, AlertTriangle, History, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import api from '../api';

const BillWidget = ({ bills, onAddClick, onRefresh }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const handlePay = async (id) => {
    setLoadingId(id);
    try {
      await api.put(`/bills/${id}/pay`);
      onRefresh(); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const getStatus = (dateStr) => {
    if (!dateStr) return { text: 'No Date', color: 'text-slate-500', bg: 'border-slate-500' };
    
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return { text: 'DUE TODAY!', color: 'text-orange-400', bg: 'border-orange-500' };
    if (dateStr < today) return { text: 'OVERDUE', color: 'text-red-500', bg: 'border-red-500' };
    return { text: `Due: ${dateStr}`, color: 'text-emerald-400', bg: 'border-emerald-500' };
  };

  // 1. Separate Active vs Paid bills
  const activeBills = bills.filter(b => !b.is_paid);
  const historyBills = bills.filter(b => b.is_paid);

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <Receipt className="text-emerald-400" /> Bills & Rent
          </h3>
          <div className="flex gap-2">
             <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                title="View History"
             >
                <History size={16} />
             </button>
             <button 
                onClick={onAddClick}
                className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 flex items-center gap-1"
             >
                <Plus size={14} /> Add
             </button>
          </div>
       </div>

       {/* VIEW TOGGLE */}
       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          
          {/* STATE 1: HISTORY VIEW */}
          {showHistory ? (
             historyBills.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-10">No payment history yet.</p>
             ) : (
                <>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Paid History</p>
                   {historyBills.map((bill) => (
                     <div key={bill.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/40 border border-white/5 opacity-60">
                        <div className="flex items-center gap-3">
                           <CheckCircle2 size={16} className="text-slate-500" />
                           <div>
                              <p className="text-slate-400 font-bold line-through decoration-slate-600">{bill.title}</p>
                              <p className="text-[10px] text-slate-600">Paid</p>
                           </div>
                        </div>
                        <p className="text-slate-500 font-bold">₹{bill.amount}</p>
                     </div>
                   ))}
                </>
             )
          ) : (
             /* STATE 2: ACTIVE BILLS VIEW */
             activeBills.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 mt-4">
                  <span className="text-4xl mb-4 opacity-50">🎉</span>
                  <p className="text-slate-300 font-medium">All bills paid!</p>
                  <p className="text-sm text-slate-500 mt-2">Nothing due right now.</p>
               </div>
             ) : (
               activeBills.map((bill) => {
                 const status = getStatus(bill.due_date);
                 return (
                   <div key={bill.id} className={`flex justify-between items-center p-4 rounded-xl bg-slate-800/40 border border-white/5 border-l-4 ${status.bg}`}>
                      <div>
                         <p className="text-white font-bold">{bill.title}</p>
                         <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${status.color}`}>
                            {status.text === 'OVERDUE' && <AlertTriangle size={12} />}
                            {status.text}
                         </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <p className="text-xl font-bold text-white">₹{bill.amount}</p>
                         <button 
                           onClick={() => handlePay(bill.id)}
                           disabled={loadingId === bill.id}
                           className="text-xs bg-slate-700 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg transition-colors font-bold"
                         >
                           {loadingId === bill.id ? "..." : "Pay"}
                         </button>
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

export default BillWidget;