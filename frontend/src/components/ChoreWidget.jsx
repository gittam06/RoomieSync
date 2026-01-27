// frontend/src/components/ChoreWidget.jsx
import { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react'; 
import api from '../api';

const ChoreWidget = ({ household }) => {
  const [chores, setChores] = useState([]);
  const [task, setTask] = useState('');

  const fetchChores = async () => {
    try {
        const res = await api.get(`/chores/${household.id}`);
        setChores(res.data);
    } catch (err) {
        console.error("Failed to load chores");
    }
  };

  useEffect(() => {
    if (household?.id) {
        fetchChores();
        const interval = setInterval(fetchChores, 2000);
        return () => clearInterval(interval);
    }
  }, [household]);

  const addChore = async (e) => {
    e.preventDefault();
    if (!task) return;

    try {
        const res = await api.post(`/chores/${household.id}`, {
            title: task,
            points: 10
        });
        setChores([...chores, res.data]); 
        setTask('');
    } catch (err) {
        alert("Failed to add chore");
    }
  };

  const toggleChore = async (choreId) => {
    const updatedChores = chores.map(c => 
        c.id === choreId ? { ...c, is_completed: !c.is_completed } : c
    );
    setChores(updatedChores);

    try {
        await api.put(`/chores/${choreId}/toggle`);
    } catch (err) {
        console.error("Failed to toggle chore");
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-full flex flex-col min-h-[400px]">
      <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
        🧹 Chore Wars
      </h3>
      
      {/* RESPONSIVE FORM */}
      <form onSubmit={addChore} className="flex gap-2 mb-6">
        <input 
          type="text" placeholder="Task (e.g. Clean Kitchen)" 
          value={task} onChange={(e) => setTask(e.target.value)}
          className="bg-slate-900 border border-slate-600 rounded p-3 flex-grow text-white focus:border-purple-500 outline-none transition w-full"
        />
        <button type="submit" className="bg-purple-600 px-6 rounded font-bold hover:bg-purple-500 transition shadow-lg shadow-purple-600/20">+</button>
      </form>

      <div className="space-y-3 overflow-y-auto flex-grow custom-scrollbar max-h-60 sm:max-h-80 pr-1">
        {chores.length === 0 && <p className="text-slate-500 text-center py-4">No chores yet. Relax!</p>}
        
        {[...chores].reverse().map((chore) => (
            <div 
                key={chore.id} 
                onClick={() => toggleChore(chore.id)}
                className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-all border border-transparent ${
                    chore.is_completed ? 'bg-slate-800 opacity-50' : 'bg-slate-700/30 hover:bg-slate-700 hover:border-slate-600'
                }`}
            >
                {chore.is_completed ? 
                    <CheckCircle className="text-emerald-500 w-6 h-6 flex-shrink-0" /> : 
                    <Circle className="text-slate-400 w-6 h-6 flex-shrink-0" />
                }
                
                <div className="flex-grow min-w-0">
                    <p className={`font-medium truncate ${chore.is_completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {chore.title}
                    </p>
                    <p className="text-xs text-slate-400">10 XP</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ChoreWidget;