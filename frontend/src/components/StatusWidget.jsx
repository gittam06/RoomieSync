// frontend/src/components/StatusWidget.jsx
import { useState } from 'react';
import { Moon, Sun, BookOpen, Coffee } from 'lucide-react'; // Icons
import api from '../api';

const StatusWidget = ({ user }) => {
  const [status, setStatus] = useState(user.status || "Online");

  const changeStatus = async (newStatus) => {
    setStatus(newStatus); // Optimistic UI update
    try {
        // Send the new status string as a query parameter or body
        // For simplicity, let's assume the backend expects it as a query param based on standard FastAPI default
        // If your backend expects a JSON body, we would send { status: newStatus }
        await api.put(`/users/${user.id}/status?status=${newStatus}`);
    } catch (err) {
        console.error("Failed to update status");
    }
  };

  const options = [
    { label: "Online", icon: <Sun className="w-6 h-6 text-yellow-400" />, color: "bg-slate-700 hover:bg-slate-600" },
    { label: "Studying", icon: <BookOpen className="w-6 h-6 text-blue-400" />, color: "bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30" },
    { label: "Sleeping", icon: <Moon className="w-6 h-6 text-purple-400" />, color: "bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30" },
    { label: "Busy", icon: <Coffee className="w-6 h-6 text-red-400" />, color: "bg-red-900/30 hover:bg-red-900/50 border border-red-500/30" },
  ];

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-full flex flex-col justify-between">
      <div>
          <h3 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
            👋 My Status
          </h3>
          <p className="text-slate-400 text-sm mb-6">Let roommates know if you're free.</p>
          
          <div className="text-center mb-8">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                {status}
            </span>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
            <button 
                key={opt.label}
                onClick={() => changeStatus(opt.label)}
                className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${opt.color} ${status === opt.label ? 'ring-2 ring-white' : ''}`}
            >
                {opt.icon}
                <span className="text-xs font-bold">{opt.label}</span>
            </button>
        ))}
      </div>
    </div>
  );
};

export default StatusWidget;