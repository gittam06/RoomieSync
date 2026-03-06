import { useOutletContext } from 'react-router-dom';
import { User, Home, Copy, Check, LogOut, AlertTriangle, Edit2, Save, X } from 'lucide-react';
import { useState } from 'react';
import api from '../api';

const AVATARS = ["😎", "👻", "🤖", "👽", "💩", "🦄", "🦁", "🐶", "🐱", "🐼", "🦊", "🐨"];

const More = () => {
  const { user, household, fetchData } = useOutletContext();
  
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Local state for editing
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    avatar: user.avatar || "😎"
  });

  // 1. LEAVE HOUSE LOGIC (The Fix)
  const handleLeaveHousehold = async () => {
    if (!window.confirm("Are you sure? This will remove you from the house.")) return;
    try {
        // ✅ The Logic: Calls the PUT endpoint correctly
        await api.put(`/users/${user.id}/leave_household`);
        // ✅ The Refresh: Reloads app so you end up at the "Join House" screen
        window.location.reload(); 
    } catch (e) { console.error("Failed to leave:", e); }
  };

  // 2. COPY CODE LOGIC
  const copyCode = () => {
    if (household?.join_code) {
        navigator.clipboard.writeText(household.join_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  // 3. SAVE PROFILE LOGIC
  const handleSaveProfile = async () => {
      setLoading(true);
      try {
          // Update avatar
          if (formData.avatar !== user.avatar) {
              await api.put(`/users/${user.id}/avatar`, null, { params: { avatar: formData.avatar } });
          }
          // Update details
          await api.put(`/users/${user.id}/profile`, { 
              username: formData.username, 
              email: formData.email 
          });
          
          await fetchData(); // Refresh global user data
          setIsEditing(false);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-up pb-10">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* LEFT COLUMN: PROFILE */}
         <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm h-fit">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="text-purple-400" /> Your Profile
                </h2>
                <button 
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                        isEditing 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    {loading ? "Saving..." : (isEditing ? "Save Changes" : "Edit Profile")}
                </button>
            </div>

            {/* Avatar Slider */}
            <div className="mb-8">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Avatar</label>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {AVATARS.map((av) => (
                        <button 
                            key={av}
                            onClick={() => isEditing && setFormData({...formData, avatar: av})}
                            disabled={!isEditing}
                            className={`text-4xl w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all border-2 ${
                                formData.avatar === av 
                                ? 'bg-slate-800 border-purple-500 scale-110 shadow-lg shadow-purple-900/20' 
                                : 'bg-transparent border-transparent opacity-50 hover:opacity-100'
                            }`}
                        >
                            {av}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Username</label>
                    <input 
                        type="text" 
                        value={formData.username}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className={`w-full bg-slate-950 border rounded-xl p-4 text-white transition-all ${isEditing ? 'border-purple-500/50 focus:outline-none focus:border-purple-500' : 'border-white/5 text-slate-400'}`}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
                    <input 
                        type="email" 
                        value={formData.email}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full bg-slate-950 border rounded-xl p-4 text-white transition-all ${isEditing ? 'border-purple-500/50 focus:outline-none focus:border-purple-500' : 'border-white/5 text-slate-400'}`}
                    />
                </div>
            </div>
         </div>


         {/* RIGHT COLUMN: HOUSE & DANGER */}
         <div className="flex flex-col gap-8">
            
            {/* HOUSE DETAILS */}
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    <Home className="text-blue-400" /> House Details
                </h2>
                
                <div className="space-y-6">
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">House Name</p>
                            <p className="text-lg font-bold text-white mt-1">{household?.name}</p>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                           <Home size={20} />
                        </div>
                    </div>

                    <div 
                        onClick={copyCode}
                        className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center cursor-pointer hover:border-emerald-500/30 transition-colors group"
                    >
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Invite Code</p>
                            <p className="text-2xl font-mono font-bold text-emerald-400 mt-1 tracking-widest">{household?.join_code}</p>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                           {copied ? <Check size={20} /> : <Copy size={20} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-slate-900/50 border border-red-500/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                <h2 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} /> Danger Zone
                </h2>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    Moving out? This will remove you from the house, settle your pending karma, and reset your status.
                </p>
                
                <button 
                    onClick={handleLeaveHousehold}
                    className="w-full py-4 rounded-xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <LogOut size={18} /> Leave House
                </button>
            </div>

         </div>

      </div>
      
      <div className="text-center text-xs text-slate-600 mt-12">
         RoomieSync v1.0 • Built for Peace ✌️
      </div>

    </div>
  );
};

export default More;