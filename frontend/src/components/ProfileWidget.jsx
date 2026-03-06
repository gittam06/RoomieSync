import { useState } from 'react';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import api from '../api';

const ProfileWidget = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email || '',
    avatar: user.avatar || '😎'
  });

  const emojis = ['😎', '👻', '🤖', '👽', '💩', '🦄', '🦁', '🐱', '🐶', '🦊'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${user.id}`, formData);
      await onUpdate(); // Refresh global data
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-8 flex flex-col">
      <div className="flex items-center justify-between mb-8">
         <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-purple-400" /> Your Profile
         </h3>
         {!isEditing && (
           <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
             Edit Profile
           </button>
         )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
         {/* Avatar Selection */}
         <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {emojis.map(emo => (
              <button
                key={emo}
                type="button"
                disabled={!isEditing}
                onClick={() => setFormData({...formData, avatar: emo})}
                className={`flex-shrink-0 w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  formData.avatar === emo 
                    ? 'bg-purple-600 scale-110 shadow-lg shadow-purple-900/50' 
                    : 'bg-slate-800/50 hover:bg-slate-700/50'
                } ${!isEditing && 'opacity-50 cursor-default'}`}
              >
                {emo}
              </button>
            ))}
         </div>

         <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-xs uppercase font-bold text-slate-500">Username</label>
               <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                  <User size={18} className="text-slate-500" />
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    disabled={!isEditing}
                    className="bg-transparent w-full text-white font-medium focus:outline-none disabled:text-slate-400"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs uppercase font-bold text-slate-500">Email</label>
               <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                  <Mail size={18} className="text-slate-500" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className="bg-transparent w-full text-white font-medium focus:outline-none disabled:text-slate-400"
                  />
               </div>
            </div>
         </div>

         {isEditing && (
           <div className="mt-auto flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 font-bold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-purple-600 font-bold text-white hover:bg-purple-500 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
              </button>
           </div>
         )}
      </form>
    </div>
  );
};

export default ProfileWidget;