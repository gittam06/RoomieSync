import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowRight, Home } from 'lucide-react';
import api from '../api';

const Setup = () => {
  const navigate = useNavigate();
  const [houseName, setHouseName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const userId = localStorage.getItem('user_id');

  const createHousehold = async (e) => {
    e.preventDefault();
    if (!houseName) return;
    setLoading(true);
    try {
        const res = await api.post('/households/', { name: houseName });
        // Link user to the new house
        await api.put(`/users/${userId}/household/${res.data.id}`);
        navigate('/home'); 
    } catch (err) { 
        setError("Failed to create house. Try a different name."); 
    } finally {
        setLoading(false);
    }
  };

  const joinHousehold = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    setLoading(true);
    try {
        const allHouses = await api.get('/households/');
        const targetHouse = allHouses.data.find(h => h.join_code === joinCode);
        
        if (targetHouse) {
            await api.put(`/users/${userId}/household/${targetHouse.id}`);
            navigate('/home');
        } else { 
            setError("Invalid House Code! Ask your roommate again."); 
        }
    } catch (err) { 
        setError("Failed to join house."); 
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
       
       {/* Background Effects */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-float"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
       </div>

       <div className="text-center space-y-4 mb-12 relative z-10 animate-fade-up">
          <div className="inline-block p-3 rounded-full bg-slate-900 border border-white/10 mb-4 shadow-xl">
            <Home size={32} className="text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Welcome to RoomieSync
          </h1>
          <p className="text-slate-400 text-lg">Let's get you moved in. Choose your path:</p>
       </div>
       
       <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl relative z-10">
           
           {/* CREATE CARD */}
           <div className="flex-1 p-8 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-white/10 flex flex-col items-center text-center hover:border-blue-500/50 transition-all group animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform"><Plus size={32} /></div>
              <h3 className="text-2xl font-bold mb-2">Create a Squad</h3>
              <p className="text-slate-400 mb-8 text-sm">Start a fresh dashboard for your apartment. You'll get a code to invite others.</p>
              
              <form onSubmit={createHousehold} className="w-full mt-auto">
                  <input 
                    type="text" 
                    placeholder="House Name (e.g. The Boys)" 
                    value={houseName} 
                    onChange={(e) => setHouseName(e.target.value)} 
                    className="w-full p-4 mb-4 rounded-xl bg-slate-950/50 border border-white/10 focus:border-blue-500 focus:outline-none text-white transition-all placeholder:text-slate-600" 
                  />
                  <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                    {loading ? "Creating..." : <>Create House <ArrowRight size={18} /></>}
                  </button>
              </form>
           </div>
           
           {/* JOIN CARD */}
           <div className="flex-1 p-8 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-white/10 flex flex-col items-center text-center hover:border-emerald-500/50 transition-all group animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform"><Users size={32} /></div>
              <h3 className="text-2xl font-bold mb-2">Join Existing Squad</h3>
              <p className="text-slate-400 mb-8 text-sm">Moving into an existing setup? Enter the 4-letter invite code here.</p>
              
              <form onSubmit={joinHousehold} className="w-full mt-auto">
                   <input 
                    type="text" 
                    placeholder="Enter 4-Letter Code" 
                    value={joinCode} 
                    onChange={(e) => setJoinCode(e.target.value)} 
                    className="w-full p-4 mb-4 rounded-xl bg-slate-950/50 border border-white/10 focus:border-emerald-500 focus:outline-none text-white text-center font-mono text-xl tracking-widest transition-all uppercase placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal placeholder:font-sans" 
                    maxLength={4} 
                   />
                   <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                     {loading ? "Joining..." : <>Join House <ArrowRight size={18} /></>}
                   </button>
              </form>
           </div>
       </div>

       {error && (
         <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold animate-bounce-in">
            ⚠️ {error}
         </div>
       )}
    </div>
  );
};
export default Setup;