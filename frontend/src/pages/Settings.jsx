import { useOutletContext } from 'react-router-dom';
import { Info, Hash, Users, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ProfileWidget from '../components/ProfileWidget';
import MoveOutWidget from '../components/MoveOutWidget';

const Settings = () => {
  const { user, household, members, fetchData } = useOutletContext();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(household.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto animate-fade-up">
      
      {/* 1. EDIT PROFILE */}
      <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
         <ProfileWidget user={user} onUpdate={fetchData} />
      </div>

      <div className="flex flex-col gap-6">
        
        {/* 2. HOUSE INFO CARD */}
        <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-sm shadow-xl">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
                <Info className="text-blue-400" /> House Details
            </h3>
            
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">House Name</p>
                        <p className="text-lg font-bold text-white">{household.name}</p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Users size={20} />
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-colors"
                     onClick={copyCode}
                >
                    <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Invite Code</p>
                        <p className="text-2xl font-mono font-bold text-emerald-400 tracking-widest">{household.join_code}</p>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                        {copied ? <Check size={20} /> : <Hash size={20} />}
                    </div>
                </div>
            </div>
        </div>

        {/* 3. DANGER ZONE (Move Out) */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
          {/* ✅ FIXED: Passing 'members' to prevent crash */}
          <MoveOutWidget user={user} household={household} members={members} />
        </div>

      </div>
    </div>
  );
};

export default Settings;