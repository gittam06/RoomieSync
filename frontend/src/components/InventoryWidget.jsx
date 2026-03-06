import { Package, Plus, Minus, Trash2, Box } from 'lucide-react';
import api from '../api';

const InventoryWidget = ({ items, onAddClick, onRefresh }) => {
  
  const updateQty = async (id, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 0) return;
    try {
        await api.put(`/inventory/${id}`, { quantity: newQty });
        onRefresh();
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Remove this item?")) return;
      await api.delete(`/inventory/${id}`);
      onRefresh();
  };

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <Package className="text-cyan-400" /> Inventory
          </h3>
          <button onClick={onAddClick} className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 transition-colors border border-cyan-500/20">
             + Item
          </button>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 flex flex-col">
          {items.length === 0 ? (
             // ✅ COOL EMPTY STATE
             <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5 p-8 text-center group">
                 <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Box size={40} className="text-cyan-400 opacity-50" />
                 </div>
                 <h4 className="text-lg font-bold text-white mb-1">Stockpile Empty</h4>
                 <p className="text-sm text-slate-500 max-w-[200px]">
                    Toilet paper? Dish soap? Track shared supplies here.
                 </p>
                 <button 
                   onClick={onAddClick}
                   className="mt-6 text-xs font-bold bg-slate-800 hover:bg-cyan-600 text-cyan-400 hover:text-white px-4 py-2 rounded-lg transition-all border border-cyan-500/20"
                >
                   Add First Item
                </button>
             </div>
          ) : (
             items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-800/40 border border-white/5">
                   <div>
                      <p className="text-white font-bold text-sm">{item.name}</p>
                      <p className={`text-[10px] font-bold uppercase mt-0.5 ${item.quantity === 0 ? 'text-red-500' : (item.quantity <= 1 ? 'text-orange-400' : 'text-emerald-400')}`}>
                         {item.quantity === 0 ? 'Out of Stock' : (item.quantity <= 1 ? 'Low Stock' : 'In Stock')}
                      </p>
                   </div>
                   
                   <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-1 border border-white/5">
                      <button onClick={() => updateQty(item.id, item.quantity, -1)} className="p-1 hover:text-white text-slate-400 transition-colors"><Minus size={14} /></button>
                      <span className="text-sm font-mono w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity, 1)} className="p-1 hover:text-white text-slate-400 transition-colors"><Plus size={14} /></button>
                   </div>
                   <button onClick={() => handleDelete(item.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
             ))
          )}
       </div>
    </div>
  );
};

export default InventoryWidget;