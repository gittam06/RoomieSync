import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import AnalyticsWidget from '../components/AnalyticsWidget';
import ExpenseWidget from '../components/ExpenseWidget';
import BillWidget from '../components/BillWidget';
import AddExpenseModal from '../components/AddExpenseModal';
import AddBillModal from '../components/AddBillModal';

const Money = () => {
  const { user, household } = useOutletContext();
  
  // State for data
  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // State for modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  // Fetch all financial data
  const fetchFinancials = useCallback(async () => {
    if (!household?.id) return;
    try {
      const [expRes, billRes, anaRes] = await Promise.all([
        api.get(`/expenses/${household.id}`),
        api.get(`/bills/${household.id}`),
        api.get(`/expenses/analytics/${household.id}`)
      ]);
      
      setExpenses(expRes.data.reverse()); // Show newest first
      setBills(billRes.data);
      setAnalytics(anaRes.data);
    } catch (err) {
      console.error("Error loading money data:", err);
    }
  }, [household?.id]);

  // ✅ NEW: Auto-Refresh every 3 seconds (The "Instant" Fix)
  useEffect(() => {
    fetchFinancials(); // Fetch immediately on load

    const interval = setInterval(() => {
      fetchFinancials();
    }, 3000); // Check for updates every 3 seconds

    return () => clearInterval(interval); // Cleanup when leaving page
  }, [fetchFinancials]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
      
      {/* LEFT COLUMN: Analytics */}
      <div className="flex flex-col gap-6">
         <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
            <AnalyticsWidget user={user} data={analytics} />
         </div>
      </div>

      {/* RIGHT COLUMN: Action Lists */}
      <div className="flex flex-col gap-6">
        {/* Expenses List */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm h-[400px]">
          <ExpenseWidget 
            expenses={expenses} 
            onAddClick={() => setIsExpenseModalOpen(true)} 
            household={household}
            user={user}
            onRefresh={fetchFinancials} 
          />
        </div>
        
        {/* Bills List */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm h-[300px]">
          <BillWidget 
            bills={bills} 
            onAddClick={() => setIsBillModalOpen(true)} 
            onRefresh={fetchFinancials} 
          />
        </div>
      </div>

      {/* MODALS */}
      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)}
        user={user}
        household={household}
        onAdd={fetchFinancials}
      />

      <AddBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        household={household}
        onAdd={fetchFinancials}
      />

    </div>
  );
};

export default Money;