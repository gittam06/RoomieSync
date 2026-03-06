import { useState } from 'react';
import { X, Check, Package } from 'lucide-react';
import api from '../api';

const AddInventoryModal = ({ isOpen, onClose, household, onAdd }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      await api.post(`/inventory/${household.id}`, { name, quantity: parseInt(quantity), unit, status: 'ok' });
      onAdd(); onClose();
      setName(''); setQuantity(1);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex gap-2"><Package className="text-cyan-400" /> Add Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Item Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none mt-1" placeholder="e.g. Dish Soap" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Quantity</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none mt-1" />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none mt-1">
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="bottles">Bottles</option>
                    <option value="kg">Kg</option>
                    <option value="rolls">Rolls</option>
                </select>
             </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-lg transition-all flex items-center justify-center gap-2 mt-4">
            {loading ? "Adding..." : "Add to Inventory"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;