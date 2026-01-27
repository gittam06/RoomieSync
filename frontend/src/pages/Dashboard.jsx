// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ExpenseWidget from '../components/ExpenseWidget';
import ChoreWidget from '../components/ChoreWidget';
import StatusWidget from '../components/StatusWidget';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  
  // State for onboarding forms
  const [houseName, setHouseName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            navigate('/');
            return;
        }

        try {
            const response = await api.get('/users/');
            const currentUser = response.data.find(u => u.id === parseInt(userId));
            
            if (!currentUser) {
                navigate('/'); 
                return;
            }
            setUser(currentUser);

            if (currentUser.household_id) {
                try {
                    const houseRes = await api.get(`/households/${currentUser.household_id}`);
                    setHousehold(houseRes.data);
                } catch (err) {
                    setHousehold({ id: currentUser.household_id, join_code: "ERROR" });
                }
            }
        } catch (error) {
            navigate('/');
        }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const createHousehold = async () => {
    if (!houseName) return;
    try {
        const res = await api.post(`/households/create/${user.id}`, { name: houseName });
        setHousehold(res.data); 
        alert(`House Created! Your Code: ${res.data.join_code}`);
    } catch (err) {
        alert("Error creating house");
    }
  };

  const joinHousehold = async () => {
    if (!joinCode) return;
    try {
        const res = await api.post(`/households/join/${user.id}?code=${joinCode}`);
        setHousehold(res.data.household); 
        alert("Joined successfully!");
    } catch (err) {
        alert("Invalid Code!");
    }
  };

  // --- LOADING ---
  if (!user) return <div className="min-h-screen bg-slate-900 text-white p-10 flex justify-center items-center">Loading RoomieSync...</div>;

  // --- ONBOARDING ---
  if (!user.household_id && !household) {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold mb-2 text-blue-400 text-center">Welcome, {user.username}!</h1>
            <p className="mb-8 text-slate-400 text-center">You aren't in a flat yet. Let's get you settled.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🏠 Create a New Flat</h2>
                    <input 
                        type="text" placeholder="Flat Name (e.g. The Boys Hostel)"
                        className="w-full p-3 mb-4 bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                        value={houseName} onChange={(e) => setHouseName(e.target.value)}
                    />
                    <button onClick={createHousehold} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold transition">Create Flat</button>
                </div>

                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-emerald-500 transition shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🔑 Join Existing Flat</h2>
                    <input 
                        type="text" placeholder="Enter Join Code"
                        className="w-full p-3 mb-4 bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500"
                        value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
                    />
                    <button onClick={joinHousehold} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded font-bold transition">Join Flat</button>
                </div>
            </div>
            <button onClick={handleLogout} className="mt-10 text-slate-500 hover:text-slate-300 underline transition">Logout</button>
        </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6">
      {/* Responsive Navbar: Stacks on mobile, Row on Desktop */}
      <nav className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700 gap-4">
        <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">RoomieSync</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
                House Code: 
                <span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded border border-slate-600 select-all">
                    {household?.join_code || "Loading..."}
                </span>
            </p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-200 font-bold">{user.username}</p>
            <p className="text-xs text-emerald-400">Online</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm transition border border-red-500/20"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Grid: 1 col on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 h-full">
           <ExpenseWidget user={user} household={household || {id: user.household_id}} />
        </div>
        <div className="col-span-1 h-full">
           <ChoreWidget household={household || {id: user.household_id}} />
        </div>
        <div className="col-span-1 h-full">
           <StatusWidget user={user} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;