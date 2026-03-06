import { ShoppingCart, Check, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import api from '../api';

const GroceryWidget = ({ items, user, household, onRefresh }) => {
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem) return;
    setLoading(true);
    try {
        await api.post(`/grocery/${user.id}/${household.id}`, { title: newItem });
        await api.post('/activity/', {
           household_id: household.id,
           user: user.username,
           action: `added to grocery: ${newItem}`,
           emoji: '🛒',
           time: 'Just now'
        });
        setNewItem('');
        onRefresh();
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleToggle = async (item) => {
    try {
       await api.put(`/grocery/${item.id}/toggle`);
       if (!item.is_purchased) {
          await api.post('/activity/', {
             household_id: household.id,
             user: user.username,
             action: `bought ${item.title}`,
             emoji: '🛍️',
             time: 'Just now'
          });
       }
       onRefresh();
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
     if(!window.confirm("Delete this item permanently?")) return;
     await api.delete(`/grocery/${id}`);
     onRefresh();
  };

  const clearPurchased = async () => {
    if(!window.confirm("Clear all purchased items?")) return;
    await api.delete(`/grocery/clear/${household.id}`);
    onRefresh();
  };

  const sortedItems = [...items].sort((a, b) => Number(a.is_purchased) - Number(b.is_purchased));

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <ShoppingCart className="text-orange-400" /> Grocery List
          </h3>
          {items.some(i => i.is_purchased) && (
             <button onClick={clearPurchased} className="text-[10px] font-bold bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1.5 rounded-lg transition-colors">
                Clear Done
             </button>
          )}
       </div>

       <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add milk, eggs..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-orange-900/20">
             <Plus size={18} />
          </button>
       </form>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 flex flex-col">
          {sortedItems.length === 0 ? (
             // ✅ COOL EMPTY STATE
             <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5 p-8 text-center group">
                 <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-500">
                    <ShoppingBag size={40} className="text-orange-400 opacity-50" />
                 </div>
                 <h4 className="text-lg font-bold text-white mb-1">Fridge Empty?</h4>
                 <p className="text-sm text-slate-500 max-w-[200px]">
                    Don't starve! Add items above to notify the house.
                 </p>
             </div>
          ) : (
             sortedItems.map((item) => (
                <div key={item.id} className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${item.is_purchased ? 'bg-slate-900/30 border-white/5 opacity-50' : 'bg-slate-800/40 border-white/10 hover:border-orange-500/30'}`}>
                   <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleToggle(item)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${item.is_purchased ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-500 hover:border-orange-400'}`}>
                         {item.is_purchased && <Check size={12} />}
                      </div>
                      <div className="flex flex-col">
                         <span className={`text-sm font-bold ${item.is_purchased ? 'text-slate-500 line-through' : 'text-white'}`}>{item.title}</span>
                         <span className="text-[10px] text-slate-500">Added by {item.added_by?.username || 'Someone'}</span>
                      </div>
                   </div>
                   {!item.is_purchased && (
                      <button onClick={() => handleDelete(item.id)} className="text-slate-600 hover:text-red-400 p-2 transition-colors opacity-0 group-hover:opacity-100">
                         <Trash2 size={14} />
                      </button>
                   )}
                </div>
             ))
          )}
       </div>
    </div>
  );
};

export default GroceryWidget;