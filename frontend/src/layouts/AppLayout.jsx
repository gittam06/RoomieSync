import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, Wallet, CheckCircle2, MessageCircle, Settings, Bell, LogOut, Copy, Check, Menu, X } from 'lucide-react';
import api from '../api';
import MemberSidebar from '../components/MemberSidebar';

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [activity, setActivity] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { path: '/home', label: 'Home', icon: <Home size={20} /> },
    { path: '/money', label: 'Money', icon: <Wallet size={20} /> },
    { path: '/tasks', label: 'Tasks', icon: <CheckCircle2 size={20} /> },
    { path: '/social', label: 'Social', icon: <MessageCircle size={20} /> },
    { path: '/settings', label: 'More', icon: <Settings size={20} /> },
  ];

  const fetchData = useCallback(async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) { navigate('/'); return; }

      const userRes = await api.get('/users/');
      const currentUser = userRes.data.find(u => u.id === parseInt(userId));
      
      if (!currentUser) { navigate('/'); return; }
      setUser(currentUser);

      if (!currentUser.household_id) {
        navigate('/setup');
        return;
      }

      const houseRes = await api.get(`/households/${currentUser.household_id}`);
      setHousehold(houseRes.data);
      setMembers(houseRes.data.members || []);

    } catch (err) {
      console.error("Layout Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchActivity = useCallback(async () => {
    if (!household?.id) return;
    try {
        const res = await api.get(`/activity/${household.id}`);
        setActivity(res.data || []);
    } catch(e) { console.log("Activity fetch error", e); }
  }, [household?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (household?.id) {
      fetchActivity();
      const interval = setInterval(() => {
          fetchData(); 
          fetchActivity();
      }, 3000); 
      return () => clearInterval(interval);
    }
  }, [household?.id, fetchActivity, fetchData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(household.join_code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading House...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white pb-24 md:pb-0 flex flex-col">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/home" className="text-2xl hover:scale-105 transition-transform">🏠</Link>
            <div>
              <h1 className="font-bold text-sm md:text-base leading-tight">{household?.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">
                  {members.length} Members
                </span>
                <button onClick={copyCode} className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                  {copySuccess ? <Check size={10} /> : <Copy size={10} />}
                  <span>{household?.join_code}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            {tabs.map((tab) => (
              <Link key={tab.path} to={tab.path} className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${location.pathname.includes(tab.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                {tab.icon} {tab.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-bold text-white leading-tight">{user.username}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-lg shadow-lg">
                {user.avatar || '😎'}
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-slate-950/95 backdrop-blur-md z-40 p-6 flex flex-col gap-4 animate-fade-in">
           {tabs.map(tab => (
             <Link key={tab.path} to={tab.path} onClick={() => setMobileMenuOpen(false)} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 text-slate-300 font-bold flex items-center gap-3 active:scale-95 transition-transform">
               {tab.icon} {tab.label}
             </Link>
           ))}
           <button onClick={handleLogout} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-3 mt-auto"><LogOut size={20} /> Log Out</button>
        </div>
      )}

      {/* ✅ NEW LAYOUT: Full Width Flex Container */}
      <div className="flex flex-1 overflow-hidden">
          
          {/* Main Content (Takes remaining space) */}
          <main className="flex-1 px-4 md:px-8 py-8 overflow-y-auto custom-scrollbar relative z-10">
            {/* Center the content max-width */}
            <div className="max-w-[1400px] mx-auto">
               <Outlet context={{ user, household, members, activity, fetchData }} />
            </div>
          </main>

          {/* Right Sidebar (Fixed width, Pinned Right) */}
          <MemberSidebar members={members} currentUser={user} />
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
        <div className="flex justify-around items-center p-2">
           {tabs.map((tab) => (
               <Link key={tab.path} to={tab.path} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${location.pathname.includes(tab.path) ? 'text-blue-400' : 'text-slate-500'}`}>
                 {tab.icon} 
                 {location.pathname.includes(tab.path) && <div className="w-1 h-1 rounded-full bg-blue-500 mt-1"></div>}
               </Link>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;