import { useState } from 'react';
import { X, User, Mail, Lock, Save } from 'lucide-react';
import api from '../api';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    old_password: '',
    new_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Only send fields that have values (don't send empty passwords if not changing)
    const payload = {
        username: formData.username,
        email: formData.email
    };
    if (formData.new_password) {
        payload.old_password = formData.old_password;
        payload.new_password = formData.new_password;
    }

    try {
      await api.put(`/users/${user.id}/profile`, payload);
      onUpdate(); // Refresh user data
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex gap-2"><User className="text-blue-400" /> Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
            <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-3.5 text-slate-500" />
                <input name="username" type="text" value={formData.username} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-500" />
                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
             <label className="text-xs font-bold text-slate-500 uppercase">Change Password (Optional)</label>
             <div className="space-y-3 mt-2">
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3.5 text-slate-500" />
                    <input name="old_password" type="password" placeholder="Current Password" value={formData.old_password} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3.5 text-slate-500" />
                    <input name="new_password" type="password" placeholder="New Password" value={formData.new_password} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none" />
                </div>
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-900/20">
            {loading ? "Saving..." : <>Save Changes <Save size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;