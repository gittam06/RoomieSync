import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import ChoreWidget from '../components/ChoreWidget';
import GroceryWidget from '../components/GroceryWidget';
import InventoryWidget from '../components/InventoryWidget';
import AddChoreModal from '../components/AddChoreModal';
import AddInventoryModal from '../components/AddInventoryModal';

const Tasks = () => {
  const { user, household } = useOutletContext();
  
  const [chores, setChores] = useState([]);
  const [grocery, setGrocery] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  const [choreModalOpen, setChoreModalOpen] = useState(false);
  const [invModalOpen, setInvModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!household?.id) return;
    try {
        const [choreRes, grocRes, invRes] = await Promise.all([
            api.get(`/chores/${household.id}`),
            api.get(`/grocery/${household.id}`),
            api.get(`/inventory/${household.id}`)
        ]);
        setChores(choreRes.data);
        setGrocery(grocRes.data);
        setInventory(invRes.data);
    } catch(e) { console.error(e); }
  }, [household?.id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Auto-refresh logic
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
      {/* CHORES */}
      <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm h-[500px]">
        <ChoreWidget 
            chores={chores} 
            user={user} 
            onAddClick={() => setChoreModalOpen(true)} 
            onRefresh={fetchData} 
        />
      </div>

      {/* GROCERY */}
      <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm h-[500px]">
        <GroceryWidget 
            items={grocery} 
            user={user} 
            household={household} 
            onRefresh={fetchData} 
        />
      </div>

      {/* INVENTORY */}
      <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm h-[500px]">
        <InventoryWidget 
            items={inventory} 
            onAddClick={() => setInvModalOpen(true)} 
            onRefresh={fetchData} 
        />
      </div>

      {/* MODALS */}
      <AddChoreModal 
        isOpen={choreModalOpen} 
        onClose={() => setChoreModalOpen(false)} 
        household={household} 
        onAdd={fetchData} 
      />
      <AddInventoryModal 
        isOpen={invModalOpen} 
        onClose={() => setInvModalOpen(false)} 
        household={household} 
        onAdd={fetchData} 
      />
    </div>
  );
};

export default Tasks;